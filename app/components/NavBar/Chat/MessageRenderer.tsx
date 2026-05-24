import { Box, Text, Tooltip } from '@chakra-ui/react';
import type { ChatToken } from '@/app/utils/chatTokenizer';

const MessageRenderer = ({
    tokens,
    textColor,
    mentionColor,
}: {
    tokens: ChatToken[];
    textColor?: string;
    mentionColor?: string;
}) => {
    return (
        <>
            {tokens.map((token, index) => {
                if (token.type === 'emote') {
                    return (
                        <Tooltip
                            key={`emote-${index}`}
                            label={`:${token.name}:`}
                            placement="top"
                            hasArrow
                            fontSize="xs"
                            px={2}
                            py={1}
                            borderRadius="md"
                            openDelay={150}
                        >
                            <Box
                                as="img"
                                src={token.url}
                                alt={token.name}
                                minHeight={{ base: '26px', md: '32px' }}
                                minWidth={{ base: '26px', md: '32px' }}
                                maxWidth={{ base: '60px', md: '80px' }}
                                display="inline-block"
                                verticalAlign="middle"
                                loading="lazy"
                                decoding="async"
                            />
                        </Tooltip>
                    );
                }

                if (token.type === 'mention') {
                    return (
                        <Text
                            as="span"
                            key={`mention-${index}`}
                            color={mentionColor ?? 'brand.green'}
                            fontWeight="semibold"
                        >
                            @{token.username}
                        </Text>
                    );
                }

                return (
                    <Text
                        as="span"
                        key={`text-${index}`}
                        color={textColor ?? 'text.primary'}
                    >
                        {token.content}
                    </Text>
                );
            })}
        </>
    );
};

export default MessageRenderer;
