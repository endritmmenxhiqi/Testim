using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;

namespace Backend.Services
{
    // --- 1. INTERFACES ---

    public interface IUserService
    {
        Task<bool> UserExists(string username);
        Task CreateUserAsync(User user);
        Task<User?> GetUserByUsernameAsync(string username);
        Task<User?> GetUserByEmailAsync(string email);
        Task<bool> SetUserApprovalAsync(int userId, bool isApproved);
        Task UpdateUserAsync(User user);
        Task<List<User>> GetAllUsersAsync();
        Task<List<User>> GetUnapprovedUsersAsync();
        Task<bool> ApproveUserAsync(int userId);
        Task<bool> UpdateUserRoleAsync(int userId, string role);
    }

    public interface IExamService
    {
        Task CreateExamAsync(Exam exam);
        Task<Exam?> GetExamByCodeAsync(string code);
        Task SaveExamResultAsync(ExamResultDto result);
        Task LogViolationAsync(ViolationDto violation);
        Task<List<Exam>> GetExamsByProfessorIdAsync(int profId);
        Task<Exam?> GetExamByIdAsync(int id);
        Task UpdateExamAsync(Exam exam);
        
        // Kthejmë listën e pjesëmarrësve (Përdoret te Live Monitoring dhe Reports)
        Task<List<dynamic>> GetParticipantsByExamIdAsync(int examId);
        
        Task UpdateStudentGradeAsync(int examId, int studentId, decimal grade); 
        Task EnsureStudentResultRecordAsync(int examId, int studentId);
        Task<ExamResult?> GetExamResultAsync(int examId, int studentId);
        
        // Metoda për fshirjen (Ritake)
        Task<bool> DeleteStudentResultAsync(int examId, int studentId);

        // E RE: Metoda për Sdisualifikim (Përjashtim nga profesori)
        Task<bool> DisqualifyStudentAsync(int examId, int studentId);

        // E RE: Metoda për Studentët (Dashboard)
        Task<List<dynamic>> GetResultsByStudentIdAsync(int studentId);
    }

    // --- 2. IMPLEMENTATIONS ---

    public class UserService : IUserService
    {
        private readonly AppDbContext _context;
        public UserService(AppDbContext context) { _context = context; }

        public async Task<bool> UserExists(string username) => await _context.Users.AnyAsync(u => u.Username == username);
        public async Task CreateUserAsync(User user) { _context.Users.Add(user); await _context.SaveChangesAsync(); }
        public async Task<User?> GetUserByUsernameAsync(string username) => await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
        public async Task<User?> GetUserByEmailAsync(string email) => await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        public async Task<bool> SetUserApprovalAsync(int userId, bool isApproved) {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;
            user.IsApproved = isApproved;
            await _context.SaveChangesAsync();
            return true;
        }
        public async Task UpdateUserAsync(User user) {
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
        }

        public async Task<List<User>> GetAllUsersAsync() => await _context.Users.ToListAsync();
        public async Task<List<User>> GetUnapprovedUsersAsync() => await _context.Users.Where(u => !u.IsApproved).ToListAsync();
        public async Task<bool> ApproveUserAsync(int userId) => await SetUserApprovalAsync(userId, true);

        public async Task<bool> UpdateUserRoleAsync(int userId, string role) {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;
            user.Role = role;
            await _context.SaveChangesAsync();
            return true;
        }
    }

    public class ExamService : IExamService
    {
        private readonly AppDbContext _context;
        public ExamService(AppDbContext context) { _context = context; }

        public async Task EnsureStudentResultRecordAsync(int examId, int studentId)
        {
            var exists = await _context.ExamResults.AnyAsync(r => r.ExamId == examId && r.StudentId == studentId);
            if (!exists)
            {
                var newResult = new ExamResult {
                    ExamId = examId,
                    StudentId = studentId,
                    Status = "IN_PROGRESS",
                    StartActual = DateTime.UtcNow,
                    ViolationLog = "",
                    Score = 0 
                };
                _context.ExamResults.Add(newResult);
                await _context.SaveChangesAsync();
            }
        }

