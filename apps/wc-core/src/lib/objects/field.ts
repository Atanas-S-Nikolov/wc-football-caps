import { FieldConfig, GradientColors } from '../config/config';
import { BaseCoordinates } from './game-object';

export interface GoalAreaSidePoints {
    top: BaseCoordinates;
    bottom: BaseCoordinates;
}

export interface GoalAreaCoordinates {
    left: GoalAreaSidePoints;
    right: GoalAreaSidePoints;
    height: number;
}

export interface FieldDimensions {
    width: number;
    height: number;
    topLeft: BaseCoordinates;
    topRight: BaseCoordinates;
    bottomLeft: BaseCoordinates;
    bottomRight: BaseCoordinates;
    centerSpot: BaseCoordinates;
    goalAreaCoords: GoalAreaCoordinates;
}

const LINE_WIDTH = 3;
const DOT_RADIUS = 5;
const DEFAULT_GOAL_AREA_POINT: BaseCoordinates = { x: 0, y: 0 };

export const DEFAULT_GOAL_ARE_COORDINATES: GoalAreaCoordinates = {
    left: { top: DEFAULT_GOAL_AREA_POINT, bottom: DEFAULT_GOAL_AREA_POINT },
    right: {
        top: DEFAULT_GOAL_AREA_POINT,
        bottom: DEFAULT_GOAL_AREA_POINT,
    },
    height: 0,
};

export class Field {
    private width = 0;
    private height = 0;
    private topLeft = DEFAULT_GOAL_AREA_POINT;
    private topRight = DEFAULT_GOAL_AREA_POINT;
    private bottomLeft = DEFAULT_GOAL_AREA_POINT;
    private bottomRight = DEFAULT_GOAL_AREA_POINT;
    private penaltyAreaWidth = 0;
    private penaltyAreaHeight = 0;
    private leftPenaltySpot = DEFAULT_GOAL_AREA_POINT;
    private rightPenaltySpot = DEFAULT_GOAL_AREA_POINT;
    private centerSpot = DEFAULT_GOAL_AREA_POINT;
    private goalAreaCoords = DEFAULT_GOAL_ARE_COORDINATES;

    getDimensions(): FieldDimensions {
        return {
            width: this.width,
            height: this.height,
            topLeft: this.topLeft,
            topRight: this.topRight,
            bottomLeft: this.bottomLeft,
            bottomRight: this.bottomRight,
            centerSpot: this.centerSpot,
            goalAreaCoords: this.goalAreaCoords,
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
        this.centerSpot = {
            x: this.topLeft.x + this.width / 2,
            y: this.topLeft.y + this.height / 2,
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

        const centerCircle = {
            x: this.centerSpot.x,
            y: this.centerSpot.y,
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
