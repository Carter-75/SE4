import { Routes } from '@angular/router';
import { LoginPageComponent } from './pages/login/login.component';
import { RegisterPageComponent } from './pages/register/register.component';
import { AvailabilityPageComponent } from './pages/availability/availability.component';
import { BookingPageComponent } from './pages/booking/booking.component';
import { CustomerPageComponent } from './pages/customer/customer.component';
import { ProviderPageComponent } from './pages/provider/provider.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginPageComponent },
  { path: 'register', component: RegisterPageComponent },
  { path: 'availability', component: AvailabilityPageComponent },
  { path: 'booking', component: BookingPageComponent },
  { path: 'customer', component: CustomerPageComponent },
  { path: 'provider', component: ProviderPageComponent },
  { path: '**', redirectTo: 'login' },
];
