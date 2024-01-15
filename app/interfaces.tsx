export type Card = string;

export type Player = {
    username: string;
    address: string;
    position: number;
	amount: number;
    // seatID: number;
    // ready: boolean;
    // in: boolean;
    // called: boolean;
    // left: boolean;
    // totalBuyIn: number;
    // bet: number;
    // totalBet: number;
    // cards: Card[];
};

export type User = {
    address: string;
    username?: string;
    amount?: number;
};