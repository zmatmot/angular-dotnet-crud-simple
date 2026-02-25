import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, User } from './user.service'; // Ensure this path matches your service file

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html' // Using app.html as per your current project structure
})
export class AppComponent implements OnInit {
  // Array to store the list of users fetched from the backend
  users: User[] = [];
  
  // Object to hold data for creating or updating a user
  newUser: User = { username: '', email: '' };
  
  // String to display error messages in the UI
  errorMessage: string = '';

  // View controller: 'form' for registration, 'table' for admin dashboard
  currentView: string = 'form'; 
  
  // State variables for edit mode
  isEditing = false;
  editingUserId?: number;

  // State variable for theme mode (Dark/Light)
  isDarkMode = false;

  // Inject the UserService to handle API requests
  constructor(private userService: UserService) {}

  // Lifecycle hook called after Angular initializes data-bound properties
  ngOnInit() {
    this.loadUsers();
    this.initTheme(); // Initialize theme based on user's OS preference
  }

  // Initialize theme based on Windows/OS settings
  initTheme() {
    // Check if the user's system prefers dark mode
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.setTheme(prefersDark);
  }

  // Toggle between light and dark modes manually
  toggleTheme() {
    this.setTheme(!this.isDarkMode);
  }

  // Apply the selected theme to the entire document using Bootstrap 5.3 data attribute
  setTheme(isDark: boolean) {
    this.isDarkMode = isDark;
    document.documentElement.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');
  }

  // Fetch all users from the .NET backend API
  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (data: User[]) => {
        this.users = data;
      },
      error: (err: any) => {
        console.error('Error fetching users', err);
      }
    });
  }

  // Populate form data for editing and switch to the form view
  editUser(user: User) {
    this.isEditing = true;
    this.editingUserId = user.id;
    // Use the spread operator {...} to clone the object
    // This prevents modifying the table row directly before clicking 'Save'
    this.newUser = { ...user };
    this.currentView = 'form'; 
  }

  // Clear form data, exit edit mode, and switch back to the table view
  cancelEdit() {
    this.isEditing = false;
    this.editingUserId = undefined;
    this.newUser = { username: '', email: '' };
    this.errorMessage = '';
    this.currentView = 'table'; 
  }

  // Delete a user by ID
  deleteUser(id?: number) {
    if (!id) return;
    
    // Add a confirmation dialog before deleting
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => {
          this.loadUsers(); // Refresh the list after successful deletion
          
          // If the user being deleted is currently loaded in the edit form, reset the form
          if (this.editingUserId === id) {
            this.cancelEdit();
          }
        },
        error: (err: any) => {
          console.error('Error deleting user', err);
          alert('Failed to delete user.');
        }
      });
    }
  }

  // Save a user (handles both Create and Update operations)
  saveUser() {
    // 1. Validate empty fields
    if (!this.newUser.username || !this.newUser.email) {
      this.errorMessage = 'Please enter both username and email.';
      return; // Stop execution
    }

    // 2. Validate email format using Regular Expression
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(this.newUser.email)) {
      this.errorMessage = 'Invalid email format (e.g., test@example.com).';
      return; // Stop execution
    }

    // 3. Clear error message if validation passes
    this.errorMessage = ''; 

    if (this.isEditing && this.editingUserId) {
      // Update existing user via PUT request
      this.userService.updateUser(this.editingUserId, this.newUser).subscribe({
        next: () => {
          this.loadUsers();
          this.cancelEdit(); // Reset form and switch to table view
        },
        error: (err: any) => {
          this.errorMessage = err.error?.detail || 'An error occurred during update.';
        }
      });
    } else {
      // Create new user via POST request
      this.userService.createUser(this.newUser).subscribe({
        next: () => {
          this.loadUsers();
          this.cancelEdit(); // Reset form and switch to table view
        },
        error: (err: any) => {
          this.errorMessage = err.error?.detail || 'An error occurred during creation.';
        }
      });
    }
  }
}