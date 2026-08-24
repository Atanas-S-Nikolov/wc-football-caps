import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Playground } from './playground';

@Component({
    imports: [Playground, RouterModule],
    selector: 'app-root',
    templateUrl: './app.html',
    styleUrl: './app.scss',
})
export class App {
    protected title = 'wc-app';
}
