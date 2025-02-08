import React from 'react';
import { Box, Switch, Text } from '@chakra-ui/react';

interface PlayTypeToggleProps {
    playType: 'Free' | 'Crypto';
    setPlayType: (type: 'Free' | 'Crypto') => void;
}

export default function PlayTypeToggle({
    playType,
    setPlayType,
}: PlayTypeToggleProps) {
    const bgColor = 'gray.800';
    const activeColor = 'gray.50';
    const textColor = 'white';
    const borderColor = 'red';

    const handleToggle = () => {
        const newType = playType === 'Free' ? 'Crypto' : 'Free';
        setPlayType(newType);
    };

    return (
        <Box
            position="relative"
            width="200px"
            height="40px"
            bg={bgColor}
            borderRadius="full"
            display="flex"
            alignItems="center"
            padding="4px"
            cursor="pointer"
            as="switch"
            onClick={handleToggle}
        >
            <Box
                position="absolute"
                left={playType === 'Crypto' ? '50%' : '0'}
                width="50%"
                height="32px"
                bg={activeColor}
                borderRadius="full"
                transition="left 0.2s"
                borderWidth="2px"
                borderColor={borderColor}
            />
            <Text
                position="absolute"
                left="25%"
                transform="translateX(-50%)"
                fontSize="sm"
                fontWeight="bold"
                color={textColor}
                zIndex="1"
            >
                Free Play
            </Text>
            <Text
                position="absolute"
                right="25%"
                transform="translateX(50%)"
                fontSize="sm"
                fontWeight="bold"
                color={textColor}
                zIndex="1"
            >
                Crypto
            </Text>

        </Box>
    );
}
