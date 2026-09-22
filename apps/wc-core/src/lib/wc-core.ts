import { CapConfig, DEFAULT_WC_CONFIG } from './config/config';
import { getFlagUrl, TeamSide } from './config/teams/team';
import { Ball } from './objects/ball';
import { Cap } from './objects/cap';
import { Field, FieldDimensions } from './objects/field';
import { Formation, getFormationCoords } from './objects/formation';
import { GOAL_NET_DEPTH, Goal } from './objects/goal';

export const CANVAS_ID = 'wc-canvas-playground';
const TEAM_1 = 'es';
const TEAM_2 = 'ar';
const LAUNCH_POWER = 5;
const VELOCITY_DAMPING = 2.5;
const MAX_FRAME_TIME = 0.05;
export const run = async (): Promise<void> => {
    const canvas = initializePlayground();
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        console.warn(
            `Canvas context not found!!! Check if canvas with id: ${CANVAS_ID} is in HTML`,
        );
        return;
    }

    await draw(ctx, canvas);
};

const initializePlayground = (): HTMLCanvasElement => {
    let canvas = document.getElementById(CANVAS_ID) as HTMLCanvasElement | null;

    if (!canvas) {
        canvas = document.createElement('canvas');
    }

    if (!(canvas instanceof HTMLCanvasElement)) {
        document.removeChild(canvas);
        canvas = document.createElement('canvas');
        canvas.id = CANVAS_ID;
    }

    canvas.tabIndex = 0;

    return canvas;
};

const draw = async (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
): Promise<void> => {
    const field = new Field();
    field.draw(ctx, DEFAULT_WC_CONFIG.field);
    const fieldDimensions = field.getDimensions();

    const ballInitialPosition = fieldDimensions.centerSpot;
    const ball = new Ball(
        ballInitialPosition.x,
        ballInitialPosition.y,
        DEFAULT_WC_CONFIG.ball.radius,
    );

    const firstTeamCaps = createTeamCaps(
        DEFAULT_WC_CONFIG.cap,
        fieldDimensions,
        TEAM_1,
        '1-3-1',
        'home',
    );
    const secondTeamCaps = createTeamCaps(
        DEFAULT_WC_CONFIG.cap,
        fieldDimensions,
        TEAM_2,
        '2-2-1-narrow',
        'away',
    );
    const caps = [...firstTeamCaps, ...secondTeamCaps];

    const goal = new Goal(fieldDimensions.goalAreaCoords);
    await drawScene(ctx, field, ball, caps, goal);
    registerCapMouseMovement(canvas, ctx, field, ball, caps, goal);
};

const drawScene = async (
    ctx: CanvasRenderingContext2D,
    field: Field,
    ball: Ball,
    caps: Cap[],
    goal: Goal,
): Promise<void> => {
    field.draw(ctx, DEFAULT_WC_CONFIG.field);
    ball.draw(ctx, DEFAULT_WC_CONFIG.ball);
    await Promise.all(caps.map((cap) => cap.draw(ctx)));
    goal.draw(ctx, DEFAULT_WC_CONFIG.field.lineColor);
};

const updateBodies = (
    dt: number,
    fieldDimensions: FieldDimensions,
    ball: Ball,
    caps: Cap[],
): void => {
    const bodies = [ball, ...caps];
    bodies.forEach((body) => {
        body.update(dt);
        body.vx *= Math.exp(-VELOCITY_DAMPING * dt);
        body.vy *= Math.exp(-VELOCITY_DAMPING * dt);
        keepBodyInField(body, fieldDimensions);
    });

    for (let firstIndex = 0; firstIndex < bodies.length; firstIndex++) {
        for (
            let secondIndex = firstIndex + 1;
            secondIndex < bodies.length;
            secondIndex++
        ) {
            bodies[firstIndex].resolveCollision(bodies[secondIndex]);
        }
    }
};

