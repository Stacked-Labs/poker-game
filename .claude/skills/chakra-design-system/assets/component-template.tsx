'use client';

import { Box, Flex, Text } from '@chakra-ui/react';

export type ComponentTemplateProps = {
    title: string;
    subtitle?: string;
};

export default function ComponentTemplate({
    title,
    subtitle,
}: ComponentTemplateProps) {
    return (
        <Flex
            direction="column"
            gap={2}
            p={4}
            borderRadius="lg"
            bg="card.white"
            color="text.primary"
            border="1px solid"
            borderColor="chat.border"
        >
            <Text fontSize="lg" fontWeight="bold">
                {title}
            </Text>
            {subtitle ? (
                <Text fontSize="sm" color="text.secondary">
                    {subtitle}
                </Text>
            ) : null}
            <Box />
        </Flex>
    );
}

