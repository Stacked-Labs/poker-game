import React from 'react';
import { Text, VStack, Flex, Tooltip } from '@chakra-ui/react';
import Image from 'next/image';

interface OptionCardProps {
    name: string;
    image?: string; // Make image optional
    description?: string; // Make description optional
    isSelected: boolean;
    onClick: () => void;
    disabled?: boolean; // New prop
}

const OptionCard: React.FC<OptionCardProps> = ({
    name,
    image,
    description,
    isSelected,
    onClick,
    disabled = false, // Default to false
}) => {
    const card = (
        <Flex
            borderWidth="2px"
            borderColor={isSelected ? 'brand.pink' : 'brand.lightGray'}
            borderRadius="16px"
            p={4}
            cursor={disabled ? 'not-allowed' : 'pointer'}
            onClick={disabled ? undefined : onClick}
            width={['100px', '100px', '150px', '150px']}
            height={['100px', '100px', '150px', '150px']}
            transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
            _hover={
                disabled
                    ? {}
                    : {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.12)',
                      }
            }
            alignItems="center"
            justifyContent="center"
            opacity={disabled ? 0.5 : 1}
            bg={disabled ? 'rgba(236, 238, 245, 0.5)' : 'card.white'}
            boxShadow={
                isSelected
                    ? '0 4px 16px rgba(235, 11, 92, 0.25)'
                    : '0 2px 8px rgba(0, 0, 0, 0.06)'
            }
            transform={isSelected ? 'scale(1.02)' : 'scale(1)'}
        >
            <VStack spacing={2} align="center">
                {image && (
                    <Image
                        src={image}
                        alt={name}
                        objectFit="cover"
                        width={50}
                        height={50}
                    />
                )}
                <Text
                    fontWeight="bold"
                    textAlign="center"
                    color={disabled ? 'gray.400' : 'text.primary'}
                    fontSize={['12px', '12px', '16px', '16px']}
                >
                    {name}
                </Text>
                {description && (
                    <Text
                        fontSize={['10px', '10px', '12px', '12px']}
                        textAlign="center"
                        color={disabled ? 'gray.400' : 'text.secondary'}
                    >
                        {description}
                    </Text>
                )}
            </VStack>
        </Flex>
    );

    return disabled ? (
        <Tooltip
            label="Coming soon"
            aria-label="Coming soon tooltip"
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

export default OptionCard;
