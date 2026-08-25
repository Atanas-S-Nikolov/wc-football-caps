import { CapConfig, DEFAULT_WC_CONFIG } from './config/config';
import { getFlagUrl, TeamSide } from './config/teams/team';
import { Ball } from './objects/ball';
import { Cap } from './objects/cap';
import { Field, FieldDimensions } from './objects/field';
import { Formation, getFormationCoords } from './objects/formation';

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
        DEFAULT_WC_CONFIG.cap,
        fieldDimensions,
        TEAM_1,
        '1-3-1',
        'home',
    );
    drawTeamCaps(
        ctx,
        DEFAULT_WC_CONFIG.cap,
        fieldDimensions,
        TEAM_2,
        '2-2-1-narrow',
        'away',
    );
};

const drawTeamCaps = (
    ctx: CanvasRenderingContext2D,
    config: CapConfig,
    fieldDimensions: FieldDimensions,
    teamId: string,
    formation: Formation,
    teamSide: TeamSide,
) => {
    createLogoImgElement(teamId, config.radius);

    const capsCoords = getFormationCoords(formation, fieldDimensions, teamSide);
    for (let i = 0; i < capsCoords.length; i++) {
        const capCoords = capsCoords[i];
        const cap = new Cap(capCoords.x, capCoords.y, config.radius, teamId);
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
