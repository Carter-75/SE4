import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-page',
  standalone: true,
  templateUrl: './register.component.html',
})
export class RegisterPageComponent {
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  accountType = 'customer';
  isLoading = false;
  statusMessage = '';
  today = '';

  constructor() {
    inject(Title).setTitle('Register');

    const now = new Date();

    this.today = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2,'0'),
      String(now.getDate()).padStart(2,'0'),
    ].join('-');
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
    const dob = String(formData.get('dob') ?? '').trim();
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
      !password|| 
      !dob
    ) {
      this.statusMessage = 'Please complete all required fields.';
      return;
    }

    if (
  !/^\d{4}-\d{2}-\d{2}$/.test(dob) ||
  dob > this.today
) {
  this.statusMessage = 'Please enter a valid date of birth.';
  return;
}

  const [year, month, day] = dob.split('-').map(Number);
  const dobDate = new Date(year, month - 1, day);

  if (
    dobDate.getFullYear() !== year ||
    dobDate.getMonth() !== month - 1 ||
    dobDate.getDate() !== day
  ) {
    this.statusMessage = 'Please enter a valid date of birth.';
    return;
  }
    
    

    if (password.length < 8) {
      this.statusMessage = 'Password must be at least 8 characters.';
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
          dob: String(formData.get('dob') ?? '').trim(),
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
      this.cdr.detectChanges();
    }
  }
}