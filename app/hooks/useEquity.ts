import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppContext } from '../contexts/AppStoreProvider';
import type {
    EquityWorkerRequest,
    EquityWorkerResponse,
} from '../lib/poker/equityWorker';

type EquityMap = Map<string, number>;

/**
 * Computes live equity for all players with visible hole cards during
 * all-in / showdown scenarios. Returns null when equity should not be shown.
 *
 * Runs a Monte Carlo simulation in a Web Worker so the main thread stays free.
 */
export function useEquity(): EquityMap | null {
    const { appState } = useContext(AppContext);
    const [equityMap, setEquityMap] = useState<EquityMap | null>(null);
    const workerRef = useRef<Worker | null>(null);

    const game = appState.game;

    // Determine whether we should be calculating equity right now.
    // Conditions:
    //  - Game is running
    //  - Betting is over (all-in or showdown)
    //  - No winners determined yet (once winningPlayerNums is populated, hide equity)
    //  - At least 2 players still in with both hole cards visible
    const calculationInput = useMemo(() => {
        if (!game || !game.running || game.betting) {
            return null;
        }

        // Check if winners have already been determined
        const hasWinners = game.pots.some(
            (pot) => pot.winningPlayerNums && pot.winningPlayerNums.length > 0
        );
        if (hasWinners) return null;

        // Collect players with visible hole cards who are still in
        const eligiblePlayers: { uuid: string; hole: number[] }[] = [];
        for (const p of game.players) {
            if (!p.in) continue;
            const c0 = Number(p.cards[0]);
            const c1 = Number(p.cards[1]);
            if (c0 > 0 && c1 > 0) {
                eligiblePlayers.push({ uuid: p.uuid, hole: [c0, c1] });
            }
        }

        if (eligiblePlayers.length < 2) return null;

        // Collect known community cards
        const board = (game.communityCards || [])
            .map((c) => Number(c))
            .filter((c) => c > 0);

        return { players: eligiblePlayers, board };
    }, [game]);

    // Stable serialization key so we only post to the worker when inputs change
    const inputKey = useMemo(() => {
        if (!calculationInput) return null;
        return JSON.stringify(calculationInput);
    }, [calculationInput]);

    // Manage worker lifecycle
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const worker = new Worker(
            new URL('../lib/poker/equityWorker.ts', import.meta.url)
        );
        workerRef.current = worker;

        worker.onmessage = (e: MessageEvent<EquityWorkerResponse>) => {
            const map = new Map<string, number>();
            for (const r of e.data.results) {
                map.set(r.uuid, r.equity);
            }
            setEquityMap(map);
        };

        return () => {
            worker.terminate();
            workerRef.current = null;
        };
    }, []);

    // Post calculation requests to the worker when inputs change
    useEffect(() => {
        if (!inputKey || !workerRef.current) {
            setEquityMap(null);
            return;
        }

        const parsed = JSON.parse(inputKey) as {
            players: { uuid: string; hole: number[] }[];
            board: number[];
        };

        const msg: EquityWorkerRequest = {
            players: parsed.players,
            board: parsed.board,
            iterations: 2000,
        };

        workerRef.current.postMessage(msg);
    }, [inputKey]);

    return equityMap;
}
