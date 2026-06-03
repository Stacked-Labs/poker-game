'use client';

import NextLink from 'next/link';
import {
    Button,
    Flex,
    HStack,
    Icon,
    Link,
    Text,
    VStack,
    useColorModeValue,
} from '@chakra-ui/react';
import { FiPlus } from 'react-icons/fi';
import { SocialIconButton } from '../SocialIconButton';

const X_URL = 'https://x.com/stacked_poker';
const DISCORD_URL = 'https://discord.gg/347RBVcvpn';

interface TournamentsEmptyStateProps {
    /** Where the "Host a tournament" CTA points. Defaults to the create-game page. */
    createHref?: string;
    /** Optional click handler; when set, the CTA is a button instead of a link. */
    onCreate?: () => void;
}

// A true empty state: no fabricated tournaments. Honest copy, a way to host one,
// and a place to get a heads-up when others schedule theirs.
export default function TournamentsEmptyState({
    createHref = '/create-game',
    onCreate,
}: TournamentsEmptyStateProps) {
    const iconBg = useColorModeValue('rgba(54, 163, 123, 0.10)', 'rgba(54, 163, 123, 0.18)');
    const notifyBg = useColorModeValue('rgba(255, 255, 255, 0.7)', 'rgba(255, 255, 255, 0.04)');
    const notifyBorder = useColorModeValue('rgba(11, 20, 48, 0.08)', 'rgba(255, 255, 255, 0.08)');

    const ctaProps = onCreate
        ? { onClick: onCreate }
        : { as: NextLink, href: createHref };

    return (
        <VStack as="section" align="stretch" spacing={{ base: 6, md: 8 }} w="full">
            <Flex
                direction="column"
                align="center"
                textAlign="center"
                py={{ base: 10, md: 14 }}
                px={4}
                gap={4}
            >
                <Flex
                    align="center"
                    justify="center"
                    boxSize="56px"
                    borderRadius="full"
                    bg={iconBg}
                    aria-hidden
                >
                    <Icon as={FiPlus} boxSize="24px" color="brand.green" />
                </Flex>
                <VStack spacing={1.5} maxW="440px">
                    <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight="bold" color="text.primary">
                        No tournaments on the schedule yet
                    </Text>
                    <Text color="text.secondary" fontSize="sm" lineHeight={1.6}>
                        Tournaments are player-hosted. Be the first to run one, or check
                        back soon, new ones show up here the moment a host opens
                        registration.
                    </Text>
                </VStack>
                <Button
                    {...ctaProps}
                    leftIcon={<FiPlus />}
                    variant="tactilePrimary"
                    borderRadius="14px"
                    minH="44px"
                    px={6}
                >
                    Host a tournament
                </Button>
            </Flex>

            <Flex
                direction={{ base: 'column', md: 'row' }}
                align={{ base: 'stretch', md: 'center' }}
                justify="space-between"
                gap={{ base: 3, md: 4 }}
                p={{ base: 4, md: 4 }}
                borderRadius="14px"
                bg={notifyBg}
                border="1px solid"
                borderColor={notifyBorder}
            >
                <Text color="text.secondary" fontSize="sm" maxW="560px" lineHeight={1.55}>
                    Want a heads-up when the next tournament hits the lobby? Follow along,
                    we post dates and structures there first.
                </Text>
                <HStack
                    spacing={2}
                    flexShrink={0}
                    w={{ base: 'full', md: 'auto' }}
                    justify={{ base: 'stretch', md: 'flex-end' }}
                >
                    <Link
                        href={X_URL}
                        isExternal
                        flex={{ base: 1, md: 'initial' }}
                        _hover={{ textDecoration: 'none' }}
                    >
                        <SocialIconButton tone="x" chipSize="md" label="Follow on X" w="full" />
                    </Link>
                    <Link
                        href={DISCORD_URL}
                        isExternal
                        flex={{ base: 1, md: 'initial' }}
                        _hover={{ textDecoration: 'none' }}
                    >
                        <SocialIconButton
                            tone="discord"
                            chipSize="md"
                            label="Join Discord"
                            w="full"
                        />
                    </Link>
                </HStack>
            </Flex>
        </VStack>
    );
}
