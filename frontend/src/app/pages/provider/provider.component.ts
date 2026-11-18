
import {
  Component,
  inject,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-provider-page',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './provider.component.html',
})
export class ProviderPageComponent implements OnInit {
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  providerName = '';

  constructor() {
    inject(Title).setTitle('Service provider home');
  }

  async ngOnInit(): Promise<void> {
    try {
      const response = await fetch('/api/auth/user', {
        credentials: 'include',
      });

      if (response.ok) {
        const user = await response.json();

        if (user.type === 'customer') {
          await this.router.navigate(['/customer']);
          return;
        }

        const firstName = user.firstN || '';
        const lastName = user.lastN || '';

        this.providerName =
          `${firstName} ${lastName}`.trim() ||
          user.username ||
          '';
      }
    } catch (error) {
      console.error('Error loading provider information:', error);
    } finally {
      this.cdr.detectChanges();
    }
  }

  async logout(): Promise<void> {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Logout failed.');
      }

      await this.router.navigate(['/login']);

    } catch (error) {
      console.error('Error logging out:', error);
      window.alert('Unable to log out. Please try again.');
    }
  }

}
