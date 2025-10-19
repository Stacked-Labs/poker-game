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

    return (
        <Button
            color={`${color}.500`}
            borderColor={`${color}.500`}
            borderBottomWidth={4}
            padding={
                isCompactButton
                    ? { base: 2, sm: 2.5, md: 4, lg: 5 }
                    : { base: 4, sm: 5, md: 4, lg: 5 }
            }
            textTransform={'uppercase'}
            onClick={clickHandler}
            isDisabled={isDisabled}
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
                    : { base: '100%', md: 'auto' }
            }
            minH={isCompactButton ? { base: '36px', sm: '40px' } : undefined}
            maxH={
                isCompactButton
                    ? { base: '44px', sm: '48px', md: 'none' }
                    : undefined
            }
            flexShrink={{ base: 1, md: 0 }}
            position={'relative'}
            className={`action-button ${text.toLowerCase()}-button ${className}`.trim()}
        >
            <Box
                position={'absolute'}
                top={1}
                left={1}
                fontSize={'small'}
                opacity={'60%'}
                textTransform={'uppercase'}
                display={{ base: 'none', md: 'block' }}
            >
                {hotkey}
            </Box>
            {text}
        </Button>
    );
};

export default ActionButton;
