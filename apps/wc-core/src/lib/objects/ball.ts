import { BallConfig } from '../config/config';
import { Body } from './body';

export class Ball extends Body {
    constructor(x: number, y: number, radius: number) {
        super(x, y, radius, 0.99);
    }

    public draw(ctx: CanvasRenderingContext2D, config: BallConfig): void {
        ctx.save();
        ctx.translate(this.x, this.y);

        // ==========================================
        // Ball base
        // ==========================================

        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);

        ctx.fillStyle = config.color;
        ctx.fill();

        // ==========================================
        // Clip everything to the ball
        // ==========================================

        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.clip();

        // ==========================================
        // Central pentagon
        // ==========================================

        this.drawPentagon(ctx, 0, 0, this.radius * 0.27, -Math.PI / 2);

        // ==========================================
        // Five surrounding pentagons
        // ==========================================

        const outerDistance = this.radius * 0.9;
        const outerRadius = this.radius * 0.2;

        for (let i = 0; i < 5; i++) {
            const angle = -Math.PI / 2 + (i * Math.PI * 2) / 5;

            const x = Math.cos(angle) * outerDistance;
            const y = Math.sin(angle) * outerDistance;

            // Rotate the pentagon so one point
            // faces toward the center.
            const rotation = angle + Math.PI;

            this.drawPentagon(ctx, x, y, outerRadius, rotation);
        }

        // ==========================================
        // Outer ball border
        // ==========================================

        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);

        ctx.strokeStyle = '#111111';
        ctx.lineWidth = Math.max(1, this.radius * 0.035);
        ctx.stroke();

        ctx.restore();
    }

    private drawPentagon(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        radius: number,
        rotation: number,
    ): void {
        ctx.beginPath();

        for (let i = 0; i < 5; i++) {
            const angle = rotation + (i * Math.PI * 2) / 5;

            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;

            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }

        ctx.closePath();

        ctx.fillStyle = '#111111';
        ctx.fill();

        ctx.strokeStyle = '#222222';
        ctx.lineWidth = Math.max(0.5, this.radius * 0.015);
        ctx.stroke();
    }
}
