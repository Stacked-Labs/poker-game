'use client';

import { HStack, Box } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';

const urgencyPulse = keyframes`
    0%, 100% { opacity: 0.5; box-shadow: 0 0 4px rgba(235, 11, 92, 0.3); }
    50% { opacity: 1; box-shadow: 0 0 8px rgba(235, 11, 92, 0.5); }
`;

const TRANSITION = 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

interface SeatIndicatorProps {
    playerCount: number;
    maxPlayers: number;
}

export default function SeatIndicator({ playerCount, maxPlayers }: SeatIndicatorProps) {
    const seatsLeft = maxPlayers - playerCount;
    const isUrgent = seatsLeft > 0 && seatsLeft <= 2;

    return (
        <HStack spacing="4px">
            {Array.from({ length: maxPlayers }, (_, i) => {
                const isFilled = i < playerCount;
                const isEmptyUrgent = !isFilled && isUrgent;

                return (
                    <Box
                        key={i}
                        w="9px"
                        h="9px"
                        borderRadius="full"
                        bg={
                            isFilled
                                ? 'brand.green'
                                : 'rgba(12, 21, 49, 0.1)'
                        }
                        boxShadow={
                            isFilled
                                ? '0 0 4px rgba(54, 163, 123, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                                : 'inset 0 1px 2px rgba(0, 0, 0, 0.1)'
                        }
                        _dark={{
                            bg: isFilled
                                ? 'brand.green'
                                : 'rgba(255, 255, 255, 0.1)',
                            boxShadow: isFilled
                                ? '0 0 4px rgba(54, 163, 123, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
                                : 'inset 0 1px 2px rgba(0, 0, 0, 0.3)',
                        }}
                        animation={
                            isEmptyUrgent
                                ? `${urgencyPulse} 2s ease-in-out infinite`
                                : undefined
                        }
                        sx={
                            isEmptyUrgent
                                ? { bg: 'brand.pink', _dark: { bg: 'brand.pink' } }
                                : undefined
                        }
                        transition={TRANSITION}
                    />
                );
            })}
        </HStack>
    );
}
