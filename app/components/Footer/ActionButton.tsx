'use client';

import { Box, Button } from '@chakra-ui/react';
import React from 'react';

const ActionButton = ({
    text,
    color,
    clickHandler,
    isDisabled,
    hotkey,
}: {
    text: string;
    color: string;
    clickHandler: () => void;
    isDisabled: boolean;
    hotkey: String;
}) => {
    return (
        <Button
            color={`${color}.500`}
            borderColor={`${color}.500`}
            borderBottomWidth={4}
            padding={{ sm: 2, md: 8 }}
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
            flex={1}
            position={'relative'}
        >
            <Box
                position={'absolute'}
                top={1}
                left={1}
                fontSize={'small'}
                opacity={'60%'}
                textTransform={'uppercase'}
            >
                {hotkey}
            </Box>
            {text}
        </Button>
    );
};

export default ActionButton;
