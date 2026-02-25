using System.ComponentModel.DataAnnotations;

namespace UserApi.Models
{
    // Database entity model
    public class User
    {
        public int Id { get; set; }
        
        [Required]
        public string Username { get; set; } = string.Empty;
        
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
    }

    // Data Transfer Objects (DTOs) for API requests and responses
    public record UserCreate(string Username, string Email);
    public record UserResponse(int Id, string Username, string Email);
}