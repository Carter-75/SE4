import { AfterViewInit, Component, ElementRef, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';

const PAGE_SCRIPT = "  const registerForm = document.getElementById('register-form');\n  const registerStatus = document.getElementById('register-status');\n  const roleSelect = document.querySelector('[name=\"role\"]');\n\n  const serviceTypeField = registerForm.querySelector('[name=\"serviceType\"]');\n  const qualificationsField = registerForm.querySelector('[name=\"qualifications\"]');\n\n  // Show provider-specific fields only when provider is selected.\n  function updateProviderFields() {\n    const isProvider = roleSelect.value === 'provider';\n\n    if (serviceTypeField) {\n      serviceTypeField.required = isProvider;\n      serviceTypeField.closest('.form-group')?.toggleAttribute('hidden', !isProvider);\n    }\n\n    if (qualificationsField) {\n      qualificationsField.required = isProvider;\n      qualificationsField.closest('.form-group')?.toggleAttribute('hidden', !isProvider);\n    }\n  }\n\n  roleSelect.addEventListener('change', updateProviderFields);\n  updateProviderFields();\n\n  registerForm.addEventListener('submit', async (event) => {\n    event.preventDefault();\n\n    const firstName = document.getElementById('first-name').value.trim();\n    const lastName = document.getElementById('last-name').value.trim();\n    const email = document.getElementById('email').value.trim();\n    const username = document.getElementById('register-username').value.trim();\n    const password = document.getElementById('register-password').value;\n    const type = roleSelect.value;\n\n    const serviceType = serviceTypeField?.value.trim() || '';\n    const qualifications = qualificationsField?.value.trim() || '';\n\n    registerStatus.hidden = false;\n    registerStatus.textContent = 'Creating your account...';\n\n    try {\n      const response = await fetch('/api/auth/register', {\n        method: 'POST',\n        headers: {\n          'Content-Type': 'application/json'\n        },\n        credentials: 'include',\n        body: JSON.stringify({\n          firstName,\n          lastName,\n          email,\n          username,\n          password,\n          type,\n          serviceType,\n          qualifications\n        })\n      });\n\n      const result = await response.json();\n\n      if (!response.ok) {\n        throw new Error(result.message || 'Registration failed.');\n      }\n\n      registerStatus.textContent =\n        `Registration successful! Welcome, ${result.firstName}.`;\n\n      // Redirect according to the account type.\n      if (result.type === 'customer') {\n        window.location.href = 'customer.html';\n      } else if (result.type === 'provider') {\n        window.location.href = 'provider.html';\n      }\n    } catch (error) {\n      registerStatus.textContent =\n        error.message || 'Unable to connect to the server.';\n    }\n  });";

@Component({
  selector: 'app-register-page',
  standalone: true,
  templateUrl: './register.component.html',
})
export class RegisterPageComponent implements AfterViewInit {
  private host: ElementRef<HTMLElement> = inject(ElementRef);

  constructor() {
    inject(Title).setTitle("Register \u2014 Figma preview");
  }

  ngAfterViewInit(): void {
    const scriptEl = document.createElement('script');
    scriptEl.textContent = PAGE_SCRIPT;
    this.host.nativeElement.appendChild(scriptEl);
  }
}
