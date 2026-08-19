import { DEFAULT_WC_CONFIG } from "./config/config";
import { Field } from "./objects/field";

export const CANVAS_ID = 'wc-canvas-playground';

export const run = (): void =>  {
    const canvas = initializePlayground();
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        console.warn(`Canvas context not found!!! Check if canvas with id: ${CANVAS_ID} is in HTML`);
        return;
    }

    draw(ctx);
}

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
}

const draw = (ctx: CanvasRenderingContext2D) => {
    const field = new Field();
    field.draw(ctx, DEFAULT_WC_CONFIG.field);
}
