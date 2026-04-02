using Microsoft.AspNetCore.Mvc;
using Backend.Models; 
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ExamController : ControllerBase
    {
        private readonly IExamService _examService;

        public ExamController(IExamService examService)
        {
            _examService = examService;
        }

        [HttpGet("get-by-code/{code}")]
        public async Task<IActionResult> GetByCode(string code)
        {
            var exam = await _examService.GetExamByCodeAsync(code);
            if (exam == null) return NotFound("Provimi nuk u gjet.");
            return Ok(exam);
        }

        [HttpPost("join/{id}")]
        [Authorize(AuthenticationSchemes = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme)]
        public async Task<IActionResult> JoinExam(int id)
        {
            var userIdClaim = User.FindFirst("id")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized("Ju lutem logohuni.");

            int studentId = int.Parse(userIdClaim);
            Console.WriteLine($"[DEBUG] Student {studentId} po tenton të hyjë në Provimin {id}");

            var exam = await _examService.GetExamByIdAsync(id);
            if (exam == null) return NotFound();

            if (exam.StartTime == null) 
                return BadRequest(new { message = "Provimi nuk ka filluar ende." });
            
            var endTime = exam.StartTime.Value.AddMinutes(exam.Duration);
            if (DateTime.UtcNow > endTime) 
                return BadRequest(new { message = "Koha e provimit ka përfunduar (Expired)." });

            var existingResult = await _examService.GetExamResultAsync(id, studentId);
            if (existingResult != null)
            {
                if (existingResult.Status == "FINISHED") 
                    return BadRequest(new { message = "Ju e keni përfunduar këtë provim." });
                if (existingResult.Status == "DISQUALIFIED") 
                    return BadRequest(new { message = "Ju jeni sdisualifikuar nga ky provim." });
                
                return Ok(new { message = "Rikthim në provim" });
            }

            await _examService.EnsureStudentResultRecordAsync(id, studentId);
            return Ok(new { message = "Sukses" });
        }

        // --- ENDPOINT-I I RI PËR PËRJASHTIM (KICK) ---

        [HttpPost("disqualify-student")]
        [Authorize(AuthenticationSchemes = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme)]
        public async Task<IActionResult> DisqualifyStudent([FromBody] DisqualifyDto model)
        {
            var userIdClaim = User.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();

            // Kontrollojmë nëse provimi i përket këtij profesori
            var exam = await _examService.GetExamByIdAsync(model.ExamId);
            if (exam == null || exam.ProfId != int.Parse(userIdClaim)) return Unauthorized();

            // Përdorim metodën e re te ExamService
            await _examService.DeleteStudentResultAsync(model.ExamId, model.StudentId); // Ose krijo DisqualifyStudentAsync
            
            // Opsionale: Mund të krijosh një metodë specifike .DisqualifyStudentAsync(id, id) 
            // nëse dëshiron të ruash rekordin por me status DISQUALIFIED. 
            // Për momentin, po e fshijmë që profesori ta ketë në dorë ta lejojë ose jo.

            return Ok(new { message = "Veprimi u kreu me sukses." });
        }

        // --- ENDPOINT-ET PËR RITAKE/STATUS ---

        [HttpGet("{examId}/students-status")]
        [Authorize(AuthenticationSchemes = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme)]
        public async Task<IActionResult> GetStudentsStatus(int examId)
        {
            var userIdClaim = User.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();

            var exam = await _examService.GetExamByIdAsync(examId);
            if (exam == null || exam.ProfId != int.Parse(userIdClaim)) return Unauthorized();

            var participants = await _examService.GetParticipantsByExamIdAsync(examId);
            
            var result = participants.Select(p => new {
                Id = p.StudentId,
                FullName = p.StudentName, 
                IsFinished = p.Status == "FINISHED"
            });

            return Ok(result);
        }

        [HttpPost("reset-student-attempt")]
        [Authorize(AuthenticationSchemes = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme)]
        public async Task<IActionResult> ResetStudentAttempt([FromBody] ResetAttemptDto model)
        {
            var userIdClaim = User.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();

            var exam = await _examService.GetExamByIdAsync(model.ExamId);
            if (exam == null || exam.ProfId != int.Parse(userIdClaim)) return Unauthorized();

            bool success = await _examService.DeleteStudentResultAsync(model.ExamId, model.StudentId);
            
            if (!success) return BadRequest("Nuk u mundësua resetimi.");
            return Ok(new { message = "Studenti u resetua me sukses!" });
        }

        [HttpGet("{id}/participants")]
        public async Task<IActionResult> GetParticipants(int id)
        {
            var participants = await _examService.GetParticipantsByExamIdAsync(id);
            return Ok(participants);
        }

        [HttpPost("save-result")]
        public async Task<IActionResult> SaveResult([FromBody] ExamResultDto model)
        {
            await _examService.SaveExamResultAsync(model);
            return Ok();
        }

        [HttpPost("log-violation")]
        public async Task<IActionResult> LogViolation([FromBody] ViolationDto model)
        {
            await _examService.LogViolationAsync(model);
            return Ok();
        }

        [HttpGet("my-exams")]
        [Authorize(AuthenticationSchemes = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme)]
        public async Task<IActionResult> GetMyExams()
        {
            var userIdClaim = User.FindFirst("id")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();

            var exams = await _examService.GetExamsByProfessorIdAsync(int.Parse(userIdClaim));
            return Ok(exams);
        }

        [HttpGet("my-results")]
        [Authorize(AuthenticationSchemes = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme)]
        public async Task<IActionResult> GetMyResults()
        {
            var userIdClaim = User.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();

            var results = await _examService.GetResultsByStudentIdAsync(int.Parse(userIdClaim));
            return Ok(results);
        }

        [HttpPost("create")]
        [Authorize(AuthenticationSchemes = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme)]
        public async Task<IActionResult> CreateExam([FromBody] Exam model)
        {
            var userIdClaim = User.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized("Ju lutem logohuni si profesor.");

            int profId = int.Parse(userIdClaim);
            Console.WriteLine($"[DEBUG] Krijim provimi nga ProfId: {profId}. Titulli: {model.Title}, Subjekti: {model.Subject}");

            model.ProfId = profId;
            model.CreatedAt = DateTime.UtcNow;

            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            var random = new Random();
            model.Code = new string(Enumerable.Repeat(chars, 6).Select(s => s[random.Next(s.Length)]).ToArray());

            await _examService.CreateExamAsync(model);
            return Ok(model);
        }

        [HttpPost("start/{id}")]
        [Authorize(AuthenticationSchemes = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme)]
        public async Task<IActionResult> StartExam(int id)
        {
            var userIdClaim = User.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();

            var exam = await _examService.GetExamByIdAsync(id);
            if (exam == null || exam.ProfId != int.Parse(userIdClaim)) return NotFound();

            exam.StartTime = DateTime.UtcNow;
            await _examService.UpdateExamAsync(exam);
            return Ok(new { message = "Provimi u nis." });
        }

        [HttpPost("update-grade")]
        [Authorize(AuthenticationSchemes = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme)]
        public async Task<IActionResult> UpdateGrade([FromBody] GradeUpdateDto model)
        {
            await _examService.UpdateStudentGradeAsync(model.ExamId, model.StudentId, model.Grade);
            return Ok(new { message = "Nota u përditësua me sukses" });
        }

        // DTO-të e nevojshme
        public class ResetAttemptDto { public int ExamId { get; set; } public int StudentId { get; set; } }
        public class DisqualifyDto { public int ExamId { get; set; } public int StudentId { get; set; } }
        public class GradeUpdateDto { public int ExamId { get; set; } public int StudentId { get; set; } public decimal Grade { get; set; } }
    }
}