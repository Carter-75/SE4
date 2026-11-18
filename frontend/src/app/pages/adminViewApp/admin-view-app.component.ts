
import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Appointment {
    _id: string;
    title: string;
    category: string;
    startTime: string;
    endTime: string;
    status: string;
    provider: {
        firstN: string;
        lastN: string;
        username: string;
    } | null;
    user: {
        firstN: string;
        lastN: string;
        username: string;
    } | null;
}

@Component({
    selector: 'app-admin-view-app',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './admin-view-app.component.html',
    styleUrl: './adminViewApp.css'
})
export class AdminViewAppComponent implements OnInit {
    private cdr = inject(ChangeDetectorRef);
    appointments: Appointment[] = [];
    loading = true;
    errorMessage = '';
    searchTerm = '';
    selectedService = 'all';
    selectedDate = '';
    cancellingId: string | null = null;

    async ngOnInit() {
        await this.loadAppointments();
    }

    async loadAppointments() {
        this.loading = true;
        this.errorMessage = '';

        try {
            const response = await fetch('/api/appointments/admin/all', {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to retrieve appointments.');
            }

            const data = await response.json();

            if (!Array.isArray(data)) {
                throw new Error('Invalid appointment response.');
            }

            this.appointments = data;
        } catch (error) {
            console.error('Error loading appointments:', error);
            this.errorMessage = 'Unable to load appointments.';
        } finally {
            this.loading = false;
            this.cdr.detectChanges();
        }
    }

    getCustomerName(appointment: Appointment): string {
        if (!appointment.user) {
            return 'Unbooked';
        }

        return `${appointment.user.firstN} ${appointment.user.lastN}`;
    }

    getProviderName(appointment: Appointment): string {
        if (!appointment.provider) {
            return 'Unknown Provider';
        }

        return `${appointment.provider.firstN} ${appointment.provider.lastN}`;
    }

    get filteredAppointments(): Appointment[] {
        const search = this.searchTerm.trim().toLowerCase();

        return this.appointments.filter(appointment => {
            const customerName = this.getCustomerName(appointment).toLowerCase();
            const providerName = this.getProviderName(appointment).toLowerCase();

            // Filter by customer or provider
            const matchesSearch =
                customerName.includes(search) ||
                providerName.includes(search);

            // Filter by service category
            const matchesService =
                this.selectedService === 'all' ||
                appointment.category?.toLowerCase() === this.selectedService;

            // Filter by appointment date
            const matchesDate =
                !this.selectedDate ||
                this.getAppointmentDate(appointment) === this.selectedDate;

            // All three conditions must match
            return matchesSearch && matchesService && matchesDate;
        });
    }

    formatDate(date: string): string {
        return new Date(date).toLocaleDateString('en-US', {
            timeZone: 'America/Chicago',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    formatTime(date: string): string {
        return new Date(date).toLocaleTimeString('en-US', {
            timeZone: 'America/Chicago',
            hour: 'numeric',
            minute: '2-digit'
        });
    }

    getAppointmentDate(appointment: Appointment): string {
        const date = new Date(appointment.startTime);

        if (Number.isNaN(date.getTime())) {
            return '';
        }

        // Convert the appointment date to YYYY-MM-DD
        // using the application's Chicago timezone.
        const parts = new Intl.DateTimeFormat('en-US', {
            timeZone: 'America/Chicago',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).formatToParts(date);

        const year = parts.find(part => part.type === 'year')?.value;
        const month = parts.find(part => part.type === 'month')?.value;
        const day = parts.find(part => part.type === 'day')?.value;

        return `${year}-${month}-${day}`;
    }

    async cancelAppointment(appointment: Appointment): Promise<void> {
        if (this.cancellingId !== null) {
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to cancel "${appointment.title}"?`
        );

        if (!confirmed) {
            return;
        }

        this.cancellingId = appointment._id;

        try {
            const response = await fetch(
                `/api/appointments/admin/${encodeURIComponent(appointment._id)}/cancel`,
                {
                    method: 'POST',
                    credentials: 'include'
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || 'Failed to cancel appointment.'
                );
            }

            await this.loadAppointments();

            window.alert('Appointment cancelled successfully.');

        } catch (error) {
            console.error('Error cancelling appointment:', error);

            window.alert(
                error instanceof Error
                    ? error.message
                    : 'Unable to cancel appointment.'
            );
        } finally {
            this.cancellingId = null;
            this.cdr.detectChanges();
        }
    }

    canCancelAppointment(appointment: Appointment): boolean {
        // Already cancelled appointments cannot be cancelled again
        if (appointment.status === 'cancelled') {
            return false;
        }

        const startTime = new Date(appointment.startTime).getTime();

        // Invalid appointment dates should not be cancellable
        if (Number.isNaN(startTime)) {
            return false;
        }

        // Appointments must start more than 30 minutes from now
        const thirtyMinutes = 30 * 60 * 1000;

        return startTime - Date.now() > thirtyMinutes;
    }

}
