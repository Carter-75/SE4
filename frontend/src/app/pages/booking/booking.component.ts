import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { BackButtonComponent } from '../../components/back-button/back-button.component';

interface AppointmentSlot {
  _id: string;
  startTime: string;
  endTime: string;
  category: string;
  provider?: {
    firstN?: string;
    lastN?: string;
    serviceType?: string;
    username?: string;
  };
}

interface CalendarDay {
  day: number;
  dateKey: string;
  hasAvailability: boolean;
}

@Component({
  selector: 'app-booking-page',
  standalone: true,
  imports: [CommonModule, RouterLink, BackButtonComponent],
  templateUrl: './booking.component.html',
})
export class BookingPageComponent implements OnInit {
  private title = inject(Title);
  private cdr = inject(ChangeDetectorRef);

  allSlots: AppointmentSlot[] = [];
  filteredSlots: AppointmentSlot[] = [];

  isLoadingAppointments = false;

  selectedService = '';
  selectedMonth = '';
  selectedDate = '';
  selectedSlotId = '';
  providerSearch = '';

  selectedSlot: AppointmentSlot | null = null;

  calendarDays: CalendarDay[] = [];
  calendarBlanks: number[] = [];

  isBooking = false;
  bookingStatus = '';
  bookingError = false;
  bookingSummary = '';

  constructor() {
    this.title.setTitle('Book an appointment');
  }

  ngOnInit(): void {
    const now = new Date();

    this.selectedMonth =
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    this.loadAppointments();
  }

  async loadAppointments(): Promise<void> {
    this.isLoadingAppointments = true;
    this.bookingStatus = '';

    try {
      const response = await fetch('/api/appointments/available', {
        credentials: 'include',
        cache: 'no-store',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Could not load appointments.');
      }

      if (!Array.isArray(result)) {
        throw new Error('The server returned an unexpected appointment response.');
      }

      this.allSlots = result;
      this.updateCalendar();
      this.updateFilteredSlots();
    } catch (error: unknown) {
      this.allSlots = [];
      this.updateCalendar();
      this.updateFilteredSlots();

      this.bookingStatus =
        error instanceof Error
          ? error.message
          : 'Unable to load available appointments.';
    } finally {
      this.isLoadingAppointments = false;
      this.cdr.detectChanges();
    }
  }

  onServiceChange(service: string): void {
    this.selectedService = service;
    this.selectedDate = '';
    this.selectedSlotId = '';
    this.selectedSlot = null;
    this.bookingSummary = '';
    this.bookingStatus = '';

    this.updateCalendar();
    this.updateFilteredSlots();
  }

  onMonthChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.value) {
      return;
    }

    this.selectedMonth = input.value;
    this.selectedDate = '';
    this.selectedSlotId = '';
    this.selectedSlot = null;
    this.bookingSummary = '';

    this.updateCalendar();
    this.updateFilteredSlots();
  }

  updateCalendar(): void {
    this.calendarDays = [];
    this.calendarBlanks = [];

    if (!this.selectedService || !this.selectedMonth) {
      return;
    }

    const [year, month] = this.selectedMonth.split('-').map(Number);

    const firstDay = new Date(year, month - 1, 1).getDay();
    const numberOfDays = new Date(year, month, 0).getDate();

    this.calendarBlanks = Array.from(
      { length: firstDay },
      (_, index) => index
    );

    for (let day = 1; day <= numberOfDays; day++) {
      const dateKey =
        `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      const hasAvailability = this.allSlots.some((slot) => {
        return (
          slot.category?.toLowerCase() === this.selectedService &&
          this.getDateKey(slot.startTime) === dateKey &&
          new Date(slot.startTime).getTime() > Date.now() &&
          this.matchesProviderSearch(slot)
        );
      });

      this.calendarDays.push({
        day,
        dateKey,
        hasAvailability,
      });
    }
  }

  updateFilteredSlots(): void {
    this.filteredSlots = this.allSlots.filter((slot) => {
      const matchesService =
        slot.category?.toLowerCase() === this.selectedService;

      const matchesDate =
        this.selectedDate !== '' &&
        this.getDateKey(slot.startTime) === this.selectedDate;

      const isFuture =
        new Date(slot.startTime).getTime() > Date.now();

      const matchesProvider =
        this.matchesProviderSearch(slot);

      return (
        matchesService &&
        matchesDate &&
        isFuture &&
        matchesProvider
      );
    });

    if (
      this.selectedSlotId &&
      !this.filteredSlots.some(
        (slot) => slot._id === this.selectedSlotId
      )
    ) {
      this.selectedSlotId = '';
      this.selectedSlot = null;
      this.bookingSummary = '';
    }
  }


  selectDate(dateKey: string): void {
    this.selectedDate = dateKey;
    this.selectedSlotId = '';
    this.selectedSlot = null;
    this.bookingSummary = '';
    this.bookingStatus = '';

    this.updateFilteredSlots();
  }

  selectSlot(slot: AppointmentSlot): void {
    this.selectedSlot = slot;
    this.selectedSlotId = slot._id;

    const providerName =
      `${slot.provider?.firstN ?? ''} ${slot.provider?.lastN ?? ''}`.trim()
      || slot.provider?.username
      || 'Provider';

    this.bookingSummary =
      `Selected ${providerName} at ${this.formatTime(slot.startTime)}.`;

    this.bookingStatus = '';
  }

  async bookAppointment(): Promise<void> {
    if (!this.selectedSlotId || this.isBooking) {
      return;
    }

    this.isBooking = true;
    this.bookingError = false;
    this.bookingStatus = 'Confirming your appointment...';

    try {
      const response = await fetch(
        `/api/appointments/${this.selectedSlotId}/book`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || 'Booking failed. Please try again.'
        );
      }

      this.bookingStatus = result.message || 'Appointment booked successfully!';
      this.bookingError = false;
      this.bookingSummary = '';
      this.selectedSlotId = '';
      this.selectedSlot = null;

      // Update the available appointments after setting the confirmation.
      const bookedAppointmentId = result.appointment?._id || result._id;

      this.allSlots = this.allSlots.filter(
        slot => slot._id !== bookedAppointmentId
      );

      this.updateCalendar();
      this.updateFilteredSlots();

    } catch (error: unknown) {
      this.bookingStatus =
        error instanceof Error
          ? error.message
          : 'Unable to book this appointment.';
      this.bookingError = true;
    } finally {
      this.isBooking = false;
      this.cdr.detectChanges();
    }
  }

  getDateKey(dateValue: string): string {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Chicago',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date(dateValue));

    const values = Object.fromEntries(
      parts.map(part => [part.type, part.value])
    );

    return `${values['year']}-${values['month']}-${values['day']}`;
  }

  formatTime(dateValue: string): string {
    return new Date(dateValue).toLocaleTimeString('en-US', {
      timeZone: 'America/Chicago',
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  onProviderSearch(event: Event): void {
    this.providerSearch = (event.target as HTMLInputElement).value;

    this.updateCalendar();
    this.updateFilteredSlots();
  }

  private matchesProviderSearch(slot: AppointmentSlot): boolean {
    const search = this.providerSearch.trim().toLowerCase();

    if (!search) {
      return true;
    }

    const firstName = slot.provider?.firstN || '';
    const lastName = slot.provider?.lastN || '';
    const username = slot.provider?.username || '';

    const fullName = `${firstName} ${lastName}`.trim().toLowerCase();

    return (
      fullName.includes(search) ||
      firstName.toLowerCase().includes(search) ||
      lastName.toLowerCase().includes(search) ||
      username.toLowerCase().includes(search)
    );
  }

}