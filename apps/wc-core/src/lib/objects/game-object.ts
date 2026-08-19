export abstract class GameObject {
    public x: number;
    public y: number;

    public rotation = 0;
    public active = true;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    /**
     * Update object state.
     * dt = elapsed time in seconds.
     */
    public update(dt: number): void {
        // Override in subclasses when needed
    }

    /**
     * Draw object on Canvas.
     */
    public abstract draw(ctx: CanvasRenderingContext2D, _config: object): void;
}
