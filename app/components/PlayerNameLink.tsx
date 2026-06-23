import { Link, Text, TextProps } from '@chakra-ui/react';
import { buildExplorerUrls } from '@/app/hooks/useExplorerUrl';
import { resolvePlayerIdentity } from '@/app/utils/address';

interface PlayerNameLinkProps extends TextProps {
    username: string | null | undefined;
    /** Full wallet, when known — enables the explorer link for wallet identities. */
    address?: string | null;
    /** Table chain (e.g. "base"), for building the explorer URL. */
    chain?: string | null;
}

// The outbound link for a player identity: X profile for @handles, block explorer
// for wallets (when the chain is known), nothing for chosen nicknames. Shared so
// the seat and chat link the same way.
export function playerIdentityHref(
    username: string | null | undefined,
    address?: string | null,
    chain?: string | null
): string | null {
    const id = resolvePlayerIdentity(username, address);
    if (id.kind === 'x') return `https://x.com/${id.handle}`;
    if (id.kind === 'wallet') return buildExplorerUrls(chain).address(id.address);
    return null;
}

// Default text color is set on the inner <Text> directly (Chakra Text
// baseStyle's hardcoded `charcoal.800` wins via cascade if we don't —
// invisible in dark mode). Consumers can still override via textProps
// since the spread comes after the default color.
export const PlayerNameLink = ({
    username,
    address,
    chain,
    ...textProps
}: PlayerNameLinkProps) => {
    const { label } = resolvePlayerIdentity(username, address);
    const href = playerIdentityHref(username, address, chain);

    if (!href) {
        return (
            <Text as="span" color="text.primary" {...textProps}>
                {label}
            </Text>
        );
    }

    return (
        <Link
            href={href}
            isExternal
            onClick={(e) => e.stopPropagation()}
            _hover={{ textDecoration: 'none' }}
            display="inline"
        >
            <Text
                as="span"
                color="text.primary"
                {...textProps}
                _hover={{
                    textDecoration: 'underline',
                    textDecorationThickness: '1.5px',
                    textUnderlineOffset: '3px',
                }}
                transition="text-decoration-color 80ms ease"
                cursor="pointer"
            >
                {label}
            </Text>
        </Link>
    );
};

export default PlayerNameLink;
