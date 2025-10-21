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
                mb={4}
                color="white"
                fontFamily="Poppins, sans-serif"
            >
                How To Play
            </Text>

            <Accordion allowMultiple defaultIndex={[0]}>
                <AccordionItem
                    bg="#262626"
                    borderRadius="md"
                    mb={3}
                    border="2px"
                    borderColor="#363535"
                >
                    <AccordionButton
                        _hover={{ bg: '#2e2e2e' }}
                        borderRadius="md"
                        py={4}
                    >
                        <Box flex="1" textAlign="left">
                            <Heading
                                size={{ base: 'sm', md: 'md' }}
                                color="white"
                                fontFamily="Poppins, sans-serif"
                            >
                                Getting Started
                            </Heading>
                        </Box>
                        <AccordionIcon color="white" />
                    </AccordionButton>
                    <AccordionPanel pb={4}>
                        <VStack align="start" gap={3}>
                            <OrderedList
                                spacing={2}
                                color="#c6c6c6"
                                fontFamily="Poppins, sans-serif"
                            >
                                <ListItem>
                                    <strong>Connect your wallet</strong> - Click
                                    the wallet button in the top right to
                                    connect your Web3 wallet
                                </ListItem>
                                <ListItem>
                                    <strong>Join a table</strong> - Click on an
                                    empty seat to request joining the game
                                </ListItem>
                                <ListItem>
                                    <strong>Wait for approval</strong> - The
                                    table owner will accept your request
                                </ListItem>
                                <ListItem>
                                    <strong>Start playing</strong> - Once
                                    seated, you can begin playing poker!
                                </ListItem>
                            </OrderedList>
                        </VStack>
                    </AccordionPanel>
                </AccordionItem>

                <AccordionItem
                    bg="#262626"
                    borderRadius="md"
                    mb={3}
                    border="2px"
                    borderColor="#363535"
                >
                    <AccordionButton
                        _hover={{ bg: '#2e2e2e' }}
                        borderRadius="md"
                        py={4}
                    >
                        <Box flex="1" textAlign="left">
                            <Heading
                                size={{ base: 'sm', md: 'md' }}
                                color="white"
                                fontFamily="Poppins, sans-serif"
                            >
                                Game Actions
                            </Heading>
                        </Box>
                        <AccordionIcon color="white" />
                    </AccordionButton>
                    <AccordionPanel pb={4}>
                        <VStack align="start" gap={3}>
                            <UnorderedList
                                spacing={2}
                                color="#c6c6c6"
                                fontFamily="Poppins, sans-serif"
                            >
                                <ListItem>
                                    <Code
                                        colorScheme="green"
                                        bg="#1db954"
                                        color="white"
                                        px={2}
                                        py={1}
                                        fontFamily="Poppins, sans-serif"
                                    >
                                        Fold
                                    </Code>{' '}
                                    - Give up your hand and forfeit the current
                                    pot
                                </ListItem>
                                <ListItem>
                                    <Code
                                        colorScheme="blue"
                                        bg="blue.600"
                                        color="white"
                                        px={2}
                                        py={1}
                                        fontFamily="Poppins, sans-serif"
                                    >
                                        Check
                                    </Code>{' '}
                                    - Pass the action without betting (only when
                                    no bet is required)
                                </ListItem>
                                <ListItem>
                                    <Code
                                        colorScheme="yellow"
                                        bg="yellow.600"
                                        color="white"
                                        px={2}
                                        py={1}
                                        fontFamily="Poppins, sans-serif"
                                    >
                                        Call
                                    </Code>{' '}
                                    - Match the current bet amount
                                </ListItem>
                                <ListItem>
                                    <Code
                                        colorScheme="orange"
                                        bg="orange.600"
                                        color="white"
                                        px={2}
                                        py={1}
                                        fontFamily="Poppins, sans-serif"
                                    >
                                        Raise
                                    </Code>{' '}
                                    - Increase the current bet amount
                                </ListItem>
                                <ListItem>
                                    <Code
                                        colorScheme="red"
                                        bg="#eb4034"
                                        color="white"
                                        px={2}
                                        py={1}
                                        fontFamily="Poppins, sans-serif"
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
                    bg="#262626"
                    borderRadius="md"
                    mb={3}
                    border="2px"
                    borderColor="#363535"
                >
                    <AccordionButton
                        _hover={{ bg: '#2e2e2e' }}
                        borderRadius="md"
                        py={4}
                    >
                        <Box flex="1" textAlign="left">
                            <Heading
                                size={{ base: 'sm', md: 'md' }}
                                color="white"
                                fontFamily="Poppins, sans-serif"
                            >
                                Hand Rankings
                            </Heading>
                        </Box>
                        <AccordionIcon color="white" />
                    </AccordionButton>
                    <AccordionPanel pb={4}>
                        <VStack align="start" gap={2}>
                            <Text
                                fontSize="sm"
                                color="#c6c6c6"
                                mb={2}
                                fontFamily="Poppins, sans-serif"
                            >
                                From highest to lowest:
                            </Text>
                            <OrderedList
                                spacing={2}
                                color="#c6c6c6"
                                fontFamily="Poppins, sans-serif"
                            >
                                <ListItem>
                                    <strong>Royal Flush</strong> - A, K, Q, J,
                                    10, all same suit
                                </ListItem>
                                <ListItem>
                                    <strong>Straight Flush</strong> - Five cards
                                    in sequence, all same suit
                                </ListItem>
                                <ListItem>
                                    <strong>Four of a Kind</strong> - Four cards
                                    of the same rank
                                </ListItem>
                                <ListItem>
                                    <strong>Full House</strong> - Three of a
                                    kind plus a pair
                                </ListItem>
                                <ListItem>
                                    <strong>Flush</strong> - Five cards of the
                                    same suit
                                </ListItem>
                                <ListItem>
                                    <strong>Straight</strong> - Five cards in
                                    sequence
                                </ListItem>
                                <ListItem>
                                    <strong>Three of a Kind</strong> - Three
                                    cards of the same rank
                                </ListItem>
                                <ListItem>
                                    <strong>Two Pair</strong> - Two different
                                    pairs
                                </ListItem>
                                <ListItem>
                                    <strong>One Pair</strong> - Two cards of the
                                    same rank
                                </ListItem>
                                <ListItem>
                                    <strong>High Card</strong> - Highest card
                                    wins
                                </ListItem>
                            </OrderedList>
                        </VStack>
                    </AccordionPanel>
                </AccordionItem>

                <AccordionItem
                    bg="#262626"
                    borderRadius="md"
                    mb={3}
                    border="2px"
                    borderColor="#363535"
                >
                    <AccordionButton
                        _hover={{ bg: '#2e2e2e' }}
                        borderRadius="md"
                        py={4}
                    >
                        <Box flex="1" textAlign="left">
                            <Heading
                                size={{ base: 'sm', md: 'md' }}
                                color="white"
                                fontFamily="Poppins, sans-serif"
                            >
                                Tips & Tricks
                            </Heading>
                        </Box>
                        <AccordionIcon color="white" />
                    </AccordionButton>
                    <AccordionPanel pb={4}>
                        <VStack align="start" gap={3}>
                            <UnorderedList
                                spacing={2}
                                color="#c6c6c6"
                                fontFamily="Poppins, sans-serif"
                            >
                                <ListItem>
                                    Pay attention to other players&apos; betting
                                    patterns
                                </ListItem>
                                <ListItem>
                                    Position matters - later positions have more
                                    information
                                </ListItem>
                                <ListItem>
                                    Don&apos;t play every hand - be selective
                                    with starting hands
                                </ListItem>
                                <ListItem>
                                    Manage your bankroll - don&apos;t bet more
                                    than you can afford
                                </ListItem>
                                <ListItem>
                                    Use the chat to communicate with other
                                    players
                                </ListItem>
                                <ListItem>
                                    Toggle &quot;Away&quot; mode if you need to
                                    step away briefly
                                </ListItem>
                            </UnorderedList>
                        </VStack>
                    </AccordionPanel>
                </AccordionItem>

                <AccordionItem
                    bg="#262626"
                    borderRadius="md"
                    mb={3}
                    border="2px"
                    borderColor="#363535"
                >
                    <AccordionButton
                        _hover={{ bg: '#2e2e2e' }}
                        borderRadius="md"
                        py={4}
                    >
                        <Box flex="1" textAlign="left">
                            <Heading
                                size={{ base: 'sm', md: 'md' }}
                                color="white"
                                fontFamily="Poppins, sans-serif"
                            >
                                Table Owner Controls
                            </Heading>
                        </Box>
                        <AccordionIcon color="white" />
                    </AccordionButton>
                    <AccordionPanel pb={4}>
                        <VStack align="start" gap={3}>
                            <Text
                                fontSize="sm"
                                color="#c6c6c6"
                                fontFamily="Poppins, sans-serif"
                            >
                                If you&apos;re the table owner, you have
                                additional controls:
                            </Text>
                            <UnorderedList
                                spacing={2}
                                color="#c6c6c6"
                                fontFamily="Poppins, sans-serif"
                            >
                                <ListItem>
                                    Accept or deny player requests to join
                                </ListItem>
                                <ListItem>
                                    Kick players from the table if needed
                                </ListItem>
                                <ListItem>
                                    Configure game settings (blinds, antes,
                                    etc.)
                                </ListItem>
                                <ListItem>Start the game when ready</ListItem>
                                <ListItem>
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
