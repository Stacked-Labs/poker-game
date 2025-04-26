import { useRef, useEffect, useCallback } from 'react';

const useAudio = (src: string) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        audioRef.current = new Audio(src);

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, [src]);

    const play = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.play().catch((error) => {
                console.error('Audio playback failed:', error);
            });
        }
    }, []);

    const setVolume = useCallback((volume: number) => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, []);

    return { play, setVolume };
};

export default useAudio;
