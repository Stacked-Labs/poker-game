'use client';

import {
    VStack,
    Heading,
    Text,
    Button,
    Box,
    HStack,
    Icon,
    Link,
    Card,
    CardBody,
    Divider,
} from '@chakra-ui/react';
import { FaDiscord } from 'react-icons/fa';
import { FiInfo } from 'react-icons/fi';
import { RiTwitterXLine } from 'react-icons/ri';
import { keyframes } from '@emotion/react';

// Animation for the cards
const fadeInUp = keyframes`
    from { 
        opacity: 0; 
        transform: translateY(20px); 
    }
    to { 
        opacity: 1; 
        transform: translateY(0); 
    }
`;

const Support = () => {
    return (
        <VStack
            spacing={{ base: 4, md: 6 }}
            align="stretch"
            maxW="800px"
            mx="auto"
            p={{ base: 4, md: 6 }}
        >
            <Card
                variant="outline"
                bg="rgba(15, 23, 42, 0.55)"
                borderColor="rgba(255, 255, 255, 0.2)"
                borderWidth="1px"
                borderRadius="24px"
                boxShadow="0 18px 40px rgba(0, 0, 0, 0.35)"
                backdropFilter="blur(12px) saturate(140%)"
                animation={`${fadeInUp} 0.5s ease-out`}
                transition="all 0.3s ease"
            >
                <CardBody p={{ base: 5, md: 7 }}>
                    <VStack spacing={{ base: 5, md: 6 }} align="stretch">
                        <VStack spacing={{ base: 2, md: 3 }}>
                            <Text
                                fontSize="xs"
                                letterSpacing="0.08em"
                                textTransform="uppercase"
                                bg="brand.pink"
                                color="text.white"
                                px={3}
                                py={1}
                                borderRadius="999px"
                                fontWeight="bold"
                            >
                                Support Desk
                            </Text>
                            <Text
                                fontSize={{ base: 'xs', md: 'md' }}
                                color="whiteAlpha.900"
                                fontWeight="semibold"
                                textAlign="center"
                                textShadow="0 1px 2px rgba(0, 0, 0, 0.35)"
                                maxW="640px"
                                mx="auto"
                            >
                                We&apos;re here to help! Reach out to us through
                                Discord or Twitter for support with any game
                                issues or questions.
                            </Text>
                        </VStack>

                        <Divider borderColor="rgba(255, 255, 255, 0.15)" />

                        <VStack spacing={4} align="stretch">
                            <HStack spacing={3}>
                                <Box
                                    p={3}
                                    bg="#5865F2"
                                    borderRadius="12px"
                                    aspectRatio={1}
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                >
                                    <Icon
                                        as={FaDiscord}
                                        boxSize={{ base: 6, md: 8 }}
                                        color="white"
                                    />
                                </Box>
                                <Box flex={1}>
                                    <Heading
                                        as="h3"
                                        size={{ base: 'md', md: 'lg' }}
                                        color="text.white"
                                        mb={1}
                                    >
                                        Discord Support
                                    </Heading>
                                    <Text
                                        fontSize={{ base: 'sm', md: 'md' }}
                                        color="whiteAlpha.700"
                                    >
                                        Join our Discord server
                                    </Text>
                                </Box>
                            </HStack>

                            <Text
                                fontSize={{ base: 'sm', md: 'md' }}
                                color="whiteAlpha.800"
                            >
                                For game issues, bug reports, or general
                                support, please join our Discord community and
                                submit a ticket. Our team will respond as soon
                                as possible.
                            </Text>

                            <Button
                                as={Link}
                                href="https://discord.gg/347RBVcvpn"
                                target="_blank"
                                rel="noopener noreferrer"
                                size={{ base: 'md', md: 'lg' }}
                                bg="#5865F2"
                                color="white"
                                borderRadius="12px"
                                fontWeight="bold"
                                leftIcon={
                                    <Icon
                                        as={FaDiscord}
                                        boxSize={{ base: 5, md: 6 }}
                                    />
                                }
                                _hover={{
                                    bg: '#4752C4',
                                    transform: 'translateY(-2px)',
                                    boxShadow:
                                        '0 6px 16px rgba(88, 101, 242, 0.3)',
                                    textDecoration: 'none',
                                }}
                                _active={{
                                    bg: '#3C45A5',
                                }}
                                transition="all 0.2s ease"
                            >
                                Join Discord
                            </Button>
                        </VStack>

                        <Divider borderColor="rgba(255, 255, 255, 0.12)" />

                        <VStack spacing={4} align="stretch">
                            <HStack spacing={3}>
                                <Box
                                    p={3}
                                    bg="#000000"
                                    borderRadius="12px"
                                    aspectRatio={1}
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                >
                                    <Icon
                                        as={RiTwitterXLine}
                                        boxSize={{ base: 6, md: 8 }}
                                        color="white"
                                    />
                                </Box>
                                <Box flex={1}>
                                    <Heading
                                        as="h3"
                                        size={{ base: 'md', md: 'lg' }}
                                        color="text.white"
                                        mb={1}
                                    >
                                        Twitter/X Support
                                    </Heading>
                                    <Text
                                        fontSize={{ base: 'sm', md: 'md' }}
                                        color="whiteAlpha.700"
                                    >
                                        Reach out on Twitter
                                    </Text>
                                </Box>
                            </HStack>

                            <Text
                                fontSize={{ base: 'sm', md: 'md' }}
                                color="whiteAlpha.800"
                            >
                                You can also contact us on Twitter for quick
                                questions or updates. Send us a DM or mention us
                                in your tweet!
                            </Text>

                            <Button
                                as={Link}
                                href="https://x.com/stacked_poker"
                                target="_blank"
                                rel="noopener noreferrer"
                                size={{ base: 'md', md: 'lg' }}
                                bg="#111111"
                                color="white"
                                borderRadius="12px"
                                fontWeight="bold"
                                leftIcon={
                                    <Icon
                                        as={RiTwitterXLine}
                                        boxSize={{ base: 5, md: 6 }}
                                    />
                                }
                                _hover={{
                                    bg: '#2A2A2A',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.35)',
                                    textDecoration: 'none',
                                }}
                                _active={{
                                    bg: '#000000',
                                }}
                                transition="all 0.2s ease"
                            >
                                Follow on Twitter
                            </Button>
                        </VStack>

                        <Box
                            textAlign="center"
                            p={{ base: 2, md: 4 }}
                            bg="rgba(54, 163, 123, 0.18)"
                            border="1px solid rgba(54, 163, 123, 0.35)"
                            borderLeftWidth="6px"
                            borderLeftColor="brand.green"
                            borderRadius="16px"
                            boxShadow="0 6px 18px rgba(0, 0, 0, 0.12)"
                            backdropFilter="blur(8px)"
                            animation={`${fadeInUp} 0.5s ease-out 0.2s backwards`}
                        >
                            <HStack spacing={3} justify="center">
                                <Box
                                    bg="rgba(54, 163, 123, 0.9)"
                                    color="white"
                                    w={8}
                                    h={8}
                                    borderRadius="999px"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    border="1px solid rgba(255, 255, 255, 0.35)"
                                    boxShadow="0 6px 12px rgba(54, 163, 123, 0.35)"
                                    flexShrink={0}
                                >
                                    <Icon as={FiInfo} boxSize={5} />
                                </Box>
                                <Text
                                    fontSize={{ base: 'sm', md: 'md' }}
                                    color="gray.300"
                                    fontWeight="medium"
                                >
                                    <Text
                                        as="span"
                                        fontWeight="bold"
                                        color="gray.300"
                                    >
                                        Tip:
                                    </Text>{' '}
                                    For the fastest response, join our Discord
                                    and create a support ticket with details
                                    about your issue.
                                </Text>
                            </HStack>
                        </Box>
                    </VStack>
                </CardBody>
            </Card>
        </VStack>
    );
};

export default Support;
