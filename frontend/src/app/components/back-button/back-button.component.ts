import { Location } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-back-button',
  standalone: true,
  template: '<button type="button" class="back-button" (click)="goBack()">Back</button>',
})
export class BackButtonComponent {
  private location = inject(Location);
  private router = inject(Router);

  @Input() fallback = '/customer';

  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      void this.router.navigate([this.fallback]);
    }
  }
}
