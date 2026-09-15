import { Component, inject, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="container p-8 max-w-4xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold">Dashboard</h1>
        <button (click)="logout()" class="text-red-600 font-semibold">Logout</button>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="p-6 bg-white rounded-xl shadow border glass">
          <h3 class="text-gray-500 text-sm uppercase">User</h3>
          <p class="text-xl font-semibold">{{ api.currentUser()?.email }}</p>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  public api = inject(ApiService);
  private router = inject(Router);

  ngOnInit() {
    this.api.checkStatus().subscribe({
      error: () => this.router.navigate(['/login'])
    });
  }

  logout() {
    this.api.logout();
    this.router.navigate(['/home']);
  }
}
