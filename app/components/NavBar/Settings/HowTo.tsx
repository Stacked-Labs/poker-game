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
    Code,
} from '@chakra-ui/react';

const SECTION_LABEL_PROPS = {
    fontSize: '2xs' as const,
    color: 'text.secondary',
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

const ActionChip = ({
    bg,
    color = 'white',
    children,
}: {
    bg: string;
    color?: string;
    children: React.ReactNode;
}) => (
    <Code
        bg={bg}
        color={color}
        px={2.5}
        py={1}
        borderRadius="6px"
        fontWeight={700}
        fontSize="xs"
        letterSpacing="0.02em"
        boxShadow="inset 0 1px 0 rgba(255,255,255,0.18)"
    >
        {children}
    </Code>
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
                            No email, no password, no KYC. Your wallet{' '}
                            <Text as="span" color="text.muted">
                                is
                            </Text>{' '}
                            your account.
                        </Text>
                        <UnorderedList
                            spacing={2.5}
                            color="text.secondary"
                            styleType="none"
                            ml={0}
                        >
                            <ListItem>
                                <TitleText>Already have a wallet</TitleText>{' '}
                                <Text as="span" color="text.muted">
                                    — connect MetaMask, Coinbase Wallet, Rabby,
                                    or any WalletConnect option
                                </Text>
                            </ListItem>
                            <ListItem>
                                <TitleText>New to crypto</TitleText>{' '}
                                <Text as="span" color="text.muted">
                                    — sign in with Google, Discord, X, Apple,
                                    or email; thirdweb spins up a wallet for
                                    you
                                </Text>
                            </ListItem>
                            <ListItem>
                                <TitleText>Sign the message</TitleText>{' '}
                                <Text as="span" color="text.muted">
                                    — a one-time signature proves the wallet is
                                    yours. Free, gasless, no transaction
                                </Text>
                            </ListItem>
                        </UnorderedList>
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
                            Real-money tables run in <TitleText>USDC</TitleText>{' '}
                            on <TitleText>Base</TitleText>. At the table,
                            balances are denominated in chips so the math reads
                            cleanly.
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
                                    — fixed. No volatility, no conversion games
                                </Text>
                            </ListItem>
                            <ListItem>
                                <TitleText>Custody is onchain</TitleText>{' '}
                                <Text as="span" color="text.muted">
                                    — every table is its own smart contract.
                                    Your USDC sits there, not in a Stacked
                                    bank account
                                </Text>
                            </ListItem>
                            <ListItem>
                                <TitleText>The contract pays winners</TitleText>{' '}
                                <Text as="span" color="text.muted">
                                    — settlement is automatic when a hand ends.
                                    We deal the cards; the contract holds the
                                    cash
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
                            You need USDC on Base in your wallet. Bridge or
                            send it from any exchange that supports Base.
                        </Text>
                        <OrderedList spacing={2.5} color="text.secondary">
                            <ListItem>
                                <TitleText>Pick a seat</TitleText>{' '}
                                <Text as="span" color="text.muted">
                                    — tap an empty seat at the table
                                </Text>
                            </ListItem>
                            <ListItem>
                                <TitleText>Choose your buy-in</TitleText>{' '}
                                <Text as="span" color="text.muted">
                                    — within the host&apos;s min/max range
                                </Text>
                            </ListItem>
                            <ListItem>
                                <TitleText>Approve once, deposit</TitleText>{' '}
                                <Text as="span" color="text.muted">
                                    — first time at a contract you approve USDC
                                    spend, then deposit. After that, just
                                    deposit
                                </Text>
                            </ListItem>
                            <ListItem>
                                <TitleText>Get dealt in</TitleText>{' '}
                                <Text as="span" color="text.muted">
                                    — once the host approves your seat request,
                                    you&apos;re live
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
                            Withdrawals settle onchain. No review queue, no
                            holds, no &ldquo;contact support.&rdquo;
                        </Text>
                        <OrderedList spacing={2.5} color="text.secondary">
                            <ListItem>
                                <TitleText>Stand up</TitleText>{' '}
                                <Text as="span" color="text.muted">
                                    — leave your seat. You can&apos;t withdraw
                                    while playing a hand
                                </Text>
                            </ListItem>
                            <ListItem>
                                <TitleText>Wait for settlement</TitleText>{' '}
                                <Text as="span" color="text.muted">
                                    — the contract finalizes the last hand.
                                    Usually a few seconds; the Withdraw modal
                                    polls automatically
                                </Text>
                            </ListItem>
                            <ListItem>
                                <TitleText>Hit Withdraw</TitleText>{' '}
                                <Text as="span" color="text.muted">
                                    — chips convert back to USDC and land in
                                    your wallet on Base
                                </Text>
                            </ListItem>
                        </OrderedList>
                        <Text
                            mt={3}
                            color="text.muted"
                            fontSize="xs"
                            lineHeight="tall"
                        >
                            <TitleText>Emergency Withdraw</TitleText> is the
                            backup path — use it if a table gets stuck and the
                            normal flow won&apos;t resolve. Funds still come
                            from the same contract; you keep what&apos;s yours.
                        </Text>
                    </AccordionPanel>
                </AccordionItem>

                <SectionHeader label="AT THE TABLE" />

                <AccordionItem {...ITEM_CHROME} mb={2}>
                    <ItemHeader title="Joining vs hosting" />
                    <AccordionPanel pb={4} px={4} pt={1}>
                        <UnorderedList
                            spacing={2.5}
                            color="text.secondary"
                            styleType="none"
                            ml={0}
                        >
                            <ListItem>
                                <TitleText>Joining</TitleText>{' '}
                                <Text as="span" color="text.muted">
                                    — pick an empty seat, request a sit-down,
                                    wait for the host to wave you in
                                </Text>
                            </ListItem>
                            <ListItem>
                                <TitleText>Hosting</TitleText>{' '}
                                <Text as="span" color="text.muted">
                                    — set the blinds, min/max buy-in, and table
                                    size. You approve seat requests, kick if
                                    needed, and start the game when the crew is
                                    ready
                                </Text>
                            </ListItem>
                            <ListItem>
                                <TitleText>Host rewards</TitleText>{' '}
                                <Text as="span" color="text.muted">
                                    — running the table earns you a share of
                                    the rake. Collect anytime from the
                                    Withdraw panel
                                </Text>
                            </ListItem>
                        </UnorderedList>
                    </AccordionPanel>
                </AccordionItem>

                <AccordionItem {...ITEM_CHROME} mb={2}>
                    <ItemHeader title="Action grammar" />
                    <AccordionPanel pb={4} px={4} pt={1}>
                        <UnorderedList
                            spacing={2.5}
                            color="text.secondary"
                            styleType="none"
                            ml={0}
                        >
                            <ListItem>
                                <ActionChip bg="brand.pink">Fold</ActionChip>{' '}
                                <Text as="span" color="text.muted">
                                    — give up the hand
                                </Text>
                            </ListItem>
                            <ListItem>
                                <ActionChip bg="brand.navy">Check</ActionChip>{' '}
                                <Text as="span" color="text.muted">
                                    — pass when no bet is owed
                                </Text>
                            </ListItem>
                            <ListItem>
                                <ActionChip
                                    bg="brand.yellow"
                                    color="brand.darkNavy"
                                >
                                    Call
                                </ActionChip>{' '}
                                <Text as="span" color="text.muted">
                                    — match the current bet
                                </Text>
                            </ListItem>
                            <ListItem>
                                <ActionChip bg="brand.green">Raise</ActionChip>{' '}
                                <Text as="span" color="text.muted">
                                    — push the bet up
                                </Text>
                            </ListItem>
                            <ListItem>
                                <ActionChip bg="brand.pink">All-In</ActionChip>{' '}
                                <Text as="span" color="text.muted">
                                    — every chip you have left, on the line
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
