
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = async () => {
    const router = inject(Router);

    try {
        const response = await fetch('/api/auth/user', {
            credentials: 'include'
        });

        if (!response.ok) {
            return router.createUrlTree(['/login']);
        }

        const user = await response.json();

        if (user.type === 'admin') {
            return true;
        }

        if (user.type === 'provider') {
            return router.createUrlTree(['/provider']);
        }

        return router.createUrlTree(['/customer']);

    } catch (error) {
        console.error('Admin authentication check failed:', error);
        return router.createUrlTree(['/login']);
    }
};
