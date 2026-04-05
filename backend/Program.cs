using Backend.Data;
using Backend.Services;
using Backend.Hubs;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// 1. Shto shërbimet (Controllers, SignalR)
builder.Services.AddControllers();
builder.Services.AddSignalR();
builder.Services.AddEndpointsApiExplorer();

// 2. Lidhja me Databazën (Sigurohu që DefaultConnection është në Render Env Vars)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "server=localhost;user=root;password=;database=bgt_secure_exam";

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IExamService, ExamService>();

// 3. Konfigurimi i CORS (I rëndësishëm për Netlify dhe SignalR)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowNetlify", policy =>
    {
        policy.WithOrigins("https://dazzling-gumption-3362bc.netlify.app") // URL e saktë e Netlify
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials(); // Duhet për SignalR/Hubs
    });
});

// 4. Authentication (JWT)
var jwtKey = builder.Configuration["Jwt:Key"] ?? "SUPER_SECRET_KEY_123456789_MUST_BE_LONG_ENOUGH";
var key = Encoding.ASCII.GetBytes(jwtKey);

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

var app = builder.Build();

// 5. Krijimi i tabelave (Migrimet automatike)
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try {
        var context = services.GetRequiredService<AppDbContext>();
        context.Database.EnsureCreated();
        Console.WriteLine("Database and tables ensured.");
    } catch (Exception ex) {
        Console.WriteLine($"Database Error: {ex.Message}");
    }
}

// 6. Middleware Pipeline (RENDITJA KA RËNDËSI!)
app.UseCors("AllowNetlify"); // Duhet të jetë i pari

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<ExamMonitorHub>("/examHub");

app.Run();