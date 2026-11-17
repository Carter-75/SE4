import { NgForOf, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BackButtonComponent } from '../../components/back-button/back-button.component';

interface NotificationItem {
  _id: string;
  kind: string;
  message: string;
  read: boolean;
  timeSent: string;
}

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [NgForOf, NgIf, RouterLink, BackButtonComponent],
  templateUrl: './settings.component.html',
})
export class SettingsPageComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  isProvider = false;
  fromCustomer = false;
  backFallback = '/customer';
  notifications: NotificationItem[] = [];

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

    await this.loadNotifications();
  }

  get hasUnread(): boolean {
    return this.notifications.some((notification) => !notification.read);
  }

  async loadNotifications(): Promise<void> {
    try {
      const response = await fetch('/api/notifications', {
        credentials: 'include',
      });

      if (response.ok) {
        this.notifications = await response.json();
        this.cdr.detectChanges();
      }
    } catch {
    }
  }

  async markRead(notification: NotificationItem): Promise<void> {
    if (notification.read) {
      return;
    }

    try {
      const response = await fetch(`/api/notifications/${notification._id}/read`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        notification.read = true;
        this.cdr.detectChanges();
      }
    } catch {
    }
  }

  async markAllRead(): Promise<void> {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        this.notifications = this.notifications.map((notification) => ({
          ...notification,
          read: true,
        }));
        this.cdr.detectChanges();
      }
    } catch {
    }
  }

  formatSent(timeSent: string): string {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Chicago',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(timeSent));
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
