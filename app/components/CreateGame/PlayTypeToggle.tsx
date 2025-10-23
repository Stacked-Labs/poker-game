import React from 'react';
import { Box, Text } from '@chakra-ui/react';

interface PlayTypeToggleProps {
    playType: 'Free' | 'Crypto';
    setPlayType: (type: 'Free' | 'Crypto') => void;
}

export default function PlayTypeToggle({
    playType,
    setPlayType,
}: PlayTypeToggleProps) {
    const handleToggle = () => {
        const newType = playType === 'Free' ? 'Crypto' : 'Free';
        setPlayType(newType);
    };

    return (
        <Box
            position="relative"
            width="240px"
            height="48px"
            bg="brand.lightGray"
            borderRadius="full"
            display="flex"
            alignItems="center"
            padding="4px"
            cursor="pointer"
            onClick={handleToggle}
            _hover={{
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            }}
            transition="all 0.2s ease"
        >
            {/* Active Pill */}
            <Box
                position="absolute"
                left={playType === 'Crypto' ? 'calc(50% - 2px)' : '4px'}
                width="calc(50% - 2px)"
                height="40px"
                bg="white"
                borderRadius="full"
                transition="left 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                borderWidth="2px"
                borderColor="brand.pink"
                boxShadow="0 2px 8px rgba(235, 11, 92, 0.2)"
            />

            {/* Free Play Text */}
            <Box
                position="absolute"
                left="0"
                width="50%"
                display="flex"
                alignItems="center"
                justifyContent="center"
                zIndex="1"
            >
                <Text
                    fontSize="sm"
                    fontWeight="bold"
                    color={
                        playType === 'Free' ? 'brand.pink' : 'brand.darkNavy'
                    }
                    transition="color 0.2s ease"
                >
                    Free Play
                </Text>
            </Box>

            {/* Crypto Text */}
            <Box
                position="absolute"
                right="0"
                width="50%"
                display="flex"
                alignItems="center"
                justifyContent="center"
                zIndex="1"
            >
                <Text
                    fontSize="sm"
                    fontWeight="bold"
                    color={
                        playType === 'Crypto' ? 'brand.pink' : 'brand.darkNavy'
                    }
                    transition="color 0.2s ease"
                >
                    Crypto
                </Text>
            </Box>
        </Box>
    );
}
