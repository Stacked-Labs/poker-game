'use client';

/**
 * DEV-ONLY: Base App shell simulator.
 *
 * Renders the app inside a faithful mock of the Coinbase **Base App** mini-app
 * container (device status bar + Base App header + bottom system bar + safe-area
 * insets) so we can review how Stacked looks/behaves for a user who opens it
 * from inside the Base App. This is a *simulation* of the standard-web-app host
 * the Base App became on 2026-04-09 — it is NOT the real Base App and cannot
 * perfectly replicate its wallet UX, onramp, or notifications.
 *
 * Open: /dev/base-shell  (defaults to framing https://dev.stackedpoker.io)
 * Params:
 *   ?app=<url|local>   target app (default dev; `local` = same-origin `/`)
 *   ?pk=<0xhex>        optional e2e private key appended as ?e2e_pk= so the
 *                      repo's E2EAutoConnect + wallet-mock can simulate a
 *                      one-tap Base-wallet connection inside the frame
 *   ?path=<path>       initial in-app path (e.g. /?join=1, /table/<id>)
 *   ?device=iphone|android   device chrome (default iphone)
 *
 * See `.claude/skills/base-miniapp-developer/references/testing-simulation.md`.
 */

import {
    Box,
    Button,
    Flex,
    HStack,
    Select,
    Text,
    VStack,
    chakra,
} from '@chakra-ui/react';
import { Suspense, useMemo, useRef, useState } from 'react';
import { notFound, useSearchParams } from 'next/navigation';

const TARGETS: Record<string, string> = {
    dev: 'https://dev.stackedpoker.io',
    prod: 'https://stackedpoker.io',
    local: '',
};

const DEVICES = {
    iphone: { label: 'iPhone 15', w: 393, h: 852, radius: 50, notch: true },
    android: { label: 'Pixel 8', w: 412, h: 870, radius: 34, notch: false },
} as const;

export default function BaseShellSimPage() {
    // Dev tool — must NOT ship to production. Gate on a dedicated public flag,
    // NOT NODE_ENV: this repo's .env.local forces NODE_ENV=production even under
    // `next dev`, so a `NODE_ENV !== 'production'` guard would be statically
    // eliminated and 404 the route locally too. Set NEXT_PUBLIC_ENABLE_DEV_TOOLS
    // =true only in dev/preview envs.
    if (process.env.NEXT_PUBLIC_ENABLE_DEV_TOOLS !== 'true') notFound();

    return (
        <Suspense fallback={null}>
            <BaseShellSim />
        </Suspense>
    );
}

