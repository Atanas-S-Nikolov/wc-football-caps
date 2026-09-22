import { GameObject } from './game-object';
import { areBodiesColliding, resolveBodyCollision } from './collision';

export abstract class Body extends GameObject {
    public radius = 0;
    public mass = 0;
    public vx = 0;
    public vy = 0;

    constructor(x: number, y: number, radius: number, mass: number) {
        super(x, y);

        this.radius = radius;
        this.mass = mass;

        this.vx = 0;
        this.vy = 0;
    }

    public collidesWith(other: Body): boolean {
        return areBodiesColliding(this, other);
    }

    public containsPoint(x: number, y: number): boolean {
        const distanceX = x - this.x;
        const distanceY = y - this.y;

        return (
            distanceX * distanceX + distanceY * distanceY <=
            this.radius * this.radius
        );
    }

    public override update(dt: number): void {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
    }

    public resolveCollision(other: Body): boolean {
        return resolveBodyCollision(this, other);
    }
}
