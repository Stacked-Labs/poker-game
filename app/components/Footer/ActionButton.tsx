'use client';

import { Button } from '@chakra-ui/react';
import React from 'react';

const ActionButton = ({
    text,
    color,
    clickHandler,
    isDisabled,
}: {
    text: string;
    color: string;
    clickHandler: () => void;
    isDisabled: boolean;
}) => {
    return (
        <Button
            color={`${color}.500`}
            borderColor={`${color}.500`}
            borderBottomWidth={4}
            padding={8}
            textTransform={'uppercase'}
            onClick={clickHandler}
            isDisabled={isDisabled}
        >
            {text}
        </Button>
    );
};

export default ActionButton;
