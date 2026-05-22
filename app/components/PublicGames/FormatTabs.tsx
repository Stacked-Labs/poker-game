'use client';

import { KeyboardEvent } from 'react';
import {
    Box,
    Flex,
    HStack,
    Text,
    useColorModeValue,
} from '@chakra-ui/react';

export type GameFormat = 'cash' | 'tournaments';

interface FormatTabsProps {
    format: GameFormat;
    onChange: (next: GameFormat) => void;
}

export function isGameFormat(value: string | null | undefined): value is GameFormat {
    return value === 'cash' || value === 'tournaments';
}

export default function FormatTabs({ format, onChange }: FormatTabsProps) {
    const ruleColor = useColorModeValue(
        'rgba(11, 20, 48, 0.10)',
        'rgba(255, 255, 255, 0.10)'
    );

    return (
        <Flex
            role="tablist"
            aria-label="Game format"
            borderBottom="1px solid"
            borderColor={ruleColor}
            gap={{ base: 4, md: 6 }}
        >
            <Tab
                isActive={format === 'cash'}
                onSelect={() => onChange('cash')}
                label="Cash games"
            />
            <Tab
                isActive={format === 'tournaments'}
                onSelect={() => onChange('tournaments')}
                label="Tournaments"
                badge="Soon"
            />
        </Flex>
    );
}

interface TabProps {
    isActive: boolean;
    onSelect: () => void;
    label: string;
    badge?: string;
}

function Tab({ isActive, onSelect, label, badge }: TabProps) {
    const idleColor = useColorModeValue('text.muted', 'whiteAlpha.600');
    const activeColor = useColorModeValue('text.primary', 'white');
    const accent = 'brand.green';
    const badgeBg = useColorModeValue(
        'rgba(11, 20, 48, 0.06)',
        'rgba(255, 255, 255, 0.08)'
    );
    const badgeFg = useColorModeValue('text.muted', 'whiteAlpha.700');

    const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            onSelect();
        }
    };

    return (
        <Box
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={onSelect}
            onKeyDown={onKeyDown}
            cursor="pointer"
            position="relative"
            pb={2.5}
            mt={1}
            transition="color 120ms ease"
            color={isActive ? activeColor : idleColor}
            _hover={{ color: activeColor }}
            _focusVisible={{
                outline: '2px solid',
                outlineColor: accent,
                outlineOffset: '2px',
                borderRadius: '4px',
            }}
        >
            <HStack spacing={2} align="center">
                <Text
                    fontWeight={isActive ? 700 : 600}
                    fontSize={{ base: 'sm', md: 'md' }}
                    letterSpacing="-0.01em"
                    whiteSpace="nowrap"
                >
                    {label}
                </Text>
                {badge && (
                    <Box
                        bg={badgeBg}
                        color={badgeFg}
                        fontSize="2xs"
                        fontWeight="bold"
                        letterSpacing="0.06em"
                        textTransform="uppercase"
                        px={1.5}
                        py="1px"
                        borderRadius="full"
                        lineHeight="1.2"
                    >
                        {badge}
                    </Box>
                )}
            </HStack>
            <Box
                position="absolute"
                left={0}
                right={0}
                bottom="-1px"
                h="2px"
                bg={accent}
                borderRadius="2px"
                opacity={isActive ? 1 : 0}
                transform={isActive ? 'scaleX(1)' : 'scaleX(0.4)'}
                transition="opacity 160ms ease, transform 160ms ease"
                transformOrigin="center"
            />
        </Box>
    );
}
