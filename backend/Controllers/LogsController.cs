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

                // 2. Marrim rezultatet duke përfshirë tabelat lidhëse
                var examResults = await _context.ExamResults
                    .Include(er => er.Exam)
                    .Include(er => er.Student)
                    .Where(er => er.Exam != null && er.Exam.ProfId == professorId) 
                    // Hoqa kushtin !string.IsNullOrEmpty(er.ViolationLog) që të shohim të gjithë studentët "Live" 
                    // edhe nëse s'kanë bërë ende shkelje, por mund t'i përjashtojmë.
                    .ToListAsync();

                // 3. Formatojmë përgjigjen për Frontend-in e ri
                var now = DateTime.UtcNow;
                var response = examResults.Select(er => {
                    var startTime = er.Exam?.StartTime;
                    var duration = er.Exam?.Duration ?? 0;
                    
                    // Llogaritja nëse provimi është aktualisht LIVE
                    bool isLive = startTime.HasValue && 
                                  startTime.Value.Year > 1 &&
                                  now >= startTime.Value && 
                                  now <= startTime.Value.AddMinutes(duration) &&
                                  er.Status != "FINISHED"; // Nëse e ka kryer, nuk është më live për të

                    return new {
                        id = er.Id,
                        studentId = er.StudentId, // Kritike për butonin Përjashto
                        studentName = er.Student?.Username ?? "Student i panjohur",
                        examId = er.ExamId, // Kritike për butonin Përjashto
                        examTitle = er.Exam?.Title ?? "Provim pa titull",
                        subject = er.Exam?.Subject ?? "",
                        score = er.Score, // Shtuar: Shfaq pikët/rezultatin
                        status = er.Status,
                        violationType = er.Status == "DISQUALIFIED" ? "GRAVE" : 
                                       (!string.IsNullOrEmpty(er.ViolationLog) ? "PARALAJMËRIM" : "OK"),
                        description = er.ViolationLog ?? "Nuk ka shkelje deri tani",
                        timestamp = er.EndActual.HasValue ? er.EndActual.Value : er.StartActual,
                        isLive = isLive
                    };
                }).OrderByDescending(x => x.isLive).ThenByDescending(x => x.timestamp).ToList();

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Gabim gjatë procesimit të raporteve", error = ex.Message });
            }
        }
    }
}