function BaseShellSim() {
    const params = useSearchParams();
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Default to the same-origin local app: the global CSP `frame-src 'self'`
    // (next.config.js) allows it out of the box. Framing the remote dev/prod
    // site requires adding those domains to `frame-src` (or a /dev-scoped CSP).
    const [target, setTarget] = useState<string>(params.get('app') ?? 'local');
    const [deviceKey, setDeviceKey] = useState<keyof typeof DEVICES>(
        (params.get('device') as keyof typeof DEVICES) ?? 'iphone'
    );
    const device = DEVICES[deviceKey];

    const pk = params.get('pk') ?? '';
    const path = params.get('path') ?? '/';

    // SSR-safe: build the URL by string (no `window`, no relative `new URL`).
    // local target → same-origin relative path; dev/prod → absolute origin.
    const src = useMemo(() => {
        const base = target === 'local' ? '' : TARGETS[target] ?? target;
        const sep = path.includes('?') ? '&' : '?';
        const query = pk ? `${sep}e2e_pk=${encodeURIComponent(pk)}` : '';
        return `${base}${path}${query}`;
    }, [target, path, pk]);

    const reload = () => {
        if (iframeRef.current) iframeRef.current.src = src;
    };

    const host =
        target === 'local'
            ? 'local (same-origin)'
            : (TARGETS[target] ?? target).replace(/^https?:\/\//, '');

    return (
        <Flex
            direction="column"
            minH="100vh"
            bg="#15171c"
            color="whiteAlpha.900"
            align="center"
            py={6}
            px={4}
            gap={5}
        >
            {/* dev control strip (outside the device) */}
            <Flex
                w="full"
                maxW="980px"
                align="center"
                justify="space-between"
                wrap="wrap"
                gap={3}
            >
                <HStack spacing={3}>
                    <Box
                        px={2.5}
                        py={1}
                        rounded="md"
                        bg="yellow.400"
                        color="black"
                        fontWeight="800"
                        fontSize="xs"
                        letterSpacing="0.04em"
                    >
                        SIMULATION
                    </Box>
                    <Text fontWeight="700">Base App shell</Text>
                    <Text fontSize="sm" color="whiteAlpha.600">
                        not the real Base App — standard-web-app host model
                    </Text>
                </HStack>
                <HStack spacing={2}>
                    <Select
                        size="sm"
                        w="auto"
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                        bg="whiteAlpha.100"
                        borderColor="whiteAlpha.300"
                    >
                        <option value="dev">dev.stackedpoker.io</option>
                        <option value="prod">stackedpoker.io</option>
                        <option value="local">local (/)</option>
                    </Select>
                    <Select
                        size="sm"
                        w="auto"
                        value={deviceKey}
                        onChange={(e) =>
                            setDeviceKey(e.target.value as keyof typeof DEVICES)
                        }
                        bg="whiteAlpha.100"
                        borderColor="whiteAlpha.300"
                    >
                        {Object.entries(DEVICES).map(([k, d]) => (
                            <option key={k} value={k}>
                                {d.label}
                            </option>
                        ))}
                    </Select>
                    <Button size="sm" onClick={reload} variant="outline">
                        Reload
                    </Button>
                </HStack>
            </Flex>

            {/* the device */}
            <Box
                position="relative"
                w={`${device.w + 16}px`}
                h={`${device.h + 16}px`}
                bg="#000"
                rounded={`${device.radius}px`}
                p="8px"
                boxShadow="0 30px 80px rgba(0,0,0,0.6), 0 0 0 2px #2a2d35"
            >
                <Flex
                    direction="column"
                    w={`${device.w}px`}
                    h={`${device.h}px`}
                    bg="#0b0c0f"
                    rounded={`${device.radius - 8}px`}
                    overflow="hidden"
                    position="relative"
                >
                    {/* device status bar */}
                    <Flex
                        h="44px"
                        flexShrink={0}
                        align="center"
                        justify="space-between"
                        px={5}
                        pt="6px"
                        bg="#000"
                        color="white"
                        fontSize="13px"
                        fontWeight="600"
                        position="relative"
                    >
                        <Text>9:41</Text>
                        {device.notch && (
                            <Box
                                position="absolute"
                                left="50%"
                                top="8px"
                                transform="translateX(-50%)"
                                w="118px"
                                h="26px"
                                bg="#000"
                                rounded="full"
                            />
                        )}
                        <HStack spacing={1.5} fontSize="12px">
                            <Text>●●●</Text>
                            <Text>Wi-Fi</Text>
                            <Text>100%</Text>
                        </HStack>
                    </Flex>

                    {/* Base App mini-app header */}
                    <Flex
                        h="52px"
                        flexShrink={0}
                        align="center"
                        justify="space-between"
                        px={3}
                        bg="#101114"
                        borderBottom="1px solid"
                        borderColor="whiteAlpha.100"
                    >
                        <Button
                            variant="ghost"
                            size="sm"
                            color="whiteAlpha.800"
                            fontSize="20px"
                            minW="auto"
                            px={2}
                            onClick={() => {
                                // contentWindow.history is cross-origin for
                                // dev/prod targets and throws a SecurityError.
                                if (target !== 'local') return;
                                try {
                                    iframeRef.current?.contentWindow?.history.back();
                                } catch {
                                    /* cross-origin — ignore */
                                }
                            }}
                            aria-label="Back"
                        >
                            ‹
                        </Button>
                        <VStack spacing={0} lineHeight={1.1}>
                            <Text fontSize="14px" fontWeight="700">
                                Stacked Poker
                            </Text>
                            <Text fontSize="10px" color="whiteAlpha.500">
                                {host}
                            </Text>
                        </VStack>
                        <HStack spacing={0} color="whiteAlpha.800">
                            <chakra.button px={2} fontSize="16px" aria-label="Share">
                                ↗
                            </chakra.button>
                            <chakra.button px={2} fontSize="18px" aria-label="More">
                                ⋯
                            </chakra.button>
                        </HStack>
                    </Flex>

                    {/* the app */}
                    <Box flex="1" minH={0} bg="white" position="relative">
                        <chakra.iframe
                            ref={iframeRef}
                            src={src}
                            title="Stacked Poker (in Base App shell)"
                            w="full"
                            h="full"
                            border="0"
                            allow="clipboard-write; web-share"
                        />
                        {target !== 'local' && (
                            <Flex
                                position="absolute"
                                inset={0}
                                direction="column"
                                align="center"
                                justify="center"
                                textAlign="center"
                                px={6}
                                gap={2}
                                bg="gray.50"
                                color="gray.600"
                                pointerEvents="none"
                            >
                                <Text fontSize="sm" fontWeight="700">
                                    Remote frame blocked
                                </Text>
                                <Text fontSize="xs">
                                    The global CSP <code>frame-src &apos;self&apos;</code>{' '}
                                    blocks framing {host}. Use the same-origin{' '}
                                    <strong>local</strong> target, or add the domain
                                    to <code>frame-src</code> (a <code>/dev</code>-scoped
                                    header) in <code>next.config.js</code>.
                                </Text>
                            </Flex>
                        )}
                    </Box>

                    {/* home indicator */}
                    <Flex
                        h="22px"
                        flexShrink={0}
                        align="center"
                        justify="center"
                        bg="#0b0c0f"
                    >
                        <Box w="134px" h="5px" rounded="full" bg="whiteAlpha.700" />
                    </Flex>
                </Flex>
            </Box>

            <Text fontSize="xs" color="whiteAlpha.500" maxW="640px" textAlign="center">
                Visual chrome harness only. The header (≈96px) and home indicator
                approximate the Base App chrome — watch for our fixed top banners /
                bottom action bars colliding with it and for safe-area issues. This
                shell does <strong>not</strong> inject a Base Account provider or test
                the real one-tap-login bridge (that belongs in a Playwright harness).
                With <chakra.code bg="whiteAlpha.200" px={1} rounded="sm">target=local</chakra.code>{' '}
                + <chakra.code bg="whiteAlpha.200" px={1} rounded="sm">NEXT_PUBLIC_E2E=true</chakra.code>,{' '}
                <chakra.code bg="whiteAlpha.200" px={1} rounded="sm">?pk=0x…</chakra.code> drives the
                existing E2E connect path.
            </Text>
        </Flex>
    );
}
