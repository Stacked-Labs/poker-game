import { Dispatch, SetStateAction } from 'react';

export interface User {
	name: string;
	amount: number;
	seatedAt: number | null;
}

export interface EmptySeatButtonProps {
	seats: Seat[];
	handleSetSeats: React.Dispatch<React.SetStateAction<Seat[]>>;
	seatIndex: number;
}
export interface Player {
	id?: number;
	name: string;
	earnings: number;
}

export interface Seat {
	player: Player | null;
}

export interface SideBarChatProps {
	handleOpen: Dispatch<SetStateAction<boolean>>;
}
