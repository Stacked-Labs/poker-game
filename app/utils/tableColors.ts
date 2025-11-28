export type TableColor = {
    color: string;
    horizontal: string;
    vertical: string;
}

export const tableColors: {
    [key: string]: TableColor;
} = {
    "blue": {
        "color": "brand.navy",
        "horizontal": "table-horizontal-blue.webp",
        "vertical": "table-vertical-blue.webp"
    },
    "green": {
        "color": "brand.green",
        "horizontal": "table-horizontal-green.webp",
        "vertical": "table-vertical-green.webp"
    },
    "red": {
        "color": "brand.pink",
        "horizontal": "table-horizontal-red.webp",
        "vertical": "table-vertical-red.webp"
    },
    "white": {
        "color": "white",
        "horizontal": "table-horizontal-white.webp",
        "vertical": "table-vertical-white.webp"
    }
};