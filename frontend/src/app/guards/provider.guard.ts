
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const providerGuard: CanActivateFn = async () => {
    const router = inject(Router);

    try {
        const response = await fetch('/api/auth/user', {
            credentials: 'include'
        });

        if (!response.ok) {
            return router.createUrlTree(['/login']);
        }

        const user = await response.json();

        // Only providers can access the Provider Dashboard
        if (user.type === 'provider') {
            return true;
        }

        if (user.type === 'admin') {
            return router.createUrlTree(['/admin']);
        }

        if (user.type === 'customer') {
            return router.createUrlTree(['/customer']);
        }

        return router.createUrlTree(['/login']);

    } catch (error) {
        console.error('Provider authentication check failed:', error);
        return router.createUrlTree(['/login']);
    }
};
