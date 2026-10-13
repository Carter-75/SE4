import { Component, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-provider-page',
  standalone: true,
  templateUrl: './provider.component.html',
})
export class ProviderPageComponent {
  constructor() {
    inject(Title).setTitle("Service provider home");
  }
}
