export interface GradientColors {
    firstColor: string;
    secondColor: string;
}

export interface FieldConfig {
    // offset (margin) from the height of the screen in percentages.
    offset: number;
    // bottomOffset from the height of the screen in percentages.
    bottomOffset: number;
    // outerBackground is the background of the area outside the field (the margin).
    outerBackground: string;
    // innerBackground is the background of the field itself.
    innerBackground: string | GradientColors;
    // color of the field lines.
    lineColor: string;
}

export interface BallConfig {
    color: string;
    radius: number;
}

export interface WCCoreConfig {
    field: FieldConfig;
    ball: BallConfig;
}

const DEFAULT_INNER_BACKGROUND_GRADIENT: GradientColors = {
    firstColor: '#2f8f2f',
    secondColor: '#3fa63f',
};

export const DEFAULT_WC_CONFIG: WCCoreConfig = {
    field: {
        offset: 10,
        bottomOffset: 5,
        outerBackground: DEFAULT_INNER_BACKGROUND_GRADIENT.firstColor,
        innerBackground: DEFAULT_INNER_BACKGROUND_GRADIENT,
        lineColor: '#FFFFFF',
    },
    ball: {
        color: '#FFFFFF',
        radius: 10,
    },
};
