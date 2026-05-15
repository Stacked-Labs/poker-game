'use client';

import { useContext, useMemo } from 'react';
import { Flex, Grid, Text } from '@chakra-ui/react';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import {
    CHAIN_CONFIG,
    defaultChain,
    defaultUsdcAddress,
} from '@/app/thirdwebclient';
import { useExplorerUrl } from '@/app/hooks/useExplorerUrl';
import { useOnchainTableSnapshot } from '@/app/hooks/useOnchainTableSnapshot';
import { useOnchainTableEvents } from '@/app/hooks/useOnchainTableEvents';
import FactsPanel from './FactsPanel';
import SeatedPlayersList from './SeatedPlayersList';
import TransactionHistoryList from './TransactionHistoryList';

interface OnchainTabProps {
    isActive: boolean;
}

const OnchainTab = ({ isActive }: OnchainTabProps) => {
    const { appState } = useContext(AppContext);
    const config = appState.game?.config;
    const contractAddress = config?.contractAddress;
    const chainName = config?.chain;

    const { chain, usdc } = useMemo(() => {
        const key = chainName?.toLowerCase().replace(/\s+/g, '-') ?? '';
        const entry = CHAIN_CONFIG[key];
        return {
            chain: entry?.chain ?? defaultChain,
            usdc: entry?.usdc ?? defaultUsdcAddress,
        };
    }, [chainName]);

    const explorer = useExplorerUrl(chainName);

    const isUserSeated = Boolean(
        appState.game?.players?.some((p) => p.uuid === appState.clientID)
    );

    const { snapshot, loading: snapshotLoading } = useOnchainTableSnapshot(
        contractAddress,
        chain,
        usdc,
        isActive
    );

    const {
        events,
        loading: eventsLoading,
        initialLoading: eventsInitialLoading,
        error: eventsError,
        hasMore,
        scanLimitReached,
        loadMore,
    } = useOnchainTableEvents(contractAddress, chain, isActive);

    if (!contractAddress || !config?.crypto) {
        return (
            <Flex justify="center" py={8}>
                <Text fontSize="sm" color="text.muted">
                    Onchain details are only available on real-money tables.
                </Text>
            </Flex>
        );
    }

    const creator = snapshot?.gameCreator ?? config.ownerAddress ?? null;

    return (
        <Grid
            templateColumns={{ base: '1fr', lg: 'minmax(300px, 360px) 1fr' }}
            gap={{ base: 3, md: 4 }}
            alignItems="start"
        >
            <FactsPanel
                contractAddress={contractAddress}
                chain={chain}
                chainName={chainName}
                gameCreator={creator}
                contractExplorerUrl={explorer.address(contractAddress)}
                creatorExplorerUrl={
                    creator ? explorer.address(creator) : null
                }
                contractUsdcBalance={snapshot?.contractUsdcBalance ?? null}
                hostWithdrawable={snapshot?.hostWithdrawable ?? null}
                players={snapshot?.players ?? null}
                lastSettlement={snapshot?.lastSettlement ?? null}
                snapshotLoading={snapshotLoading}
                isUserSeated={isUserSeated}
            />
            <Flex direction="column" gap={{ base: 3, md: 4 }} minW={0}>
                <SeatedPlayersList
                    players={snapshot?.players ?? null}
                    explorerFor={(addr) => explorer.address(addr)}
                />
                <TransactionHistoryList
                    events={events}
                    loading={eventsLoading}
                    initialLoading={eventsInitialLoading}
                    error={eventsError}
                    hasMore={hasMore}
                    scanLimitReached={scanLimitReached}
                    contractExplorerUrl={explorer.address(contractAddress)}
                    onLoadMore={loadMore}
                    explorerForTx={(hash) => explorer.tx(hash)}
                />
            </Flex>
        </Grid>
    );
};

export default OnchainTab;
