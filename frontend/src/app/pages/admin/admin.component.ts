import { Component, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-admin-page',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './admin.component.html',
    styleUrl: './admin.component.css'
})
export class AdminPageComponent {
    constructor() {
        inject(Title).setTitle('Admin Dashboard');
    }
}