import { FieldConfig, GradientColors } from '../config/config';
import { BaseCoordinates } from './game-object';

export interface FieldDimensions {
    width: number;
    height: number;
    topLeft: { x: number; y: number };
    topRight: { x: number; y: number };
    bottomLeft: { x: number; y: number };
    bottomRight: { x: number; y: number };
}

export interface GoalAreaSidePoints {
    top: BaseCoordinates;
    bottom: BaseCoordinates;
}

const DEFAULT_GOAL_AREA_POINT: BaseCoordinates = { x: 0, y: 0 };
const LINE_WIDTH = 3;
const DOT_RADIUS = 5;
const GOAL_BARS_ANGLE_OFFSET = { x: 12, y: 20 };

export class Field {
    private width = 0;
    private height = 0;
    private topLeft = { x: 0, y: 0 };
    private topRight = { x: 0, y: 0 };
    private bottomLeft = { x: 0, y: 0 };
    private bottomRight = { x: 0, y: 0 };
    private penaltyAreaWidth = 0;
    private penaltyAreaHeight = 0;
    private leftPenaltySpot = { x: 0, y: 0 };
    private rightPenaltySpot = { x: 0, y: 0 };
    private goalAreaCoords: {
        left: GoalAreaSidePoints;
        right: GoalAreaSidePoints;
        height: number;
    } = {
        left: { top: DEFAULT_GOAL_AREA_POINT, bottom: DEFAULT_GOAL_AREA_POINT },
        right: {
            top: DEFAULT_GOAL_AREA_POINT,
            bottom: DEFAULT_GOAL_AREA_POINT,
        },
        height: 0,
    };

    getWidth() {
        return this.width;
    }

    getHeight() {
        return this.height;
    }

    getDimensions(): FieldDimensions {
        return {
            width: this.width,
            height: this.height,
            topLeft: this.topLeft,
            topRight: this.topRight,
            bottomLeft: this.bottomLeft,
            bottomRight: this.bottomRight,
        };
    }

    public draw(ctx: CanvasRenderingContext2D, config: FieldConfig): void {
        // Use the canvas size (CSS pixels) and devicePixelRatio for crisp rendering.
        const canvas = ctx.canvas as HTMLCanvasElement;
        const dpr = window.devicePixelRatio || 1;

        // Determine the CSS size of the canvas. If client sizes are not set,
        // fall back to the current canvas width/height divided by DPR.
        const cssWidth = canvas.clientWidth || canvas.width / dpr || 300;
        const cssHeight = canvas.clientHeight || canvas.height / dpr || 150;

        // Resize the backing store to match DPR for sharp drawing.
        const pixelWidth = Math.max(1, Math.floor(cssWidth * dpr));
        const pixelHeight = Math.max(1, Math.floor(cssHeight * dpr));
        if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
            canvas.width = pixelWidth;
            canvas.height = pixelHeight;
            // keep CSS size
            canvas.style.width = `${cssWidth}px`;
            canvas.style.height = `${cssHeight}px`;
        }

        // Reset transform and scale so drawing commands use CSS pixels.
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // offset in config is a percentage of the canvas height
        const { offset } = config;
        const offsetPercentage = (cssHeight * offset) / 100;
        const bottomOffsetPercentage = (cssHeight * config.bottomOffset) / 100;

        this.width = Math.max(0, cssWidth - 2 * offsetPercentage);
        this.height = Math.max(
            0,
            cssHeight - offsetPercentage - bottomOffsetPercentage,
        );
        this.topLeft = { x: offsetPercentage, y: offsetPercentage };
        this.topRight = {
            x: offsetPercentage + this.width,
            y: offsetPercentage,
        };
        this.bottomLeft = {
            x: offsetPercentage,
            y: offsetPercentage + this.height,
        };
        this.bottomRight = {
            x: offsetPercentage + this.width,
            y: offsetPercentage + this.height,
        };
        this.penaltyAreaWidth = this.width / 9;
        this.penaltyAreaHeight = this.height * 0.4;
        this.leftPenaltySpot = {
            x: this.topLeft.x + this.width * 0.08,
            y: this.topLeft.y + this.height / 2,
        };
        this.rightPenaltySpot = {
            x: this.topLeft.x + this.width * 0.92,
            y: this.topLeft.y + this.height / 2,
        };
        const goalLineHeight = this.penaltyAreaHeight / 2;
        this.goalAreaCoords = {
            left: {
                top: {
                    x: this.topLeft.x,
                    y: this.topLeft.y + this.height * 0.4,
                },
                bottom: {
                    x: this.topLeft.x,
                    y: this.topLeft.y + this.height * 0.4 + goalLineHeight,
                },
            },
            right: {
                top: {
                    x: this.topRight.x,
                    y: this.topRight.y + this.height * 0.4,
                },
                bottom: {
                    x: this.topRight.x,
                    y: this.topRight.y + this.height * 0.4 + goalLineHeight,
                },
            },
            height: goalLineHeight,
        };

