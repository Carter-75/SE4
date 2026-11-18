
import {
    Component,
    inject,
    OnInit,
    ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';

@Component({
    selector: 'app-admin-page',
    standalone: true,
    imports: [RouterLink, CommonModule],
    templateUrl: './admin.component.html',
    styleUrl: './admin.component.css'
})
export class AdminPageComponent implements OnInit {
    private cdr = inject(ChangeDetectorRef);
    private router = inject(Router);
    adminName = '';

    constructor() {
        inject(Title).setTitle('Admin Dashboard');
    }

    async ngOnInit(): Promise<void> {
        try {
            const response = await fetch('/api/auth/user', {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Unable to retrieve admin information.');
            }

            const user = await response.json();

            const firstName = user.firstN || '';
            const lastName = user.lastN || '';

            this.adminName =
                `${firstName} ${lastName}`.trim() ||
                user.username ||
                '';

        } catch (error) {
            console.error('Error loading admin name:', error);
        } finally {
            this.cdr.detectChanges();
        }
    }

    async logout(): Promise<void> {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Logout failed.');
            }

            await this.router.navigate(['/login']);

        } catch (error) {
            console.error('Error logging out:', error);
            window.alert('Unable to log out. Please try again.');
        }
    }

}
