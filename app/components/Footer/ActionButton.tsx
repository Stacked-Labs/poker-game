'use client';

import { Box, Button } from '@chakra-ui/react';
import React from 'react';

interface ActionButtonProps {
    text: string;
    color: string;
    clickHandler: () => void;
    isDisabled: boolean;
    hotkey: string;
    className?: string;
}

const ActionButton = ({
    text,
    color,
    clickHandler,
    isDisabled,
    hotkey,
    className = '',
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
            maxW={{ base: 'unset', md: '180px', lg: '200px' }}
            width={{ base: '100%', md: 'auto' }}
            flex={{ base: 1, md: '0 0 auto' }}
            height={
                isCompactButton
                    ? { base: 'auto', md: 'auto' }
                    : { base: '100%', md: '100%', lg: '100%' }
            }
            minH={isCompactButton ? { base: '36px', sm: '40px' } : undefined}
            maxH={
                isCompactButton
                    ? { base: '44px', sm: '48px', md: 'none' }
                    : undefined
            }
            flexShrink={{ base: 1, md: 0 }}
            position={'relative'}
            zIndex={10}
            _hover={{
                bg: !isDisabled ? buttonColors.hoverBg : buttonColors.bg,
                transform: !isDisabled ? 'translateY(-1px)' : 'none',
                boxShadow: !isDisabled ? 'lg' : 'none',
            }}
            _active={{
                transform: !isDisabled ? 'translateY(0px)' : 'none',
            }}
            transition="all 0.2s"
            className={`action-button ${text.toLowerCase()}-button ${className}`.trim()}
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
            {text}
        </Button>
    );
};

export default ActionButton;