        // OPTIMIZUAR: Marrja e pjesëmarrësve me JOIN për performancë më të lartë
        public async Task<List<dynamic>> GetParticipantsByExamIdAsync(int examId)
        {
            var query = from er in _context.ExamResults
                        join u in _context.Users on er.StudentId equals u.Id
                        join ex in _context.Exams on er.ExamId equals ex.Id
                        where er.ExamId == examId && er.StudentId != ex.ProfId
                        select new {
                            StudentId = er.StudentId,
                            StudentName = u.Username,
                            Score = er.Score,
                            Status = er.Status,
                            Violations = er.ViolationLog
                        };

            var data = await query.ToListAsync();
            return data.Cast<dynamic>().ToList();
        }

        // E RE: Logjika e Sdisualifikimit
        public async Task<bool> DisqualifyStudentAsync(int examId, int studentId)
        {
            var result = await _context.ExamResults
                .FirstOrDefaultAsync(r => r.ExamId == examId && r.StudentId == studentId);

            if (result != null)
            {
                result.Status = "DISQUALIFIED";
                // Shtojmë shënimin në log që u përjashtua manualisht
                result.ViolationLog += $"[{DateTime.Now:HH:mm}] PËRJASHTUAR NGA PROFESORI; ";
                await _context.SaveChangesAsync();
                return true;
            }
            return false;
        }

        public async Task UpdateStudentGradeAsync(int examId, int studentId, decimal grade)
        {
            var result = await _context.ExamResults
                .FirstOrDefaultAsync(r => r.ExamId == examId && r.StudentId == studentId);
            
            if (result != null) { 
                result.Score = grade; 
                await _context.SaveChangesAsync(); 
            }
        }

        public async Task CreateExamAsync(Exam exam) { _context.Exams.Add(exam); await _context.SaveChangesAsync(); }
        
        public async Task<Exam?> GetExamByCodeAsync(string code) => 
            await _context.Exams.FirstOrDefaultAsync(e => e.Code == code);

        public async Task<List<Exam>> GetExamsByProfessorIdAsync(int profId) => 
            await _context.Exams.Where(e => e.ProfId == profId).ToListAsync();

        public async Task<Exam?> GetExamByIdAsync(int id) => await _context.Exams.FindAsync(id);

        public async Task UpdateExamAsync(Exam exam) { 
            _context.Entry(exam).State = EntityState.Modified; 
            await _context.SaveChangesAsync(); 
        }

        public async Task SaveExamResultAsync(ExamResultDto result)
        {
            var entity = await _context.ExamResults
                .FirstOrDefaultAsync(r => r.ExamId == result.ExamId && r.StudentId == result.StudentId);
            
            if (entity != null) {
                entity.Score = result.Score;
                entity.Status = "FINISHED";
                entity.EndActual = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }

        public async Task LogViolationAsync(ViolationDto violation)
        {
            var result = await _context.ExamResults
                .FirstOrDefaultAsync(r => r.ExamId == violation.ExamId && r.StudentId == violation.StudentId);
            
            if (result != null) {
                result.ViolationLog += $"[{DateTime.Now:HH:mm}] Shkelje: {violation.ProcessName}; ";
                await _context.SaveChangesAsync();
            }
        }

        public async Task<ExamResult?> GetExamResultAsync(int examId, int studentId)
        {
            return await _context.ExamResults.FirstOrDefaultAsync(r => r.ExamId == examId && r.StudentId == studentId);
        }

        public async Task<bool> DeleteStudentResultAsync(int examId, int studentId)
        {
            var result = await _context.ExamResults
                .FirstOrDefaultAsync(r => r.ExamId == examId && r.StudentId == studentId);

            if (result != null)
            {
                _context.ExamResults.Remove(result);
                await _context.SaveChangesAsync();
                return true;
            }
            return false;
        }

        public async Task<List<dynamic>> GetResultsByStudentIdAsync(int studentId)
        {
            var query = from er in _context.ExamResults
                        join e in _context.Exams on er.ExamId equals e.Id
                        where er.StudentId == studentId
                        select new {
                            ExamId = er.ExamId,
                            ExamTitle = e.Title,
                            Subject = e.Subject,
                            Score = er.Score,
                            Status = er.Status,
                            ViolationLog = er.ViolationLog,
                            Date = er.EndActual ?? er.StartActual,
                            Duration = e.Duration
                        };

            var data = await query.OrderByDescending(r => r.Date).ToListAsync();
            return data.Cast<dynamic>().ToList();
        }
    }
}