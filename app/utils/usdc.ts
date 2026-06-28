// USDC is stored as micro-USDC (1 USDC = 1_000_000). Format an integer micro-amount for display:
// whole dollars when the value is exact, two decimals when there are cents — never truncating
// sub-dollar money to "$0" (e.g. 12_400_000 -> "12.40", 1_250_000_000 -> "1,250", 500_000 -> "0.50").
export function formatUsdcMicro(micro: number): string {
    const dollars = micro / 1_000_000;
    const hasCents = Math.round(dollars * 100) % 100 !== 0;
    return dollars.toLocaleString('en-US', {
        minimumFractionDigits: hasCents ? 2 : 0,
        maximumFractionDigits: 2,
    });
}
