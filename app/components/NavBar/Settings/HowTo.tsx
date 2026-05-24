'use client';

import {
    Box,
    HStack,
    Text,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    OrderedList,
    UnorderedList,
    ListItem,
} from '@chakra-ui/react';

const SECTION_LABEL_PROPS = {
    fontSize: '2xs' as const,
    color: 'whiteAlpha.700',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.10em',
    fontWeight: 800,
};

const ITEM_CHROME = {
    bg: 'card.white',
    borderRadius: { base: '12px', md: '14px' },
    border: '1px solid',
    borderColor: 'border.lightGray',
    overflow: 'hidden' as const,
    boxShadow: 'card.lift',
};

const BUTTON_PRESS = {
    _hover: { bg: 'card.lightGray' },
    _active: {
        bg: 'card.lightGray',
        transform: 'translateY(1px)',
        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.10)',
    },
    transition:
        'transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 80ms ease, background-color 80ms ease',
};

const TitleText = ({ children }: { children: React.ReactNode }) => (
    <Text as="span" fontWeight="bold" color="text.secondary">
        {children}
    </Text>
);

const ItemHeader = ({ title }: { title: string }) => (
    <AccordionButton
        {...BUTTON_PRESS}
        borderRadius={{ base: '12px', md: '14px' }}
        py={3.5}
        px={4}
    >
        <Box flex="1" textAlign="left">
            <Text
                fontSize={{ base: 'sm', md: 'md' }}
                color="text.secondary"
                fontWeight={700}
                letterSpacing="0.01em"
            >
                {title}
            </Text>
        </Box>
        <AccordionIcon color="text.muted" boxSize={5} />
    </AccordionButton>
);

const SectionHeader = ({ label }: { label: string }) => (
    <HStack spacing={1.5} px={1} mb={1.5} mt={2}>
        <Text {...SECTION_LABEL_PROPS}>{label}</Text>
    </HStack>
);