const keepBodyInField = (body: Ball | Cap, field: FieldDimensions): void => {
    const left = field.topLeft.x + body.radius;
    const right = field.topRight.x - body.radius;
    const top = field.topLeft.y + body.radius;
    const bottom = field.bottomLeft.y - body.radius;
    const leftGoalBack =
        field.goalAreaCoords.left.top.x - GOAL_NET_DEPTH + body.radius;
    const rightGoalBack =
        field.goalAreaCoords.right.top.x + GOAL_NET_DEPTH - body.radius;

    const isInLeftGoal =
        body.y + body.radius > field.goalAreaCoords.left.top.y &&
        body.y - body.radius < field.goalAreaCoords.left.bottom.y;
    const isInRightGoal =
        body.y + body.radius > field.goalAreaCoords.right.top.y &&
        body.y - body.radius < field.goalAreaCoords.right.bottom.y;

    if (body.x < left) {
        if (!isInLeftGoal) {
            body.x = left;
            body.vx = Math.abs(body.vx);
        } else if (body.x < leftGoalBack) {
            body.x = leftGoalBack;
            body.vx = Math.abs(body.vx);
        }
    } else if (body.x > right) {
        if (!isInRightGoal) {
            body.x = right;
            body.vx = -Math.abs(body.vx);
        } else if (body.x > rightGoalBack) {
            body.x = rightGoalBack;
            body.vx = -Math.abs(body.vx);
        }
    }

    if (body.y < top) {
        body.y = top;
        body.vy = Math.abs(body.vy);
    } else if (body.y > bottom) {
        body.y = bottom;
        body.vy = -Math.abs(body.vy);
    }
};

const createTeamCaps = (
    config: CapConfig,
    fieldDimensions: FieldDimensions,
    teamId: string,
    formation: Formation,
    teamSide: TeamSide,
): Cap[] => {
    createLogoImgElement(teamId, config.radius);

    return getFormationCoords(formation, fieldDimensions, teamSide).map(
        (capCoords) => new Cap(capCoords.x, capCoords.y, config.radius, teamId),
    );
};

const registerCapMouseMovement = (
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    field: Field,
    ball: Ball,
    caps: Cap[],
    goal: Goal,
): void => {
    let selectedCap: Cap | null = null;
    let aimPoint: { x: number; y: number } | null = null;
    let animationFrame = 0;
    let previousFrameTime = performance.now();

    const resetAimState = () => {
        selectedCap = null;
        aimPoint = null;
        canvas.style.cursor = '';
    };

    const renderFrame = async (frameTime: number): Promise<void> => {
        const dt = Math.min(
            (frameTime - previousFrameTime) / 1000,
            MAX_FRAME_TIME,
        );
        previousFrameTime = frameTime;
        updateBodies(dt, field.getDimensions(), ball, caps);
        await drawScene(ctx, field, ball, caps, goal);

        if (selectedCap && aimPoint) {
            drawAimGuide(ctx, selectedCap, aimPoint);
        }

        animationFrame = requestAnimationFrame((nextFrameTime) => {
            void renderFrame(nextFrameTime);
        });
    };

    animationFrame = requestAnimationFrame((frameTime) => {
        void renderFrame(frameTime);
    });

    canvas.addEventListener('mousedown', (event) => {
        const point = getCanvasPoint(canvas, event.clientX, event.clientY);
        selectedCap =
            [...caps]
                .reverse()
                .find((cap) => cap.containsPoint(point.x, point.y)) ?? null;

        if (!selectedCap) {
            return;
        }

        console.log('Selected cap from team:', selectedCap);

        selectedCap.vx = 0;
        selectedCap.vy = 0;
        aimPoint = point;
        canvas.focus();
        canvas.style.cursor = 'crosshair';
    });

    canvas.addEventListener('mousemove', (event) => {
        if (!selectedCap) {
            return;
        }

        aimPoint = getCanvasPoint(canvas, event.clientX, event.clientY);
    });

    canvas.addEventListener('mouseup', (event) => {
        if (!selectedCap) {
            return;
        }

        const point = getCanvasPoint(canvas, event.clientX, event.clientY);
        selectedCap.vx = (selectedCap.x - point.x) * LAUNCH_POWER;
        selectedCap.vy = (selectedCap.y - point.y) * LAUNCH_POWER;
        resetAimState();
    });

    canvas.addEventListener('mouseleave', resetAimState);

    canvas.addEventListener('keydown', (event) => {
        if (event.key.toLowerCase() === 'escape') {
            resetAimState();
        }
    });

    void animationFrame;
};

const drawAimGuide = (
    ctx: CanvasRenderingContext2D,
    cap: Cap,
    aimPoint: { x: number; y: number },
): void => {
    ctx.save();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(cap.x, cap.y);
    ctx.lineTo(aimPoint.x, aimPoint.y);
    ctx.stroke();
    ctx.restore();
};

const getCanvasPoint = (
    canvas: HTMLCanvasElement,
    clientX: number,
    clientY: number,
): { x: number; y: number } => {
    const bounds = canvas.getBoundingClientRect();
    return {
        x: clientX - bounds.left,
        y: clientY - bounds.top,
    };
};

const createLogoImgElement = (teamId: string, capRadius: number): void => {
    const img = document.createElement('img');
    img.src = getFlagUrl(teamId);
    img.id = `cap-background-${teamId}`;
    img.height = capRadius;
    img.width = capRadius;
    img.style.display = 'none';
    document.body.appendChild(img);
};
