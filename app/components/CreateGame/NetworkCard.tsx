import React from 'react';
import {
    Box,
    Text,
    VStack,
    Tooltip,
    useColorModeValue,
} from '@chakra-ui/react';
import Image from 'next/image';

// Network cards only render in the Real Money flow, so the accent
// matches the ModeChooser's Real Money card (USDC blue).
const USDC_BLUE = '#2775CA';
const USDC_BLUE_EDGE = '#1F5FA3';
const USDC_LOGO = '/usdc-logo.png';

interface NetworkCardProps {
    name: string;
    // Network logo, rendered as a small "punched out" badge at the
    // bottom-right of the USDC logo (standard wallet token/chain pattern).
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
    // The badge's outer ring matches the card surface so the chip looks
    // "cut out" from it. Inner circle stays white in both modes for logo legibility.
    const badgeRing = useColorModeValue('card.white', 'card.darkNavy');
    const testnetBorder = useColorModeValue('whiteAlpha.700', 'whiteAlpha.500');
    const card = (
        <Box
            as="button"
            className="network-card"
            borderWidth="2px"
            borderColor={isSelected ? USDC_BLUE : 'border.lightGray'}
            borderRadius="16px"
            bg={disabled ? 'card.lightGray' : 'card.white'}
            p={2}
            cursor={disabled ? 'not-allowed' : 'pointer'}
            onClick={disabled ? undefined : onClick}
            width={{ base: '90px', sm: '110px' }}
            height={{ base: '90px', sm: '110px' }}
            position="relative"
            boxShadow={
                isSelected
                    ? `inset 0 1px 0 rgba(255,255,255,0.50), 0 2px 0 ${USDC_BLUE_EDGE}`
                    : '0 1.5px 0 rgba(0,0,0,0.08)'
            }
            transition="transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 80ms ease, background-color 80ms ease, border-color 80ms ease"
            _hover={
                disabled
                    ? {}
                    : isSelected
                      ? { borderColor: USDC_BLUE }
                      : {
                            borderColor: USDC_BLUE,
                            bg: 'rgba(39, 117, 202, 0.05)',
                        }
            }
            _active={
                disabled
                    ? undefined
                    : {
                          transform: 'translateY(2px)',
                          boxShadow: isSelected
                              ? `inset 0 2px 4px rgba(0,0,0,0.14), 0 0 0 ${USDC_BLUE_EDGE}`
                              : 'inset 0 1px 2px rgba(0,0,0,0.10), 0 0 0 transparent',
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
                    top="3px"
                    right="3px"
                    bg="brand.yellow"
                    color="brand.darkNavy"
                    px={1.5}
                    py="1px"
                    borderRadius="full"
                    fontSize={{ base: '7px', sm: '8px' }}
                    fontWeight="bold"
                    letterSpacing="0.06em"
                    textTransform="uppercase"
                    boxShadow="0 2px 6px rgba(0, 0, 0, 0.12)"
                    border="1px solid"
                    borderColor={testnetBorder}
                    transform="rotate(8deg)"
                    whiteSpace="nowrap"
                    zIndex={2}
                >
                    {badge}
                </Box>
            )}
            <VStack spacing={1.5} className="network-card__content">
                {/* USDC primary logo with the network as a "punched out" badge */}
                <Box
                    className="network-card__logo"
                    width={{ base: '40px', sm: '52px' }}
                    height={{ base: '40px', sm: '52px' }}
                    position="relative"
                >
                    <Image
                        src={USDC_LOGO}
                        alt="USDC"
                        fill
                        className="network-card__logo-image"
                        style={{ objectFit: 'contain' }}
                    />
                    <Box
                        className="network-card__chain-badge"
                        position="absolute"
                        bottom="-3px"
                        right="-3px"
                        width={{ base: '18px', sm: '22px' }}
                        height={{ base: '18px', sm: '22px' }}
                        borderRadius="6px"
                        bg={badgeRing}
                        p="2px"
                        boxShadow="0 1px 2px rgba(0,0,0,0.10)"
                    >
                        <Box
                            position="relative"
                            width="100%"
                            height="100%"
                            borderRadius="4px"
                            overflow="hidden"
                        >
                            {/* Plain <img> for SVG — Next.js next/image disallows
                                SVG by default and this is one asset, not worth a config flip. */}
                            <img
                                src={image}
                                alt={name}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                    display: 'block',
                                }}
                            />
                        </Box>
                    </Box>
                </Box>
                <Box
                    className="network-card__label"
                    minHeight={{ base: '22px', sm: '28px' }}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    px={1}
                >
                    <Text
                        className="network-card__label-text"
                        fontSize={{ base: '9px', sm: '10px' }}
                        fontWeight="semibold"
                        color={disabled ? 'gray.400' : 'text.primary'}
                        textAlign="center"
                        lineHeight="1.15"
                    >
                        USDC on {name}
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
