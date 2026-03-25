using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("users")]
    public class User
    {
        [Column("id")]
        public int Id { get; set; }
        [Column("username")]
        public string Username { get; set; } = string.Empty;
        [Column("email")]
        public string Email { get; set; } = string.Empty;
        [Column("password_hash")]
        public string PasswordHash { get; set; } = string.Empty;
        [Column("role")]
        public string Role { get; set; } = "STUDENT"; 
        [Column("is_approved")]
        public bool IsApproved { get; set; } = false;
        
        [NotMapped]
        public string? AvatarUrl { get; set; } // U SHTUA KJO
        
        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    [Table("exams")]
    public class Exam
    {
        [Column("id")]
        public int Id { get; set; }
        [Column("title")]
        public string Title { get; set; } = string.Empty;
        [Column("subject")]
        public string Subject { get; set; } = string.Empty;
        [Column("code")]
        public string Code { get; set; } = string.Empty; 
        [Column("duration")]
        public int Duration { get; set; } 
        [Column("start_time")]
        public DateTime? StartTime { get; set; } = null; // NULL = provimi nuk ka filluar
        [Column("url")]
        public string Url { get; set; } = string.Empty; 
        [Column("prof_id")]
        public int ProfId { get; set; } 
        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [NotMapped]
        public string DeepLink => $"seb://{Url?.Replace("https://", "").Replace("http://", "")}";
    }

    [Table("exam_results")]
    public class ExamResult
    {
        [Column("id")]
        public int Id { get; set; }
        [Column("exam_id")]
        public int ExamId { get; set; }
        [Column("student_id")]
        public int StudentId { get; set; }
        [Column("score")]
        public decimal Score { get; set; } = 0;
        [Column("status")]
        public string Status { get; set; } = "IN_PROGRESS"; 
        [Column("start_actual")]
        public DateTime StartActual { get; set; } = DateTime.UtcNow;
        [Column("end_actual")]
        public DateTime? EndActual { get; set; }
        [Column("violation_log")]
        public string ViolationLog { get; set; } = string.Empty;

        [ForeignKey("ExamId")]
        public virtual Exam? Exam { get; set; }

        [ForeignKey("StudentId")]
        public virtual User? Student { get; set; }
    }

    public class RegisterDto { public string Username { get; set; } = ""; public string Email { get; set; } = ""; public string Password { get; set; } = ""; }
    public class LoginDto { public string Username { get; set; } = ""; public string Password { get; set; } = ""; }
    public class ExamResultDto { public int ExamId { get; set; } public int StudentId { get; set; } public decimal Score { get; set; } }
    public class ViolationDto { public int ExamId { get; set; } public int StudentId { get; set; } public string ProcessName { get; set; } = ""; }
    public class JoinExamDto { public int StudentId { get; set; } }
}