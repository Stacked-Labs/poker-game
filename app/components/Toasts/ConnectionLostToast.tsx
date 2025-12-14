'use client';

import { Box, Flex, Text, CloseButton, Icon } from '@chakra-ui/react';
import { MdWifiOff } from 'react-icons/md';
import { keyframes } from '@emotion/react';

const pulseIcon = keyframes({
    '0%, 100%': { transform: 'scale(1)' },
    '50%': { transform: 'scale(1.1)' },
});

interface ConnectionLostToastProps {
    onClose: () => void;
}

const ConnectionLostToast = ({ onClose }: ConnectionLostToastProps) => {
    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <Box
            bg="card.white"
            borderRadius="12px"
            p={4}
            boxShadow="0 4px 20px rgba(235, 11, 92, 0.25), 0 0 0 2px rgba(235, 11, 92, 0.3)"
            border="2px solid"
            borderColor="brand.pink"
            position="relative"
            overflow="hidden"
        >
            <Flex align="flex-start" gap={3}>
                {/* Animated Icon Container */}
                <Flex
                    align="center"
                    justify="center"
                    bg="brand.pink"
                    borderRadius="full"
                    p={2}
                    flexShrink={0}
                    animation={`${pulseIcon} 2s ease-in-out infinite`}
                >
                    <Icon as={MdWifiOff} color="white" boxSize={5} />
                </Flex>

                {/* Content */}
                <Box flex={1} pr={6}>
                    <Text
                        fontWeight="bold"
                        fontSize="md"
                        color="text.primary"
                        mb={1}
                    >
                        Connection Lost
                    </Text>
                    <Text
                        fontSize="sm"
                        color="text.secondary"
                        lineHeight="tall"
                    >
                        Having trouble reconnecting? Click{' '}
                        <Text
                            as="span"
                            fontWeight="bold"
                            textDecoration="underline"
                            color="brand.pink"
                            cursor="pointer"
                            onClick={handleRefresh}
                            _hover={{
                                color: 'brand.green',
                            }}
                            transition="color 0.2s"
                        >
                            here
                        </Text>{' '}
                        to refresh the page.
                    </Text>
                </Box>

                {/* Close Button */}
                <CloseButton
                    size="sm"
                    color="text.secondary"
                    _hover={{ color: 'brand.pink', bg: 'brand.lightGray' }}
                    onClick={onClose}
                    position="absolute"
                    top={2}
                    right={2}
                />
            </Flex>
        </Box>
    );
};

export default ConnectionLostToast;
