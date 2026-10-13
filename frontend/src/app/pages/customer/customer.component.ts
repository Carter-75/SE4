import { Component, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-customer-page',
  standalone: true,
  templateUrl: './customer.component.html',
})
export class CustomerPageComponent {
  constructor() {
    inject(Title).setTitle("Customer home");
  }
}
