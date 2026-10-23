import { Component, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { SettingsDropdownComponent } from '../../components/settings-dropdown/settings-dropdown.component';

@Component({
  selector: 'app-provider-page',
  standalone: true,
  imports: [RouterLink, SettingsDropdownComponent],
  templateUrl: './provider.component.html',
})
export class ProviderPageComponent {
  constructor() {
    inject(Title).setTitle('Service provider home');
  }
}