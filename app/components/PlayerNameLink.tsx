import { Link, Text, TextProps } from '@chakra-ui/react';

interface PlayerNameLinkProps extends TextProps {
    username: string | null | undefined;
}

export const PlayerNameLink = ({
    username,
    ...textProps
}: PlayerNameLinkProps) => {
    const name = username ?? '';
    const isX = name.startsWith('@');

    if (!isX) {
        return <Text as="span" {...textProps}>{name}</Text>;
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
                _hover={{ color: 'brand.green' }}
                transition="color 0.15s ease"
                {...textProps}
            >
                {name}
            </Text>
        </Link>
    );
};

export default PlayerNameLink;
