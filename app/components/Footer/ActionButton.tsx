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
    return (
        <Button
            color={`${color}.500`}
            borderColor={`${color}.500`}
            borderBottomWidth={4}
            padding={{ base: 4, sm: 6, md: 10 }}
            textTransform={'uppercase'}
            onClick={clickHandler}
            isDisabled={isDisabled}
            fontSize={{
                base: '15px',
                md: 'medium',
                lg: 'large',
                xl: 'large',
                '2xl': 'large',
            }}
            maxW={{ base: 'unset', md: '180px', lg: '200px' }}
            width={{ base: '100%', md: 'auto' }}
            flex={{ base: 1, md: '0 0 auto' }}
            height={{ base: '100%', md: 'auto' }}
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
