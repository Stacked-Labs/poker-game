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
    stop: (soundType: string) => void;
    isReady: () => boolean;
} | null>(null);

type SoundProviderProps = {
    children: ReactNode;
};

export function SoundProvider({ children }: SoundProviderProps) {
    const { appState } = useContext(AppContext);
    const lastSeenMsgKeyRef = useRef<string | null>(null);
    const volumeRef = useRef(appState.volume);

    // Defer AudioContext creation + sound preload (~358KB of mp3 fetch/decode)
    // until the first user gesture. Browser autoplay policy blocks any sound
    // before a gesture anyway, so nothing is audible earlier — this just keeps
    // the audio work off initial page load (it ran on every route before).
    useEffect(() => {
        const unlock = () => {
            // Unlock synchronously inside the gesture (iOS requires this), then
            // re-apply the saved volume (the volume effect ran as a no-op before
            // the gain node existed), then kick off the async mp3 preload.
            void soundManager.unlock();
            soundManager.setVolume(volumeRef.current);
            void soundManager.init();
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

    // Update volume when app volume changes (no-op until the sound manager is
    // initialized on first gesture; the unlock handler applies the latest value).
    useEffect(() => {
        volumeRef.current = appState.volume;
        soundManager.setVolume(appState.volume);
    }, [appState.volume]);

    // Chat notification sound - keep this reactive trigger for chat messages
    useEffect(() => {
        const messages = appState.messages;

        // Skip if no messages
        if (messages.length === 0) {
            lastSeenMsgKeyRef.current = null;
            return;
        }

        const latest = messages[messages.length - 1];
        const latestKey = `${latest.timestamp}-${latest.name}`;

        // Only play sound for NEW messages (not on initial load or same message)
        if (latestKey === lastSeenMsgKeyRef.current) return;

        const isInitialLoad = lastSeenMsgKeyRef.current === null;
        lastSeenMsgKeyRef.current = latestKey;

        // Don't play sound on initial load
        if (isInitialLoad) return;

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

    const stop = useCallback((soundType: string) => {
        soundManager.stop(soundType);
    }, []);

    const isReady = useCallback(() => {
        return soundManager.isReady();
    }, []);

    return (
        <SoundContext.Provider value={{ play, stop, isReady }}>
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
