'use client';

import { Badge, Box, Button } from '@chakra-ui/react';
import React from 'react';

interface ActionButtonProps {
    text: string;
    color: string;
    clickHandler: () => void;
    isDisabled: boolean;
    hotkey: string;
    className?: string;
    queued?: boolean;
    queueMode?: boolean;
    // Override the derived `action-<text>` testid (e.g. the RIT vote buttons reuse this
    // component but keep their own rit-vote-* hooks).
    testId?: string;
    // Subtle outline rendering — transparent fill, tone-colored border + text (used by
    // the RIT vote buttons so YES/NO read quieter than the solid Raise/Call/Fold).
    outline?: boolean;
}

const ActionButton = ({
    text,
    color,
    clickHandler,
    isDisabled,
    hotkey,
    className = '',
    queued = false,
    queueMode = false,
    testId,
    outline = false,
}: ActionButtonProps) => {
    // Tactile palette per tone — solid fill + matching darker shade for press
    // and an edge color for the chip's bottom rim. Brand tokens, no hex leaks.
    const tonePalette: {
        [key: string]: {
            bg: string;
            press: string;
            edge: string;
            text: string;
        };
    } = {
        green: {
            bg: 'brand.green',
            press: 'brand.greenDark',
            edge: '#22674E', // brand.greenEdge
            text: 'white',
        },
        red: {
            bg: 'brand.pink',
            press: 'brand.pinkDark',
            edge: '#950839', // brand.pinkEdge
            text: 'white',
        },
        white: {
            bg: 'brand.pink',
            press: 'brand.pinkDark',
            edge: '#950839',
            text: 'brand.lightGray',
        },
    };

    const t = tonePalette[color] || tonePalette.green;

    const queueStyles = queueMode
        ? {
              opacity: queued ? 1 : 0.5,
              borderStyle: queued ? 'solid' : 'dashed',
          }
        : {};

    // Derive a testid from the button text: "Call (50)" → "action-call", "Bet" → "action-bet"
    const actionTestId = testId ?? `action-${text.split(/[\s(]/)[0].toLowerCase()}`;

    return (
        <Button
            data-testid={actionTestId}
            bg={outline ? 'transparent' : t.bg}
            color={outline ? t.bg : t.text}
            border={outline ? '2px solid' : 'none'}
            borderColor={outline ? t.bg : undefined}
            textTransform={'uppercase'}
            onClick={clickHandler}
            isDisabled={isDisabled}
            fontWeight="bold"
            letterSpacing="0.04em"
            position={'relative'}
            zIndex={10}
            cursor="pointer"
            overflow="hidden"
            boxShadow={
                outline
                    ? `0 2px 0 ${t.edge}`
                    : `inset 0 1px 0 rgba(255,255,255,0.18), 0 2px 0 ${t.edge}`
            }
            transition="transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 80ms ease, background-color 80ms ease"
            _hover={outline ? { bg: 'whiteAlpha.100' } : { bg: t.bg }}
            _active={
                queueMode
                    ? undefined
                    : outline
                      ? {
                            bg: 'whiteAlpha.200',
                            transform: 'translateY(2px)',
                            boxShadow: `0 0 0 ${t.edge}`,
                        }
                      : {
                            bg: t.press,
                            transform: 'translateY(2px)',
                            boxShadow: `inset 0 2px 4px rgba(0,0,0,0.18), 0 0 0 ${t.edge}`,
                        }
            }
            className={`action-button ${text.toLowerCase()}-button ${className}`.trim()}
            data-queue-mode={queueMode ? 'true' : undefined}
            style={queueStyles}
            sx={{
                // Portrait/Vertical mode — sizing preserved verbatim
                '@media (orientation: portrait)': {
                    borderRadius: '10px',
                    padding: '2%',
                    fontSize: '3cqw',
                    width: '100%',
                    flex: 1,
                    height: 'auto',
                    minHeight: '8cqh',
                    maxHeight: '100%',
                    flexShrink: 1,
                },
                // Landscape/Horizontal mode — sizing preserved verbatim
                '@media (orientation: landscape)': {
                    borderRadius: '10px',
                    padding: '0.5% 1.5%',
                    fontSize: '1cqw',
                    width: 'auto',
                    minWidth: '7cqw',
                    maxWidth: '12cqw',
                    height: '100%',
                    flexShrink: 0,
                },
            }}
        >
            <Box
                position={'absolute'}
                top={0}
                left={1}
                opacity={'60%'}
                textTransform={'uppercase'}
                color={t.text}
                sx={{
                    '@media (orientation: portrait)': {
                        display: 'none',
                    },
                    '@media (orientation: landscape)': {
                        display: 'block',
                        fontSize: '0.6cqw',
                    },
                }}
            >
                {hotkey}
            </Box>
            {queued && (
                <Badge
                    position="absolute"
                    top={1}
                    right={1}
                    colorScheme="yellow"
                    fontSize="0.55rem"
                    textTransform="uppercase"
                    borderRadius="full"
                    px={1.5}
                    py={0.5}
                    bg="rgba(253, 197, 29, 0.25)"
                    color={t.text}
                    border="1px solid rgba(253, 197, 29, 0.5)"
                    backdropFilter="blur(4px)"
                >
                    Auto
                </Badge>
            )}
            {text}
        </Button>
    );
};

export default ActionButton;
