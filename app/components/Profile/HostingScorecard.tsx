'use client';

import { Box, Button, Flex, HStack, Icon, Text, VStack } from '@chakra-ui/react';
import NextLink from 'next/link';
import { FaUsers } from 'react-icons/fa';
import { GiPodium } from 'react-icons/gi';
import { FiArrowRight } from 'react-icons/fi';
import TooltipOrPopover from '../TooltipOrPopover';

export interface HostingScorecardProps {
    tablesHosted: number;
    tournamentsHosted: number;
    isOwn: boolean;
    name?: string;
}

function HostStat({
    value,
    label,
    icon,
    tooltip,
}: {
    value: number;
    label: string;
    icon: typeof FaUsers;
    tooltip: string;
}) {
    return (
        <TooltipOrPopover label={tooltip} aria-label={label}>
            <VStack align="start" spacing={0.5} flex={1}>
                <HStack spacing={1.5}>
                    <Icon as={icon} color="text.muted" boxSize="13px" aria-hidden />
                    <Text
                        fontSize="xl"
                        fontWeight={800}
                        color="text.primary"
                        sx={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                        {value.toLocaleString()}
                    </Text>
                </HStack>
                <Text
                    fontSize="2xs"
                    fontWeight={700}
                    letterSpacing="0.04em"
                    textTransform="uppercase"
                    color="text.muted"
                >
                    {label}
                </Text>
            </VStack>
        </TooltipOrPopover>
    );
}

// The host track record + action. Counts only — the earnings figure lives once, in the hero,
// so no figure prints twice. Renders only on real hosting activity (container guards too).
export default function HostingScorecard({
    tablesHosted,
    tournamentsHosted,
    isOwn,
    name,
}: HostingScorecardProps) {
    if (tablesHosted <= 0 && tournamentsHosted <= 0) return null;

    return (
        <Flex
            direction="column"
            gap={4}
            bg="card.white"
            border="1px solid"
            borderColor="border.felt"
            borderRadius="20px"
            p={{ base: 4, md: 5 }}
        >
            <Box>
                <Text
                    as="h2"
                    fontSize="xs"
                    fontWeight={700}
                    letterSpacing="0.04em"
                    textTransform="uppercase"
                    color="text.muted"
                    mb={3}
                >
                    Hosting
                </Text>
                <HStack align="start" spacing={4}>
                    {tablesHosted > 0 && (
                        <HostStat
                            value={tablesHosted}
                            label="Tables"
                            icon={FaUsers}
                            tooltip="Cash tables this player created and approved seats for"
                        />
                    )}
                    {tournamentsHosted > 0 && (
                        <HostStat
                            value={tournamentsHosted}
                            label="Tournaments"
                            icon={GiPodium}
                            tooltip="Tournaments this player organized as Host"
                        />
                    )}
                </HStack>
            </Box>

            <Button
                as={NextLink}
                href={isOwn ? '/create-game' : '/public-games'}
                variant={isOwn ? 'tactileOutline' : 'tactilePrimary'}
                size="sm"
                height="44px"
                _focusVisible={{ boxShadow: 'focus.ring' }}
                rightIcon={<Icon as={FiArrowRight} />}
                w="full"
            >
                {isOwn ? 'Manage your tables' : `Play at ${name || 'their'} tables`}
            </Button>
        </Flex>
    );
}
