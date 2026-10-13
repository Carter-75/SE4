import { AfterViewInit, Component, ElementRef, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';

const PAGE_SCRIPT = "  const loginForm = document.getElementById('login-form');\n  const loginStatus = document.getElementById('login-status');\n  const loginButton = loginForm.querySelector('button[type=\"submit\"]');\n\n  loginForm.addEventListener('submit', async (event) => {\n    // Stop the browser from reloading the page when the form is submitted.\n    event.preventDefault();\n\n    const email = document.getElementById('username').value.trim();\n    const password = document.getElementById('password').value;\n\n    loginStatus.hidden = false;\n    loginStatus.textContent = 'Logging in...';\n    loginButton.disabled = true;\n\n    try {\n      const response = await fetch('/api/auth/login', {\n        method: 'POST',\n        headers: {\n          'Content-Type': 'application/json'\n        },\n        credentials: 'include',\n        body: JSON.stringify({\n          email: email,\n          password: password\n        })\n      });\n\n      const result = await response.json();\n\n      if (!response.ok) {\n        throw new Error(result.message || 'Login failed. Please try again.');\n      }\n\n      loginStatus.textContent = 'Login successful! Redirecting...';\n\n      // Redirect according to the account type returned by the backend.\n      if (result.type === 'customer') {\n        window.location.href = 'customer.html';\n      } else if (result.type === 'provider') {\n        window.location.href = 'provider.html';\n      } else if (result.type === 'admin') {\n        loginStatus.textContent =\n          'Login successful, but the admin page has not been created yet.';\n      } else {\n        loginStatus.textContent =\n          'Login successful, but this account type is not recognized.';\n      }\n    } catch (error) {\n      loginStatus.textContent =\n        error.message || 'Unable to connect to the server. Please try again.';\n    } finally {\n      loginButton.disabled = false;\n    }\n  });";

@Component({
  selector: 'app-login-page',
  standalone: true,
  templateUrl: './login.component.html',
})
export class LoginPageComponent implements AfterViewInit {
  private host: ElementRef<HTMLElement> = inject(ElementRef);

  constructor() {
    inject(Title).setTitle("Login");
  }

  ngAfterViewInit(): void {
    const scriptEl = document.createElement('script');
    scriptEl.textContent = PAGE_SCRIPT;
    this.host.nativeElement.appendChild(scriptEl);
  }
}
