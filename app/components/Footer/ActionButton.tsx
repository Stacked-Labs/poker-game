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
    // Check if this is a compact button (used in raise interface)
    const isCompactButton = className.includes('mobile-');

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
            borderRadius={{ base: '8px', md: '10px' }}
            padding={
                isCompactButton
                    ? { base: 2, sm: 2.5, md: 4, lg: 5 }
                    : { base: 4, sm: 5, md: 4, lg: 5 }
            }
            textTransform={'uppercase'}
            onClick={clickHandler}
            isDisabled={isDisabled}
            fontWeight="bold"
            fontSize={
                isCompactButton
                    ? {
                          base: '12px',
                          sm: '13px',
                          md: 'medium',
                          lg: 'large',
                          xl: 'large',
                          '2xl': 'large',
                      }
                    : {
                          base: '15px',
                          sm: '16px',
                          md: 'medium',
                          lg: 'large',
                          xl: 'large',
                          '2xl': 'large',
                      }
            }
            maxW={{ base: 'unset', md: '180px', lg: '180px' }}
            width={{ base: '100%', md: '140px', lg: '140px' }}
            flex={{ base: 1, md: '0 0 auto' }}
            height={
                isCompactButton
                    ? { base: 'auto', md: 'auto' }
                    : { base: '100%', md: '100%', lg: '100%' }
            }
            minH={
                isCompactButton
                    ? { base: '40px', sm: '44px', md: '48px' }
                    : undefined
            }
            maxH={isCompactButton ? { base: '100%', md: 'none' } : undefined}
            flexShrink={{ base: 1, md: 0 }}
            position={'relative'}
            zIndex={10}
            cursor={queueMode ? 'pointer' : 'pointer'}
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
        >
            <Box
                position={'absolute'}
                top={1}
                left={1}
                fontSize={'small'}
                opacity={'70%'}
                textTransform={'uppercase'}
                display={{ base: 'none', md: 'block' }}
                color={buttonColors.text}
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
