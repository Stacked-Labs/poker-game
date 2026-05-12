'use client';

import { Box, Flex, HStack, Icon, Text } from '@chakra-ui/react';
import type { IconType } from 'react-icons/lib/iconBase';

interface SectionCardProps {
    icon?: IconType;
    title: string;
    subtitle?: string;
    accent?: 'green' | 'pink' | 'navy' | 'yellow';
    children: React.ReactNode;
    headerRight?: React.ReactNode;
}

const ACCENT_COLOR: Record<NonNullable<SectionCardProps['accent']>, string> = {
    green: 'brand.green',
    pink: 'brand.pink',
    navy: 'brand.navy',
    yellow: 'brand.yellow',
};

const SectionCard = ({
    icon,
    title,
    subtitle,
    accent = 'green',
    children,
    headerRight,
}: SectionCardProps) => {
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
                align={{ base: 'flex-start', md: 'center' }}
                justify="space-between"
                gap={3}
                mb={{ base: 2.5, md: 3 }}
                direction={{ base: 'column', sm: 'row' }}
            >
                <HStack spacing={2.5} align="center" minW={0}>
                    {icon && (
                        <Icon
                            as={icon}
                            color={ACCENT_COLOR[accent]}
                            boxSize={{ base: 4, md: 4.5 }}
                            flexShrink={0}
                        />
                    )}
                    <Box minW={0}>
                        <Text
                            fontSize={{ base: 'xs', md: 'sm' }}
                            fontWeight="bold"
                            color="text.primary"
                            textTransform="uppercase"
                            letterSpacing="0.06em"
                            lineHeight="1.1"
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
