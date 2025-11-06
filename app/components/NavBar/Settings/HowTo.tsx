'use client';

import {
    Box,
    VStack,
    Text,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    OrderedList,
    UnorderedList,
    ListItem,
    Heading,
    Code,
} from '@chakra-ui/react';

const HowTo = () => {
    return (
        <Box>
            <Text
                fontSize={{ base: 'xl', md: '2xl' }}
                fontWeight={'bold'}
                mb={6}
                color="text.secondary"
                letterSpacing="-0.02em"
            >
                How To Play
            </Text>

            <Accordion allowMultiple defaultIndex={[0]}>
                <AccordionItem
                    bg="card.white"
                    borderRadius="16px"
                    mb={3}
                    border="2px solid"
                    borderColor="card.lightGray"
                    overflow="hidden"
                    boxShadow="0 2px 8px rgba(0, 0, 0, 0.05)"
                    _hover={{
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    }}
                    transition="all 0.2s ease"
                >
                    <AccordionButton
                        _hover={{ bg: 'card.lightGray' }}
                        borderRadius="16px"
                        py={4}
                        px={5}
                        transition="all 0.2s ease"
                    >
                        <Box flex="1" textAlign="left">
                            <Heading
                                size={{ base: 'sm', md: 'md' }}
                                color="text.secondary"
                                fontWeight="bold"
                            >
                                Getting Started
                            </Heading>
                        </Box>
                        <AccordionIcon color="text.secondary" boxSize={6} />
                    </AccordionButton>
                    <AccordionPanel pb={5} px={5}>
                        <VStack align="start" gap={3}>
                            <OrderedList spacing={3} color="text.gray700">
                                <ListItem fontWeight="medium">
                                    <Text
                                        as="span"
                                        fontWeight="bold"
                                        color="text.secondary"
                                    >
                                        Connect your wallet
                                    </Text>{' '}
                                    - Click the wallet button in the top right
                                    to connect your Web3 wallet
                                </ListItem>
                                <ListItem fontWeight="medium">
                                    <Text
                                        as="span"
                                        fontWeight="bold"
                                        color="text.secondary"
                                    >
                                        Join a table
                                    </Text>{' '}
                                    - Click on an empty seat to request joining
                                    the game
                                </ListItem>
                                <ListItem fontWeight="medium">
                                    <Text
                                        as="span"
                                        fontWeight="bold"
                                        color="text.secondary"
                                    >
                                        Wait for approval
                                    </Text>{' '}
                                    - The table owner will accept your request
                                </ListItem>
                                <ListItem fontWeight="medium">
                                    <Text
                                        as="span"
                                        fontWeight="bold"
                                        color="text.secondary"
                                    >
                                        Start playing
                                    </Text>{' '}
                                    - Once seated, you can begin playing poker!
                                </ListItem>
                            </OrderedList>
                        </VStack>
                    </AccordionPanel>
                </AccordionItem>

                <AccordionItem
                    bg="card.white"
                    borderRadius="16px"
                    mb={3}
                    border="2px solid"
                    borderColor="card.lightGray"
                    overflow="hidden"
                    boxShadow="0 2px 8px rgba(0, 0, 0, 0.05)"
                    _hover={{
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    }}
                    transition="all 0.2s ease"
                >
                    <AccordionButton
                        _hover={{ bg: 'card.lightGray' }}
                        borderRadius="16px"
                        py={4}
                        px={5}
                        transition="all 0.2s ease"
                    >
                        <Box flex="1" textAlign="left">
                            <Heading
                                size={{ base: 'sm', md: 'md' }}
                                color="text.secondary"
                                fontWeight="bold"
                            >
                                Game Actions
                            </Heading>
                        </Box>
                        <AccordionIcon color="text.secondary" boxSize={6} />
                    </AccordionButton>
                    <AccordionPanel pb={5} px={5}>
                        <VStack align="start" gap={3}>
                            <UnorderedList spacing={3} color="text.gray700">
                                <ListItem fontWeight="medium">
                                    <Code
                                        bg="brand.pink"
                                        color="white"
                                        px={3}
                                        py={1.5}
                                        borderRadius="6px"
                                        fontWeight="bold"
                                        fontSize="sm"
                                    >
                                        Fold
                                    </Code>{' '}
                                    - Give up your hand and forfeit the current
                                    pot
                                </ListItem>
                                <ListItem fontWeight="medium">
                                    <Code
                                        bg="brand.navy"
                                        color="white"
                                        px={3}
                                        py={1.5}
                                        borderRadius="6px"
                                        fontWeight="bold"
                                        fontSize="sm"
                                    >
                                        Check
                                    </Code>{' '}
                                    - Pass the action without betting (only when
                                    no bet is required)
                                </ListItem>
                                <ListItem fontWeight="medium">
                                    <Code
                                        bg="brand.yellow"
                                        color="white"
                                        px={3}
                                        py={1.5}
                                        borderRadius="6px"
                                        fontWeight="bold"
                                        fontSize="sm"
                                    >
                                        Call
                                    </Code>{' '}
                                    - Match the current bet amount
                                </ListItem>
                                <ListItem fontWeight="medium">
                                    <Code
                                        bg="brand.green"
                                        color="white"
                                        px={3}
                                        py={1.5}
                                        borderRadius="6px"
                                        fontWeight="bold"
                                        fontSize="sm"
                                    >
                                        Raise
                                    </Code>{' '}
                                    - Increase the current bet amount
                                </ListItem>
                                <ListItem fontWeight="medium">
                                    <Code
                                        bg="brand.pink"
                                        color="white"
                                        px={3}
                                        py={1.5}
                                        borderRadius="6px"
                                        fontWeight="bold"
                                        fontSize="sm"
                                    >
                                        All-In
                                    </Code>{' '}
                                    - Bet all your remaining chips
                                </ListItem>
                            </UnorderedList>
                        </VStack>
                    </AccordionPanel>
                </AccordionItem>

                <AccordionItem
                    bg="card.white"
                    borderRadius="16px"
                    mb={3}
                    border="2px solid"
                    borderColor="card.lightGray"
                    overflow="hidden"
                    boxShadow="0 2px 8px rgba(0, 0, 0, 0.05)"
                    _hover={{
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    }}
                    transition="all 0.2s ease"
                >
                    <AccordionButton
                        _hover={{ bg: 'card.lightGray' }}
                        borderRadius="16px"
                        py={4}
                        px={5}
                        transition="all 0.2s ease"
                    >
                        <Box flex="1" textAlign="left">
                            <Heading
                                size={{ base: 'sm', md: 'md' }}
                                color="text.secondary"
                                fontWeight="bold"
                            >
                                Hand Rankings
                            </Heading>
                        </Box>
                        <AccordionIcon color="text.secondary" boxSize={6} />
                    </AccordionButton>
                    <AccordionPanel pb={5} px={5}>
                        <VStack align="start" gap={2}>
                            <Text
                                fontSize="sm"
                                color="text.gray600"
                                mb={2}
                                fontWeight="semibold"
                            >
                                From highest to lowest:
                            </Text>
                            <OrderedList spacing={2} color="text.gray700">
                                <ListItem fontWeight="medium">
                                    <Text
                                        as="span"
                                        fontWeight="bold"
                                        color="text.secondary"
                                    >
                                        Royal Flush
                                    </Text>{' '}
                                    - A, K, Q, J, 10, all same suit
                                </ListItem>
                                <ListItem fontWeight="medium">
                                    <Text
                                        as="span"
                                        fontWeight="bold"
                                        color="text.secondary"
                                    >
                                        Straight Flush
                                    </Text>{' '}
                                    - Five cards in sequence, all same suit
                                </ListItem>
                                <ListItem fontWeight="medium">
                                    <Text
                                        as="span"
                                        fontWeight="bold"
                                        color="text.secondary"
                                    >
                                        Four of a Kind
                                    </Text>{' '}
                                    - Four cards of the same rank
                                </ListItem>
                                <ListItem fontWeight="medium">
                                    <Text
                                        as="span"
                                        fontWeight="bold"
                                        color="text.secondary"
                                    >
                                        Full House
                                    </Text>{' '}
                                    - Three of a kind plus a pair
                                </ListItem>
                                <ListItem fontWeight="medium">
                                    <Text
                                        as="span"
                                        fontWeight="bold"
                                        color="text.secondary"
                                    >
                                        Flush
                                    </Text>{' '}
                                    - Five cards of the same suit
                                </ListItem>
                                <ListItem fontWeight="medium">
                                    <Text
                                        as="span"
                                        fontWeight="bold"
                                        color="text.secondary"
                                    >
                                        Straight
                                    </Text>{' '}
                                    - Five cards in sequence
                                </ListItem>
                                <ListItem fontWeight="medium">
                                    <Text
                                        as="span"
                                        fontWeight="bold"
                                        color="text.secondary"
                                    >
                                        Three of a Kind
                                    </Text>{' '}
                                    - Three cards of the same rank
                                </ListItem>
                                <ListItem fontWeight="medium">
                                    <Text
                                        as="span"
                                        fontWeight="bold"
                                        color="text.secondary"
                                    >
                                        Two Pair
                                    </Text>{' '}
                                    - Two different pairs
                                </ListItem>
                                <ListItem fontWeight="medium">
                                    <Text
                                        as="span"
                                        fontWeight="bold"
                                        color="text.secondary"
                                    >
                                        One Pair
                                    </Text>{' '}
                                    - Two cards of the same rank
                                </ListItem>
                                <ListItem fontWeight="medium">
                                    <Text
                                        as="span"
                                        fontWeight="bold"
                                        color="text.secondary"
                                    >
                                        High Card
                                    </Text>{' '}
                                    - Highest card wins
                                </ListItem>
                            </OrderedList>
                        </VStack>
                    </AccordionPanel>
                </AccordionItem>

                <AccordionItem
                    bg="card.white"
                    borderRadius="16px"
                    mb={3}
                    border="2px solid"
                    borderColor="card.lightGray"
                    overflow="hidden"
                    boxShadow="0 2px 8px rgba(0, 0, 0, 0.05)"
                    _hover={{
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    }}
                    transition="all 0.2s ease"
                >
                    <AccordionButton
                        _hover={{ bg: 'card.lightGray' }}
                        borderRadius="16px"
                        py={4}
                        px={5}
                        transition="all 0.2s ease"
                    >
                        <Box flex="1" textAlign="left">
                            <Heading
                                size={{ base: 'sm', md: 'md' }}
                                color="text.secondary"
                                fontWeight="bold"
                            >
                                Tips & Tricks
                            </Heading>
                        </Box>
                        <AccordionIcon color="text.secondary" boxSize={6} />
                    </AccordionButton>
                    <AccordionPanel pb={5} px={5}>
                        <VStack align="start" gap={3}>
                            <UnorderedList spacing={3} color="text.gray700">
                                <ListItem fontWeight="medium">
                                    Pay attention to other players&apos; betting
                                    patterns
                                </ListItem>
                                <ListItem fontWeight="medium">
                                    Position matters - later positions have more
                                    information
                                </ListItem>
                                <ListItem fontWeight="medium">
                                    Don&apos;t play every hand - be selective
                                    with starting hands
                                </ListItem>
                                <ListItem fontWeight="medium">
                                    Manage your bankroll - don&apos;t bet more
                                    than you can afford
                                </ListItem>
                                <ListItem fontWeight="medium">
                                    Use the chat to communicate with other
                                    players
                                </ListItem>
                                <ListItem fontWeight="medium">
                                    Toggle &quot;Away&quot; mode if you need to
                                    step away briefly
                                </ListItem>
                            </UnorderedList>
                        </VStack>
                    </AccordionPanel>
                </AccordionItem>

                <AccordionItem
                    bg="card.white"
                    borderRadius="16px"
                    mb={3}
                    border="2px solid"
                    borderColor="card.lightGray"
                    overflow="hidden"
                    boxShadow="0 2px 8px rgba(0, 0, 0, 0.05)"
                    _hover={{
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    }}
                    transition="all 0.2s ease"
                >
                    <AccordionButton
                        _hover={{ bg: 'card.lightGray' }}
                        borderRadius="16px"
                        py={4}
                        px={5}
                        transition="all 0.2s ease"
                    >
                        <Box flex="1" textAlign="left">
                            <Heading
                                size={{ base: 'sm', md: 'md' }}
                                color="text.secondary"
                                fontWeight="bold"
                            >
                                Table Owner Controls
                            </Heading>
                        </Box>
                        <AccordionIcon color="text.secondary" boxSize={6} />
                    </AccordionButton>
                    <AccordionPanel pb={5} px={5}>
                        <VStack align="start" gap={3}>
                            <Text
                                fontSize="sm"
                                color="text.gray600"
                                fontWeight="semibold"
                            >
                                If you&apos;re the table owner, you have
                                additional controls:
                            </Text>
                            <UnorderedList spacing={3} color="text.gray700">
                                <ListItem fontWeight="medium">
                                    Accept or deny player requests to join
                                </ListItem>
                                <ListItem fontWeight="medium">
                                    Kick players from the table if needed
                                </ListItem>
                                <ListItem fontWeight="medium">
                                    Configure game settings (blinds, antes,
                                    etc.)
                                </ListItem>
                                <ListItem fontWeight="medium">
                                    Start the game when ready
                                </ListItem>
                                <ListItem fontWeight="medium">
                                    View the financial ledger and game log
                                </ListItem>
                            </UnorderedList>
                        </VStack>
                    </AccordionPanel>
                </AccordionItem>
            </Accordion>
        </Box>
    );
};

export default HowTo;
