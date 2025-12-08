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
    // Map legacy colors to brand colors
    const brandColorMap: {
        [key: string]: {
            bg: string;
            border: string;
            text: string;
            hoverBg: string;
        };
    } = {
        green: {
            bg: 'brand.green',
            border: 'brand.green',
            text: 'white',
            hoverBg: '#2d8763', // darker green
        },
        red: {
            bg: 'brand.pink',
            border: 'brand.pink',
            text: 'white',
            hoverBg: '#c9094c', // darker pink
        },
        white: {
            bg: 'brand.pink',
            border: 'brand.pink',
            text: 'brand.lightGray',
            hoverBg: '#c9094c', // darker pink
        },
    };

    const buttonColors = brandColorMap[color] || brandColorMap.green;

    const queueStyles = queueMode
        ? {
              opacity: queued ? 1 : 0.6,
              borderStyle: queued ? 'solid' : 'dashed',
          }
        : {};

    return (
        <Button
            bg={buttonColors.bg}
            color={buttonColors.text}
            borderColor={buttonColors.border}
            border="2px solid"
            textTransform={'uppercase'}
            onClick={clickHandler}
            isDisabled={isDisabled}
            fontWeight="bold"
            position={'relative'}
            zIndex={10}
            cursor="pointer"
            _hover={{
                bg:
                    !isDisabled && !queueMode
                        ? buttonColors.hoverBg
                        : buttonColors.bg,
                transform:
                    !isDisabled && !queueMode ? 'translateY(-1px)' : 'none',
                boxShadow:
                    !isDisabled && !queueMode
                        ? 'lg'
                        : queueMode
                          ? 'none'
                          : 'none',
            }}
            _active={{
                transform:
                    !isDisabled && !queueMode ? 'translateY(0px)' : 'none',
            }}
            transition="all 0.2s"
            className={`action-button ${text.toLowerCase()}-button ${className}`.trim()}
            data-queue-mode={queueMode ? 'true' : undefined}
            style={queueStyles}
            sx={{
                // Portrait/Vertical mode: Compact styles
                '@media (orientation: portrait)': {
                    borderRadius: '8px',
                    padding: '2%',
                    fontSize: '3cqw',
                    width: '100%',
                    flex: 1,
                    height: 'auto',
                    minHeight: '8cqh',
                    maxHeight: '100%',
                    flexShrink: 1,
                },
                // Landscape/Horizontal mode: Full styles
                '@media (orientation: landscape)': {
                    borderRadius: '8px',
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
                opacity={'70%'}
                textTransform={'uppercase'}
                color={buttonColors.text}
                sx={{
                    // Hide hotkey in portrait, show in landscape
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
                    bg="rgba(253, 197, 29, 0.2)"
                    color={buttonColors.text}
                    border="1px solid rgba(253, 197, 29, 0.6)"
                >
                    Auto
                </Badge>
            )}
            {text}
        </Button>
    );
};

export default ActionButton;
