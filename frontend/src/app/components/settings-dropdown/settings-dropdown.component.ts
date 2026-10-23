import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-settings-dropdown',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './settings-dropdown.component.html',
})
export class SettingsDropdownComponent {
  private router = inject(Router);

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
