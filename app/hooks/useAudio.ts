import { useRef, useEffect, useCallback } from 'react';

const useAudio = (src: string) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const audio = new Audio(src);
        // Hint browser to preload metadata to avoid first-play lag
        audio.preload = 'auto';
        audioRef.current = audio;

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = '';
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
