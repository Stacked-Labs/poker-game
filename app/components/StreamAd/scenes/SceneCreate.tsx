'use client';

import { Box, Flex, HStack, Icon, Text, VStack } from '@chakra-ui/react';
import { FaApple, FaDiscord } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { RiTwitterXLine } from 'react-icons/ri';
import { SiThirdweb } from 'react-icons/si';
import { InkChip, SceneCopy, StageCard } from '../primitives';

// Same auth options the homepage CommunitySection shows, scaled down to chip size.
const AUTH_ICONS: { icon: React.ElementType; color?: string; label: string }[] = [
    { icon: FcGoogle, label: 'Google' },
    { icon: RiTwitterXLine, color: 'brand.darkNavy', label: 'X' },
    { icon: FaDiscord, color: '#5865F2', label: 'Discord' },
    { icon: FaApple, color: 'brand.darkNavy', label: 'Apple' },
];

const IconChip = ({ children }: { children: React.ReactNode }) => (
    <Flex
        align="center"
        justify="center"
        w="clamp(26px, 2.5vw, 34px)"
        h="clamp(26px, 2.5vw, 34px)"
        borderRadius="full"
        bg="white"
        border="1px solid"
        borderColor="brand.lightGray"
        boxShadow="0 2px 8px rgba(11, 20, 48, 0.08)"
        flexShrink={0}
    >
        {children}
    </Flex>
);

const SocialSignInRow = () => (
    <HStack spacing="clamp(5px, 0.5vw, 8px)" mt="clamp(5px, 0.6vh, 8px)" flexWrap="wrap">
        {AUTH_ICONS.map((a) => (
            <IconChip key={a.label}>
                <Icon as={a.icon} color={a.color} fontSize="clamp(0.85rem, 1.1vw, 1.1rem)" />
            </IconChip>
        ))}
        <IconChip>
            <Box
                w="62%"
                h="62%"
                bgImage="url('/networkLogos/base-logo.png')"
                bgSize="contain"
                bgRepeat="no-repeat"
                bgPosition="center"
            />
        </IconChip>
        <Text
            color="brand.navy"
            fontWeight={500}
            fontSize="clamp(0.78rem, 1vw, 1rem)"
            pl="2px"
        >
            or any wallet
        </Text>
    </HStack>
);

const ThirdwebBadge = () => (
    <HStack justify="center" pt="clamp(2px, 0.4vh, 6px)">
        <HStack
            spacing="7px"
            bg="rgba(133, 93, 205, 0.08)"
            border="1px solid rgba(133, 93, 205, 0.18)"
            borderRadius="full"
            px="clamp(12px, 1.2vw, 18px)"
            py="clamp(6px, 0.7vh, 9px)"
        >
            <Icon as={SiThirdweb} color="purple.600" fontSize="clamp(0.8rem, 1.05vw, 1.05rem)" />
            <Text
                color="purple.600"
                fontWeight={700}
                fontSize="clamp(0.66rem, 0.88vw, 0.85rem)"
                letterSpacing="0.1em"
                textTransform="uppercase"
                whiteSpace="nowrap"
            >
                Gas sponsored · Powered by Thirdweb
            </Text>
        </HStack>
    </HStack>
);

const STEPS: {
    n: string;
    title: string;
    detail?: string;
    extra?: React.ReactNode;
    active?: boolean;
}[] = [
    { n: '1', title: 'Sign in your way', extra: <SocialSignInRow /> },
    { n: '2', title: 'Pick stakes, click create', detail: 'Blinds, speed, who gets a seat. Your call.' },
    { n: '3', title: 'Earn from the first hand', detail: 'First hand settles, first cents land', active: true },
];

const SetupCard = () => (
    <StageCard
        accent="purple.500"
        header="Host setup"
        headerRight={
            <Text
                color="purple.600"
                fontWeight={800}
                fontSize="clamp(0.66rem, 0.88vw, 0.85rem)"
                letterSpacing="0.14em"
            >
                3 CLICKS
            </Text>
        }
    >
        <VStack align="stretch" spacing="clamp(10px, 1.2vh, 16px)">
            {STEPS.map((s) => (
                <HStack
                    key={s.n}
                    spacing="clamp(12px, 1.3vw, 18px)"
                    bg={s.active ? 'rgba(133, 93, 205, 0.07)' : 'transparent'}
                    border="1px solid"
                    borderColor={s.active ? 'rgba(133, 93, 205, 0.3)' : 'brand.lightGray'}
                    borderRadius="12px"
                    px="clamp(12px, 1.3vw, 18px)"
                    py="clamp(10px, 1.3vh, 16px)"
                    align="flex-start"
                >
                    <Flex
                        align="center"
                        justify="center"
                        flexShrink={0}
                        w="clamp(28px, 2.7vw, 38px)"
                        h="clamp(28px, 2.7vw, 38px)"
                        borderRadius="full"
                        bg={s.active ? 'purple.500' : 'rgba(133, 93, 205, 0.12)'}
                        color={s.active ? 'white' : 'purple.600'}
                        fontWeight={800}
                        fontSize="clamp(0.88rem, 1.1vw, 1.1rem)"
                    >
                        {s.n}
                    </Flex>
                    <Box minW={0}>
                        <Text
                            color="brand.darkNavy"
                            fontWeight={700}
                            fontSize="clamp(0.9rem, 1.2vw, 1.2rem)"
                            lineHeight="1.3"
                        >
                            {s.title}
                        </Text>
                        {s.detail && (
                            <Text
                                color="brand.navy"
                                fontWeight={500}
                                fontSize="clamp(0.78rem, 1vw, 1rem)"
                                lineHeight="1.4"
                            >
                                {s.detail}
                            </Text>
                        )}
                        {s.extra}
                    </Box>
                </HStack>
            ))}
            <ThirdwebBadge />
        </VStack>
    </StageCard>
);

// Scene D — create your game: the host prompt. Accented in thirdweb purple (the
// gas-sponsored deployment is thirdweb infra), not brand pink.
export default function SceneCreate() {
    return (
        <Flex h="100%" align="center" justify="space-between" gap="clamp(20px, 3vw, 56px)" minH={0}>
            <SceneCopy
                eyebrow="Anyone can host"
                eyebrowColor="purple.600"
                headline={
                    <>
                        Three clicks.
                        <br />
                        You&apos;re the <InkChip bg="purple.500">house</InkChip>.
                    </>
                }
                sub={
                    <>
                        Pick the stakes, share a link, and your crew is playing in minutes.
                        Stacked covers the gas, so your table goes live for free.
                    </>
                }
                badges={['No application', 'No approval queue', 'Free to deploy']}
                badgeTone="purple"
            />

            <Flex flex="1" h="100%" minW={0} align="center" justify="center" display={{ base: 'none', sm: 'flex' }}>
                <SetupCard />
            </Flex>
        </Flex>
    );
}
