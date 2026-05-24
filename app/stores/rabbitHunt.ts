import { create } from 'zustand';

type RabbitHuntStore = {
    revealed: boolean;
    setRevealed: (revealed: boolean) => void;
};

export const useRabbitHuntStore = create<RabbitHuntStore>((set) => ({
    revealed: false,
    setRevealed: (revealed) => set({ revealed }),
}));
