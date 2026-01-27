import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './sign-up.html',
  styleUrls: ['./sign-up.css']
})
export class SignUp {

  firstName: string = '';
  lastName: string = '';
  password: string = '';

  constructor(private router: Router, private http: HttpClient) {}

  onSubmit() {
    if (this.firstName && this.lastName && this.password) {
      this.http.post('http://localhost:8000/api/submit', {
        firstName: this.firstName,
        lastName: this.lastName,
        password: this.password
      }).subscribe({
        next: (response: any) => {
          alert('Sign up successful');
          this.router.navigate(['/login']);
        },
        error: () => alert('Sign up failed')
      });
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}