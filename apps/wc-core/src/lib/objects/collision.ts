import type { Body } from './body';

const POSITION_CORRECTION_PERCENT = 1;

export const areBodiesColliding = (first: Body, second: Body): boolean => {
    const combinedRadius = first.radius + second.radius;
    const distanceX = second.x - first.x;
    const distanceY = second.y - first.y;

    return (
        distanceX * distanceX + distanceY * distanceY <=
        combinedRadius * combinedRadius
    );
};

export const resolveBodyCollision = (first: Body, second: Body): boolean => {
    const distanceX = second.x - first.x;
    const distanceY = second.y - first.y;
    const distanceSquared = distanceX * distanceX + distanceY * distanceY;
    const combinedRadius = first.radius + second.radius;

    if (distanceSquared > combinedRadius * combinedRadius) {
        return false;
    }

    const distance = Math.sqrt(distanceSquared);
    const normalX = distance > 0 ? distanceX / distance : 1;
    const normalY = distance > 0 ? distanceY / distance : 0;
    const firstInverseMass = getInverseMass(first.mass);
    const secondInverseMass = getInverseMass(second.mass);
    const inverseMassTotal = firstInverseMass + secondInverseMass;

    if (inverseMassTotal > 0) {
        const penetration = combinedRadius - distance;
        const correction =
            (Math.max(0, penetration) * POSITION_CORRECTION_PERCENT) /
            inverseMassTotal;

        first.x -= normalX * correction * firstInverseMass;
        first.y -= normalY * correction * firstInverseMass;
        second.x += normalX * correction * secondInverseMass;
        second.y += normalY * correction * secondInverseMass;

        const relativeVelocityX = second.vx - first.vx;
        const relativeVelocityY = second.vy - first.vy;
        const velocityAlongNormal =
            relativeVelocityX * normalX + relativeVelocityY * normalY;

        if (velocityAlongNormal < 0) {
            const impulse = (-(1 + 1) * velocityAlongNormal) / inverseMassTotal;
            const impulseX = impulse * normalX;
            const impulseY = impulse * normalY;

            first.vx -= impulseX * firstInverseMass;
            first.vy -= impulseY * firstInverseMass;
            second.vx += impulseX * secondInverseMass;
            second.vy += impulseY * secondInverseMass;
        }
    }

    return true;
};

const getInverseMass = (mass: number): number => (mass > 0 ? 1 / mass : 0);
