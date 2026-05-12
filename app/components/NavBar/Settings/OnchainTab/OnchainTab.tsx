'use client';

import { useContext, useMemo } from 'react';
import { Flex, Text } from '@chakra-ui/react';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import {
    CHAIN_CONFIG,
    defaultChain,
    defaultUsdcAddress,
} from '@/app/thirdwebclient';
import { useExplorerUrl } from '@/app/hooks/useExplorerUrl';
import { useOnchainTableSnapshot } from '@/app/hooks/useOnchainTableSnapshot';
import { useOnchainTableEvents } from '@/app/hooks/useOnchainTableEvents';
import ContractIdentityCard from './ContractIdentityCard';
import CustodySnapshotCard from './CustodySnapshotCard';
import SettlementHealthCard from './SettlementHealthCard';
import SeatedPlayersList from './SeatedPlayersList';
import RakeSummaryCard from './RakeSummaryCard';
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
        appState.game?.players?.some(
            (p) => p.uuid === appState.clientID
        )
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
        loadMore,
    } = useOnchainTableEvents(contractAddress, chain, isActive);

    const blockTimes = useMemo(() => new Map<string, number>(), []);

    if (!contractAddress || !config?.crypto) {
        return (
            <Flex justify="center" py={8}>
                <Text fontSize="sm" color="text.muted">
                    Onchain details are only available on real-money tables.
                </Text>
            </Flex>
        );
    }

    return (
        <Flex direction="column" gap={{ base: 3, md: 4 }}>
            <ContractIdentityCard
                contractAddress={contractAddress}
                gameCreator={snapshot?.gameCreator ?? config.ownerAddress ?? null}
                chain={chainName}
                contractExplorerUrl={explorer.address(contractAddress)}
                creatorExplorerUrl={
                    (snapshot?.gameCreator ?? config.ownerAddress)
                        ? explorer.address(
                              snapshot?.gameCreator ?? (config.ownerAddress as string)
                          )
                        : null
                }
            />
            <CustodySnapshotCard
                contractUsdcBalance={snapshot?.contractUsdcBalance ?? null}
                players={snapshot?.players ?? null}
                loading={snapshotLoading}
            />
            <SettlementHealthCard
                lastSettlement={snapshot?.lastSettlement ?? null}
                contractAddress={contractAddress}
                chain={chain}
                isUserSeated={isUserSeated}
            />
            <SeatedPlayersList
                players={snapshot?.players ?? null}
                explorerFor={(addr) => explorer.address(addr)}
            />
            <RakeSummaryCard
                hostWithdrawable={snapshot?.hostWithdrawable ?? null}
                events={events}
                loading={snapshotLoading || eventsInitialLoading}
            />
            <TransactionHistoryList
                events={events}
                loading={eventsLoading}
                initialLoading={eventsInitialLoading}
                error={eventsError}
                hasMore={hasMore}
                onLoadMore={loadMore}
                explorerForTx={(hash) => explorer.tx(hash)}
                blockTimes={blockTimes}
            />
        </Flex>
    );
};

export default OnchainTab;
