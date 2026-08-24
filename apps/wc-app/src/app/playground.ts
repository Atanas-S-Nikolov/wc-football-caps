import { Component, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { run } from '@wc-football-caps/wc-core';

@Component({
    selector: 'app-playground',
    imports: [CommonModule],
    template: ` <canvas id="wc-canvas-playground"></canvas> `,
    styles: `
        #wc-canvas-playground {
            display: block;
            width: 100vw;
            height: 100vh;
            max-width: 100vw;
            max-height: 100vh;
            box-sizing: border-box;
        }
    `,
    encapsulation: ViewEncapsulation.None,
})
export class Playground implements AfterViewInit {
    ngAfterViewInit(): void {
        run();
    }
}
