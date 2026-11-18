
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const customerGuard: CanActivateFn = async () => {
    const router = inject(Router);

    try {
        const response = await fetch('/api/auth/user', {
            credentials: 'include'
        });

        // User is not logged in
        if (!response.ok) {
            return router.createUrlTree(['/login']);
        }

        const user = await response.json();

        // Customer is allowed to access this page
        if (user.type === 'customer' || user.type === 'provider' || user.type === 'admin') {
            return true;
        }

        // Redirect administrators to their dashboard
        if (user.type === 'admin') {
            return router.createUrlTree(['/admin']);
        }

        // Redirect providers to their dashboard
        if (user.type === 'provider') {
            return router.createUrlTree(['/provider']);
        }

        // Unknown account type
        return router.createUrlTree(['/login']);

    } catch (error) {
        console.error('Customer authentication check failed:', error);
        return router.createUrlTree(['/login']);
    }
};
