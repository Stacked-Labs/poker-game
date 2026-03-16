'use client';

import { Badge, Box, Button } from '@chakra-ui/react';
import React from 'react';
import { motion } from 'framer-motion';
import { keyframes } from '@emotion/react';

const MotionButton = motion(Button);

// Subtle shimmer effect on hover
const shimmer = keyframes`
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
`;

interface ActionButtonProps {
    text: string;
    color: string;
    clickHandler: () => void;
    isDisabled: boolean;
    hotkey: string;
    className?: string;
    queued?: boolean;
    queueMode?: boolean;
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
}: ActionButtonProps) => {
    const brandColorMap: {
        [key: string]: {
            bg: string;
            bgHover: string;
            border: string;
            text: string;
            hoverBg: string;
            glowColor: string;
            gradient: string;
        };
    } = {
        green: {
            bg: 'brand.green',
            bgHover: '#2d8763',
            border: 'rgba(54, 163, 123, 0.6)',
            text: 'white',
            hoverBg: '#2d8763',
            glowColor: 'rgba(54, 163, 123, 0.4)',
            gradient:
                'linear-gradient(135deg, rgba(54, 163, 123, 1) 0%, rgba(45, 135, 99, 1) 100%)',
        },
        red: {
            bg: 'brand.pink',
            bgHover: '#c9094c',
            border: 'rgba(235, 11, 92, 0.6)',
            text: 'white',
            hoverBg: '#c9094c',
            glowColor: 'rgba(235, 11, 92, 0.4)',
            gradient:
                'linear-gradient(135deg, rgba(235, 11, 92, 1) 0%, rgba(201, 9, 76, 1) 100%)',
        },
        white: {
            bg: 'brand.pink',
            bgHover: '#c9094c',
            border: 'rgba(235, 11, 92, 0.6)',
            text: 'brand.lightGray',
            hoverBg: '#c9094c',
            glowColor: 'rgba(235, 11, 92, 0.4)',
            gradient:
                'linear-gradient(135deg, rgba(235, 11, 92, 1) 0%, rgba(201, 9, 76, 1) 100%)',
        },
    };

    const buttonColors = brandColorMap[color] || brandColorMap.green;

    const queueStyles = queueMode
        ? {
              opacity: queued ? 1 : 0.5,
              borderStyle: queued ? 'solid' : 'dashed',
          }
        : {};

    // Derive a testid from the button text: "Call (50)" → "action-call", "Bet" → "action-bet"
    const actionTestId = `action-${text.split(/[\s(]/)[0].toLowerCase()}`;

    return (
        <MotionButton
            data-testid={actionTestId}
            bg={buttonColors.bg}
            bgGradient={!queueMode ? buttonColors.gradient : undefined}
            color={buttonColors.text}
            borderColor={buttonColors.border}
            border="1.5px solid"
            textTransform={'uppercase'}
            onClick={clickHandler}
            isDisabled={isDisabled}
            fontWeight="bold"
            letterSpacing="0.04em"
            position={'relative'}
            zIndex={10}
            cursor="pointer"
            overflow="hidden"
            // Framer Motion spring animation
            whileHover={
                !isDisabled && !queueMode
                    ? {
                          y: -2,
                          scale: 1.03,
                          transition: {
                              type: 'spring',
                              stiffness: 400,
                              damping: 17,
                          },
                      }
                    : undefined
            }
            whileTap={
                !isDisabled && !queueMode
                    ? {
                          scale: 0.95,
                          y: 0,
                          transition: {
                              type: 'spring',
                              stiffness: 500,
                              damping: 15,
                          },
                      }
                    : undefined
            }
            _hover={{
                boxShadow:
                    !isDisabled && !queueMode
                        ? `0 8px 24px ${buttonColors.glowColor}, inset 0 1px 0 rgba(255, 255, 255, 0.2)`
                        : 'none',
            }}
            transition="box-shadow 0.3s ease, background 0.3s ease"
            className={`action-button ${text.toLowerCase()}-button ${className}`.trim()}
            data-queue-mode={queueMode ? 'true' : undefined}
            style={queueStyles}
            sx={{
                // Inner light effect
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '50%',
                    background:
                        'linear-gradient(to bottom, rgba(255, 255, 255, 0.15), transparent)',
                    borderRadius: 'inherit',
                    pointerEvents: 'none',
                },
                // Shimmer effect on hover
                '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background:
                        'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.12), transparent)',
                    backgroundSize: '200% 100%',
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                    pointerEvents: 'none',
                },
                '&:hover::after': {
                    opacity: isDisabled || queueMode ? 0 : 1,
                    animation: `${shimmer} 1.5s ease-in-out infinite`,
                },
                // Portrait/Vertical mode
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
                // Landscape/Horizontal mode
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
                color={buttonColors.text}
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
                    color={buttonColors.text}
                    border="1px solid rgba(253, 197, 29, 0.5)"
                    backdropFilter="blur(4px)"
                >
                    Auto
                </Badge>
            )}
            {text}
        </MotionButton>
    );
};

export default ActionButton;
