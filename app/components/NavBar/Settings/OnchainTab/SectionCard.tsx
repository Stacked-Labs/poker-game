'use client';

import { Box, Flex, HStack, Icon, Text } from '@chakra-ui/react';
import type { IconType } from 'react-icons/lib/iconBase';

interface SectionCardProps {
    icon?: IconType;
    title: string;
    subtitle?: React.ReactNode;
    accent?: 'green' | 'pink' | 'navy' | 'yellow';
    children: React.ReactNode;
    headerRight?: React.ReactNode;
}

interface AccentTokens {
    fg: string;
    fgDark?: string;
    tile: string;
    tileDark: string;
}

const ACCENT_TOKENS: Record<NonNullable<SectionCardProps['accent']>, AccentTokens> = {
    green: {
        fg: 'brand.green',
        tile: 'rgba(54, 163, 123, 0.12)',
        tileDark: 'rgba(54, 163, 123, 0.22)',
    },
    pink: {
        fg: 'brand.pink',
        tile: 'rgba(235, 11, 92, 0.12)',
        tileDark: 'rgba(235, 11, 92, 0.22)',
    },
    navy: {
        fg: 'brand.navy',
        fgDark: 'rgba(180, 197, 245, 1)',
        tile: 'rgba(51, 68, 121, 0.12)',
        tileDark: 'rgba(154, 173, 230, 0.18)',
    },
    yellow: {
        fg: 'brand.yellow',
        tile: 'rgba(232, 168, 0, 0.14)',
        tileDark: 'rgba(232, 168, 0, 0.22)',
    },
};

const SectionCard = ({
    icon,
    title,
    subtitle,
    accent = 'green',
    children,
    headerRight,
}: SectionCardProps) => {
    const tokens = ACCENT_TOKENS[accent];
    return (
        <Box
            bg="card.white"
            borderRadius={{ base: '14px', md: '18px' }}
            border="2px solid"
            borderColor="border.lightGray"
            px={{ base: 3, sm: 4, md: 5 }}
            py={{ base: 3, sm: 3.5, md: 4 }}
            boxShadow="0 2px 8px rgba(0, 0, 0, 0.05)"
        >
            <Flex
                align="center"
                justify="space-between"
                gap={3}
                mb={{ base: 2.5, md: 3 }}
            >
                <HStack spacing={3} align="center" minW={0}>
                    {icon && (
                        <Flex
                            align="center"
                            justify="center"
                            boxSize={{ base: '32px', md: '36px' }}
                            borderRadius="10px"
                            bg={tokens.tile}
                            _dark={{ bg: tokens.tileDark }}
                            flexShrink={0}
                        >
                            <Icon
                                as={icon}
                                color={tokens.fg}
                                _dark={
                                    tokens.fgDark
                                        ? { color: tokens.fgDark }
                                        : undefined
                                }
                                boxSize={{ base: 4, md: '18px' }}
                            />
                        </Flex>
                    )}
                    <Box minW={0}>
                        <Text
                            fontSize={{ base: 'sm', md: 'md' }}
                            fontWeight="bold"
                            color="text.primary"
                            textTransform="uppercase"
                            letterSpacing="0.06em"
                            lineHeight="1.15"
                        >
                            {title}
                        </Text>
                        {subtitle && (
                            <Text
                                fontSize="2xs"
                                color="text.muted"
                                mt={0.5}
                                lineHeight="1.3"
                            >
                                {subtitle}
                            </Text>
                        )}
                    </Box>
                </HStack>
                {headerRight && <Box flexShrink={0}>{headerRight}</Box>}
            </Flex>
            {children}
        </Box>
    );
};

export default SectionCard;
