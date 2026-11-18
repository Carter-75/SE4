import { Routes } from '@angular/router';
import { LoginPageComponent } from './pages/login/login.component';
import { RegisterPageComponent } from './pages/register/register.component';
import { AvailabilityPageComponent } from './pages/availability/availability.component';
import { BookingPageComponent } from './pages/booking/booking.component';
import { CustomerPageComponent } from './pages/customer/customer.component';
import { ProviderPageComponent } from './pages/provider/provider.component';
import { SettingsPageComponent } from './pages/settings/settings.component';
import { AppointmentsPageComponent } from './pages/appointments/appointments.component';
import { ProviderAppointmentsPageComponent } from './pages/provider-appointments/provider-appointments.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginPageComponent },
  { path: 'register', component: RegisterPageComponent },
  { path: 'availability', component: AvailabilityPageComponent },
  { path: 'booking', component: BookingPageComponent },
  { path: 'customer', component: CustomerPageComponent },
  { path: 'provider', component: ProviderPageComponent },
  { path: 'settings', component: SettingsPageComponent },
  { path: 'appointments', component: AppointmentsPageComponent },
  { path: 'provider-appointments', component: ProviderAppointmentsPageComponent },
  { path: '**', redirectTo: 'login' },
];
