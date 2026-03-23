import { test, expect } from './fixtures-wallet';

// Anvil account #0 — deterministic address for TEST_PK_A
const PLAYER_A_ADDRESS = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266';

test('Mock wallet auto-connects via EIP-6963', async ({ playerA }) => {
    const address = await playerA
        .locator('[data-testid="wallet-connected"]')
        .getAttribute('data-address');

    expect(address?.toLowerCase()).toBe(PLAYER_A_ADDRESS);
});
