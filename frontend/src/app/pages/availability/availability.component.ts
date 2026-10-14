import { Component, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-availability-page',
  standalone: true,
  templateUrl: './availability.component.html',
})
export class AvailabilityPageComponent {
  slotStatus = '';

  constructor() {
    inject(Title).setTitle('Set availability');
  }

  async createSlot(event: SubmitEvent): Promise<void> {
    event.preventDefault();

    const form = event.currentTarget as HTMLFormElement;
    const formData = new FormData(form);

    this.slotStatus = 'Creating appointment slot...';

    try {
      const response = await fetch('/api/appointments/slots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          serviceType: formData.get('serviceType'),
          appointmentTitle: formData.get('appointmentTitle'),
          date: formData.get('date'),
          startTime: formData.get('startTime'),
          endTime: formData.get('endTime'),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Could not create appointment slot.');
      }

      this.slotStatus = 'Appointment slot created successfully!';
      form.reset();
    } catch (error: unknown) {
      this.slotStatus =
        error instanceof Error
          ? error.message
          : 'Could not create appointment slot.';
    }
  }
}
