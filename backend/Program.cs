using Backend.Data;
using Backend.Services;
using Backend.Hubs;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Shto shërbimet
builder.Services.AddControllers();
builder.Services.AddSignalR();
builder.Services.AddEndpointsApiExplorer();

// Lidhja me Databazën
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "server=localhost;user=root;password=;database=bgt_secure_exam";

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IExamService, ExamService>();

// Authentication
var key = Encoding.ASCII.GetBytes(builder.Configuration["Jwt:Key"] ?? "SUPER_SECRET_KEY_123456789_MUST_BE_LONG_ENOUGH");
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false; 
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false, 
        ValidateAudience = false,
        ValidateLifetime = true
    };
});

// CORS i thjeshtuar për Render
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin() 
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Krijimi i tabelave
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try {
        var context = services.GetRequiredService<AppDbContext>();
        context.Database.EnsureCreated();
        Console.WriteLine("Database and tables ensured.");
    } catch (Exception ex) {
        Console.WriteLine($"Error: {ex.Message}");
    }
}

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<ExamMonitorHub>("/examHub");

app.Run();