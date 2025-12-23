import { FAQ } from '../interfaces';

export const FAQs: FAQ[] = [
    {
        question: 'How can I get in touch with you?',
        answer: 'The best place to reach us, get support, or chat with the community is our Discord server. We’re building Stacked with the community and would love your feedback directly.',
    },
    {
        question: 'Why choose Stacked?',
        answer: 'Stacked is built for players who want instant action without the friction of traditional sites. We offer trustless play (funds held by smart contracts, not us), a no-download browser experience, and a “Banker” system that lets hosts earn revenue for running games—whether you’re playing for free or wagering crypto.',
    },
    {
        question: 'Where can I learn more?',
        answer: 'You can find our roadmap, game rules, and technical architecture in the docs: https://docs.stackedpoker.io',
    },
    {
        question: 'Do I need to download an app or create an account to play?',
        answer: 'No. Stacked is 100% browser-based, so you can play on phone, tablet, or laptop without downloads. You can also jump in with Free Play—no sign-in, email, or wallet connection required.',
    },
    {
        question: 'Which blockchain and tokens do you use for real-money games?',
        answer: 'We’re launching on Base using USDC. Base keeps fees low and confirmations fast, so gameplay stays smooth and affordable. More tokens may come later, but real-money tables currently use USDC on Base.',
    },
    {
        question: "I’m new to crypto. How do I connect a wallet?",
        answer: 'We use Thirdweb to make connecting simple. You can sign in with Google, Discord, or X and it automatically creates a secure wallet, or you can connect a wallet like MetaMask, Rabby, or Coinbase Wallet.',
    },
    {
        question: 'How does the “Banker” system work — can I earn from it?',
        answer: 'Yes. When you create and host a table, you become the Banker. As a reward for organizing the game and bringing players together, you earn a substantial portion of the table’s fees directly to your wallet.',
    },
    {
        question: 'Is my money safe while I play?',
        answer: 'Stacked uses a trustless smart contract system. When you buy in with USDC, funds are held in a smart contract on Base—not a company bank account. Payouts are handled automatically so winners are paid out instantly and fairly without human intervention.',
    },
];
