import { Box, Text } from '@chakra-ui/react';
import type { ChatToken } from '@/app/utils/chatTokenizer';

const MessageRenderer = ({ tokens }: { tokens: ChatToken[] }) => {
    return (
        <>
            {tokens.map((token, index) => {
                if (token.type === 'emote') {
                    return (
                        <Box
                            key={`${token.id}-${index}`}
                            as="img"
                            src={token.url}
                            alt={token.name}
                            height={{ base: '32px', md: '40px' }}
                            minWidth={{ base: '32px', md: '40px' }}
                            width="auto"
                            display="inline-block"
                            verticalAlign="middle"
                            loading="lazy"
                            decoding="async"
                        />
                    );
                }

                if (token.type === 'mention') {
                    return (
                        <Text
                            as="span"
                            key={`${token.username}-${index}`}
                            color="brand.green"
                            fontWeight="semibold"
                        >
                            @{token.username}
                        </Text>
                    );
                }

                return (
                    <Text as="span" key={`${token.content}-${index}`}>
                        {token.content}
                    </Text>
                );
            })}
        </>
    );
};

export default MessageRenderer;
