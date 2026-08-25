import { TeamSide } from '../config/teams/team';
import { FieldDimensions } from './field';
import { BaseCoordinates } from './game-object';
import { getPositionCoords, Positon } from './position';

export const FORMATIONS = [
    '1-3-1',
    '2-2-1',
    '2-2-1-narrow',
    '2-2-1-v',
    '3-2',
    '2-1-2',
    '1-2-2',
] as const;
export type Formation = (typeof FORMATIONS)[number];

export const getFormationCoords = (
    formation: Formation,
    fieldDimensions: FieldDimensions,
    side: TeamSide,
): BaseCoordinates[] => {
    let positions: Positon[] = [];
    switch (formation) {
        case '1-3-1':
            positions = ['CB', 'RM', 'CM', 'LM', 'CF'];
            break;
        case '2-2-1':
            positions = ['RCB', 'LCB', 'RM', 'LM', 'CF'];
            break;
        case '2-2-1-narrow':
            positions = ['RCB', 'LCB', 'RCM', 'LCM', 'CF'];
            break;
        case '2-2-1-v':
            positions = ['RB', 'LB', 'RCM', 'LCM', 'CF'];
            break;
        case '3-2':
            positions = ['RB', 'CB', 'LB', 'RCM', 'LCM'];
            break;
        case '2-1-2':
            positions = ['RCB', 'LCB', 'CM', 'RF', 'LF'];
            break;
        case '1-2-2':
            positions = ['CB', 'RM', 'LM', 'RCF', 'LCF'];
            break;
    }
    return positions.map((p) => getPositionCoords(p, fieldDimensions, side));
};
