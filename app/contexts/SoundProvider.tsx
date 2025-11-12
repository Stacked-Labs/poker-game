'use client';

import { createContext, ReactNode, useEffect, useContext } from 'react';
import { AppContext } from './AppStoreProvider';
import useAudio from '../hooks/useAudio';

export const SoundContext = createContext<{
    playFlip: () => void;
    playCheck: () => void;
    playChips: () => void;
    playRaise: () => void;
} | null>(null);

type SoundProviderProps = {
    children: ReactNode;
};

export function SoundProvider({ children }: SoundProviderProps) {
    const { appState } = useContext(AppContext);

    const { play: playFlip, setVolume: setVolumeFlip } = useAudio(
        '/sound/card_flip_1.mp3'
    );
    const { play: playCheck, setVolume: setVolumeCheck } =
        useAudio('/sound/check_1.mp3');
    const { play: playChips, setVolume: setVolumeChips } =
        useAudio('/sound/chips_1.mp3');
    const { play: playRaise, setVolume: setVolumeRaise } = useAudio(
        '/sound/chips_allin.mp3'
    );
    const { play: playChatNotif, setVolume: setVolumeChatNotif } = useAudio(
        '/sound/chat_notif.mp3'
    );

    // Update volume for all sounds when app volume changes
    useEffect(() => {
        setVolumeFlip(appState.volume);
        setVolumeCheck(appState.volume);
        setVolumeChips(appState.volume);
        setVolumeRaise(appState.volume);
        setVolumeChatNotif(appState.volume);
    }, [
        appState.volume,
        setVolumeFlip,
        setVolumeCheck,
        setVolumeChips,
        setVolumeRaise,
        setVolumeChatNotif
    ]);

    // Play sounds based on log messages
    useEffect(() => {
        const logs = appState.logs;
        if (logs.length === 0) return;

        const latestLog = logs[logs.length - 1];

        if (latestLog.message.includes('calls')) {
            playChips();
        } else if (latestLog.message.includes('checks')) {
            playCheck();
        } else if (latestLog.message.includes('folds')) {
            playFlip();
        } else if (latestLog.message.includes('raises')) {
            playRaise();
        }
    }, [appState.logs, playChips, playCheck, playFlip, playRaise]);

    useEffect(() => {
        const messages = appState.messages;
        if (messages.length === 0) return;

        const latest = messages[messages.length - 1];
        if (latest.name === appState.username) return;

        playChatNotif();
    }, [appState.messages, appState.clientID, appState.username, playChatNotif]);

    return (
        <SoundContext.Provider
            value={{
                playFlip,
                playCheck,
                playChips,
                playRaise,
            }}
        >
            {children}
        </SoundContext.Provider>
    );
}
