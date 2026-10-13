import { Component, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-availability-page',
  standalone: true,
  templateUrl: './availability.component.html',
})
export class AvailabilityPageComponent {
  constructor() {
    inject(Title).setTitle("Set availability");
  }
}
