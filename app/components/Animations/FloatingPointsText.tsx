'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { usePointsAnimationStore } from '@/app/stores/pointsAnimation';

export default function FloatingPointsText() {
    const { showAnimation, pendingPoints, clearAnimation } =
        usePointsAnimationStore();
    const prefersReducedMotion = useReducedMotion();

    useEffect(() => {
        if (!showAnimation) return;
        const timer = setTimeout(
            () => {
                clearAnimation();
            },
            prefersReducedMotion ? 1500 : 2200
        );
        return () => clearTimeout(timer);
    }, [showAnimation, clearAnimation, prefersReducedMotion]);

    return (
        <AnimatePresence>
            {showAnimation && pendingPoints !== null && (
                <motion.div
                    key="floating-pts"
                    initial={
                        prefersReducedMotion
                            ? { opacity: 1, y: 0 }
                            : { opacity: 0, y: 0, scale: 0.8 }
                    }
                    animate={
                        prefersReducedMotion
                            ? { opacity: 1, y: 0 }
                            : {
                                  opacity: [0, 1, 1, 0],
                                  y: -60,
                                  scale: [0.8, 1.15, 1.0, 0.9],
                              }
                    }
                    exit={{ opacity: 0 }}
                    transition={
                        prefersReducedMotion
                            ? { duration: 0 }
                            : { duration: 2, ease: 'easeOut' }
                    }
                    style={{
                        position: 'absolute',
                        top: '-10px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 20,
                        pointerEvents: 'none',
                        userSelect: 'none',
                        whiteSpace: 'nowrap',
                        fontSize: '13px',
                        fontWeight: 800,
                        color: '#36A37B',
                        textShadow:
                            '0 0 12px rgba(54,163,123,0.7), 0 0 24px rgba(54,163,123,0.3)',
                        fontFamily: 'inherit',
                        letterSpacing: '0.02em',
                    }}
                >
                    +{pendingPoints} pts
                    {/* sparkle dot */}
                    <motion.span
                        initial={{ scale: 1.5, opacity: 0.8 }}
                        animate={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            width: '20px',
                            height: '20px',
                            marginTop: '-10px',
                            marginLeft: '-10px',
                            borderRadius: '50%',
                            background:
                                'radial-gradient(circle, rgba(54,163,123,0.6) 0%, transparent 70%)',
                            pointerEvents: 'none',
                        }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
