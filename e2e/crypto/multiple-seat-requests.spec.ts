import { test, expect } from '../fixtures-wallet';
import { setupCryptoGameThreePlayers } from '../helpers/common';

const PK_A = process.env.TEST_CRYPTO_PK_A as string;
const PK_B = process.env.TEST_CRYPTO_PK_B as string;
const PK_C = process.env.TEST_CRYPTO_PK_C as string;

test('Crypto: owner accepts multiple seat requests — all players seated', async ({
    cryptoPlayerA,
    cryptoPlayerB,
    cryptoPlayerC,
}) => {
    await setupCryptoGameThreePlayers(
        cryptoPlayerA, cryptoPlayerB, cryptoPlayerC,
        PK_A, PK_B, PK_C
    );

    // Verify all three seats taken on owner's screen
    await cryptoPlayerA.getByTestId('taken-seat-1').waitFor({ state: 'visible', timeout: 5_000 });
    await cryptoPlayerA.getByTestId('taken-seat-2').waitFor({ state: 'visible', timeout: 5_000 });
    await cryptoPlayerA.getByTestId('taken-seat-3').waitFor({ state: 'visible', timeout: 5_000 });
});
