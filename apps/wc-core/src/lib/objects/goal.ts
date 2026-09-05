import { DEFAULT_GOAL_AREA_COORDINATES, GoalAreaCoordinates } from './field';
import { BaseCoordinates } from './game-object';

const GOAL_BARS_ANGLE_OFFSET = { x: 12, y: 20 };

export class Goal {
    private goalAreaCoords = DEFAULT_GOAL_AREA_COORDINATES;

    constructor(goalAreaCoords: GoalAreaCoordinates) {
        this.goalAreaCoords = goalAreaCoords;
    }

    public draw(ctx: CanvasRenderingContext2D, lineColor: string) {
        this.drawGoal(ctx, lineColor);
    }

    private drawGoal(ctx: CanvasRenderingContext2D, lineColor: string) {
        this.drawGoalSide(ctx, lineColor, 'left');
        this.drawGoalSide(ctx, lineColor, 'right');
    }

    private drawGoalSide(
        ctx: CanvasRenderingContext2D,
        lineColor: string,
        side: 'left' | 'right',
    ) {
        const direction = side === 'left' ? -1 : 1;
        const goalArea = this.goalAreaCoords[side];

        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 4;

        const topPoint = goalArea.top;
        const topAngleX = topPoint.x + direction * GOAL_BARS_ANGLE_OFFSET.x;
        const topAngleY = topPoint.y - GOAL_BARS_ANGLE_OFFSET.y;
        ctx.beginPath();
        ctx.moveTo(topPoint.x, topPoint.y);
        ctx.lineTo(topAngleX, topAngleY);
        const bottomPoint = goalArea.bottom;
        const bottomAngleX =
            bottomPoint.x + direction * GOAL_BARS_ANGLE_OFFSET.x;
        const bottomAngleY = bottomPoint.y - GOAL_BARS_ANGLE_OFFSET.y;
        ctx.lineTo(bottomAngleX, bottomAngleY);
        ctx.lineTo(bottomPoint.x, bottomPoint.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.lineWidth = 1;
        const topNetX = topAngleX + direction * 28;
        const bottomNetX = bottomAngleX + direction * 28;
        ctx.moveTo(topPoint.x, topPoint.y);
        ctx.lineTo(topNetX, topPoint.y);
        ctx.moveTo(topAngleX, topAngleY);
        ctx.lineTo(topNetX, topAngleY);
        ctx.lineTo(bottomNetX, bottomAngleY);
        ctx.lineTo(bottomAngleX, bottomAngleY);
        ctx.stroke();

        [28, 21, 14, 7].forEach((offset) => {
            this.drawNetSideVerticalRope(
                ctx,
                topAngleX,
                topAngleY,
                topPoint,
                offset,
                direction,
            );
        });

        [21, 14, 7].forEach((offset) => {
            this.drawNetTopLongRope(
                ctx,
                topAngleX,
                topAngleY,
                bottomAngleX,
                bottomAngleY,
                offset,
                direction,
            );
        });

        [28, 21, 14, 7].forEach((offset) => {
            this.drawNetSideVerticalRope(
                ctx,
                bottomAngleX,
                bottomAngleY,
                bottomPoint,
                offset,
                direction,
            );
        });

        ctx.beginPath();
        ctx.moveTo(bottomNetX, bottomAngleY);
        ctx.lineTo(bottomNetX, bottomAngleY + GOAL_BARS_ANGLE_OFFSET.y);
        ctx.lineTo(
            bottomAngleX - direction * GOAL_BARS_ANGLE_OFFSET.x,
            bottomAngleY + GOAL_BARS_ANGLE_OFFSET.y,
        );
        ctx.stroke();
    }

    private drawNetTopLongRope(
        ctx: CanvasRenderingContext2D,
        topLeftAngleX: number,
        topLeftAngleY: number,
        bottomLeftAngleX: number,
        bottomLeftAngleY: number,
        offsetFromTopBar: number,
        direction: number,
    ) {
        ctx.beginPath();
        ctx.moveTo(topLeftAngleX + direction * offsetFromTopBar, topLeftAngleY);
        ctx.lineTo(
            bottomLeftAngleX + direction * offsetFromTopBar,
            bottomLeftAngleY,
        );
        ctx.stroke();
    }

    private drawNetSideVerticalRope(
        ctx: CanvasRenderingContext2D,
        leftAngleX: number,
        leftAngleY: number,
        leftPoint: BaseCoordinates,
        offsetFromSideBar: number,
        direction: number,
    ) {
        ctx.beginPath();
        ctx.moveTo(leftAngleX + direction * offsetFromSideBar, leftAngleY);
        ctx.lineTo(leftPoint.x + direction * offsetFromSideBar, leftPoint.y);
        ctx.stroke();
    }
}
