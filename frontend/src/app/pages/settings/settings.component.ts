import { NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
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
  private cdr = inject(ChangeDetectorRef);

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
        this.cdr.detectChanges();
      }
    } catch {
    }
  }

  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
    } finally {
      await this.router.navigate(['/login']);
    }
  }
}
