import { useRef, useEffect, useCallback } from 'react';

const useAudio = (src: string, initialVolume: number = 1) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        audioRef.current = new Audio(src);
        audioRef.current.volume = initialVolume;

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, [src, initialVolume]);

    const play = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.volume = initialVolume;
            audioRef.current.play().catch((error) => {
                console.error('Audio playback failed:', error);
            });
        }
    }, [initialVolume]);

    const setVolume = useCallback((volume: number) => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, []);

    return { play, setVolume };
};

export default useAudio;
