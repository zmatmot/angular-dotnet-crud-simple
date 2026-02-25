using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UserApi.Models;

namespace UserApi.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _db;

        // Inject database context
        public UsersController(AppDbContext db)
        {
            _db = db;
        }

        // GET: /users
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserResponse>>> GetUsers()
        {
            var users = await _db.Users
                .Select(u => new UserResponse(u.Id, u.Username, u.Email))
                .ToListAsync();
                
            return Ok(users);
        }

        // POST: /users
        [HttpPost]
        public async Task<ActionResult<UserResponse>> CreateUser([FromBody] UserCreate user)
        {
            // Check for existing username or email
            var existingUser = await _db.Users
                .FirstOrDefaultAsync(u => u.Username == user.Username || u.Email == user.Email);

            if (existingUser != null)
            {
                return BadRequest(new { detail = "Username or Email already exists" });
            }

            // Create and save new user
            var newUser = new User
            {
                Username = user.Username,
                Email = user.Email
            };

            _db.Users.Add(newUser);
            await _db.SaveChangesAsync();

            return Created($"/users/{newUser.Id}", new UserResponse(newUser.Id, newUser.Username, newUser.Email));
        }
    }
}