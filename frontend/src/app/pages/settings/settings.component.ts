import { NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BackButtonComponent } from '../../components/back-button/back-button.component';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [NgIf, RouterLink, BackButtonComponent],
  templateUrl: './settings.component.html',
})
export class SettingsPageComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  isProvider = false;
  fromCustomer = false;
  backFallback = '/customer';

  constructor() {
    inject(Title).setTitle('Settings');
    const from = this.route.snapshot.queryParamMap.get('from');
    this.fromCustomer = from === 'customer';
    this.backFallback = from === 'provider' ? '/provider' : '/customer';
  }

  async ngOnInit(): Promise<void> {
    try {
      const response = await fetch('/api/auth/user', {
        credentials: 'include',
      });

      if (response.ok) {
        const user = await response.json();
        this.isProvider = user.type === 'provider';
        this.cdr.detectChanges();
      }
    } catch {
    }
  }

  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
    } finally {
      await this.router.navigate(['/login']);
    }
  }
}
