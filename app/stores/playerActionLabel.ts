import { create } from 'zustand';

export type PlayerActionType =
    | 'call'
    | 'bet'
    | 'raise'
    | 'all_in'
    | 'check'
    | 'fold';

export type PlayerActionLabelEntry = {
    action: PlayerActionType;
    nonce: number;
};

type PlayerActionLabelState = {
    labels: Record<string, PlayerActionLabelEntry>;
    trigger: (playerKey: string, action: PlayerActionType) => void;
    clear: (playerKey: string, nonce: number) => void;
};

export const ACTION_LABEL_DURATION_MS = 1500;

export const usePlayerActionLabelStore = create<PlayerActionLabelState>(
    (set) => ({
        labels: {},
        trigger: (playerKey, action) =>
            set((state) => {
                const prev = state.labels[playerKey];
                const nonce = (prev?.nonce ?? 0) + 1;
                return {
                    labels: {
                        ...state.labels,
                        [playerKey]: { action, nonce },
                    },
                };
            }),
        clear: (playerKey, nonce) =>
            set((state) => {
                const current = state.labels[playerKey];
                if (!current || current.nonce !== nonce) return state;
                const rest = { ...state.labels };
                delete rest[playerKey];
                return { labels: rest };
            }),
    })
);

export const PLAYER_ACTION_LABEL_TYPES: ReadonlyArray<PlayerActionType> = [
    'call',
    'bet',
    'raise',
    'all_in',
    'check',
    'fold',
];

export function isPlayerActionLabelType(
    eventType: string
): eventType is PlayerActionType {
    return (PLAYER_ACTION_LABEL_TYPES as ReadonlyArray<string>).includes(
        eventType
    );
}

export function actionLabelText(action: PlayerActionType): string {
    switch (action) {
        case 'call':
            return 'CALL';
        case 'bet':
            return 'BET';
        case 'raise':
            return 'RAISE';
        case 'all_in':
            return 'ALL-IN';
        case 'check':
            return 'CHECK';
        case 'fold':
            return 'FOLD';
    }
}

export function actionLabelColor(action: PlayerActionType): string {
    switch (action) {
        case 'call':
        case 'bet':
        case 'raise':
            return 'brand.yellow';
        case 'all_in':
            return 'brand.pink';
        case 'check':
            return 'brand.green';
        case 'fold':
            return 'gray.500';
    }
}
