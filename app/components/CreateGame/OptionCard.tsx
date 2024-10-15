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
            borderWidth={4}
            borderColor={isSelected ? 'red.500' : 'gray.50'}
            borderRadius="lg"
            p={4}
            cursor={disabled ? 'not-allowed' : 'pointer'}
            onClick={disabled ? undefined : onClick}
            width={150}
            height={150}
            transition="all 0.2s"
            _hover={disabled ? {} : { boxShadow: 'md', bgColor: 'gray.50' }}
            alignItems="center"
            justifyContent="center"
            opacity={disabled ? 0.5 : 1}
            bgColor={disabled ? 'gray.100' : 'transparent'}
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
                <Text fontWeight="bold" textAlign="center" color="white">
                    {name}
                </Text>
                {description && (
                    <Text fontSize="sm" textAlign="center" color="white">
                        {description}
                    </Text>
                )}
            </VStack>
        </Flex>
    );

    return disabled ? (
        <Tooltip label="Coming soon" aria-label="A tooltip">
            {card}
        </Tooltip>
    ) : (
        card
    );
};

export default OptionCard;
