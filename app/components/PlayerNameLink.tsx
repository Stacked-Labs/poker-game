import { Link, Text, TextProps } from '@chakra-ui/react';

interface PlayerNameLinkProps extends TextProps {
    username: string | null | undefined;
}

// Default text color is set on the inner <Text> directly (Chakra Text
// baseStyle's hardcoded `charcoal.800` wins via cascade if we don't —
// invisible in dark mode). Consumers can still override via textProps
// since the spread comes after the default color.
export const PlayerNameLink = ({
    username,
    ...textProps
}: PlayerNameLinkProps) => {
    const name = username ?? '';
    const isX = name.startsWith('@');

    if (!isX) {
        return (
            <Text as="span" color="text.primary" {...textProps}>
                {name}
            </Text>
        );
    }

    const handle = name.replace(/^@/, '');
    return (
        <Link
            href={`https://x.com/${handle}`}
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
                {name}
            </Text>
        </Link>
    );
};

export default PlayerNameLink;
