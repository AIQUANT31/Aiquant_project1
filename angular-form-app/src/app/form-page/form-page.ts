import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-form-page',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './form-page.html',
  styleUrls: ['./form-page.css']
})
export class FormPage {

  firstName: string = '';
  lastName: string = '';
  password: string = '';

  constructor(private router: Router, private http: HttpClient) {}

  onSubmit() {
    if (this.firstName && this.lastName && this.password) {
      this.http.post('http://localhost:8000/api/login', {
        firstName: this.firstName,
        lastName: this.lastName,
        password: this.password
      }).subscribe({
        next: (response: any) => {
          if (response.token) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('userId', response.userId);
            this.router.navigate(['/wallet']);
          } else {
            alert('Login failed');
          }
        },
        error: () => alert('Login failed')
      });
    }
  }

  goToSignUp() {
    this.router.navigate(['/sign-up']);
  }
}
