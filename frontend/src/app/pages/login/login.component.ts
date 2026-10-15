
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './login.component.html',
})
export class LoginPageComponent {
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  isLoading = false;
  statusMessage = '';

  constructor() {
    inject(Title).setTitle('Login');
  }

  async login(event: SubmitEvent): Promise<void> {
    event.preventDefault();

    const form = event.currentTarget as HTMLFormElement;
    const formData = new FormData(form);

    const username = String(formData.get('username') ?? '').trim();
    const password = String(formData.get('password') ?? '');

    if (!username || !password) {
      this.statusMessage = 'Please enter your username and password.';
      return;
    }

    this.isLoading = true;
    this.statusMessage = 'Logging in...';
    //('Login started');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username,
          password,
        }),
      });
      //console.log('Login response received:', response.status);

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message || 'Invalid username or password. Please try again.'
        );
      }

      if (result.type === 'customer') {
        await this.router.navigate(['/customer']);
      } else if (result.type === 'provider') {
        await this.router.navigate(['/provider']);
      } else if (result.type === 'admin') {
        this.statusMessage =
          'Login successful, but the admin page has not been created yet.';
      } else {
        this.statusMessage =
          'Login successful, but this account type is not recognized.';
      }

     } catch (error: unknown) {
      console.error('Login error:', error);

      this.statusMessage =
        error instanceof Error
          ? error.message
          : 'Unable to connect to the server. Please try again.';

    //console.log('Status message set to:', this.statusMessage);
  } finally {
  this.isLoading = false;

  // Explicitly refresh the Angular view.
  this.cdr.detectChanges();

  //console.log('Login finished; isLoading:', this.isLoading);
}
  }
}
