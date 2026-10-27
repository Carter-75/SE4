import { NgIf } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [NgIf, RouterLink],
  templateUrl: './settings.component.html',
})
export class SettingsPageComponent implements OnInit {
  private router = inject(Router);

  isProvider = false;

  constructor() {
    inject(Title).setTitle('Settings');
  }

  async ngOnInit(): Promise<void> {
    try {
      const response = await fetch('/api/auth/user', {
        credentials: 'include',
      });

      if (response.ok) {
        const user = await response.json();
        this.isProvider = user.type === 'provider';
      }
    } catch {
    }
  }

  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        credentials: 'include',
      });
    } catch {
    } finally {
      await this.router.navigate(['/login']);
    }
  }
}
