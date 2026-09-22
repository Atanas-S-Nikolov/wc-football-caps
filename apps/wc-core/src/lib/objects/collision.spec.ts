import { Ball } from './ball';

describe('body collisions', () => {
    it('detects overlapping and touching bodies', () => {
        const first = new Ball(0, 0, 10);
        const second = new Ball(20, 0, 10);

        expect(first.collidesWith(second)).toBe(true);

        second.x = 21;
        expect(first.collidesWith(second)).toBe(false);
    });

    it('separates overlapping bodies and exchanges velocity', () => {
        const first = new Ball(0, 0, 10);
        const second = new Ball(15, 0, 10);
        first.vx = 10;
        second.vx = -10;

        expect(first.resolveCollision(second)).toBe(true);

        expect(second.x - first.x).toBe(20);
        expect(first.vx).toBe(-10);
        expect(second.vx).toBe(10);
    });

    it('does not change separated bodies', () => {
        const first = new Ball(0, 0, 10);
        const second = new Ball(25, 0, 10);
        first.vx = 10;
        second.vx = 10;

        expect(first.resolveCollision(second)).toBe(false);
        expect(first.vx).toBe(10);
        expect(second.vx).toBe(10);
    });

    it('checks whether a point is inside a body', () => {
        const ball = new Ball(10, 10, 5);

        expect(ball.containsPoint(14, 10)).toBe(true);
        expect(ball.containsPoint(16, 10)).toBe(false);
    });

    it('moves a body according to its velocity and elapsed time', () => {
        const ball = new Ball(10, 20, 5);
        ball.vx = 30;
        ball.vy = -10;

        ball.update(0.5);

        expect(ball.x).toBe(25);
        expect(ball.y).toBe(15);
    });
});
