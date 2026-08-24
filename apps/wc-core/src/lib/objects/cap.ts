import { Body } from './body';

export class Cap extends Body {
    private teamId = '';

    constructor(x: number, y: number, radius: number, teamId: string) {
        super(x, y, radius, 1);
        this.teamId = teamId;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        const backgroundImage = this.getLogoImgElement();

        if (backgroundImage.complete && backgroundImage.naturalWidth > 0) {
            this.fillWithLogo(ctx, backgroundImage);
            return;
        }

        backgroundImage.addEventListener(
            'load',
            () => this.fillWithLogo(ctx, backgroundImage),
            { once: true },
        );
    }

    private createLogoImgElement(): HTMLImageElement {
        const img = document.createElement('img');
        img.src = '/assets/test-logo.svg';
        img.id = 'cap-background';
        img.height = this.radius;
        img.width = this.radius;
        img.style.display = 'none';
        return img;
    }

    private fillWithLogo(
        ctx: CanvasRenderingContext2D,
        image: HTMLImageElement,
    ): void {
        const pattern = ctx.createPattern(image, 'no-repeat');

        if (!pattern) {
            return;
        }

        const size = this.radius * 2;
        const scaleX = size / image.naturalWidth;
        const scaleY = size / image.naturalHeight;
        pattern.setTransform(
            new DOMMatrix([
                scaleX,
                0,
                0,
                scaleY,
                this.x - this.radius,
                this.y - this.radius,
            ]),
        );

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = pattern;
        ctx.fill();
    }

    private getLogoImgElement(): HTMLImageElement {
        let img = document.getElementById(
            'cap-background',
        ) as HTMLImageElement | null;

        if (!img) {
            img = this.createLogoImgElement();
        }

        document.body.appendChild(img);

        return img;
    }
}
