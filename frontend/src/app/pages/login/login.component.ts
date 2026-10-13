import { AfterViewInit, Component, ElementRef, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';

const PAGE_SCRIPT = "  const loginForm = document.getElementById('login-form');\n  const loginStatus = document.getElementById('login-status');\n  const loginButton = loginForm.querySelector('button[type=\"submit\"]');\n\n  loginForm.addEventListener('submit', async (event) => {\n    // Stop the browser from reloading the page when the form is submitted.\n    event.preventDefault();\n\n    const email = document.getElementById('username').value.trim();\n    const password = document.getElementById('password').value;\n\n    loginStatus.hidden = false;\n    loginStatus.textContent = 'Logging in...';\n    loginButton.disabled = true;\n\n    try {\n      const response = await fetch('/api/auth/login', {\n        method: 'POST',\n        headers: {\n          'Content-Type': 'application/json'\n        },\n        credentials: 'include',\n        body: JSON.stringify({\n          email: email,\n          password: password\n        })\n      });\n\n      const result = await response.json();\n\n      if (!response.ok) {\n        throw new Error(result.message || 'Login failed. Please try again.');\n      }\n\n      loginStatus.textContent = 'Login successful! Redirecting...';\n\n      // Redirect according to the account type returned by the backend.\n      if (result.type === 'customer') {\n        window.location.href = 'customer.html';\n      } else if (result.type === 'provider') {\n        window.location.href = 'provider.html';\n      } else if (result.type === 'admin') {\n        loginStatus.textContent =\n          'Login successful, but the admin page has not been created yet.';\n      } else {\n        loginStatus.textContent =\n          'Login successful, but this account type is not recognized.';\n      }\n    } catch (error) {\n      loginStatus.textContent =\n        error.message || 'Unable to connect to the server. Please try again.';\n    } finally {\n      loginButton.disabled = false;\n    }\n  });";

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './login.component.html',
})

export class LoginPageComponent {
  private router = inject(Router);

  isLoading = false;
  statusMessage = '';

  constructor() {
    inject(Title).setTitle('Login');
  }

  async login(event: SubmitEvent): Promise<void> {
    // Prevent the browser from reloading the page.
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

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || 'Login failed. Please try again.'
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
      this.statusMessage =
        error instanceof Error
          ? error.message
          : 'Unable to connect to the server. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }
}