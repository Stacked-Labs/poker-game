'use client';

import {
    Text,
    Flex,
    Box,
    HStack,
    VStack,
    SimpleGrid,
    Spinner,
    Input,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    Button,
    Textarea,
    Badge,
} from '@chakra-ui/react';
import {
    addToSBTWhitelist,
    type SBTWhitelistEntry,
} from '../../hooks/server_actions';

interface WhitelistTabProps {
    whitelist: SBTWhitelistEntry[];
    wlLoading: boolean;
    wlSearch: string;
    setWlSearch: (v: string) => void;
    wlTotal: number;
    wlTotalClaimed: number;
    wlInputMode: 'paste' | 'csv';
    setWlInputMode: (v: 'paste' | 'csv') => void;
    wlPasteText: string;
    setWlPasteText: (v: string) => void;
    wlAdding: boolean;
    setWlAdding: (v: boolean) => void;
    loadWhitelist: (search?: string) => Promise<void>;
}

const ADDR_RE = /^0x[a-fA-F0-9]{40}$/;
const LOOSE_ADDR_RE = /^0x/i;

const parseAddresses = (raw: string) => {
    const tokens = raw
        .split(/[\n,;\s]+/)
        .map((t) => t.trim())
        .filter(Boolean);
    const valid: string[] = [];
    const invalid: string[] = [];
    const seen = new Set<string>();
    for (const t of tokens) {
        if (!LOOSE_ADDR_RE.test(t)) {
            invalid.push(t);
            continue;
        }
        if (ADDR_RE.test(t)) {
            const lower = t.toLowerCase();
            if (!seen.has(lower)) {
                seen.add(lower);
                valid.push(t);
            }
        } else {
            invalid.push(t);
        }
    }
    return { valid, invalid };
};

const parseCsv = (text: string) =>
    text
        .split(/\r?\n/)
        .map((line) => line.split(',')[0]?.trim() ?? '')
        .filter((a) => LOOSE_ADDR_RE.test(a))
        .join('\n');

