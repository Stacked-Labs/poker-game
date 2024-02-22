import { Card } from '../interfaces';

const types: string[] = ['club', 'spades', 'diamond', 'heart'];
const values: string[] = [
	'ace',
	'2',
	'3',
	'4',
	'5',
	'6',
	'7',
	'8',
	'9',
	'10',
	'jack',
	'queen',
	'king',
];

const generateRandomCard = () => {
	const newCard: Card = {
		type: types[Math.floor(Math.random() * types.length)],
		value: values[Math.floor(Math.random() * values.length)],
	};

	return newCard;
};

export const getCommunityCards = () => {
	const cards: Card[] = new Array(5);

	for (let i = 0; i < cards.length; i++) {
		const newCard: Card = generateRandomCard();
		if (!cards.includes(newCard)) {
			cards[i] = newCard;
		}
	}

	return cards;
};
