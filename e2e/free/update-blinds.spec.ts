import { test, expect } from '@playwright/test';
import { setupFreeGameTwoPlayers, openSettingsTab } from '../helpers/common';

test('Owner updates blinds between hands', async ({ browser }) => {
    const { owner, player, ctxOwner, ctxPlayer } =
        await setupFreeGameTwoPlayers(browser);

    // ── Owner opens Settings > Settings tab ──
    await openSettingsTab(owner, 'Settings');

    // ── Owner changes small blind to 10 ──
    const sbInput = owner.getByTestId('sb-input');
    await sbInput.waitFor({ timeout: 5_000 });
    await sbInput.clear();
    await sbInput.fill('10');

    // ── Owner changes big blind to 20 ──
    const bbInput = owner.getByTestId('bb-input');
    await bbInput.clear();
    await bbInput.fill('20');

    // ── Owner confirms blind changes ──
    await owner.getByTestId('blinds-confirm-btn').click();

    // ── Close settings ──
    await owner.getByTestId('settings-close-btn').click();

    // ── Verify: blind display shows pending update ──
    await expect(owner.getByText('NEXT HAND: 10/20')).toBeVisible({ timeout: 10_000 });

    await ctxOwner.close();
    await ctxPlayer.close();
});
