export const getLastCharacter = (str: string): string => {
    if (!str) {
        return '';
    }

    const trimmed = str.trim();

    if (trimmed.length === 0) {
        return '';
    }

    return trimmed.charAt(str.length - 1);
};

export const getFirstCharacter = (str: string): string => {
    if (!str) {
        return '';
    }

    const trimmed = str.trim();

    if (trimmed.length === 0) {
        return '';
    }

    return trimmed.charAt(0);
};

export const getFirstTwoCharacters = (str: string): string => {
    if (!str) {
        return '';
    }

    const trimmed = str.trim();

    if (trimmed.length <= 2) {
        return '';
    }

    return trimmed.substring(0, 2);
};
