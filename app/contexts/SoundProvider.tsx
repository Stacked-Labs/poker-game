'use client';

import {
    createContext,
    ReactNode,
    useEffect,
    useContext,
    useCallback,
    useRef,
} from 'react';
import { AppContext } from './AppStoreProvider';
import { soundManager } from '../utils/SoundManager';

// Context type - exposes the play function for direct sound triggering
export const SoundContext = createContext<{
    play: (soundType: string) => void;
    isReady: () => boolean;
} | null>(null);

type SoundProviderProps = {
    children: ReactNode;
};

export function SoundProvider({ children }: SoundProviderProps) {
    const { appState } = useContext(AppContext);
    const isInitializedRef = useRef(false);
    const prevMessagesLengthRef = useRef(0);

    // Initialize the sound manager on mount
    useEffect(() => {
        if (isInitializedRef.current) return;
        isInitializedRef.current = true;

        soundManager.init().catch((error) => {
            console.error('Failed to initialize sound manager:', error);
        });

        return () => {
            // Don't dispose on unmount - singleton should persist
        };
    }, []);

    // Handle iOS audio unlock on first user interaction
    useEffect(() => {
        const unlock = () => {
            soundManager.unlock();
            document.removeEventListener('touchstart', unlock);
            document.removeEventListener('touchend', unlock);
            document.removeEventListener('click', unlock);
        };

        document.addEventListener('touchstart', unlock, { once: true });
        document.addEventListener('touchend', unlock, { once: true });
        document.addEventListener('click', unlock, { once: true });

        return () => {
            document.removeEventListener('touchstart', unlock);
            document.removeEventListener('touchend', unlock);
            document.removeEventListener('click', unlock);
        };
    }, []);

    // Update volume when app volume changes
    useEffect(() => {
        soundManager.setVolume(appState.volume);
    }, [appState.volume]);

    // Chat notification sound - keep this reactive trigger for chat messages
    useEffect(() => {
        const messages = appState.messages;

        // Skip if no messages or on initial load
        if (messages.length === 0) {
            prevMessagesLengthRef.current = 0;
            return;
        }

        // Only play sound for NEW messages (not on initial load)
        if (messages.length <= prevMessagesLengthRef.current) {
            prevMessagesLengthRef.current = messages.length;
            return;
        }

        prevMessagesLengthRef.current = messages.length;

        const latest = messages[messages.length - 1];

        // Don't play sound for own messages
        if (latest.name === appState.username) return;

        if (!appState.chatSoundEnabled) return;

        // Play chat notification sound
        soundManager.play('chat');
    }, [appState.messages, appState.username, appState.chatSoundEnabled]);

    // Expose play function via context
    const play = useCallback((soundType: string) => {
        soundManager.play(soundType);
    }, []);

    const isReady = useCallback(() => {
        return soundManager.isReady();
    }, []);

    return (
        <SoundContext.Provider value={{ play, isReady }}>
            {children}
        </SoundContext.Provider>
    );
}

// Custom hook for easy sound access
export function useSound() {
    const context = useContext(SoundContext);
    if (!context) {
        throw new Error('useSound must be used within a SoundProvider');
    }
    return context;
}
