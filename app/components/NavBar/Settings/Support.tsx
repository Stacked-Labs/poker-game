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
} from '@chakra-ui/react';
import { FaDiscord } from 'react-icons/fa';
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
            {/* Header */}
            <Box textAlign="center" mb={{ base: 2, md: 4 }}>
                <Heading
                    as="h2"
                    size={{ base: 'lg', md: 'xl' }}
                    color="brand.navy"
                    mb={3}
                    fontWeight="bold"
                >
                    Need Help?
                </Heading>
                <Text
                    fontSize={{ base: 'md', md: 'lg' }}
                    color="gray.600"
                    maxW="600px"
                    mx="auto"
                >
                    We&apos;re here to help! Reach out to us through Discord or
                    Twitter for support with any game issues or questions.
                </Text>
            </Box>

            {/* Discord Support Card */}
            <Card
                variant="outline"
                bg="white"
                borderColor="brand.lightGray"
                borderWidth="2px"
                borderRadius="20px"
                boxShadow="0 4px 12px rgba(0, 0, 0, 0.08)"
                animation={`${fadeInUp} 0.5s ease-out`}
                transition="all 0.3s ease"
                _hover={{
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(88, 101, 242, 0.15)',
                    borderColor: '#5865F2',
                }}
            >
                <CardBody p={{ base: 5, md: 6 }}>
                    <VStack spacing={4} align="stretch">
                        <HStack spacing={3}>
                            <Box
                                p={3}
                                bg="rgba(88, 101, 242, 0.1)"
                                borderRadius="12px"
                            >
                                <Icon
                                    as={FaDiscord}
                                    boxSize={{ base: 6, md: 8 }}
                                    color="#5865F2"
                                />
                            </Box>
                            <Box flex={1}>
                                <Heading
                                    as="h3"
                                    size={{ base: 'md', md: 'lg' }}
                                    color="brand.navy"
                                    mb={1}
                                >
                                    Discord Support
                                </Heading>
                                <Text
                                    fontSize={{ base: 'sm', md: 'md' }}
                                    color="gray.600"
                                >
                                    Join our Discord server
                                </Text>
                            </Box>
                        </HStack>

                        <Text
                            fontSize={{ base: 'sm', md: 'md' }}
                            color="gray.700"
                        >
                            For game issues, bug reports, or general support,
                            please join our Discord community and submit a
                            ticket. Our team will respond as soon as possible.
                        </Text>

                        <Button
                            as={Link}
                            href="https://discord.gg/XMWfksjt"
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
                                boxShadow: '0 6px 16px rgba(88, 101, 242, 0.3)',
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
                </CardBody>
            </Card>

            {/* Twitter Support Card */}
            <Card
                variant="outline"
                bg="white"
                borderColor="brand.lightGray"
                borderWidth="2px"
                borderRadius="20px"
                boxShadow="0 4px 12px rgba(0, 0, 0, 0.08)"
                animation={`${fadeInUp} 0.5s ease-out 0.1s backwards`}
                transition="all 0.3s ease"
                _hover={{
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                    borderColor: '#000000',
                }}
            >
                <CardBody p={{ base: 5, md: 6 }}>
                    <VStack spacing={4} align="stretch">
                        <HStack spacing={3}>
                            <Box
                                p={3}
                                bg="rgba(0, 0, 0, 0.08)"
                                borderRadius="12px"
                            >
                                <Icon
                                    as={RiTwitterXLine}
                                    boxSize={{ base: 6, md: 8 }}
                                    color="#000000"
                                />
                            </Box>
                            <Box flex={1}>
                                <Heading
                                    as="h3"
                                    size={{ base: 'md', md: 'lg' }}
                                    color="brand.navy"
                                    mb={1}
                                >
                                    Twitter/X Support
                                </Heading>
                                <Text
                                    fontSize={{ base: 'sm', md: 'md' }}
                                    color="gray.600"
                                >
                                    Reach out on Twitter
                                </Text>
                            </Box>
                        </HStack>

                        <Text
                            fontSize={{ base: 'sm', md: 'md' }}
                            color="gray.700"
                        >
                            You can also contact us on Twitter for quick
                            questions or updates. Send us a DM or mention us in
                            your tweet!
                        </Text>

                        <Button
                            as={Link}
                            href="https://x.com/stacked_poker"
                            target="_blank"
                            rel="noopener noreferrer"
                            size={{ base: 'md', md: 'lg' }}
                            bg="#000000"
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
                                bg: '#333333',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.3)',
                                textDecoration: 'none',
                            }}
                            _active={{
                                bg: '#1a1a1a',
                            }}
                            transition="all 0.2s ease"
                        >
                            Follow on Twitter
                        </Button>
                    </VStack>
                </CardBody>
            </Card>

            {/* Additional Info */}
            <Box
                textAlign="center"
                p={{ base: 4, md: 5 }}
                bg="rgba(54, 163, 123, 0.08)"
                borderRadius="16px"
                animation={`${fadeInUp} 0.5s ease-out 0.2s backwards`}
            >
                <Text
                    fontSize={{ base: 'sm', md: 'md' }}
                    color="brand.navy"
                    fontWeight="medium"
                >
                    💡 <strong>Tip:</strong> For the fastest response, join our
                    Discord and create a support ticket with details about your
                    issue.
                </Text>
            </Box>
        </VStack>
    );
};

export default Support;
