import { Flex, Tooltip, useClipboard } from '@chakra-ui/react';
import { FaCopy } from 'react-icons/fa';

const CopyLinkButton = ({
    link,
    // bg,
}: {
    link: string | null;
    // bg: string | null;
}) => {
    const { hasCopied, onCopy } = useClipboard(link || '');

    if (!link) {
        return null;
    }

    return (
        <Tooltip
            label={hasCopied ? 'Copied!' : 'Copy to clipboard'}
            closeOnClick={false}
            height={'100%'}
        >
            <Flex
                onClick={onCopy}
                height={'100%'}
                cursor={'pointer'}
                justifyContent={'center'}
                alignItems={'center'}
                color="white"
                _hover={{
                    color: 'lightgrey',
                }}
            >
                <FaCopy />
            </Flex>
        </Tooltip>
    );
};

export default CopyLinkButton;
