'use client';

import { Box, Button, Flex, Heading, Icon, Text } from '@chakra-ui/react';
import { FiCompass } from 'react-icons/fi';
import Link from 'next/link';

export default function NotFound() {
    return (
        <Flex
            minH="100vh"
            align="center"
            justify="center"
            bg="bg.default"
            px={4}
        >
            <Box
                bg="card.white"
                borderRadius="20px"
                p={{ base: 6, md: 10 }}
                maxW="440px"
                w="100%"
                textAlign="center"
                border="1px solid"
                borderColor="border.lightGray"
            >
                <Flex
                    mx="auto"
                    mb={5}
                    w="56px"
                    h="56px"
                    borderRadius="14px"
                    bg="rgba(54, 163, 123, 0.08)"
                    align="center"
                    justify="center"
                >
                    <Icon as={FiCompass} boxSize={6} color="brand.green" />
                </Flex>
                <Heading size="lg" color="text.primary" mb={2}>
                    Page not found
                </Heading>
                <Text color="text.secondary" mb={8} fontSize="sm">
                    The page you&apos;re looking for doesn&apos;t exist or has
                    moved.
                </Text>
                <Button
                    as={Link}
                    href="/"
                    variant="tactilePrimary"
                    size="lg"
                    w="100%"
                    borderRadius="14px"
                    h="52px"
                >
                    Back to lobby
                </Button>
            </Box>
        </Flex>
    );
}
