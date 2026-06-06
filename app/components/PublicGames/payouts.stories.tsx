import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
    Box,
    Heading,
    SimpleGrid,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    VStack,
} from '@chakra-ui/react';
import {
    calculatePayouts,
    defaultPayouts,
    distanceToMoney,
    minCash,
    nextPayJump,
    placesPaid,
} from './payouts';
import { formatUsdc } from './tournamentFormat';

// Data-preview story: verify the ladder (places paid, per-position %, $ split,
// pool conservation) against poker-server/tournament/payout.go.
const POOL = 5_840_000_000; // $5,840 in micro-USDC

function LadderPreview({ entrants }: { entrants: number }) {
    const tiers = defaultPayouts(entrants);
    const amounts = calculatePayouts(entrants, POOL);
    const total = Array.from(amounts.values()).reduce((a, b) => a + b, 0);
    const paid = placesPaid(entrants);
    return (
        <Box
            borderWidth="1px"
            borderColor="rgba(127,127,127,0.2)"
            borderRadius="12px"
            overflow="hidden"
        >
            <Box px={4} pt={3} pb={2}>
                <Heading size="sm" color="text.primary">
                    {entrants} entries
                </Heading>
                <Text fontSize="xs" color="text.muted">
                    {paid} paid · ~{Math.round((paid / entrants) * 100)}% ITM ·
                    min-cash ${formatUsdc(minCash(entrants, POOL))}
                </Text>
            </Box>
            <Table size="sm" variant="simple">
                <Thead>
                    <Tr>
                        <Th>Place(s)</Th>
                        <Th isNumeric>%/pos</Th>
                        <Th isNumeric>$/pos</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {tiers.map((t) => {
                        const label =
                            t.min === t.max
                                ? `${t.min}`
                                : `${t.min}–${t.max}`;
                        return (
                            <Tr key={`${t.min}-${t.max}`}>
                                <Td color="text.secondary">{label}</Td>
                                <Td isNumeric color="text.primary">
                                    {t.percent}%
                                </Td>
                                <Td isNumeric color="text.primary">
                                    ${formatUsdc(amounts.get(t.min) ?? 0)}
                                </Td>
                            </Tr>
                        );
                    })}
                </Tbody>
            </Table>
            <Box px={4} py={2}>
                <Text
                    fontSize="2xs"
                    color={total === POOL ? 'brand.green' : 'brand.pink'}
                >
                    pool conserved: ${formatUsdc(total)} / ${formatUsdc(POOL)}
                </Text>
            </Box>
        </Box>
    );
}

function AllLadders() {
    const fields = [2, 6, 9, 18, 27, 54, 120];
    return (
        <Box bg="card.lightGray" p={{ base: 4, md: 6 }} minH="100vh">
            <VStack align="stretch" spacing={4}>
                <Heading size="md" color="text.primary">
                    Payout ladders (F3) — mirror of payout.go · pool $5,840
                </Heading>
                <Text fontSize="sm" color="text.muted">
                    Spot-check the per-position rule: the 120-field tier 7–9 each
                    pays 4% and 10–18 each pays 1%. From rank 9 the next pay jump
                    skips the tie to position 6 → +$
                    {formatUsdc(nextPayJump(9, 120, POOL)?.gainMicro ?? 0)} ·{' '}
                    {distanceToMoney(40, 120)} from the money with 40 left.
                </Text>
                <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={4}>
                    {fields.map((n) => (
                        <LadderPreview key={n} entrants={n} />
                    ))}
                </SimpleGrid>
            </VStack>
        </Box>
    );
}

const meta = {
    title: 'Tournament/Foundations/Payouts',
    component: AllLadders,
    tags: ['autodocs'],
    parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AllLadders>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllFields: Story = {};
