import { Component, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-customer-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './customer.component.html',
})
export class CustomerPageComponent {
  constructor() {
    inject(Title).setTitle('Customer home');
  }
}