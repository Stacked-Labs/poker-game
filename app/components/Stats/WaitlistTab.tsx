'use client';

import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Box,
    Button,
    FormControl,
    FormHelperText,
    FormLabel,
    Grid,
    GridItem,
    HStack,
    Input,
    Text,
    Textarea,
    VStack,
    useDisclosure,
} from '@chakra-ui/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getWaitlistCount, sendWaitlistAnnounce } from '../../hooks/server_actions';
import useToastHelper from '../../hooks/useToastHelper';
import { renderWaitlistEmail, type WaitlistEmailProps } from '../../emails/WaitlistEmail';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function WaitlistTab() {
    const [subject, setSubject] = useState('');
    const [preheader, setPreheader] = useState('');
    const [bodyMd, setBodyMd] = useState('');
    const [ctaText, setCtaText] = useState('');
    const [ctaUrl, setCtaUrl] = useState('');
    const [heroImage, setHeroImage] = useState('');
    const [testEmail, setTestEmail] = useState('');

    const [previewHtml, setPreviewHtml] = useState('');
    const [recipientCount, setRecipientCount] = useState<number | null>(null);
    const [sendingTest, setSendingTest] = useState(false);
    const [sendingAll, setSendingAll] = useState(false);

    const { success: toastSuccess, error: toastError } = useToastHelper();
    const confirm = useDisclosure();
    const cancelRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        getWaitlistCount()
            .then(setRecipientCount)
            .catch(() => setRecipientCount(null));
    }, []);

    const emailProps = useMemo<WaitlistEmailProps>(
        () => ({
            preheader: preheader.trim() || undefined,
            body: bodyMd,
            cta: ctaText.trim() && ctaUrl.trim() ? { text: ctaText.trim(), url: ctaUrl.trim() } : undefined,
            heroImage: heroImage.trim() || undefined,
        }),
        [preheader, bodyMd, ctaText, ctaUrl, heroImage]
    );

    // Debounced live preview — byte-for-byte the HTML subscribers receive.
    useEffect(() => {
        let cancelled = false;
        const t = setTimeout(() => {
            renderWaitlistEmail(emailProps)
                .then((html) => {
                    if (!cancelled) setPreviewHtml(html);
                })
                .catch(() => {});
        }, 250);
        return () => {
            cancelled = true;
            clearTimeout(t);
        };
    }, [emailProps]);

    const validateContent = useCallback((): string | null => {
        if (!subject.trim()) return 'Subject is required.';
        if (!bodyMd.trim()) return 'Body is required.';
        if ((ctaText.trim() && !ctaUrl.trim()) || (!ctaText.trim() && ctaUrl.trim())) {
            return 'A CTA button needs both text and a URL.';
        }
        return null;
    }, [subject, bodyMd, ctaText, ctaUrl]);

    const handleSendTest = useCallback(async () => {
        const contentErr = validateContent();
        if (contentErr) {
            toastError('Cannot send', contentErr);
            return;
        }
        if (!EMAIL_RE.test(testEmail.trim())) {
            toastError('Invalid email', 'Enter a valid address to receive the test.');
            return;
        }
        setSendingTest(true);
        try {
            const html = await renderWaitlistEmail(emailProps);
            await sendWaitlistAnnounce({ subject: subject.trim(), html, testEmail: testEmail.trim() });
            toastSuccess('Test sent', `Preview delivered to ${testEmail.trim()}.`);
        } catch (err) {
            toastError('Test failed', err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setSendingTest(false);
        }
    }, [validateContent, testEmail, emailProps, subject, toastSuccess, toastError]);

    const openConfirm = useCallback(() => {
        const contentErr = validateContent();
        if (contentErr) {
            toastError('Cannot send', contentErr);
            return;
        }
        confirm.onOpen();
    }, [validateContent, confirm, toastError]);

    const handleSendAll = useCallback(async () => {
        setSendingAll(true);
        try {
            const html = await renderWaitlistEmail(emailProps);
            const res = await sendWaitlistAnnounce({ subject: subject.trim(), html });
            toastSuccess('Announcement sent', `Delivered to ${res.sent}/${res.total ?? res.sent} subscribers.`);
            confirm.onClose();
        } catch (err) {
            toastError('Send failed', err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setSendingAll(false);
        }
    }, [emailProps, subject, toastSuccess, toastError, confirm]);

    return (
        <VStack align="stretch" gap={6}>
            <VStack align="stretch" gap={1}>
                <Text fontSize="xs" fontWeight="bold" letterSpacing="0.12em" textTransform="uppercase" color="brand.green">
                    Waitlist announcement
                </Text>
                <Text fontSize="sm" color="text.secondary" _dark={{ color: 'whiteAlpha.700' }}>
                    {recipientCount === null
                        ? 'Loading recipient count…'
                        : `${recipientCount.toLocaleString()} subscriber${recipientCount === 1 ? '' : 's'} will receive this.`}
                </Text>
            </VStack>

            <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6} alignItems="start">
                {/* Compose */}
                <GridItem>
                    <VStack
                        align="stretch"
                        gap={5}
                        bg="card.white"
                        borderRadius="16px"
                        border="1px solid"
                        borderColor="border.lightGray"
                        _dark={{ borderColor: 'whiteAlpha.100' }}
                        p={{ base: 5, md: 6 }}
                    >
                        <FormControl isRequired>
                            <FormLabel color="text.primary" fontSize="sm" fontWeight="bold">
                                Subject
                            </FormLabel>
                            <Input
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="You're off the waitlist — Stacked is live"
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel color="text.primary" fontSize="sm" fontWeight="bold">
                                Preheader
                            </FormLabel>
                            <Input
                                value={preheader}
                                onChange={(e) => setPreheader(e.target.value)}
                                placeholder="USDC poker you control on Base — tournaments and a leaderboard are live."
                            />
                            <FormHelperText>The inbox preview line shown after the subject.</FormHelperText>
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel color="text.primary" fontSize="sm" fontWeight="bold">
                                Body (markdown)
                            </FormLabel>
                            <Textarea
                                value={bodyMd}
                                onChange={(e) => setBodyMd(e.target.value)}
                                placeholder={'# You\'re in.\n\nStacked is live. Play USDC poker you control on Base...\n\n- Tournaments running now\n- Cash games any time\n- Host your own table'}
                                minH="260px"
                                fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                                fontSize="sm"
                            />
                            <FormHelperText>
                                Markdown: # headings, **bold**, *italic*, lists, [links](url), and images ![alt](https://…).
                            </FormHelperText>
                        </FormControl>

                        <HStack align="start" gap={4} flexDir={{ base: 'column', md: 'row' }}>
                            <FormControl>
                                <FormLabel color="text.primary" fontSize="sm" fontWeight="bold">
                                    CTA button text
                                </FormLabel>
                                <Input
                                    value={ctaText}
                                    onChange={(e) => setCtaText(e.target.value)}
                                    placeholder="See upcoming tournaments →"
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel color="text.primary" fontSize="sm" fontWeight="bold">
                                    CTA button URL
                                </FormLabel>
                                <Input
                                    value={ctaUrl}
                                    onChange={(e) => setCtaUrl(e.target.value)}
                                    placeholder="https://stackedpoker.io/public-games?format=tournament"
                                />
                            </FormControl>
                        </HStack>

                        <FormControl>
                            <FormLabel color="text.primary" fontSize="sm" fontWeight="bold">
                                Hero image URL (optional)
                            </FormLabel>
                            <Input
                                value={heroImage}
                                onChange={(e) => setHeroImage(e.target.value)}
                                placeholder="https://stackedpoker.io/previews/home_preview.png"
                            />
                        </FormControl>

                        <Box borderTop="1px solid" borderColor="border.lightGray" _dark={{ borderColor: 'whiteAlpha.100' }} pt={5}>
                            <FormControl>
                                <FormLabel color="text.primary" fontSize="sm" fontWeight="bold">
                                    Send test to
                                </FormLabel>
                                <HStack gap={3} flexDir={{ base: 'column', sm: 'row' }} align="stretch">
                                    <Input
                                        type="email"
                                        value={testEmail}
                                        onChange={(e) => setTestEmail(e.target.value)}
                                        placeholder="you@stackedpoker.io"
                                    />
                                    <Button
                                        variant="tactileNeutral"
                                        onClick={handleSendTest}
                                        isLoading={sendingTest}
                                        loadingText="Sending"
                                        flexShrink={0}
                                    >
                                        Send test
                                    </Button>
                                </HStack>
                                <FormHelperText>Delivers a single styled preview to this address.</FormHelperText>
                            </FormControl>
                        </Box>

                        <Button
                            variant="tactilePrimary"
                            size="lg"
                            onClick={openConfirm}
                            isDisabled={sendingTest || sendingAll}
                        >
                            Send to all
                            {recipientCount !== null ? ` (${recipientCount.toLocaleString()})` : ''}
                        </Button>
                    </VStack>
                </GridItem>

                {/* Live preview */}
                <GridItem position={{ lg: 'sticky' }} top={{ lg: 6 }}>
                    <VStack align="stretch" gap={3}>
                        <Text fontSize="sm" fontWeight="bold" color="text.secondary" _dark={{ color: 'whiteAlpha.700' }}>
                            Live preview
                        </Text>
                        <Box
                            borderRadius="16px"
                            border="1px solid"
                            borderColor="border.lightGray"
                            _dark={{ borderColor: 'whiteAlpha.100' }}
                            overflow="hidden"
                            bg="#ECEEF5"
                        >
                            <iframe
                                title="Email preview"
                                srcDoc={previewHtml}
                                sandbox=""
                                style={{ width: '100%', height: '720px', border: 0, background: '#ECEEF5' }}
                            />
                        </Box>
                    </VStack>
                </GridItem>
            </Grid>

            <AlertDialog isOpen={confirm.isOpen} leastDestructiveRef={cancelRef} onClose={confirm.onClose} isCentered>
                <AlertDialogOverlay>
                    <AlertDialogContent bg="card.white" _dark={{ bg: 'bg.charcoal' }} mx={4}>
                        <AlertDialogHeader fontSize="lg" fontWeight="extrabold" color="text.primary">
                            Send to all subscribers?
                        </AlertDialogHeader>
                        <AlertDialogBody color="text.secondary" _dark={{ color: 'whiteAlpha.800' }}>
                            This sends &ldquo;{subject.trim()}&rdquo; to{' '}
                            <Text as="span" fontWeight="bold" color="text.primary">
                                {recipientCount === null ? 'all' : recipientCount.toLocaleString()}
                            </Text>{' '}
                            subscriber{recipientCount === 1 ? '' : 's'}. This cannot be undone.
                        </AlertDialogBody>
                        <AlertDialogFooter gap={3}>
                            <Button ref={cancelRef} variant="tactileNeutral" onClick={confirm.onClose} isDisabled={sendingAll}>
                                Cancel
                            </Button>
                            <Button variant="tactilePrimary" onClick={handleSendAll} isLoading={sendingAll} loadingText="Sending">
                                Send now
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </VStack>
    );
}
