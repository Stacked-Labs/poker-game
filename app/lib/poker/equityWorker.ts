import { calculateEquity, EquityInput, EquityResult } from './equityCalculator';

export type EquityWorkerRequest = {
    players: EquityInput[];
    board: number[];
    iterations?: number;
};

export type EquityWorkerResponse = {
    results: EquityResult[];
};

const ctx = self as unknown as Worker;

ctx.onmessage = (e: MessageEvent<EquityWorkerRequest>) => {
    const { players, board, iterations } = e.data;
    const results = calculateEquity(players, board, iterations);
    ctx.postMessage({ results } satisfies EquityWorkerResponse);
};
