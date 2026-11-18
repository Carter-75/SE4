import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { BackButtonComponent } from '../../components/back-button/back-button.component';

interface MineAppointment {
  _id: string;
  title: string;
  category: string;
  status: string;
  startTime: string;
  provider?: { _id: string } | null;
  user?: {
    firstN?: string;
    lastN?: string;
    username?: string;
  } | null;
}

interface AppointmentCard {
  id: string;
  title: string;
  customerName: string;
  category: string;
  categoryLabel: string;
  dateLabel: string;
  timestamp: number;
  status: string;
}

@Component({
  selector: 'app-provider-appointments-page',
  standalone: true,
  imports: [CommonModule, BackButtonComponent],
  templateUrl: './provider-appointments.component.html',
  styleUrl: './provider-appointments.component.css',
})

export class ProviderAppointmentsPageComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);

  appointments: AppointmentCard[] = [];
  loading = true;
  loadError = '';
  statusMessage = '';
  searchText = '';
  sortOption = 'default';
  category = 'all';

  constructor() {
    inject(Title).setTitle('View Your Appointments');
  }

  async ngOnInit(): Promise<void> {
    await this.loadAppointments();
  }

  async loadAppointments(): Promise<void> {
    this.loading = true;
    this.loadError = '';
    this.cdr.detectChanges();

    try {
      const userResponse = await fetch('/api/auth/user', {
        credentials: 'include',
      });

      if (!userResponse.ok) {
        throw new Error('Unable to load appointments');
      }

      const me = await userResponse.json();

      const response = await fetch('/api/appointments/mine', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Unable to load appointments');
      }

      const data: MineAppointment[] = await response.json();


      this.appointments = data
        .filter(
          (appointment) =>
            appointment.provider &&
            appointment.provider._id === me.id
        )
        .map((appointment) => this.toCard(appointment));

    } catch (error) {
      console.error(error);
      this.appointments = [];
      this.loadError = 'Could not load appointments.';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  private toCard(appointment: MineAppointment): AppointmentCard {
    const start = new Date(appointment.startTime);
    const customer = appointment.user;
    const customerName = customer
      ? [customer.firstN, customer.lastN].filter(Boolean).join(' ') ||
      customer.username ||
      'Customer'
      : appointment.status
        ? appointment.status[0].toUpperCase() + appointment.status.slice(1)
        : '';
    const category = (appointment.category || '').toLowerCase();
    const dateLabel =
      new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Chicago',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }).format(start) +
      ' • ' +
      new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Chicago',
        hour: 'numeric',
        minute: '2-digit',
      }).format(start);

    return {
      id: appointment._id,
      title: appointment.title || 'Appointment',
      customerName,
      category,
      categoryLabel: category
        ? category[0].toUpperCase() + category.slice(1)
        : '',
      dateLabel,
      timestamp: start.getTime(),
      status: appointment.status,
    };
  }

  get upcoming(): AppointmentCard[] {
    return this.sortCards(
      this.visible().filter((appointment) => appointment.timestamp > Date.now()),
      'upcoming'
    );
  }

  get past(): AppointmentCard[] {
    return this.sortCards(
      this.visible().filter(
        (appointment) => appointment.timestamp <= Date.now()
      ),
      'past'
    );
  }

  private visible(): AppointmentCard[] {
    const search = this.searchText.trim().toLowerCase();

    return this.appointments.filter((appointment) => {
      const matchesCategory =
        this.category === 'all' || appointment.category === this.category;
      const text = [
        appointment.title,
        appointment.customerName,
        appointment.categoryLabel,
      ]
        .join(' ')
        .toLowerCase();

      return matchesCategory && text.includes(search);
    });
  }

  private sortCards(
    list: AppointmentCard[],
    section: string
  ): AppointmentCard[] {
    const sorted = [...list];

    sorted.sort((a, b) => {
      if (this.sortOption === 'az') {
        return a.title.localeCompare(b.title);
      }

      if (this.sortOption === 'za') {
        return b.title.localeCompare(a.title);
      }

      if (this.sortOption === 'newest') {
        return b.timestamp - a.timestamp;
      }

      if (this.sortOption === 'oldest') {
        return a.timestamp - b.timestamp;
      }

      return section === 'upcoming'
        ? a.timestamp - b.timestamp
        : b.timestamp - a.timestamp;
    });

    return sorted;
  }

  onSearch(event: Event): void {
    this.searchText = (event.target as HTMLInputElement).value;
  }

  onSort(event: Event): void {
    this.sortOption = (event.target as HTMLSelectElement).value;
  }

  onCategory(value: string): void {
    this.category = value;
  }

  async cancel(appointment: AppointmentCard): Promise<void> {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    this.statusMessage = '';
    this.cdr.detectChanges();

    try {
      const response = await fetch(
        `/api/appointments/${encodeURIComponent(appointment.id)}/cancel`,
        {
          method: 'POST',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        this.statusMessage =
          data?.message || 'Unable to cancel the appointment. Please try again.';

        this.cdr.detectChanges();

        // Display the error in a popup
        window.alert(this.statusMessage);

        return;
      }

      await this.loadAppointments();
    } catch (error) {
      console.error(error);

      this.statusMessage =
        'Unable to cancel the appointment. Please try again.';

      this.cdr.detectChanges();

      window.alert(this.statusMessage);
    }
  }
}