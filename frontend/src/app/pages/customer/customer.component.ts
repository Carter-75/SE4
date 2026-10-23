import { Component, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { SettingsDropdownComponent } from '../../components/settings-dropdown/settings-dropdown.component';

@Component({
  selector: 'app-customer-page',
  standalone: true,
  imports: [RouterLink, SettingsDropdownComponent],
  templateUrl: './customer.component.html',
})
export class CustomerPageComponent {
  constructor() {
    inject(Title).setTitle('Customer home');
  }
}