export const WhitelistTab = ({
    whitelist,
    wlLoading,
    wlSearch,
    setWlSearch,
    wlTotal,
    wlTotalClaimed,
    wlInputMode,
    setWlInputMode,
    wlPasteText,
    setWlPasteText,
    wlAdding,
    setWlAdding,
    loadWhitelist,
}: WhitelistTabProps) => {
    const claimRate = wlTotal > 0 ? Math.round((wlTotalClaimed / wlTotal) * 100) : 0;
    const { valid, invalid } = parseAddresses(wlPasteText);
    const hasPreview = wlPasteText.trim().length > 0;

    return (
        <VStack align="stretch" gap={6}>
            <SimpleGrid columns={{ base: 1, sm: 3 }} gap={4}>
                <Box
                    bg="card.white"
                    borderRadius="14px"
                    p={5}
                    border="1px solid"
                    borderColor="border.lightGray"
                    _dark={{ borderColor: 'whiteAlpha.100' }}
                >
                    <Text fontSize="xs" color="text.secondary" textTransform="uppercase" letterSpacing="0.06em" fontWeight={700}>
                        Whitelisted
                    </Text>
                    <Text
                        mt={1}
                        fontSize={{ base: '2xl', md: '3xl' }}
                        fontWeight={800}
                        color="text.primary"
                        lineHeight={1.1}
                        sx={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                        {wlTotal.toLocaleString()}
                    </Text>
                </Box>
                <Box
                    bg="card.white"
                    borderRadius="14px"
                    p={5}
                    border="1px solid"
                    borderColor="border.lightGray"
                    _dark={{ borderColor: 'whiteAlpha.100' }}
                >
                    <Text fontSize="xs" color="text.secondary" textTransform="uppercase" letterSpacing="0.06em" fontWeight={700}>
                        Claimed
                    </Text>
                    <Text
                        mt={1}
                        fontSize={{ base: '2xl', md: '3xl' }}
                        fontWeight={800}
                        color="brand.green"
                        lineHeight={1.1}
                        sx={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                        {wlTotalClaimed.toLocaleString()}
                    </Text>
                </Box>
                <Box
                    bg="card.white"
                    borderRadius="14px"
                    p={5}
                    border="1px solid"
                    borderColor="border.lightGray"
                    _dark={{ borderColor: 'whiteAlpha.100' }}
                >
                    <Text fontSize="xs" color="text.secondary" textTransform="uppercase" letterSpacing="0.06em" fontWeight={700}>
                        Claim rate
                    </Text>
                    <Text
                        mt={1}
                        fontSize={{ base: '2xl', md: '3xl' }}
                        fontWeight={800}
                        color="text.primary"
                        lineHeight={1.1}
                        sx={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                        {claimRate}%
                    </Text>
                </Box>
            </SimpleGrid>

            <Box
                bg="card.white"
                borderRadius="16px"
                p={6}
                border="1px solid"
                borderColor="card.lightGray"
                _dark={{ borderColor: 'rgba(255,255,255,0.08)' }}
                boxShadow="0 2px 12px rgba(0,0,0,0.06)"
            >
                <Flex justify="space-between" align="center" mb={4} gap={4} flexWrap="wrap">
                    <VStack align="start" gap={0}>
                        <Text fontSize="md" fontWeight={800} color="text.primary">
                            SBT Whitelist
                        </Text>
                        <Text fontSize="xs" color="text.secondary">
                            {wlTotal.toLocaleString()} addresses · {wlTotalClaimed.toLocaleString()} claimed
                            {wlSearch && ' · filtered'}
                        </Text>
                    </VStack>
                    <HStack gap={2}>
                        <Input
                            placeholder="Search address…"
                            size="sm"
                            maxW={{ base: '100%', md: '240px' }}
                            borderRadius="8px"
                            value={wlSearch}
                            onChange={(e) => setWlSearch(e.target.value)}
                            bg="input.lightGray"
                            color="text.primary"
                            border="1px solid"
                            borderColor="transparent"
                            fontFamily="monospace"
                            fontSize="xs"
                            _placeholder={{ color: 'text.secondary', opacity: 0.7, _dark: { color: 'whiteAlpha.500', opacity: 1 } }}
                            _hover={{
                                borderColor: 'border.lightGray',
                                _dark: { borderColor: 'rgba(255,255,255,0.12)' },
                            }}
                            _focus={{
                                boxShadow: '0 0 0 3px rgba(235, 11, 92, 0.20)',
                                bg: 'card.white',
                                borderColor: 'brand.pink',
                            }}
                            _focusVisible={{
                                boxShadow: '0 0 0 3px rgba(235, 11, 92, 0.20)',
                                borderColor: 'brand.pink',
                            }}
                        />
                        <Button
                            variant="tactileChrome"
                            size="sm"
                            height="32px"
                            px={3}
                            borderRadius="8px"
                            fontSize="xs"
                            onClick={() => loadWhitelist(wlSearch)}
                            isLoading={wlLoading}
                            loadingText="Refreshing"
                        >
                            Refresh
                        </Button>
                    </HStack>
                </Flex>

                {wlLoading ? (
                    <Flex justify="center" py={10}>
                        <Spinner size="md" color="brand.green" thickness="3px" />
                    </Flex>
                ) : whitelist.length === 0 ? (
                    <Flex
                        direction="column"
                        align="center"
                        justify="center"
                        py={10}
                        gap={2}
                        borderRadius="10px"
                        bg="card.lightGray"
                        border="1px dashed"
                        borderColor="border.lightGray"
                        _dark={{ borderColor: 'rgba(255,255,255,0.10)' }}
                    >
                        <Text fontSize="sm" fontWeight={700} color="text.primary">
                            {wlSearch ? 'No addresses match.' : 'Whitelist is empty.'}
                        </Text>
                        <Text fontSize="xs" color="text.secondary">
                            {wlSearch ? 'Try a shorter prefix or a different address.' : 'Paste or upload addresses below to get started.'}
                        </Text>
                    </Flex>
                ) : (
                    <TableContainer>
                        <Table size="sm" variant="unstyled">
                            <Thead>
                                <Tr>
                                    <Th fontSize="2xs" color="text.secondary" textTransform="uppercase" letterSpacing="0.08em" fontWeight={700} pb={3}>
                                        Address
                                    </Th>
                                    <Th fontSize="2xs" color="text.secondary" textTransform="uppercase" letterSpacing="0.08em" fontWeight={700} pb={3}>
                                        Added
                                    </Th>
                                    <Th fontSize="2xs" color="text.secondary" textTransform="uppercase" letterSpacing="0.08em" fontWeight={700} pb={3} isNumeric>
                                        Status
                                    </Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {whitelist.map((entry) => (
                                    <Tr
                                        key={entry.address}
                                        _hover={{
                                            bg: 'rgba(54,163,123,0.06)',
                                            _dark: { bg: 'rgba(255,255,255,0.04)' },
                                        }}
                                    >
                                        <Td py={2.5}>
                                            <HStack gap={2}>
                                                <Text fontSize="xs" fontFamily="monospace" color="text.primary">
                                                    {entry.address.slice(0, 6)}…{entry.address.slice(-4)}
                                                </Text>
                                                <Button
                                                    variant="tactileGhost"
                                                    size="sm"
                                                    height="22px"
                                                    px={2}
                                                    fontSize="2xs"
                                                    fontWeight={700}
                                                    letterSpacing="0.04em"
                                                    textTransform="uppercase"
                                                    onClick={() => navigator.clipboard.writeText(entry.address)}
                                                    aria-label={`Copy address ${entry.address}`}
                                                >
                                                    Copy
                                                </Button>
                                            </HStack>
                                        </Td>
                                        <Td py={2.5}>
                                            <Text
                                                fontSize="xs"
                                                color="text.secondary"
                                                sx={{ fontVariantNumeric: 'tabular-nums' }}
                                            >
                                                {new Date(entry.addedAt).toLocaleDateString()}
                                            </Text>
                                        </Td>
                                        <Td py={2.5} isNumeric>
                                            {entry.claimed ? (
                                                <Badge
                                                    bg="rgba(54, 163, 123, 0.14)"
                                                    color="brand.green"
                                                    border="1px solid"
                                                    borderColor="rgba(54, 163, 123, 0.30)"
                                                    fontSize="2xs"
                                                    fontWeight={700}
                                                    letterSpacing="0.04em"
                                                    textTransform="uppercase"
                                                    borderRadius="6px"
                                                    px={2}
                                                    py={0.5}
                                                >
                                                    Claimed
                                                </Badge>
                                            ) : (
                                                <Badge
                                                    bg="card.lightGray"
                                                    color="text.secondary"
                                                    border="1px solid"
                                                    borderColor="border.lightGray"
                                                    _dark={{ borderColor: 'rgba(255,255,255,0.10)' }}
                                                    fontSize="2xs"
                                                    fontWeight={700}
                                                    letterSpacing="0.04em"
                                                    textTransform="uppercase"
                                                    borderRadius="6px"
                                                    px={2}
                                                    py={0.5}
                                                >
                                                    Unclaimed
                                                </Badge>
                                            )}
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </TableContainer>
                )}
            </Box>

            <Box
                bg="card.white"
                borderRadius="16px"
                p={6}
                border="1px solid"
                borderColor="card.lightGray"
                _dark={{ borderColor: 'rgba(255,255,255,0.08)' }}
                boxShadow="0 2px 12px rgba(0,0,0,0.06)"
            >
                <Flex align="center" justify="space-between" mb={4} gap={3} flexWrap="wrap">
                    <VStack align="start" gap={0}>
                        <Text fontSize="md" fontWeight={800} color="text.primary">
                            Add to SBT Whitelist
                        </Text>
                        <Text fontSize="xs" color="text.secondary">
                            Paste a list or upload a CSV. One address per line.
                        </Text>
                    </VStack>
                    <HStack
                        gap={1}
                        p={1}
                        bg="card.lightGray"
                        borderRadius="10px"
                        border="1px solid"
                        borderColor="border.lightGray"
                        _dark={{ borderColor: 'rgba(255,255,255,0.08)' }}
                    >
                        {(['paste', 'csv'] as const).map((mode) => {
                            const active = wlInputMode === mode;
                            return (
                                <Button
                                    key={mode}
                                    variant="base"
                                    size="sm"
                                    height="30px"
                                    px={3}
                                    borderRadius="8px"
                                    fontSize="xs"
                                    fontWeight={700}
                                    border="none"
                                    bg={active ? 'card.white' : 'transparent'}
                                    color={active ? 'text.primary' : 'text.secondary'}
                                    boxShadow={active ? '0 1px 3px rgba(0,0,0,0.10)' : 'none'}
                                    _dark={{
                                        bg: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                                        color: active ? 'white' : 'rgba(255,255,255,0.65)',
                                        boxShadow: active ? '0 1px 3px rgba(0,0,0,0.4)' : 'none',
                                    }}
                                    _hover={{
                                        bg: active ? 'card.white' : 'rgba(0,0,0,0.04)',
                                        _dark: {
                                            bg: active ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
                                        },
                                    }}
                                    _active={{ transform: 'none' }}
                                    onClick={() => setWlInputMode(mode)}
                                >
                                    {mode === 'paste' ? 'Paste' : 'CSV'}
                                </Button>
                            );
                        })}
                    </HStack>
                </Flex>

                {wlInputMode === 'paste' ? (
                    <Textarea
                        value={wlPasteText}
                        onChange={(e) => setWlPasteText(e.target.value)}
                        placeholder={'0x1234abcd…\n0x5678ef90…'}
                        rows={6}
                        fontSize="xs"
                        fontFamily="monospace"
                        bg="card.lightGray"
                        color="text.primary"
                        border="1px solid"
                        borderColor="border.lightGray"
                        borderRadius="10px"
                        resize="vertical"
                        mb={3}
                        _placeholder={{ color: 'text.secondary', opacity: 0.6 }}
                        _hover={{
                            borderColor: 'rgba(0,0,0,0.18)',
                            _dark: { borderColor: 'rgba(255,255,255,0.18)' },
                        }}
                        _focus={{
                            bg: 'card.white',
                            borderColor: 'brand.pink',
                            boxShadow: '0 0 0 3px rgba(235, 11, 92, 0.20)',
                        }}
                        _dark={{ borderColor: 'rgba(255,255,255,0.10)' }}
                    />
                ) : (
                    <Box mb={3}>
                        <Input
                            id="wl-csv-upload"
                            type="file"
                            accept=".csv,text/csv"
                            display="none"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                    const text = ev.target?.result as string;
                                    setWlPasteText(parseCsv(text));
                                    setWlInputMode('paste');
                                };
                                reader.readAsText(file);
                            }}
                        />
                        <Flex
                            as="label"
                            htmlFor="wl-csv-upload"
                            direction="column"
                            align="center"
                            justify="center"
                            gap={1}
                            py={8}
                            px={4}
                            bg="card.lightGray"
                            border="1px dashed"
                            borderColor="border.lightGray"
                            _dark={{ borderColor: 'rgba(255,255,255,0.14)' }}
                            borderRadius="10px"
                            cursor="pointer"
                            transition="border-color 120ms ease, background-color 120ms ease"
                            _hover={{
                                borderColor: 'brand.green',
                                bg: 'rgba(54, 163, 123, 0.06)',
                            }}
                        >
                            <Text fontSize="sm" fontWeight={700} color="text.primary">
                                Choose CSV file
                            </Text>
                            <Text fontSize="xs" color="text.secondary">
                                First column is read as the address. Result lands in Paste for review.
                            </Text>
                        </Flex>
                    </Box>
                )}

                {hasPreview && (
                    <Box
                        mb={3}
                        p={3}
                        bg="card.lightGray"
                        borderRadius="10px"
                        border="1px solid"
                        borderColor="border.lightGray"
                        _dark={{ borderColor: 'rgba(255,255,255,0.08)' }}
                    >
                        <HStack justify="space-between" mb={2} gap={3} flexWrap="wrap">
                            <HStack gap={3}>
                                <HStack gap={1.5}>
                                    <Box w="8px" h="8px" borderRadius="full" bg="brand.green" />
                                    <Text fontSize="xs" color="text.primary" fontWeight={700}>
                                        {valid.length} valid
                                    </Text>
                                </HStack>
                                {invalid.length > 0 && (
                                    <HStack gap={1.5}>
                                        <Box w="8px" h="8px" borderRadius="full" bg="brand.pink" opacity={0.8} />
                                        <Text fontSize="xs" color="brand.pink" fontWeight={700}>
                                            {invalid.length} invalid
                                        </Text>
                                    </HStack>
                                )}
                            </HStack>
                            {valid.length > 5 && (
                                <Text fontSize="2xs" color="text.secondary" textTransform="uppercase" letterSpacing="0.06em" fontWeight={700}>
                                    Showing first 5
                                </Text>
                            )}
                        </HStack>
                        <VStack align="stretch" gap={0.5}>
                            {valid.slice(0, 5).map((a) => (
                                <Text key={a} fontSize="xs" fontFamily="monospace" color="text.primary">
                                    {a}
                                </Text>
                            ))}
                            {valid.length > 5 && (
                                <Text fontSize="xs" color="text.secondary">
                                    …and {valid.length - 5} more
                                </Text>
                            )}
                            {invalid.length > 0 && (
                                <Text fontSize="2xs" color="text.secondary" mt={2}>
                                    Invalid entries are skipped on submit.
                                </Text>
                            )}
                        </VStack>
                    </Box>
                )}

                <HStack gap={3} flexWrap="wrap">
                    <Button
                        variant="tactilePrimary"
                        size="sm"
                        height="40px"
                        px={5}
                        borderRadius="10px"
                        isLoading={wlAdding}
                        loadingText="Adding…"
                        isDisabled={valid.length === 0}
                        onClick={async () => {
                            if (!valid.length) return;
                            setWlAdding(true);
                            try {
                                const result = await addToSBTWhitelist(valid);
                                if (result.success) {
                                    setWlPasteText('');
                                    await loadWhitelist(wlSearch);
                                }
                            } finally {
                                setWlAdding(false);
                            }
                        }}
                    >
                        {valid.length > 0
                            ? `Add ${valid.length} to whitelist`
                            : 'Add to whitelist'}
                    </Button>
                    {hasPreview && (
                        <Button
                            variant="tactileGhost"
                            size="sm"
                            height="40px"
                            px={4}
                            borderRadius="10px"
                            fontSize="sm"
                            onClick={() => setWlPasteText('')}
                            isDisabled={wlAdding}
                        >
                            Clear
                        </Button>
                    )}
                </HStack>
            </Box>
        </VStack>
    );
};
