import React from 'react';
import { Box, Text, VStack, Tooltip } from '@chakra-ui/react';
import Image from 'next/image';

interface NetworkCardProps {
    name: string;
    image: string;
    badge?: string;
    isSelected: boolean;
    onClick: () => void;
    disabled?: boolean;
}

const NetworkCard: React.FC<NetworkCardProps> = ({
    name,
    image,
    badge,
    isSelected,
    onClick,
    disabled = false,
}) => {
    const isMultiLineName = name.includes(' ');
    const useCompactLabel = !isMultiLineName && name.length > 8;
    const nameParts = isMultiLineName ? name.split(' ') : [name];
    const card = (
        <Box
            as="button"
            className="network-card"
            borderWidth="2px"
            borderColor={isSelected ? 'brand.pink' : 'border.lightGray'}
            borderRadius="16px"
            bg={disabled ? 'card.lighterGray' : 'card.white'}
            p={2}
            cursor={disabled ? 'not-allowed' : 'pointer'}
            onClick={disabled ? undefined : onClick}
            width={{ base: '90px', sm: '110px' }}
            height={{ base: '90px', sm: '110px' }}
            transition="all 0.2s ease"
            position="relative"
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
            {badge && (
                <Box
                    className="network-card__badge"
                    position="absolute"
                    top={{ base: '2px', sm: '2px' }}
                    right={{ base: '2px', sm: '2px' }}
                    bg="brand.yellow"
                    color="brand.darkNavy"
                    px={2}
                    py="2px"
                    borderRadius="full"
                    fontSize={{ base: '8px', sm: '9px' }}
                    fontWeight="bold"
                    letterSpacing="0.04em"
                    textTransform="uppercase"
                    boxShadow="0 3px 8px rgba(0, 0, 0, 0.14)"
                    border="1px solid"
                    borderColor="whiteAlpha.700"
                    transform="rotate(10deg)"
                    whiteSpace="nowrap"
                    zIndex={1}
                >
                    {badge}
                </Box>
            )}
            <VStack spacing={2} className="network-card__content">
                <Box
                    className="network-card__logo"
                    width={{ base: '32px', sm: '48px' }}
                    height={{ base: '32px', sm: '48px' }}
                    position="relative"
                >
                    <Image
                        src={image}
                        alt={name}
                        fill
                        className="network-card__logo-image"
                        style={{ objectFit: 'contain' }}
                    />
                </Box>
                <Box
                    className="network-card__label"
                    height={{ base: '28px', sm: '32px' }}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                >
                    <Text
                        className="network-card__label-text"
                        fontSize={
                            useCompactLabel
                                ? { base: '10px', sm: '11px' }
                                : { base: 'xs', sm: 'sm' }
                        }
                        fontWeight="semibold"
                        color={disabled ? 'gray.400' : 'text.primary'}
                        textAlign="center"
                        lineHeight="shorter"
                    >
                        {nameParts.map((part, index) => (
                            <React.Fragment key={`${part}-${index}`}>
                                {part}
                                {index < nameParts.length - 1 && <br />}
                            </React.Fragment>
                        ))}
                    </Text>
                </Box>
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
