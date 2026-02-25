using Microsoft.EntityFrameworkCore;
using UserApi.Models;

namespace UserApi
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // Maps the User model to the 'Users' table in the database
        public DbSet<User> Users { get; set; }
    }
}