'use client';

import { useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
    Box,
    Button,
    Divider,
    Flex,
    HStack,
    Icon,
    IconButton,
    Popover,
    PopoverArrow,
    PopoverBody,
    PopoverContent,
    PopoverTrigger,
    Text,
    VStack,
} from '@chakra-ui/react';
import { MdClose } from 'react-icons/md';
import { useAuth } from '../../contexts/AuthContext';
import {
    selectEligibleReminders,
    useTournamentReminderStore,
    type ReminderTournament,
} from '../../stores/tournamentReminders';
import TournamentCountdownDisplay from './TournamentCountdownDisplay';

// Sticky reminder strip. Adaptive surface: warm paper in light mode, penthouse
// felt in dark, so it belongs to whichever room the player is in. The countdown
// chip carries the visual weight; text uses mode-flipping text.* tokens.
export default function TournamentReminderBanner() {
    const router = useRouter();
    const pathname = usePathname();
    const { userAddress } = useAuth();

    // Subscribe to the raw state slices the selectors depend on, not to the
    // derived getters: a getter that returns a fresh array each call would
    // break Zustand v4's cached-snapshot contract. Derive with useMemo instead.
    const registeredTournaments = useTournamentReminderStore(
        (s) => s.registeredTournaments
    );
    const dismissedAt = useTournamentReminderStore((s) => s.dismissedAt);
    const suppressedSeated = useTournamentReminderStore(
        (s) => s.suppressedSeated
    );
    const dismiss = useTournamentReminderStore((s) => s.dismiss);

    const eligible = useMemo(
        () =>
            selectEligibleReminders(
                registeredTournaments,
                dismissedAt,
                suppressedSeated
            ),
        [registeredTournaments, dismissedAt, suppressedSeated]
    );
    const mostUrgent = eligible[0] ?? null;
    const remainder = eligible.slice(1);

    // The in-table HUD owns the clock at the table, so the strip stays off
    // /table routes. The trailing slash keeps it from matching sibling routes
    // like /tableau. We just hide here, we do not mutate store state, so the
    // strip reappears as soon as the player leaves the table.
    const isOnTable = pathname?.startsWith('/table/') ?? false;

    if (!mostUrgent || isOnTable) return null;

    const remainderCount = remainder.length;

    const goToSeat = (id: number) => {
        // Land on the lobby route; it resolves the live table and avoids a 404
        // before the player is actually seated.
        router.push(`/tournament/${id}`);
    };

    const onDismiss = () => {
        if (userAddress) dismiss(mostUrgent.id, userAddress);
    };

    return (
        <Box
            position="sticky"
            bottom={0}
            left={0}
            right={0}
            zIndex={40}
            bg="reminder.surface"
            borderTopWidth="1px"
            borderTopColor="reminder.border"
            boxShadow="card.lift"
            px={{ base: 3, md: 5 }}
            py={{ base: 2.5, md: 3 }}
            role="region"
            aria-label="Tournament reminder"
        >
            <Flex
                direction={{ base: 'column', md: 'row' }}
                align={{ base: 'stretch', md: 'center' }}
                gap={{ base: 2.5, md: 5 }}
                maxW="container.xl"
                mx="auto"
            >
                {/* Title row: name + chip, with the dismiss tucked top-right on
                    mobile so it never sits beside the primary action. */}
                <HStack
                    spacing={3}
                    align="center"
                    justify="space-between"
                    minW={0}
                    flex={{ md: '1 1 auto' }}
                >
                    <VStack spacing={1.5} align="start" minW={0}>
                        <Text
                            fontSize={{ base: 'sm', md: 'md' }}
                            fontWeight="extrabold"
                            color="text.primary"
                            lineHeight={1.1}
                            letterSpacing="-0.01em"
                            noOfLines={1}
                            wordBreak="break-word"
                        >
                            {mostUrgent.name}
                        </Text>
                        <TournamentCountdownDisplay
                            scheduledStartAt={mostUrgent.scheduledStartAt}
                            lateRegCloseAt={mostUrgent.lateRegCloseAt}
                            size="md"
                        />
                    </VStack>

                    <IconButton
                        variant="tactileGhost"
                        size="sm"
                        minW="44px"
                        minH="44px"
                        display={{ base: 'inline-flex', md: 'none' }}
                        color="text.muted"
                        _hover={{ bg: 'reminder.chipBorder', color: 'text.primary' }}
                        aria-label="Dismiss tournament reminder"
                        icon={<Icon as={MdClose} boxSize="20px" />}
                        onClick={onDismiss}
                    />
                </HStack>

                {/* Actions row: full-width on mobile with Take your seat
                    dominant; inline and right-aligned from md up. */}
                <HStack
                    spacing={{ base: 2, md: 2.5 }}
                    align="center"
                    flexShrink={0}
                    justify={{ base: 'flex-start', md: 'flex-end' }}
                    flex={{ md: '0 0 auto' }}
                >
                    {remainderCount > 0 && (
                        <Popover placement="top-end" isLazy>
                            <PopoverTrigger>
                                <Button
                                    variant="unstyled"
                                    size="sm"
                                    minH="44px"
                                    px={4}
                                    display="inline-flex"
                                    alignItems="center"
                                    flexShrink={0}
                                    borderRadius="full"
                                    bg="reminder.chipBg"
                                    color="text.secondary"
                                    fontWeight="bold"
                                    fontSize="sm"
                                    borderWidth="1px"
                                    borderColor="reminder.chipBorder"
                                    boxShadow="0 1.5px 0 rgba(11,20,48,0.10)"
                                    _dark={{
                                        boxShadow: '0 1.5px 0 rgba(0,0,0,0.4)',
                                    }}
                                    _hover={{
                                        bg: 'reminder.chipBorder',
                                        color: 'text.primary',
                                    }}
                                    _active={{ transform: 'translateY(1px)' }}
                                    _focusVisible={{ boxShadow: 'outline' }}
                                    aria-label={`Show ${remainderCount} more tournament reminder${
                                        remainderCount === 1 ? '' : 's'
                                    }`}
                                >
                                    +{remainderCount} more
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                bg="reminder.surface"
                                borderWidth="1px"
                                borderColor="reminder.border"
                                boxShadow="card.liftHover"
                                width="auto"
                                maxW="320px"
                                _focus={{ outline: 'none' }}
                            >
                                <PopoverArrow bg="reminder.surface" />
                                <PopoverBody p={3}>
                                    <Text
                                        px={1}
                                        pb={2}
                                        fontSize="2xs"
                                        fontWeight="bold"
                                        textTransform="uppercase"
                                        letterSpacing="0.08em"
                                        color="text.muted"
                                    >
                                        Also coming up
                                    </Text>
                                    <VStack spacing={3} align="stretch">
                                        {remainder.map(
                                            (t: ReminderTournament, i) => (
                                                <Box key={t.id}>
                                                    {i > 0 && (
                                                        <Divider
                                                            borderColor="reminder.border"
                                                            mb={3}
                                                        />
                                                    )}
                                                    <Flex
                                                        align="center"
                                                        justify="space-between"
                                                        gap={3}
                                                    >
                                                        <VStack
                                                            spacing={1.5}
                                                            align="start"
                                                            minW={0}
                                                        >
                                                            <Text
                                                                fontSize="sm"
                                                                fontWeight="bold"
                                                                color="text.primary"
                                                                noOfLines={1}
                                                            >
                                                                {t.name}
                                                            </Text>
                                                            <TournamentCountdownDisplay
                                                                scheduledStartAt={
                                                                    t.scheduledStartAt
                                                                }
                                                                lateRegCloseAt={
                                                                    t.lateRegCloseAt
                                                                }
                                                                size="sm"
                                                            />
                                                        </VStack>
                                                        <Button
                                                            variant="tactileGhost"
                                                            size="sm"
                                                            minH="44px"
                                                            color="brand.green"
                                                            flexShrink={0}
                                                            onClick={() =>
                                                                goToSeat(t.id)
                                                            }
                                                        >
                                                            Take seat
                                                        </Button>
                                                    </Flex>
                                                </Box>
                                            )
                                        )}
                                    </VStack>
                                </PopoverBody>
                            </PopoverContent>
                        </Popover>
                    )}

                    <Button
                        variant="tactilePrimary"
                        size="sm"
                        minH="44px"
                        px={{ base: 4, md: 5 }}
                        flex={{ base: '1 1 auto', md: '0 0 auto' }}
                        _focusVisible={{ boxShadow: 'outline' }}
                        onClick={() => goToSeat(mostUrgent.id)}
                    >
                        Take your seat
                    </Button>

                    <IconButton
                        variant="tactileGhost"
                        size="sm"
                        minW="44px"
                        minH="44px"
                        display={{ base: 'none', md: 'inline-flex' }}
                        color="text.muted"
                        _hover={{ bg: 'reminder.chipBorder', color: 'text.primary' }}
                        aria-label="Dismiss tournament reminder"
                        icon={<Icon as={MdClose} boxSize="20px" />}
                        onClick={onDismiss}
                    />
                </HStack>
            </Flex>
        </Box>
    );
}
