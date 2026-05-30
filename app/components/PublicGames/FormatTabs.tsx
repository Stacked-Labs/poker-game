'use client';

import { forwardRef, KeyboardEvent, useRef } from 'react';
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

const FORMATS: ReadonlyArray<{ id: GameFormat; label: string; badge?: string }> = [
    { id: 'cash', label: 'Cash games' },
    { id: 'tournaments', label: 'Tournaments' },
];

export default function FormatTabs({ format, onChange }: FormatTabsProps) {
    const ruleColor = useColorModeValue(
        'rgba(11, 20, 48, 0.10)',
        'rgba(255, 255, 255, 0.10)'
    );

    const tabRefs = useRef<Array<HTMLDivElement | null>>([]);

    const onKeyDown = (e: KeyboardEvent<HTMLDivElement>, index: number) => {
        const { key } = e;
        if (key === 'ArrowRight' || key === 'ArrowLeft' || key === 'Home' || key === 'End') {
            e.preventDefault();
            const last = FORMATS.length - 1;
            let next = index;
            if (key === 'ArrowRight') next = index === last ? 0 : index + 1;
            else if (key === 'ArrowLeft') next = index === 0 ? last : index - 1;
            else if (key === 'Home') next = 0;
            else if (key === 'End') next = last;
            tabRefs.current[next]?.focus();
            onChange(FORMATS[next].id);
            return;
        }
        if (key === ' ' || key === 'Enter') {
            e.preventDefault();
            onChange(FORMATS[index].id);
        }
    };

    return (
        <Flex
            role="tablist"
            aria-label="Game format"
            borderBottom="1px solid"
            borderColor={ruleColor}
            gap={{ base: 5, md: 7 }}
        >
            {FORMATS.map((item, index) => (
                <Tab
                    key={item.id}
                    ref={(el) => {
                        tabRefs.current[index] = el;
                    }}
                    isActive={format === item.id}
                    onSelect={() => onChange(item.id)}
                    onKeyDown={(e) => onKeyDown(e, index)}
                    label={item.label}
                    badge={item.badge}
                />
            ))}
        </Flex>
    );
}

interface TabProps {
    isActive: boolean;
    onSelect: () => void;
    onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => void;
    label: string;
    badge?: string;
}

const Tab = forwardRef<HTMLDivElement, TabProps>(function Tab(
    { isActive, onSelect, onKeyDown, label, badge },
    ref
) {
    const accent = 'brand.green';
    const badgeBg = useColorModeValue(
        'rgba(11, 20, 48, 0.06)',
        'rgba(255, 255, 255, 0.08)'
    );

    return (
        <Box
            ref={ref}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={onSelect}
            onKeyDown={onKeyDown}
            cursor="pointer"
            position="relative"
            pb={3}
            mt={1}
            transition="color 140ms ease"
            color={isActive ? 'text.primary' : 'text.muted'}
            _hover={{ color: 'text.primary' }}
            _focusVisible={{
                outline: '2px solid',
                outlineColor: accent,
                outlineOffset: '4px',
                borderRadius: '4px',
            }}
        >
            <HStack spacing={2} align="center">
                <Text
                    color="inherit"
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
                        color="text.muted"
                        fontSize="2xs"
                        fontWeight="bold"
                        letterSpacing="0.08em"
                        textTransform="uppercase"
                        px={1.5}
                        py="2px"
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
                transform={isActive ? 'scaleX(1)' : 'scaleX(0.5)'}
                transition="opacity 180ms ease, transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1)"
                transformOrigin="center"
            />
        </Box>
    );
});
