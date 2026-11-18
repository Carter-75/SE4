
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-customer-page',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './customer.component.html',
})
export class CustomerPageComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);

  customerName = '';

  constructor() {
    inject(Title).setTitle('Customer home');
  }

  async ngOnInit(): Promise<void> {
    try {
      const response = await fetch('/api/auth/user', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Unable to retrieve customer information.');
      }

      const user = await response.json();

      const firstName = user.firstN || '';
      const lastName = user.lastN || '';

      this.customerName =
        `${firstName} ${lastName}`.trim() ||
        user.username ||
        '';

    } catch (error) {
      console.error('Error loading customer name:', error);
    } finally {
      this.cdr.detectChanges();
    }
  }
}
