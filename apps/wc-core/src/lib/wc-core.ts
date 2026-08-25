import { DEFAULT_WC_CONFIG } from './config/config';
import { getFlagUrl } from './config/teams/team';
import { Ball } from './objects/ball';
import { Cap } from './objects/cap';
import { Field, FieldDimensions } from './objects/field';

export const CANVAS_ID = 'wc-canvas-playground';
const TEAM_1 = 'es';
const TEAM_2 = 'ar';
export const run = (): void => {
    const canvas = initializePlayground();
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        console.warn(
            `Canvas context not found!!! Check if canvas with id: ${CANVAS_ID} is in HTML`,
        );
        return;
    }

    draw(ctx);
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

    return canvas;
};

const draw = (ctx: CanvasRenderingContext2D) => {
    const field = new Field();
    field.draw(ctx, DEFAULT_WC_CONFIG.field);
    const fieldDimensions = field.getDimensions();
    const ballInitialPosition = fieldDimensions.centerSpot;
    const ball = new Ball(
        ballInitialPosition.x,
        ballInitialPosition.y,
        DEFAULT_WC_CONFIG.ball.radius,
    );
    ball.draw(ctx, DEFAULT_WC_CONFIG.ball);
    drawTeamCaps(
        ctx,
        fieldDimensions,
        DEFAULT_WC_CONFIG.cap.radius,
        TEAM_1,
        'home',
    );
    drawTeamCaps(
        ctx,
        fieldDimensions,
        DEFAULT_WC_CONFIG.cap.radius,
        TEAM_2,
        'away',
    );
};

const drawTeamCaps = (
    ctx: CanvasRenderingContext2D,
    fieldDimensions: FieldDimensions,
    capRadius: number,
    teamId: string,
    teamType: 'home' | 'away',
) => {
    createLogoImgElement(teamId, capRadius);
    for (let i = 0; i < 5; i++) {
        const isHomeTeam = teamType === 'home';
        const capX = isHomeTeam
            ? fieldDimensions.topLeft.x + fieldDimensions.width * (i / 10)
            : fieldDimensions.topRight.x - fieldDimensions.width * (i / 10);
        const capY = fieldDimensions.topLeft.y + fieldDimensions.height / 2;
        const cap = new Cap(capX, capY, DEFAULT_WC_CONFIG.cap.radius, teamId);
        cap.draw(ctx);
    }
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
