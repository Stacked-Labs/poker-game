'use client';

import React from 'react';
import { Box, Grid, GridItem, VStack } from '@chakra-ui/react';
import type { Account } from 'thirdweb/wallets';
import type { SBTInfo } from '@/app/hooks/server_actions';
import BadgeArtifact from './BadgeArtifact';
import BadgeNarrative from './BadgeNarrative';
import ClaimActionPanel from './ClaimActionPanel';

interface ClaimCardProps {
    account: Account | undefined;
    eligibility: { eligible: boolean; claimed: boolean } | null;
    claiming: boolean;
    onClaim: () => void;
    sbtInfo: SBTInfo | null;
    justClaimed?: boolean;
}

const FALLBACK_IMAGE = '/previews/sbt_fallback.png';
const FALLBACK_NAME = 'Stacked Poker Badge';

type ActionState =
    | 'no-wallet'
    | 'loading'
    | 'eligible'
    | 'claimed'
    | 'just-claimed'
    | 'not-eligible';

const resolveState = (
    account: Account | undefined,
    eligibility: ClaimCardProps['eligibility'],
    justClaimed: boolean,
): ActionState => {
    if (!account) return 'no-wallet';
    if (eligibility === null) return 'loading';
    if (eligibility.claimed) return justClaimed ? 'just-claimed' : 'claimed';
    if (eligibility.eligible) return 'eligible';
    return 'not-eligible';
};

const ClaimCard: React.FC<ClaimCardProps> = ({
    account,
    eligibility,
    claiming,
    onClaim,
    sbtInfo,
    justClaimed = false,
}) => {
    const nftImage = sbtInfo?.image || FALLBACK_IMAGE;
    const nftName = sbtInfo?.name || FALLBACK_NAME;
    const explorerURL = sbtInfo?.explorerURL || null;
    const state = resolveState(account, eligibility, justClaimed);
    const claimed = state === 'claimed' || state === 'just-claimed';

    return (
        <Box
            bg="card.white"
            borderRadius="20px"
            p={{ base: 8, md: 14 }}
            boxShadow="0 20px 50px rgba(12, 21, 49, 0.10), 0 0 0 1px rgba(11, 20, 48, 0.06)"
            _dark={{ boxShadow: '0 24px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.06)' }}
        >
            <Grid
                templateColumns={{ base: '1fr', md: '380px 1fr' }}
                gap={{ base: 10, md: 16 }}
                alignItems="center"
            >
                <GridItem>
                    <BadgeArtifact
                        image={nftImage}
                        name={nftName}
                        address={account?.address}
                        explorerURL={claimed ? explorerURL : null}
                    />
                </GridItem>
                <GridItem>
                    <VStack
                        align={{ base: 'center', md: 'start' }}
                        spacing={6}
                        w="full"
                    >
                        <BadgeNarrative />
                        <ClaimActionPanel
                            state={state}
                            claiming={claiming}
                            onClaim={onClaim}
                        />
                    </VStack>
                </GridItem>
            </Grid>
        </Box>
    );
};

export default ClaimCard;
