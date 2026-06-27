'use client';

import { Flex, HStack, Icon, Text, VStack } from '@chakra-ui/react';
import { FaXTwitter } from 'react-icons/fa6';
import { FiInfo } from 'react-icons/fi';
import { SocialIconButton } from '../SocialIconButton';
import TooltipOrPopover from '../TooltipOrPopover';

export interface ConnectXStripProps {
    isConnecting?: boolean;
    onConnect: () => void;
}

// Own-hub, unlinked-X state: a benefit-framed strip that promotes X-connect from buried
// plumbing to a clear action on the surface whose whole job is shareability. When linked,
// the container hides this and the hero shows the @handle chip instead.
export default function ConnectXStrip({ isConnecting, onConnect }: ConnectXStripProps) {
    return (
        <Flex
            direction={{ base: 'column', sm: 'row' }}
            align={{ base: 'stretch', sm: 'center' }}
            justify="space-between"
            gap={4}
            bg="card.white"
            border="1px solid"
            borderColor="border.felt"
            borderRadius="20px"
            p={{ base: 4, md: 5 }}
        >
            <HStack spacing={3} align="center" minW={0}>
                <Flex
                    w="36px"
                    h="36px"
                    borderRadius="9px"
                    bg="bg.pillNeutral"
                    align="center"
                    justify="center"
                    flexShrink={0}
                >
                    <Icon as={FaXTwitter} color="text.primary" boxSize="16px" />
                </Flex>
                <VStack align="start" spacing={0.5} minW={0}>
                    <HStack spacing={1.5}>
                        <Text as="h2" fontWeight={700} color="text.primary">
                            Link your X account
                        </Text>
                        <TooltipOrPopover
                            label="Shows your X name and avatar across Stacked and unlocks the Follow quest. We never post on your behalf."
                            aria-label="About linking X"
                        >
                            <Icon as={FiInfo} color="text.muted" boxSize="13px" />
                        </TooltipOrPopover>
                    </HStack>
                    <Text fontSize="sm" color="text.secondary">
                        Show your name and avatar, unlock the Follow quest.
                    </Text>
                </VStack>
            </HStack>

            <SocialIconButton
                tone="x"
                label={isConnecting ? 'Linking…' : 'Link X'}
                onClick={onConnect}
                isDisabled={isConnecting}
                alignSelf={{ base: 'stretch', sm: 'auto' }}
                flexShrink={0}
            />
        </Flex>
    );
}
