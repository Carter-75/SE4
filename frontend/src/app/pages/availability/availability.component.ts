import { Component, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { SettingsDropdownComponent } from '../../components/settings-dropdown/settings-dropdown.component';

@Component({
  selector: 'app-availability-page',
  standalone: true,
  imports: [SettingsDropdownComponent],
  templateUrl: './availability.component.html',
})

export class AvailabilityPageComponent {
  slotStatus = '';
  today ='';

  constructor() {
    inject(Title).setTitle('Set availability');

    const now = new Date();

    this.today = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2,'0'),
      String(now.getDate()).padStart(2,'0'),
    ].join('-');
  }

  async createSlot(event: SubmitEvent): Promise<void> {
    event.preventDefault();

    const form = event.currentTarget as HTMLFormElement;
    const formData = new FormData(form);

    const serviceType = String(formData.get('serviceType') ?? '');
    const appointmentTitle = String(
    formData.get('appointmentTitle') ?? ''
    ).trim();
    const date = String(formData.get('date') ?? '');
    const startTime = String(formData.get('startTime') ?? '');
    const endTime = String(formData.get('endTime') ?? '');

    if (!serviceType || !appointmentTitle || !date || !startTime || !endTime) {
      this.slotStatus = 'Please fill in all required fields.';
    return;
   }
   if (endTime <= startTime) {
      this.slotStatus = 'End time must be later than start time.';
      return;
    }

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

      this.slotStatus = result.message || 'Appointment slot created successfully!';
      form.reset();
    } catch (error: unknown) {
      this.slotStatus =
        error instanceof Error
          ? error.message
          : 'Could not create appointment slot.';
    }
  }
}
