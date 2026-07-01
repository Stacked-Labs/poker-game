'use client';

import { useColorModeValue, usePrefersReducedMotion } from '@chakra-ui/react';

// The one warm skeleton recipe for the whole app (extracted from ProfileSkeleton,
// the de-facto gold standard). Spread onto any Chakra <Skeleton> / <SkeletonCircle>:
// warm low-contrast tones (calmer than Chakra's cool-gray default), a gentle pulse,
// and still on `prefers-reduced-motion`. Mode-correct in light and dark.
export function useWarmSkeleton() {
    const reduce = usePrefersReducedMotion();
    const startColor = useColorModeValue('#F3F1EC', 'rgba(255,255,255,0.05)');
    const endColor = useColorModeValue('#E6E3DC', 'rgba(255,255,255,0.10)');
    return { startColor, endColor, speed: reduce ? 0 : 1.1 };
}

export default useWarmSkeleton;
