import { Component, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-page',
  standalone: true,
  templateUrl: './register.component.html',
})
export class RegisterPageComponent {
  private router = inject(Router);

  accountType = 'customer';
  isLoading = false;
  statusMessage = '';

  constructor() {
    inject(Title).setTitle('Register');
  }

  onAccountTypeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.accountType = select.value;
  }

  async register(event: SubmitEvent): Promise<void> {
    event.preventDefault();

    const form = event.currentTarget as HTMLFormElement;
    const formData = new FormData(form);

    const firstN = String(formData.get('firstN') ?? '').trim();
    const lastN = String(formData.get('lastN') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim();
    const username = String(formData.get('username') ?? '').trim();
    const password = String(formData.get('password') ?? '');
    const type = this.accountType;

    const serviceType = String(
      formData.get('serviceType') ?? ''
    ).trim();

    const qualifications = String(
      formData.get('qualifications') ?? ''
    ).trim();

    if (
      !firstN ||
      !lastN ||
      !email ||
      !username ||
      !password
    ) {
      this.statusMessage = 'Please complete all required fields.';
      return;
    }

    if (
      type === 'provider' &&
      (!serviceType || !qualifications)
    ) {
      this.statusMessage =
        'Please enter your service type and qualifications.';
      return;
    }

    this.isLoading = true;
    this.statusMessage = 'Creating your account...';

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          firstN,
          lastN,
          email,
          username,
          password,
          type,
          serviceType,
          qualifications,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Registration failed.');
      }

      this.statusMessage = 'Registration successful!';

      if (result.type === 'customer') {
        await this.router.navigate(['/customer']);
      } else if (result.type === 'provider') {
        await this.router.navigate(['/provider']);
      } else {
        this.statusMessage =
          'Your account was created, but its account type was not recognized.';
      }
    } catch (error: unknown) {
      this.statusMessage =
        error instanceof Error
          ? error.message
          : 'Unable to connect to the server. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }
}