        this.drawOuterArea(
            canvas,
            ctx,
            cssWidth,
            cssHeight,
            config.outerBackground,
        );
        this.drawInnerField(ctx, config.innerBackground, config.lineColor);
        this.drawCenterLine(ctx, config.lineColor);
        this.drawPenaltyAreas(ctx, config.lineColor);
        this.drawGoal(ctx, config.lineColor);
        this.drawCornerArcs(ctx, config.lineColor);
    }

    private drawOuterArea(
        canvas: HTMLCanvasElement,
        ctx: CanvasRenderingContext2D,
        cssWidth: number,
        cssHeight: number,
        background: string,
    ) {
        ctx.clearRect(0, 0, cssWidth, cssHeight);
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, cssWidth, cssHeight);
        canvas.style.background = background;
    }

    private drawInnerField(
        ctx: CanvasRenderingContext2D,
        background: string | GradientColors,
        lineColor: string,
    ) {
        const fill =
            typeof background === 'string'
                ? background
                : this.getGradientFromColors(ctx, background);
        ctx.fillStyle = fill;
        ctx.fillRect(this.topLeft.x, this.topLeft.y, this.width, this.height);
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = LINE_WIDTH;
        ctx.strokeRect(this.topLeft.x, this.topLeft.y, this.width, this.height);
    }

    private getGradientFromColors(
        ctx: CanvasRenderingContext2D,
        colors: GradientColors,
    ): CanvasGradient {
        const gradient = ctx.createLinearGradient(
            this.topLeft.x,
            this.topLeft.y,
            this.topRight.x,
            this.topRight.y,
        );
        const { firstColor, secondColor } = colors;

        gradient.addColorStop(0.0, firstColor);
        gradient.addColorStop(0.1, firstColor);

        gradient.addColorStop(0.1, secondColor);
        gradient.addColorStop(0.2, secondColor);

        gradient.addColorStop(0.2, firstColor);
        gradient.addColorStop(0.3, firstColor);

        gradient.addColorStop(0.3, secondColor);
        gradient.addColorStop(0.4, secondColor);

        gradient.addColorStop(0.4, firstColor);
        gradient.addColorStop(0.5, firstColor);

        gradient.addColorStop(0.5, secondColor);
        gradient.addColorStop(0.6, secondColor);

        gradient.addColorStop(0.6, firstColor);
        gradient.addColorStop(0.7, firstColor);

        gradient.addColorStop(0.7, secondColor);
        gradient.addColorStop(0.8, secondColor);

        gradient.addColorStop(0.8, firstColor);
        gradient.addColorStop(0.9, firstColor);

        gradient.addColorStop(0.9, secondColor);
        gradient.addColorStop(1.0, secondColor);

        return gradient;
    }

    private drawCenterLine(ctx: CanvasRenderingContext2D, lineColor: string) {
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = LINE_WIDTH;

        const topLeftLineCenter = this.topLeft.x + this.width / 2;

        ctx.beginPath();
        ctx.moveTo(topLeftLineCenter, this.topLeft.y);
        ctx.lineTo(topLeftLineCenter, this.topLeft.y + this.height);
        ctx.stroke();

        const centerPoint = {
            x: topLeftLineCenter,
            y: this.topLeft.y + this.height / 2,
        };
        const centerCircle = {
            x: centerPoint.x,
            y: centerPoint.y,
            radius: this.height / 7,
        };
        ctx.beginPath();
        ctx.arc(
            centerCircle.x,
            centerCircle.y,
            centerCircle.radius,
            0,
            2 * Math.PI,
        );
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(centerCircle.x, centerCircle.y, DOT_RADIUS, 0, 2 * Math.PI);
        ctx.fillStyle = lineColor;
        ctx.fill();
    }

    private drawPenaltyAreas(ctx: CanvasRenderingContext2D, lineColor: string) {
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = LINE_WIDTH;

        // Left penalty area
        ctx.beginPath();
        ctx.rect(
            this.topLeft.x,
            this.topLeft.y + this.height * 0.3,
            this.penaltyAreaWidth,
            this.penaltyAreaHeight,
        );
        ctx.stroke();
        // Left penalty spot
        ctx.beginPath();
        ctx.arc(
            this.leftPenaltySpot.x,
            this.leftPenaltySpot.y,
            DOT_RADIUS,
            0,
            2 * Math.PI,
        );
        ctx.fillStyle = lineColor;
        ctx.fill();

        // Right penalty area
        ctx.beginPath();
        ctx.rect(
            this.topRight.x - this.penaltyAreaWidth,
            this.topRight.y + this.height * 0.3,
            this.penaltyAreaWidth,
            this.penaltyAreaHeight,
        );
        ctx.stroke();
        // Right penalty spot
        ctx.beginPath();
        ctx.arc(
            this.rightPenaltySpot.x,
            this.rightPenaltySpot.y,
            DOT_RADIUS,
            0,
            2 * Math.PI,
        );
        ctx.fillStyle = lineColor;
        ctx.fill();

        const goalAreaWidth = this.penaltyAreaWidth / 2.5;

        // left goal area
        ctx.beginPath();
        ctx.rect(
            this.topLeft.x,
            this.topLeft.y + this.height * 0.4,
            goalAreaWidth,
            this.goalAreaCoords.height,
        );
        ctx.stroke();

        // right goal area
        ctx.beginPath();
        ctx.rect(
            this.topRight.x - goalAreaWidth,
            this.topRight.y + this.height * 0.4,
            goalAreaWidth,
            this.goalAreaCoords.height,
        );
        ctx.stroke();

        // left penalty arc
        ctx.beginPath();
        ctx.arc(
            this.topLeft.x + this.penaltyAreaWidth,
            this.leftPenaltySpot.y,
            this.height / 18,
            Math.PI / 2,
            -Math.PI / 2,
            true,
        );
        ctx.stroke();

        // right penalty arc
        ctx.beginPath();
        ctx.arc(
            this.topRight.x - this.penaltyAreaWidth,
            this.rightPenaltySpot.y,
            this.height / 18,
            Math.PI / 2,
            -Math.PI / 2,
        );
        ctx.stroke();
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

    private drawCornerArcs(ctx: CanvasRenderingContext2D, lineColor: string) {
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = LINE_WIDTH;

        this.drawCornerArc(ctx, 'topLeft');
        this.drawCornerArc(ctx, 'topRight');
        this.drawCornerArc(ctx, 'bottomLeft');
        this.drawCornerArc(ctx, 'bottomRight');
    }

    private drawCornerArc(
        ctx: CanvasRenderingContext2D,
        cornerSide: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight',
    ) {
        ctx.beginPath();

        const cornerArcRadius = this.height / 30;
        let startAngle = 0;
        let endAngle = 0;
        let cornerPoint = { x: 0, y: 0 };

        switch (cornerSide) {
            case 'topLeft':
                startAngle = 0;
                endAngle = Math.PI / 2;
                cornerPoint = this.topLeft;
                break;
            case 'topRight':
                startAngle = Math.PI / 2;
                endAngle = Math.PI;
                cornerPoint = this.topRight;
                break;
            case 'bottomLeft':
                startAngle = Math.PI * 1.5;
                endAngle = 0;
                cornerPoint = this.bottomLeft;
                break;
            case 'bottomRight':
                startAngle = Math.PI;
                endAngle = Math.PI * 1.5;
                cornerPoint = this.bottomRight;
                break;
        }

        ctx.arc(
            cornerPoint.x,
            cornerPoint.y,
            cornerArcRadius,
            startAngle,
            endAngle,
        );
        ctx.stroke();
    }
}
