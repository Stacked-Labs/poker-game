import { Player } from '../interfaces';

// for testing only
const makeid = () => {
    const length = 10;
    let result = '';
    const characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
        );
        counter += 1;
    }
    return result;
};

export const players: Player[] = [
    { username: 'John', address: makeid(), position: 0, amount: 0 },
    { username: 'George', address: makeid(), position: 0, amount: 0 },
    { username: 'Sam', address: makeid(), position: 0, amount: 0 },
    { username: 'Alice', address: makeid(), position: 0, amount: 0 },
];
