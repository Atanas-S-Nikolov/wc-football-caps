import { TeamSide } from '../config/teams/team';
import {
    getFirstCharacter,
    getFirstTwoCharacters,
    getLastCharacter,
} from '../utils/string.utils';
import { FieldDimensions } from './field';
import { BaseCoordinates } from './game-object';

const POSITIONS = [
    // defense
    'RB',
    'RCB',
    'CB',
    'LCB',
    'LB',
    // midfield
    'RM',
    'RCM',
    'CM',
    'LCM',
    'LM',
    // forward
    'RF',
    'RCF',
    'CF',
    'LCF',
    'LF',
] as const;

export type Positon = (typeof POSITIONS)[number];

const DEFENSE_POSITIONS: Positon[] = POSITIONS.filter(
    (p) => getLastCharacter(p) === 'B',
);
const MIDFIELD_POSITIONS: Positon[] = POSITIONS.filter(
    (p) => getLastCharacter(p) === 'M',
);
const FORWARD_POSITIONS: Positon[] = POSITIONS.filter(
    (p) => getLastCharacter(p) === 'F',
);

const LEFT_POSITIONS: Positon[] = POSITIONS.filter(
    (p) => getFirstCharacter(p) === 'L',
);
const LEFT_CENTRAL_POSITIONS: Positon[] = POSITIONS.filter(
    (p) => getFirstTwoCharacters(p) === 'LC',
);
const CENTRAL_POSITIONS: Positon[] = POSITIONS.filter(
    (p) => getFirstCharacter(p) === 'C',
);
const RIGHT_CENTRAL_POSITIONS: Positon[] = POSITIONS.filter(
    (p) => getFirstTwoCharacters(p) === 'RC',
);
const RIGHT_POSITIONS: Positon[] = POSITIONS.filter(
    (p) => getFirstCharacter(p) === 'R',
);

export const getPositionCoords = (
    position: Positon,
    fieldDimensions: FieldDimensions,
    side: TeamSide,
): BaseCoordinates => {
    let positionOffsetPercentX = 0;
    let positionOffsetPercentY = 0;

    if (DEFENSE_POSITIONS.includes(position)) {
        positionOffsetPercentX = 15;
    } else if (MIDFIELD_POSITIONS.includes(position)) {
        positionOffsetPercentX = 29;
    } else if (FORWARD_POSITIONS.includes(position)) {
        positionOffsetPercentX = 43;
    }

    if (LEFT_CENTRAL_POSITIONS.includes(position)) {
        positionOffsetPercentY = 35;
    } else if (LEFT_POSITIONS.includes(position)) {
        positionOffsetPercentY = 20;
    } else if (CENTRAL_POSITIONS.includes(position)) {
        positionOffsetPercentY = 50;
    } else if (RIGHT_CENTRAL_POSITIONS.includes(position)) {
        positionOffsetPercentY = 65;
    } else if (RIGHT_POSITIONS.includes(position)) {
        positionOffsetPercentY = 80;
    }

    const isHomeSide = side === 'home';
    const x = isHomeSide
        ? fieldDimensions.topLeft.x +
          fieldDimensions.width * (positionOffsetPercentX / 100)
        : fieldDimensions.topRight.x -
          fieldDimensions.width * (positionOffsetPercentX / 100);
    const y =
        fieldDimensions.topLeft.y +
        fieldDimensions.height * (positionOffsetPercentY / 100);
    return { x, y };
};
