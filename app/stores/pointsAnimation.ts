import { create } from 'zustand';

type PointsAnimationState = {
    pendingPoints: number | null;
    sessionTotal: number;
    showAnimation: boolean;
    triggerPoints: (pts: number) => void;
    clearAnimation: () => void;
};

export const usePointsAnimationStore = create<PointsAnimationState>((set) => ({
    pendingPoints: null,
    sessionTotal: 0,
    showAnimation: false,
    triggerPoints: (pts: number) =>
        set((state) => ({
            pendingPoints: pts,
            sessionTotal: state.sessionTotal + pts,
            showAnimation: true,
        })),
    clearAnimation: () =>
        set({
            pendingPoints: null,
            showAnimation: false,
        }),
}));
