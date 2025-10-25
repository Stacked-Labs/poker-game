'use client';

import {
    Box,
    HStack,
    Text,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    Badge,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    StatArrow,
    VStack,
} from '@chakra-ui/react';

interface Transaction {
    id: string;
    timestamp: Date;
    player: string;
    type: 'buy-in' | 'cash-out' | 'win' | 'loss';
    amount: number;
}

const Ledger = () => {
    // Mock transaction data - replace with actual ledger data from your state
    const transactions: Transaction[] = [
        {
            id: '1',
            timestamp: new Date(),
            player: 'Player 1',
            type: 'buy-in',
            amount: 1000,
        },
        {
            id: '2',
            timestamp: new Date(Date.now() - 60000),
            player: 'Player 2',
            type: 'win',
            amount: 500,
        },
        {
            id: '3',
            timestamp: new Date(Date.now() - 120000),
            player: 'Player 1',
            type: 'loss',
            amount: -200,
        },
    ];

    // Calculate summary stats
    const totalBuyIns = transactions
        .filter((t) => t.type === 'buy-in')
        .reduce((sum, t) => sum + t.amount, 0);
    const totalWins = transactions
        .filter((t) => t.type === 'win')
        .reduce((sum, t) => sum + t.amount, 0);
    const totalLosses = Math.abs(
        transactions
            .filter((t) => t.type === 'loss')
            .reduce((sum, t) => sum + t.amount, 0)
    );

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'buy-in':
                return 'brand.navy';
            case 'cash-out':
                return 'brand.yellow';
            case 'win':
                return 'brand.green';
            case 'loss':
                return 'brand.pink';
            default:
                return 'gray.500';
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(Math.abs(amount));
    };

    return (
        <Box>
            <Text
                fontSize={{ base: 'xl', md: '2xl' }}
                fontWeight={'bold'}
                mb={6}
                color="brand.navy"
                letterSpacing="-0.02em"
            >
                Financial Ledger
            </Text>

            {/* Summary Stats */}
            <HStack
                gap={4}
                mb={6}
                flexWrap="wrap"
                justify="space-around"
                bg="white"
                p={{ base: 4, md: 6 }}
                borderRadius="16px"
                border="2px solid"
                borderColor="brand.lightGray"
                boxShadow="0 4px 12px rgba(0, 0, 0, 0.08)"
            >
                <Stat textAlign="center">
                    <StatLabel
                        color="gray.600"
                        fontWeight="semibold"
                        fontSize="sm"
                    >
                        Total Buy-ins
                    </StatLabel>
                    <StatNumber
                        color="brand.navy"
                        fontSize={{ base: '2xl', md: '3xl' }}
                        fontWeight="bold"
                    >
                        {formatCurrency(totalBuyIns)}
                    </StatNumber>
                    <StatHelpText color="gray.500" fontWeight="medium">
                        All players
                    </StatHelpText>
                </Stat>
                <Stat textAlign="center">
                    <StatLabel
                        color="gray.600"
                        fontWeight="semibold"
                        fontSize="sm"
                    >
                        Total Wins
                    </StatLabel>
                    <StatNumber
                        color="brand.green"
                        fontSize={{ base: '2xl', md: '3xl' }}
                        fontWeight="bold"
                    >
                        <StatArrow type="increase" />
                        {formatCurrency(totalWins)}
                    </StatNumber>
                    <StatHelpText color="gray.500" fontWeight="medium">
                        Payouts
                    </StatHelpText>
                </Stat>
                <Stat textAlign="center">
                    <StatLabel
                        color="gray.600"
                        fontWeight="semibold"
                        fontSize="sm"
                    >
                        Total Losses
                    </StatLabel>
                    <StatNumber
                        color="brand.pink"
                        fontSize={{ base: '2xl', md: '3xl' }}
                        fontWeight="bold"
                    >
                        <StatArrow type="decrease" />
                        {formatCurrency(totalLosses)}
                    </StatNumber>
                    <StatHelpText color="gray.500" fontWeight="medium">
                        Rake & Losses
                    </StatHelpText>
                </Stat>
            </HStack>

            {/* Transactions Table */}
            <TableContainer
                bg="white"
                borderRadius="16px"
                border="2px solid"
                borderColor="brand.lightGray"
                overflowY="auto"
                maxH="500px"
                boxShadow="0 4px 12px rgba(0, 0, 0, 0.08)"
                sx={{
                    '&::-webkit-scrollbar': {
                        width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                        bg: 'brand.lightGray',
                        borderRadius: 'full',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        bg: 'brand.navy',
                        borderRadius: 'full',
                        _hover: {
                            bg: 'brand.pink',
                        },
                    },
                }}
            >
                <Table variant="simple" size={{ base: 'sm', md: 'md' }}>
                    <Thead
                        position="sticky"
                        top={0}
                        bg="brand.lightGray"
                        zIndex={1}
                    >
                        <Tr>
                            <Th
                                color={'brand.navy'}
                                fontWeight="bold"
                                fontSize="xs"
                            >
                                Time
                            </Th>
                            <Th
                                color={'brand.navy'}
                                fontWeight="bold"
                                fontSize="xs"
                            >
                                Player
                            </Th>
                            <Th
                                color={'brand.navy'}
                                fontWeight="bold"
                                fontSize="xs"
                            >
                                Type
                            </Th>
                            <Th
                                color={'brand.navy'}
                                fontWeight="bold"
                                fontSize="xs"
                                isNumeric
                            >
                                Amount
                            </Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {transactions.length === 0 ? (
                            <Tr>
                                <Td colSpan={4} textAlign="center" py={8}>
                                    <Text color="gray.600" fontWeight="medium">
                                        No transactions yet
                                    </Text>
                                </Td>
                            </Tr>
                        ) : (
                            transactions.map((transaction) => (
                                <Tr
                                    key={transaction.id}
                                    _hover={{
                                        bg: 'brand.lightGray',
                                    }}
                                    transition="all 0.2s ease"
                                >
                                    <Td>
                                        <Text
                                            fontSize="xs"
                                            color="gray.600"
                                            fontWeight="medium"
                                        >
                                            {transaction.timestamp.toLocaleTimeString(
                                                'en-US',
                                                {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                }
                                            )}
                                        </Text>
                                    </Td>
                                    <Td>
                                        <Text
                                            fontWeight="semibold"
                                            color="brand.navy"
                                        >
                                            {transaction.player}
                                        </Text>
                                    </Td>
                                    <Td>
                                        <Badge
                                            bg={getTypeColor(transaction.type)}
                                            color="white"
                                            fontSize="xs"
                                            px={2}
                                            py={1}
                                            borderRadius="6px"
                                            fontWeight="bold"
                                        >
                                            {transaction.type}
                                        </Badge>
                                    </Td>
                                    <Td isNumeric>
                                        <Text
                                            fontWeight="bold"
                                            color={
                                                transaction.amount >= 0
                                                    ? 'brand.green'
                                                    : 'brand.pink'
                                            }
                                        >
                                            {transaction.amount >= 0 ? '+' : ''}
                                            {formatCurrency(transaction.amount)}
                                        </Text>
                                    </Td>
                                </Tr>
                            ))
                        )}
                    </Tbody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default Ledger;
