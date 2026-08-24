import { GameObject } from './game-object';

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
}
