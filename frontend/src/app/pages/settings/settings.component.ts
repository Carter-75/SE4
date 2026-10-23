import { Component, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './settings.component.html',
})
export class SettingsPageComponent {
  private router = inject(Router);

  constructor() {
    inject(Title).setTitle('Settings');
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
