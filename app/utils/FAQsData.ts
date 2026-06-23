import { FAQ } from '../interfaces';

export const FAQs: FAQ[] = [
    {
        question: 'Do I need to download an app or create an account to play?',
        answer: 'No. Stacked runs entirely in your browser on phone, tablet, or laptop, with nothing to download. You can jump straight into Free Play with no sign-in, email, or wallet.',
    },
    {
        question: 'I’m new to crypto. How do I connect a wallet?',
        answer: 'Sign in with Google, Discord, or X and a secure wallet is created for you automatically, or connect your own, like MetaMask, Rabby, or Coinbase Wallet.',
    },
    {
        question: 'Is my money safe, and what does it run on?',
        answer: 'Real-money tables use USDC on Base, a network with low fees and fast confirmations. When you buy in, your funds are held in a smart contract on Base, not a company bank account, and the contract pays the winner, not us.',
    },
    {
        question: 'What if a payout gets stuck?',
        answer: 'Cash-outs typically land in under 5 seconds. If settlement ever stalls, a 24-hour emergency self-withdraw lets you pull your funds straight from the table contract yourself, with no ticket, no support queue, and no one who can hold them.',
    },
    {
        question: 'Can my account get frozen?',
        answer: 'No. Your funds live in your wallet and the table’s smart contract. We don’t have a “freeze” button. Withdrawals settle onchain on Base, so we can’t gate them, delay them, or close them on a Friday night.',
    },
    {
        question: 'How can I get in touch with you?',
        answer: 'The best place to reach us, get support, or chat with the community is our Discord server. We’re building Stacked with the community and would love your feedback directly.',
    },
];
