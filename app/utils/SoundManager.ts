/**
 * SoundManager - Web Audio API based sound system
 *
 * Uses Web Audio API instead of HTMLAudioElement to:
 * 1. Prevent iOS "Now Playing" media widget from appearing
 * 2. Enable better control over audio playback
 * 3. Support overlapping sounds
 */

// Sound file mappings by event type
const SOUND_FILES: Record<string, string> = {
    // Player actions
    call: '/sound/chips_1.mp3',
    check: '/sound/check_1.mp3',
    fold: '/sound/fold_1.mp3',
    raise: '/sound/chips_allin.mp3',
    bet: '/sound/chips_2.mp3',
    all_in: '/sound/chips_allin.mp3',

    // Game flow
    card_flip: '/sound/card_flip.mp3',
    tick_tock: '/sound/tick_tock.mp3',
    win: '/sound/coin_win.mp3',

    // Chat
    chat: '/sound/chat_notif.mp3',
};

class SoundManager {
    private audioContext: AudioContext | null = null;
    private gainNode: GainNode | null = null;
    private buffers: Map<string, AudioBuffer> = new Map();
    private isInitialized: boolean = false;
    private isUnlocked: boolean = false;
    private pendingUnlock: Promise<void> | null = null;

    /**
     * Initialize the AudioContext and preload all sound files.
     * Call this once when the app starts.
     */
    async init(): Promise<void> {
        if (this.isInitialized) return;

        try {
            // Create AudioContext (with webkit prefix for older Safari)
            const AudioContextClass =
                window.AudioContext ||
                (
                    window as typeof window & {
                        webkitAudioContext?: typeof AudioContext;
                    }
                ).webkitAudioContext;

            if (!AudioContextClass) {
                console.warn('Web Audio API not supported');
                return;
            }

            this.audioContext = new AudioContextClass();

            // Create a gain node for volume control
            this.gainNode = this.audioContext.createGain();
            this.gainNode.connect(this.audioContext.destination);

            // Preload all sound files
            await this.preloadSounds();

            this.isInitialized = true;
            console.log('SoundManager initialized successfully');
        } catch (error) {
            console.error('Failed to initialize SoundManager:', error);
        }
    }

    /**
     * Preload all sound files into AudioBuffers
     */
    private async preloadSounds(): Promise<void> {
        if (!this.audioContext) return;

        const loadPromises = Object.entries(SOUND_FILES).map(
            async ([key, url]) => {
                try {
                    const response = await fetch(url);
                    if (!response.ok) {
                        console.warn(`Failed to fetch sound: ${url}`);
                        return;
                    }
                    const arrayBuffer = await response.arrayBuffer();
                    const audioBuffer =
                        await this.audioContext!.decodeAudioData(arrayBuffer);
                    this.buffers.set(key, audioBuffer);
                } catch (error) {
                    console.warn(`Failed to load sound ${key}:`, error);
                }
            }
        );

        await Promise.all(loadPromises);
        console.log(`Loaded ${this.buffers.size} sounds`);
    }

    /**
     * Unlock audio on iOS/Safari. Must be called from a user gesture event handler.
     * This resumes the AudioContext if it was suspended.
     */
    async unlock(): Promise<void> {
        if (this.isUnlocked || !this.audioContext) return;

        // Prevent multiple unlock attempts
        if (this.pendingUnlock) {
            return this.pendingUnlock;
        }

        this.pendingUnlock = (async () => {
            try {
                // Resume the audio context if suspended
                if (this.audioContext!.state === 'suspended') {
                    await this.audioContext!.resume();
                }

                // Play a silent buffer to fully unlock on iOS
                const silentBuffer = this.audioContext!.createBuffer(
                    1,
                    1,
                    22050
                );
                const source = this.audioContext!.createBufferSource();
                source.buffer = silentBuffer;
                source.connect(this.audioContext!.destination);
                source.start(0);

                this.isUnlocked = true;
                console.log('Audio unlocked');
            } catch (error) {
                console.warn('Failed to unlock audio:', error);
            } finally {
                this.pendingUnlock = null;
            }
        })();

        return this.pendingUnlock;
    }

    /**
     * Play a sound by event type (e.g., 'call', 'check', 'fold', 'raise')
     * @param soundType - The event type that maps to a sound file
     */
    play(soundType: string): void {
        if (!this.audioContext || !this.gainNode) {
            console.warn('SoundManager not initialized');
            return;
        }

        const buffer = this.buffers.get(soundType);
        if (!buffer) {
            // Sound not found for this event type - this is expected for events without sounds
            return;
        }

        try {
            // Resume context if suspended (can happen after tab becomes inactive)
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }

            // Create a new buffer source for each play (they're one-shot)
            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(this.gainNode);
            source.start(0);
        } catch (error) {
            console.error(`Failed to play sound ${soundType}:`, error);
        }
    }

    /**
     * Set the master volume for all sounds
     * @param volume - Volume level from 0 to 1
     */
    setVolume(volume: number): void {
        if (this.gainNode) {
            // Clamp volume between 0 and 1
            const clampedVolume = Math.max(0, Math.min(1, volume));
            this.gainNode.gain.value = clampedVolume;
        }
    }

    /**
     * Get current volume level
     */
    getVolume(): number {
        return this.gainNode?.gain.value ?? 1;
    }

    /**
     * Check if the SoundManager is ready to play sounds
     */
    isReady(): boolean {
        return this.isInitialized && this.buffers.size > 0;
    }

    /**
     * Clean up resources
     */
    dispose(): void {
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        this.gainNode = null;
        this.buffers.clear();
        this.isInitialized = false;
        this.isUnlocked = false;
    }
}

// Export a singleton instance
export const soundManager = new SoundManager();

// Also export the class for testing purposes
export { SoundManager };
