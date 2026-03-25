using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Net.Mail;
using System.Net;
using Backend.Models; 
using Backend.Services; 

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly IUserService _userService;

        public AuthController(IConfiguration configuration, IUserService userService)
        {
            _configuration = configuration;
            _userService = userService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto model)
        {
            if (await _userService.UserExists(model.Username))
                return BadRequest("Ky username ekziston aktualisht.");

            var user = new User {
                Username = model.Username,
                Email = model.Email,
                Role = "STUDENT",
                IsApproved = true, 
                CreatedAt = DateTime.UtcNow,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(model.Password)
            };

            await _userService.CreateUserAsync(user);
            return Ok(new { message = "Regjistrimi u krye me sukses." });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto model)
        {
            if (model == null || string.IsNullOrWhiteSpace(model.Username) || string.IsNullOrWhiteSpace(model.Password))
                return BadRequest("Kërkohet username dhe password.");

            try
            {
                var user = await _userService.GetUserByUsernameAsync(model.Username);
                
                if (user == null)
                    return Unauthorized("Kredencialet janë të pasakta (User nuk u gjet).");
                
                if (string.IsNullOrEmpty(user.PasswordHash))
                    return Unauthorized("Kredencialet janë të pasakta (Password mungon).");

                if (!BCrypt.Net.BCrypt.Verify(model.Password, user.PasswordHash))
                    return Unauthorized("Kredencialet janë të pasakta.");

                var token = GenerateJwtToken(user);
                return Ok(new { token, role = user.Role.ToUpper(), id = user.Id, username = user.Username });
            }
            catch (Exception ex)
            {
                // In case any unexpected exception happens, return a clean 500 error so CORS doesn't crash completely, 
                // or just return 500 with message so it's easier to debug
                return StatusCode(500, $"Internal server error gjatë logimit: {ex.Message}");
            }
        }

        private string GenerateJwtToken(User user)
        {
            var claims = new[] {
                new Claim(JwtRegisteredClaimNames.Sub, user.Username),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim("id", user.Id.ToString()),
                new Claim(ClaimTypes.Role, user.Role.ToUpper())
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? "SUPER_SECRET_KEY_123456789"));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                _configuration["Jwt:Issuer"],
                _configuration["Jwt:Audience"],
                claims,
                expires: DateTime.Now.AddHours(2),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}