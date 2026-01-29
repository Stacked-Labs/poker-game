type RGB = [number, number, number];

function hexToRgb(hex: string): RGB {
    let normalized = hex.replace('#', '');
    if (normalized.length === 3) {
        normalized = normalized
            .split('')
            .map((c) => c + c)
            .join('');
    }
    const num = parseInt(normalized, 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function colorDistance(rgb1: RGB, rgb2: RGB): number {
    return Math.sqrt(
        Math.pow(rgb1[0] - rgb2[0], 2) +
            Math.pow(rgb1[1] - rgb2[1], 2) +
            Math.pow(rgb1[2] - rgb2[2], 2)
    );
}

function getRandomHexColor(): string {
    const forbiddenColors = ['#121212', '#ffffff'];
    const forbiddenRGBs = forbiddenColors.map(hexToRgb);
    const minDistance = 80;
    let color = '';
    let attempts = 0;

    do {
        const hex = Math.floor(Math.random() * 0xffffff).toString(16);
        color = `#${hex.padStart(6, '0')}`;
        attempts++;
    } while (
        forbiddenRGBs.some(
            (forbidden) =>
                colorDistance(hexToRgb(color), forbidden) < minDistance
        ) &&
        attempts < 20
    );

    return color;
}

const usernameColorMap: Record<string, string> = {};

export function getColorForUsername(username: string): string {
    if (!usernameColorMap[username]) {
        usernameColorMap[username] = getRandomHexColor();
    }
    return usernameColorMap[username];
}
