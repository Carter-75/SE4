import { NgForOf, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { BackButtonComponent } from '../../components/back-button/back-button.component';

interface NotificationItem {
  _id: string;
  kind: string;
  message: string;
  read: boolean;
  timeSent: string;
}

@Component({
  selector: 'app-notifications-page',
  standalone: true,
  imports: [NgForOf, NgIf, BackButtonComponent],
  templateUrl: './notifications.component.html',
})
export class NotificationsPageComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);

  notifications: NotificationItem[] = [];

  constructor() {
    inject(Title).setTitle('Notifications');
  }

  async ngOnInit(): Promise<void> {
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

  kindTitle(kind: string): string {
    if (kind === 'booked') {
      return 'Appointment Booked';
    }

    if (kind === 'unbooked') {
      return 'Appointment Unbooked';
    }

    if (kind === 'cancelled') {
      return 'Appointment Cancelled';
    }

    if (kind === 'reminder') {
      return 'Appointment Reminder';
    }

    return 'Notification';
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
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(timeSent));
  }
}
