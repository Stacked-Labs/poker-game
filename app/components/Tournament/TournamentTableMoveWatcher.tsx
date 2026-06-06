'use client';

import { useContext, useEffect, useRef, useState } from 'react';
import {
    Box,
    Modal,
    ModalContent,
    ModalOverlay,
    Spinner,
    Text,
    VStack,
    useColorModeValue,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { AppContext } from '@/app/contexts/AppStoreProvider';

const MOVE_NOTICE_MS = 2500;

/**
 * Detects table balancing — the player's leaderboard table_index changing out
 * from under them — and redirects to the new table after a brief notice. With no
 * sit-out in tournaments, a silently-relocated player would blind off, so this is
 * a correctness affordance, not just polish. (No dedicated move WS event exists;
 * we infer it from the polled leaderboard.)
 */
export default function TournamentTableMoveWatcher({
    tournamentId,
    currentTableNumber,
}: {
    tournamentId: number;
    currentTableNumber: number;
}) {
    const { appState } = useContext(AppContext);
    const router = useRouter();
    const live = appState.tournamentLive;
    const [moveTo, setMoveTo] = useState<number | null>(null);
    const navigatedRef = useRef<number | null>(null);
    const cardBg = useColorModeValue('white', 'card.darkNavy');

    const myRow = live?.leaderboard.find(
        (p) =>
            (appState.address &&
                p.wallet?.toLowerCase() === appState.address.toLowerCase()) ||
            p.uuid === appState.clientID
    );
    const myTableNumber =
        myRow && myRow.finish_pos === 0 && myRow.table_index >= 0
            ? myRow.table_index + 1
            : null;

    useEffect(() => {
        if (myTableNumber == null || myTableNumber === currentTableNumber)
            return;
        if (navigatedRef.current === myTableNumber) return;
        navigatedRef.current = myTableNumber;
        setMoveTo(myTableNumber);
        const t = setTimeout(() => {
            router.push(
                `/table/tournament-${tournamentId}-table-${myTableNumber}`
            );
        }, MOVE_NOTICE_MS);
        return () => clearTimeout(t);
    }, [myTableNumber, currentTableNumber, tournamentId, router]);

    if (moveTo == null) return null;

    return (
        <Modal
            isOpen
            onClose={() => undefined}
            isCentered
            closeOnOverlayClick={false}
            closeOnEsc={false}
        >
            <ModalOverlay
                bg="rgba(11, 20, 48, 0.6)"
                backdropFilter="blur(6px)"
            />
            <ModalContent bg="transparent" boxShadow="none" m={4} maxW="360px">
                <Box
                    bg={cardBg}
                    borderRadius="16px"
                    boxShadow="card.lift"
                    p={6}
                    textAlign="center"
                >
                    <VStack spacing={2}>
                        <Text
                            fontSize="2xs"
                            color="text.muted"
                            textTransform="uppercase"
                            letterSpacing="0.1em"
                            fontWeight="bold"
                        >
                            Table balanced
                        </Text>
                        <Text
                            fontSize="lg"
                            fontWeight="bold"
                            color="text.primary"
                        >
                            Moving you to a new table
                        </Text>
                        <Text
                            color="text.secondary"
                            sx={{ fontVariantNumeric: 'tabular-nums' }}
                        >
                            Table {currentTableNumber} → Table {moveTo}
                        </Text>
                        <Text fontSize="xs" color="text.muted">
                            Your stack and seat come with you.
                        </Text>
                        <Spinner size="sm" color="brand.green" mt={1} />
                    </VStack>
                </Box>
            </ModalContent>
        </Modal>
    );
}
