import React from 'react';
import { Box, Text, VStack, Tooltip } from '@chakra-ui/react';
import Image from 'next/image';

interface NetworkCardProps {
    name: string;
    image: string;
    isSelected: boolean;
    onClick: () => void;
    disabled?: boolean;
}

const NetworkCard: React.FC<NetworkCardProps> = ({
    name,
    image,
    isSelected,
    onClick,
    disabled = false,
}) => {
    const card = (
        <Box
            as="button"
            borderWidth="2px"
            borderColor={isSelected ? 'brand.pink' : 'border.lightGray'}
            borderRadius="16px"
            bg={disabled ? 'card.lighterGray' : 'card.white'}
            p={4}
            cursor={disabled ? 'not-allowed' : 'pointer'}
            onClick={disabled ? undefined : onClick}
            width={{ base: '90px', sm: '110px' }}
            height={{ base: '90px', sm: '110px' }}
            transition="all 0.2s ease"
            _hover={
                disabled
                    ? {}
                    : {
                          borderColor: 'brand.pink',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      }
            }
            opacity={disabled ? 0.7 : 1}
            display="flex"
            alignItems="center"
            justifyContent="center"
        >
            <VStack spacing={2}>
                <Box
                    width={{ base: '32px', sm: '40px' }}
                    height={{ base: '32px', sm: '40px' }}
                    position="relative"
                >
                    <Image
                        src={image}
                        alt={name}
                        fill
                        style={{ objectFit: 'contain' }}
                    />
                </Box>
                <Text
                    fontSize={{ base: 'xs', sm: 'sm' }}
                    fontWeight="semibold"
                    color={disabled ? 'gray.400' : 'text.primary'}
                    textAlign="center"
                >
                    {name}
                </Text>
            </VStack>
        </Box>
    );

    return disabled ? (
        <Tooltip
            label="Coming soon"
            bg="brand.darkNavy"
            color="white"
            borderRadius="8px"
            px={3}
            py={2}
        >
            {card}
        </Tooltip>
    ) : (
        card
    );
};

export default NetworkCard;
