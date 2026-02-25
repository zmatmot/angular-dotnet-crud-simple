import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, User } from './user.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  users: User[] = [];
  newUser: User = { username: '', email: '' };
  errorMessage: string = '';

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadUsers();
  }

  // Fetch users from the backend
  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (data: any) => this.users = data,
      error: (err: any) => console.error('Error fetching users', err)
    });
  }

  // Submit new user data
  addUser() {
    this.userService.createUser(this.newUser).subscribe({
      next: (response: any) => { // Added ': any' here for safety
        this.loadUsers();
        this.newUser = { username: '', email: '' }; // Reset form
        this.errorMessage = '';
      },
      error: (err: any) => {
        this.errorMessage = err.error?.detail || 'An error occurred';
      }
    });
  }
}