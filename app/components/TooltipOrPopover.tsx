'use client';

import { type ReactNode, useEffect, useState } from 'react';
import {
    Box,
    Popover,
    PopoverArrow,
    PopoverBody,
    PopoverContent,
    PopoverTrigger,
    Portal,
    Text,
    Tooltip,
} from '@chakra-ui/react';

// Explainer that works on BOTH pointer types: a hover Tooltip on devices with a fine
// pointer, a tap Popover on touch (Chakra Tooltip is hover-only, so on the mobile-heavy
// primary audience plain Tooltips silently never show). Wrap any inline trigger.
export default function TooltipOrPopover({
    label,
    children,
    'aria-label': ariaLabel,
}: {
    label: ReactNode;
    children: ReactNode;
    'aria-label'?: string;
}) {
    // Default to hover (desktop) for SSR/first paint, then correct on mount.
    const [hoverCapable, setHoverCapable] = useState(true);
    useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return;
        const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
        setHoverCapable(mq.matches);
        const onChange = (e: MediaQueryListEvent) => setHoverCapable(e.matches);
        mq.addEventListener?.('change', onChange);
        return () => mq.removeEventListener?.('change', onChange);
    }, []);

    if (hoverCapable) {
        return (
            <Tooltip
                label={label}
                hasArrow
                placement="top"
                openDelay={150}
                borderRadius="md"
                px={3}
                py={2}
                fontSize="xs"
                maxW="260px"
            >
                <Box as="span" display="inline-flex" alignItems="center">
                    {children}
                </Box>
            </Tooltip>
        );
    }

    return (
        <Popover trigger="click" placement="top" isLazy>
            <PopoverTrigger>
                <Box
                    as="span"
                    display="inline-flex"
                    alignItems="center"
                    justifyContent="center"
                    minW="24px"
                    minH="24px"
                    cursor="pointer"
                    tabIndex={0}
                    role="button"
                    aria-label={ariaLabel}
                >
                    {children}
                </Box>
            </PopoverTrigger>
            <Portal>
                <PopoverContent
                    maxW="260px"
                    bg="bg.charcoal"
                    border="none"
                    borderRadius="md"
                    _focusVisible={{ boxShadow: 'focus.ring' }}
                >
                    <PopoverArrow bg="bg.charcoal" />
                    <PopoverBody>
                        <Text fontSize="xs" color="white" lineHeight="1.5">
                            {label}
                        </Text>
                    </PopoverBody>
                </PopoverContent>
            </Portal>
        </Popover>
    );
}
