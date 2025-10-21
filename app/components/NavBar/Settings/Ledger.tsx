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
                return 'blue';
            case 'cash-out':
                return 'orange';
            case 'win':
                return 'green';
            case 'loss':
                return 'red';
            default:
                return 'gray';
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
                mb={4}
                color="white"
                fontFamily="Poppins, sans-serif"
            >
                Financial Ledger
            </Text>

            {/* Summary Stats */}
            <HStack
                gap={4}
                mb={6}
                flexWrap="wrap"
                justify="space-around"
                bg="#262626"
                p={{ base: 3, md: 4 }}
                borderRadius="lg"
                border="2px solid"
                borderColor="#363535"
            >
                <Stat textAlign="center">
                    <StatLabel color="#c6c6c6" fontFamily="Poppins, sans-serif">
                        Total Buy-ins
                    </StatLabel>
                    <StatNumber
                        color="#1ed760"
                        fontFamily="Poppins, sans-serif"
                    >
                        {formatCurrency(totalBuyIns)}
                    </StatNumber>
                    <StatHelpText
                        color="#c6c6c6"
                        fontFamily="Poppins, sans-serif"
                    >
                        All players
                    </StatHelpText>
                </Stat>
                <Stat textAlign="center">
                    <StatLabel color="#c6c6c6" fontFamily="Poppins, sans-serif">
                        Total Wins
                    </StatLabel>
                    <StatNumber
                        color="#1db954"
                        fontFamily="Poppins, sans-serif"
                    >
                        <StatArrow type="increase" />
                        {formatCurrency(totalWins)}
                    </StatNumber>
                    <StatHelpText
                        color="#c6c6c6"
                        fontFamily="Poppins, sans-serif"
                    >
                        Payouts
                    </StatHelpText>
                </Stat>
                <Stat textAlign="center">
                    <StatLabel color="#c6c6c6" fontFamily="Poppins, sans-serif">
                        Total Losses
                    </StatLabel>
                    <StatNumber
                        color="#eb4034"
                        fontFamily="Poppins, sans-serif"
                    >
                        <StatArrow type="decrease" />
                        {formatCurrency(totalLosses)}
                    </StatNumber>
                    <StatHelpText
                        color="#c6c6c6"
                        fontFamily="Poppins, sans-serif"
                    >
                        Rake & Losses
                    </StatHelpText>
                </Stat>
            </HStack>

            {/* Transactions Table */}
            <TableContainer
                bg="#262626"
                borderRadius="lg"
                border="2px solid"
                borderColor="#363535"
                overflowY="auto"
                maxH="400px"
            >
                <Table variant="simple" size={{ base: 'sm', md: 'md' }}>
                    <Thead position="sticky" top={0} bg="#363535" zIndex={1}>
                        <Tr>
                            <Th
                                color={'#c6c6c6'}
                                fontFamily="Poppins, sans-serif"
                            >
                                Time
                            </Th>
                            <Th
                                color={'#c6c6c6'}
                                fontFamily="Poppins, sans-serif"
                            >
                                Player
                            </Th>
                            <Th
                                color={'#c6c6c6'}
                                fontFamily="Poppins, sans-serif"
                            >
                                Type
                            </Th>
                            <Th
                                color={'#c6c6c6'}
                                fontFamily="Poppins, sans-serif"
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
                                    <Text
                                        color="#c6c6c6"
                                        fontFamily="Poppins, sans-serif"
                                    >
                                        No transactions yet
                                    </Text>
                                </Td>
                            </Tr>
                        ) : (
                            transactions.map((transaction) => (
                                <Tr
                                    key={transaction.id}
                                    _hover={{ bg: '#2e2e2e' }}
                                >
                                    <Td>
                                        <Text
                                            fontSize="xs"
                                            color="#c6c6c6"
                                            fontFamily="Poppins, sans-serif"
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
                                            fontWeight="medium"
                                            color="white"
                                            fontFamily="Poppins, sans-serif"
                                        >
                                            {transaction.player}
                                        </Text>
                                    </Td>
                                    <Td>
                                        <Badge
                                            colorScheme={getTypeColor(
                                                transaction.type
                                            )}
                                            fontSize="xs"
                                            fontFamily="Poppins, sans-serif"
                                        >
                                            {transaction.type}
                                        </Badge>
                                    </Td>
                                    <Td isNumeric>
                                        <Text
                                            fontWeight="bold"
                                            color={
                                                transaction.amount >= 0
                                                    ? '#1ed760'
                                                    : '#eb4034'
                                            }
                                            fontFamily="Poppins, sans-serif"
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
