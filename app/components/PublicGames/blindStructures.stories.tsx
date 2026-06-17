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
    BLIND_TEMPLATES,
    TEMPLATE_FEEL,
    TEMPLATE_LABELS,
    type TemplateName,
    startingBigBlinds,
} from './blindStructures';

// Data-preview story: lets you eyeball the four ladders against the backend
// source of truth (poker-server/tournament/blind_structures.go).
function StructurePreview({ name }: { name: TemplateName }) {
    const levels = BLIND_TEMPLATES[name];
    return (
        <Box
            borderWidth="1px"
            borderColor="rgba(127,127,127,0.2)"
            borderRadius="12px"
            overflow="hidden"
        >
            <Box px={4} pt={3} pb={2}>
                <Heading size="sm" color="text.primary">
                    {TEMPLATE_LABELS[name]}
                </Heading>
                <Text fontSize="xs" color="text.muted">
                    {TEMPLATE_FEEL[name]} · {levels[0].durationMin}-min levels ·{' '}
                    {levels.length} levels · 10,000 stack ={' '}
                    {startingBigBlinds(10_000, name)} BB
                </Text>
            </Box>
            <Table size="sm" variant="simple">
                <Thead>
                    <Tr>
                        <Th>Lvl</Th>
                        <Th isNumeric>SB</Th>
                        <Th isNumeric>BB</Th>
                        <Th isNumeric>Ante</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {levels.map((l) => (
                        <Tr key={l.level}>
                            <Td color="text.secondary">{l.level}</Td>
                            <Td isNumeric color="text.primary">
                                {l.sb.toLocaleString()}
                            </Td>
                            <Td isNumeric color="text.primary">
                                {l.bb.toLocaleString()}
                            </Td>
                            <Td isNumeric color="text.muted">
                                {l.ante === 0 ? '—' : l.ante.toLocaleString()}
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>
        </Box>
    );
}

function AllStructures() {
    const names: TemplateName[] = ['hyper', 'turbo', 'regular', 'deep'];
    return (
        <Box bg="card.lightGray" p={{ base: 4, md: 6 }} minH="100vh">
            <VStack align="stretch" spacing={4}>
                <Heading size="md" color="text.primary">
                    Blind structures (F2) — mirror of blind_structures.go
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={4}>
                    {names.map((n) => (
                        <StructurePreview key={n} name={n} />
                    ))}
                </SimpleGrid>
            </VStack>
        </Box>
    );
}

const meta = {
    title: 'Tournament/Foundations/BlindStructures',
    component: AllStructures,
    tags: ['autodocs'],
    parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AllStructures>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllFour: Story = {};
