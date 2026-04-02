using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data; 
using Backend.Models; 
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "PROFESSOR")] // Sigurohu që roli në Token përputhet (PROFESSOR)
    public class LogsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public LogsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("my-exams-logs")]
        public async Task<IActionResult> GetLogs()
        {
            try
            {
                // 1. Marrim ID-në e profesorit nga Claims
                var userIdClaim = User.FindFirst("id")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(userIdClaim))
                    return Unauthorized(new { message = "Token i pavlefshëm" });

                int professorId = int.Parse(userIdClaim);

                // 2. Marrim rezultatet duke përdorur JOIN-e të qarta dhe emërtuar saktë asetet
                var logsQuery = from er in _context.ExamResults
                                join exam in _context.Exams on er.ExamId equals exam.Id
                                join studentUser in _context.Users on er.StudentId equals studentUser.Id
                                join profUser in _context.Users on exam.ProfId equals profUser.Id
                                where exam.ProfId == professorId && er.StudentId != exam.ProfId // Filtrojmë testet e profesorit
                                select new {
                                    ResultId = er.Id,
                                    ExamId = er.ExamId,
                                    ExamTitle = exam.Title,
                                    Subject = exam.Subject,
                                    ExamDuration = exam.Duration,
                                    ExamStartTime = exam.StartTime,
                                    StudentId = er.StudentId,
                                    StudentUsername = studentUser.Username,
                                    ProfessorId = exam.ProfId,
                                    ProfessorUsername = profUser.Username,
                                    Score = er.Score,
                                    Status = er.Status,
                                    ViolationLog = er.ViolationLog,
                                    StartActual = er.StartActual,
                                    EndActual = er.EndActual
                                };

                var logsList = await logsQuery.ToListAsync();

                // 3. Formatojmë përgjigjen për Frontend
                var now = DateTime.UtcNow;
                var response = logsList.Select(log => {
                    var startTime = log.ExamStartTime;
                    var duration = log.ExamDuration;
                    
                    // Verifikimi nëse është LIVE
                    bool isLive = startTime.HasValue && 
                                  startTime.Value.Year > 1 &&
                                  now >= startTime.Value && 
                                  now <= startTime.Value.AddMinutes(duration) &&
                                  log.Status != "FINISHED";

                    return new {
                        id = log.ResultId,
                        studentId = log.StudentId,
                        studentName = log.StudentUsername, // Vetëm emri pa ID
                        examId = log.ExamId,
                        examTitle = log.ExamTitle,
                        subject = log.Subject,
                        score = log.Score,
                        status = log.Status,
                        violationType = log.Status == "DISQUALIFIED" ? "GRAVE" : 
                                       (!string.IsNullOrEmpty(log.ViolationLog) ? "PARALAJMËRIM" : "OK"),
                        description = string.IsNullOrEmpty(log.ViolationLog) ? "Nuk ka shkelje deri tani" : log.ViolationLog,
                        timestamp = log.EndActual ?? log.StartActual,
                        isLive = isLive
                    };
                })
                .OrderByDescending(x => x.isLive)
                .ThenByDescending(x => x.timestamp)
                .ToList();

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Gabim gjatë procesimit të raporteve", error = ex.Message });
            }
        }
    }
}