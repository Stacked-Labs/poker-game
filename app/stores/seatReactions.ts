import { create } from 'zustand';

export type SeatReaction = {
    id: string;
    targetUuid: string;
    emoteId: string;
    emoteName: string;
    emoteUrl: string;
    senderUuid?: string;
    createdAt: number;
};

type SeatReactionsStore = {
    reactionsByTarget: Record<string, SeatReaction | null>;
    showReaction: (reaction: SeatReaction) => void;
    clearReaction: (targetUuid: string, id?: string) => void;
};

const REACTION_TTL_MS = 5000;
const reactionTimers = new Map<string, ReturnType<typeof setTimeout>>();

export const useSeatReactionsStore = create<SeatReactionsStore>((set, get) => ({
    reactionsByTarget: {},
    showReaction: (reaction) => {
        set((state) => ({
            reactionsByTarget: {
                ...state.reactionsByTarget,
                [reaction.targetUuid]: reaction,
            },
        }));

        const existingTimer = reactionTimers.get(reaction.targetUuid);
        if (existingTimer) {
            clearTimeout(existingTimer);
        }

        const timer = setTimeout(() => {
            const current = get().reactionsByTarget[reaction.targetUuid];
            if (current?.id === reaction.id) {
                set((state) => ({
                    reactionsByTarget: {
                        ...state.reactionsByTarget,
                        [reaction.targetUuid]: null,
                    },
                }));
            }
        }, REACTION_TTL_MS);

        reactionTimers.set(reaction.targetUuid, timer);
    },
    clearReaction: (targetUuid, id) => {
        const existingTimer = reactionTimers.get(targetUuid);
        if (existingTimer) {
            clearTimeout(existingTimer);
            reactionTimers.delete(targetUuid);
        }

        const current = get().reactionsByTarget[targetUuid];
        if (!id || current?.id === id) {
            set((state) => ({
                reactionsByTarget: {
                    ...state.reactionsByTarget,
                    [targetUuid]: null,
                },
            }));
        }
    },
}));