const HowTo = () => {
    return (
        <Box>
            <Accordion allowMultiple defaultIndex={[0]}>
                <SectionHeader label="GETTING STARTED" />

                <AccordionItem {...ITEM_CHROME} mb={2}>
                    <ItemHeader title="Sign in with your wallet" />
                    <AccordionPanel pb={4} px={4} pt={1}>
                        <Text
                            color="text.secondary"
                            fontSize="sm"
                            mb={3}
                            lineHeight="tall"
                        >
                            Your wallet is your account. There&apos;s no email
                            signup, password, or KYC step. You connect, sign a
                            message to prove the wallet is yours, and you&apos;re
                            in.
                        </Text>
                        <UnorderedList
                            spacing={2.5}
                            color="text.secondary"
                            styleType="none"
                            ml={0}
                        >
                            <ListItem>
                                <TitleText>If you have a wallet</TitleText>{' '}
                                <Text as="span" color="text.muted">
                                    — connect MetaMask, Coinbase Wallet, Rabby,
                                    or anything that speaks WalletConnect.
                                </Text>
                            </ListItem>
                            <ListItem>
                                <TitleText>If you don&apos;t</TitleText>{' '}
                                <Text as="span" color="text.muted">
                                    — sign in with Google, Discord, X, Apple,
                                    email, or phone. A wallet is created for you
                                    in the background; you can export the keys
                                    later if you want to.
                                </Text>
                            </ListItem>
                            <ListItem>
                                <TitleText>Sign the message</TitleText>{' '}
                                <Text as="span" color="text.muted">
                                    — after connecting, you&apos;ll be asked to
                                    sign a one-time login message. This is free
                                    and gasless. It is not a transaction and
                                    does not move any funds.
                                </Text>
                            </ListItem>
                        </UnorderedList>
                    </AccordionPanel>
                </AccordionItem>

                <AccordionItem {...ITEM_CHROME} mb={2}>
                    <ItemHeader title="Joining a table" />
                    <AccordionPanel pb={4} px={4} pt={1}>
                        <Text
                            color="text.secondary"
                            fontSize="sm"
                            mb={3}
                            lineHeight="tall"
                        >
                            Tables are hosted by other players. To play, you
                            pick an open table, request a seat, and wait for the
                            host to let you in.
                        </Text>
                        <OrderedList spacing={2.5} color="text.secondary">
                            <ListItem>
                                <TitleText>Find a table</TitleText>{' '}
                                <Text as="span" color="text.muted">
                                    — browse Public Games, or open a private
                                    table from a link the host shared with you.
                                </Text>
                            </ListItem>
                            <ListItem>
                                <TitleText>Pick an empty seat</TitleText>{' '}
                                <Text as="span" color="text.muted">
                                    — tap the seat you want and choose your
                                    buy-in within the host&apos;s min/max range.
                                </Text>
                            </ListItem>
                            <ListItem>
                                <TitleText>Wait for the host</TitleText>{' '}
                                <Text as="span" color="text.muted">
                                    — the host approves seat requests. Once they
                                    do, you&apos;re dealt in on the next hand.
                                </Text>
                            </ListItem>
                        </OrderedList>
                    </AccordionPanel>
                </AccordionItem>

                <SectionHeader label="WALLET & CHIPS" />

                <AccordionItem {...ITEM_CHROME} mb={2}>
                    <ItemHeader title="How chips work" />
                    <AccordionPanel pb={4} px={4} pt={1}>
                        <Text
                            color="text.secondary"
                            fontSize="sm"
                            mb={3}
                            lineHeight="tall"
                        >
                            Real-money tables are played in{' '}
                            <TitleText>USDC</TitleText> on{' '}
                            <TitleText>Base</TitleText>. The chips you see at
                            the table are just a display unit for that USDC, so
                            bet sizes read cleanly.
                        </Text>
                        <UnorderedList
                            spacing={2}
                            color="text.secondary"
                            styleType="none"
                            ml={0}
                        >
                            <ListItem>
                                <TitleText>100 chips = 1 USDC</TitleText>{' '}
                                <Text as="span" color="text.muted">
                                    — fixed conversion. There is no internal
                                    token and no exchange rate to track.
                                </Text>
                            </ListItem>
                            <ListItem>
                                <TitleText>Funds live in the table contract</TitleText>{' '}
                                <Text as="span" color="text.muted">
                                    — every table is its own smart contract on
                                    Base. When you buy in, your USDC moves into
                                    that contract. Stacked does not custody it.
                                </Text>
                            </ListItem>
                            <ListItem>
                                <TitleText>Payouts are automatic</TitleText>{' '}
                                <Text as="span" color="text.muted">
                                    — when a hand ends, the contract updates
                                    each player&apos;s balance. You withdraw
                                    your balance directly from the contract when
                                    you&apos;re done playing.
                                </Text>
                            </ListItem>
                        </UnorderedList>
                    </AccordionPanel>
                </AccordionItem>

                <AccordionItem {...ITEM_CHROME} mb={2}>
                    <ItemHeader title="Buying in" />
                    <AccordionPanel pb={4} px={4} pt={1}>
                        <Text
                            color="text.secondary"
                            fontSize="sm"
                            mb={3}
                            lineHeight="tall"
                        >
                            To sit down at a real-money table, you need USDC on
                            Base in your wallet. You can bridge to Base or send
                            USDC from any exchange that supports the network.
                        </Text>
                        <OrderedList spacing={2.5} color="text.secondary">
                            <ListItem>
                                <TitleText>Pick a seat</TitleText>{' '}
                                <Text as="span" color="text.muted">
                                    — tap an empty seat at the table.
                                </Text>
                            </ListItem>
                            <ListItem>
                                <TitleText>Choose your buy-in</TitleText>{' '}
                                <Text as="span" color="text.muted">
                                    — enter an amount within the host&apos;s
                                    min/max range. This is how many chips you
                                    start with.
                                </Text>
                            </ListItem>
                            <ListItem>
                                <TitleText>Approve, then deposit</TitleText>{' '}
                                <Text as="span" color="text.muted">
                                    — the first time you play at a given table
                                    contract, you&apos;ll sign a USDC approval
                                    so the contract can pull the buy-in. After
                                    that, only the deposit transaction is
                                    needed.
                                </Text>
                            </ListItem>
                            <ListItem>
                                <TitleText>Get dealt in</TitleText>{' '}
                                <Text as="span" color="text.muted">
                                    — once the host approves your seat request,
                                    you join on the next hand.
                                </Text>
                            </ListItem>
                        </OrderedList>
                    </AccordionPanel>
                </AccordionItem>

                <AccordionItem {...ITEM_CHROME} mb={2}>
                    <ItemHeader title="Cashing out" />
                    <AccordionPanel pb={4} px={4} pt={1}>
                        <Text
                            color="text.secondary"
                            fontSize="sm"
                            mb={3}
                            lineHeight="tall"
                        >
                            When you&apos;re done playing, you withdraw your
                            chip balance back to your wallet as USDC. The
                            withdrawal is a normal onchain transaction from the
                            table contract — no review queue, no holds.
                        </Text>
                        <OrderedList spacing={2.5} color="text.secondary">
                            <ListItem>
                                <TitleText>Stand up</TitleText>{' '}
                                <Text as="span" color="text.muted">
                                    — leave your seat. You can&apos;t withdraw
                                    while you&apos;re still in a hand.
                                </Text>
                            </ListItem>
                            <ListItem>
                                <TitleText>Wait for settlement</TitleText>{' '}
                                <Text as="span" color="text.muted">
                                    — the contract needs to finalize the last
                                    hand you were in. This is usually a few
                                    seconds; the Withdraw panel checks for you.
                                </Text>
                            </ListItem>
                            <ListItem>
                                <TitleText>Hit Withdraw</TitleText>{' '}
                                <Text as="span" color="text.muted">
                                    — sign the transaction. Your chips convert
                                    back to USDC at 100 chips = 1 USDC and
                                    arrive in your wallet on Base.
                                </Text>
                            </ListItem>
                        </OrderedList>
                        <Text
                            mt={3}
                            color="text.muted"
                            fontSize="xs"
                            lineHeight="tall"
                        >
                            <TitleText>Emergency Withdraw</TitleText> is a
                            backup path. If a table gets stuck and the normal
                            flow won&apos;t complete, this lets you pull your
                            balance straight from the contract. The funds are
                            the same; only the path differs.
                        </Text>
                    </AccordionPanel>
                </AccordionItem>

                <SectionHeader label="HOSTING" />

                <AccordionItem {...ITEM_CHROME} mb={2}>
                    <ItemHeader title="Hosting your own table" />
                    <AccordionPanel pb={4} px={4} pt={1}>
                        <Text
                            color="text.secondary"
                            fontSize="sm"
                            mb={3}
                            lineHeight="tall"
                        >
                            Hosting means you create the table and run the
                            game. You set the rules, decide who plays, and earn
                            a share of the rake on every hand that settles.
                        </Text>
                        <UnorderedList
                            spacing={2.5}
                            color="text.secondary"
                            styleType="none"
                            ml={0}
                        >
                            <ListItem>
                                <TitleText>Set the rules</TitleText>{' '}
                                <Text as="span" color="text.muted">
                                    — choose blinds, min and max buy-in, table
                                    size, and whether the table is public or
                                    invite-only. Creating a real-money table
                                    deploys its own contract on Base.
                                </Text>
                            </ListItem>
                            <ListItem>
                                <TitleText>Manage the seats</TitleText>{' '}
                                <Text as="span" color="text.muted">
                                    — players request seats; you approve or
                                    deny them. You can also remove a player
                                    between hands if you need to.
                                </Text>
                            </ListItem>
                            <ListItem>
                                <TitleText>Start the game</TitleText>{' '}
                                <Text as="span" color="text.muted">
                                    — once the seats you want are filled, you
                                    deal the first hand. Action runs from there
                                    automatically.
                                </Text>
                            </ListItem>
                            <ListItem>
                                <TitleText>Collect host rewards</TitleText>{' '}
                                <Text as="span" color="text.muted">
                                    — a portion of the rake goes to the host.
                                    You can collect it at any time from the
                                    Withdraw panel; it pays out in USDC on
                                    Base.
                                </Text>
                            </ListItem>
                        </UnorderedList>
                    </AccordionPanel>
                </AccordionItem>
            </Accordion>
        </Box>
    );
};

export default HowTo;
