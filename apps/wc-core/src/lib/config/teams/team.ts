export interface Team {
    id: string;
    name: string;
    fifaCode: string;
}

export type TeamSide = 'home' | 'away';

export const getFlagUrl = (id: string) =>
    `https://flags.restcountries.com/v5/w320/${id}.png`;
