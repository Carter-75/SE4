
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

    if (this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.statusMessage = 'Logging in...';

    try {
      let forceLogin = false;

      while (true) {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            username,
            password,
            forceLogin
          })
        });

        const result = await response.json().catch(() => ({}));

        if (
          response.status === 409 &&
          result.code === 'SESSION_EXISTS'
        ) {
          const confirmed = window.confirm(
            'This account is already logged in on another device.\n\n' +
            'Would you like to sign out of the other device and log in here?'
          );

          if (!confirmed) {
            this.statusMessage = 'Login cancelled.';
            return;
          }

          forceLogin = true;
          continue;
        }

        if (!response.ok) {
          throw new Error(
            result.message ||
            'Invalid username or password. Please try again.'
          );
        }

        if (result.type === 'customer') {
          await this.router.navigate(['/customer']);
        } else if (result.type === 'provider') {
          await this.router.navigate(['/provider']);
        } else if (result.type === 'admin') {
          await this.router.navigate(['/admin']);
        } else {
          this.statusMessage =
            'Login successful, but this account type is not recognized.';
        }

        break;
      }

    } catch (error: unknown) {
      console.error('Login error:', error);

      this.statusMessage =
        error instanceof Error
          ? error.message
          : 'Unable to connect to the server. Please try again.';

    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

}
