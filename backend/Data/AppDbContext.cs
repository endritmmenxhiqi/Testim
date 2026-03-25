using Microsoft.EntityFrameworkCore;
using Backend.Models;

namespace Backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Exam> Exams { get; set; }
        public DbSet<ExamResult> ExamResults { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Seed Users
            modelBuilder.Entity<User>().HasData(
                new User { Id = 1, Username = "admin", Email = "admin@test.com", PasswordHash = "...", Role = "ADMIN", IsApproved = true },
                new User { Id = 2, Username = "profesor1", Email = "prof@test.com", PasswordHash = "...", Role = "PROFESSOR", IsApproved = true }
            );

            // Seed Exam
            modelBuilder.Entity<Exam>().HasData(
                new Exam { 
                    Id = 1, 
                    Title = "Testi Provim", 
                    Subject = "Programim", 
                    Code = "123456", 
                    Duration = 60, 
                    Url = "google.com", 
                    ProfId = 2 
                }
            );
        }
    }
}