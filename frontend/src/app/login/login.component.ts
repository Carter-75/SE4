import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="container p-4 max-w-md mx-auto min-h-screen flex items-center">
      <div class="p-8 bg-white rounded-xl shadow-2xl border w-full glass">
        <h2 class="text-2xl font-bold mb-6 text-center">Login</h2>
        
        <div class="space-y-4">
          <input [(ngModel)]="email" type="email" placeholder="Email" class="w-full p-3 border rounded-lg">
          <input [(ngModel)]="password" type="password" placeholder="Password" class="w-full p-3 border rounded-lg">
          
          <button (click)="login()" 
                  class="w-full p-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors">
            Sign In
          </button>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private api = inject(ApiService);
  private router = inject(Router);
  email = '';
  password = '';

  login() {
    this.api.login({ email: this.email, password: this.password }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => alert(err.error?.message || 'Login failed')
    });
  }
}
