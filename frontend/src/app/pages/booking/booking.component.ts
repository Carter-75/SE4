import { Component, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-booking-page',
  standalone: true,
  templateUrl: './booking.component.html',
})
export class BookingPageComponent {
  constructor() {
    inject(Title).setTitle("Book an appointment");
  }
}
