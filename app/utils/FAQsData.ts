import { FAQ } from '../interfaces';

export const FAQs: FAQ[] = [
    {
        question: 'How can I get in touch with you?',
        answer: 'The best place to reach us, get support, or chat with the community is our Discord server. We’re building Stacked with the community and would love your feedback directly.',
    },
    {
        question: 'Why choose Stacked?',
        answer: 'Stacked is built for players who want to sit down and play, fast. No hoops, no waiting. Funds are held by smart contracts (not us), there’s nothing to download, and the player who hosts a table earns a cut for running it, whether you’re playing Free Play or staking real USDC.',
    },
    {
        question: 'Where can I learn more?',
        answer: 'You can find our roadmap, game rules, and technical architecture in the docs: https://docs.stackedpoker.io/',
    },
    {
        question: 'Do I need to download an app or create an account to play?',
        answer: 'No. Stacked is 100% browser-based, so you can play on phone, tablet, or laptop without downloads. You can also jump in with Free Play, with no sign-in, email, or wallet connection required.',
    },
    {
        question: 'Which blockchain and tokens do you use for real-money games?',
        answer: 'We’re launching on Base using USDC. Base keeps fees low and confirmations fast, so gameplay stays smooth and affordable. More tokens may come later, but real-money tables currently use USDC on Base.',
    },
    {
        question: "I’m new to crypto. How do I connect a wallet?",
        answer: 'Connecting is simple. Sign in with Google, Discord, or X and a secure wallet is created for you automatically, or connect a wallet like MetaMask, Rabby, or Coinbase Wallet.',
    },
    {
        question: 'How does hosting work, and can I earn from it?',
        answer: 'Yes. Create a table and you become the Host. For running the game and pulling players together, you earn a quarter of the platform fee, about 1% of every pot, straight to your wallet.',
    },
    {
        question: 'Is my money safe while I play?',
        answer: 'Stacked uses a trustless smart contract system. When you buy in with USDC, funds are held in a smart contract on Base, not a company bank account. Payouts are handled automatically so winners are paid out instantly and fairly without human intervention.',
    },
    {
        question: 'Can my account get frozen?',
        answer: 'No. Your funds live in your wallet and the table’s smart contract. We don’t have a “freeze” button. Withdrawals settle onchain on Base. We can’t gate them, delay them, or close them on a Friday night.',
    },
    {
        question: 'How is this different from CoinPoker / PokerStars?',
        answer: 'Stacked is the only one built on Base with USDC stakes and zero signup. CoinPoker uses their own token. PokerStars wants your ID and a download. Stacked: open the link, connect a wallet, play. Your funds stay in your control the whole time.',
    },
];
