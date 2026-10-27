import { Component, inject, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-provider-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './provider.component.html',
})
export class ProviderPageComponent implements OnInit {
  private router = inject(Router);

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
        }
      }
    } catch {
    }
  }
}