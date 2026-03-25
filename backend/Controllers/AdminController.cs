using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.Models;
using Backend.Services;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "ADMIN")]
    public class AdminController : ControllerBase
    {
        private readonly IUserService _userService;

        public AdminController(IUserService userService)
        {
            _userService = userService;
        }

        // Get all users
        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _userService.GetAllUsersAsync();
            return Ok(users);
        }

        // Get unapproved users (Approval Queue)
        [HttpGet("approval-queue")]
        public async Task<IActionResult> GetApprovalQueue()
        {
            var users = await _userService.GetUnapprovedUsersAsync();
            return Ok(users);
        }

        // Approve a user
        [HttpPost("approve/{userId}")]
        public async Task<IActionResult> ApproveUser(int userId)
        {
            var success = await _userService.ApproveUserAsync(userId);
            if (!success) return NotFound("User not found.");
            return Ok(new { message = "User approved." });
        }

        // Change user role (Elevate)
        [HttpPost("set-role")]
        public async Task<IActionResult> SetUserRole([FromBody] SetRoleDto model)
        {
            if (model.Role != "ADMIN" && model.Role != "PROFESSOR" && model.Role != "STUDENT")
                return BadRequest("Invalid role.");

            var success = await _userService.UpdateUserRoleAsync(model.UserId, model.Role);
            if (!success) return NotFound("User not found.");
            return Ok(new { message = $"User role updated to {model.Role}." });
        }

        // Ban user (or Delete)
        [HttpPost("ban/{userId}")]
        public async Task<IActionResult> BanUser(int userId)
        {
            // Implementation depends on if we have a 'IsBanned' flag or just approve=false
            // For now setting approved = false is a soft ban
            var success = await _userService.SetUserApprovalAsync(userId, false); 
            if (!success) return NotFound("User not found.");
            return Ok(new { message = "User access revoked." });
        }
    }

    public class SetRoleDto
    {
        public int UserId { get; set; }
        public string Role { get; set; } = string.Empty;
    }
}
