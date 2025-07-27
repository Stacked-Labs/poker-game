import { Flex, Tooltip, useClipboard } from '@chakra-ui/react';
import { FaCopy } from 'react-icons/fa';

const CopyLinkButton = ({ link }: { link: string | null }) => {
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
                bg="green.500"
                onClick={onCopy}
                height={'100%'}
                cursor={'pointer'}
                justifyContent={'center'}
                alignItems={'center'}
                _hover={{
                    bg: 'green.400',
                }}
                transition="all 0.2s"
            >
                <FaCopy color="white" />
            </Flex>
        </Tooltip>
    );
};

export default CopyLinkButton;
