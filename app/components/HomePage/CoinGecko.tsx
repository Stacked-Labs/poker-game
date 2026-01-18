'use client'

import { Box, useColorMode } from '@chakra-ui/react';
import Script from 'next/script';
import { useEffect, useState } from 'react';

const CoinGecko = () => {
    const { colorMode } = useColorMode();
    const [shouldLoad, setShouldLoad] = useState(false);
    const coinIds = 'bitcoin,ethereum,usd-coin,tether';

    // Inject styles for CoinGecko widget in dark mode
    useEffect(() => {
        const styleId = 'coingecko-dark-mode-styles';
        let styleElement = document.getElementById(styleId);

        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = styleId;
            document.head.appendChild(styleElement);
        }

        if (colorMode === 'dark') {
            styleElement.textContent = `
                gecko-coin-price-marquee-widget,
                gecko-coin-price-marquee-widget * {
                    color: white !important;
                }
            `;
        } else {
            styleElement.textContent = '';
        }

        return () => {
            // Cleanup on unmount
            const element = document.getElementById(styleId);
            if (element) {
                element.remove();
            }
        };
    }, [colorMode]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (window.requestIdleCallback) {
            const handle = window.requestIdleCallback(
                () => setShouldLoad(true),
                { timeout: 2500 }
            );
            return () => window.cancelIdleCallback?.(handle);
        }

        const timeout = window.setTimeout(() => setShouldLoad(true), 1500);
        return () => window.clearTimeout(timeout);
    }, []);

    return (
        <>
            {shouldLoad && (
                <Script
                    src="https://widgets.coingecko.com/gecko-coin-price-marquee-widget.js"
                    strategy="lazyOnload"
                />
            )}
            <Box
                width="100%"
                bgColor="card.white"
                display="flex"
                justifyContent="center"
                position="fixed"
                top={{ base: '68px', md: '76px' }}
                left={0}
                zIndex={98}
                borderBottom="1px solid"
                borderColor="rgba(235, 11, 92, 0.2)"
                boxShadow="0 2px 8px rgba(0, 0, 0, 0.1)"
                minHeight={{ base: '32px', md: '40px' }}
                visibility={shouldLoad ? 'visible' : 'hidden'}
                dangerouslySetInnerHTML={
                    shouldLoad
                        ? {
                              __html: `<gecko-coin-price-marquee-widget dark-mode="${
                                  colorMode === 'dark'
                              }" locale="en" transparent-background="true" coin-ids="${coinIds}" initial-currency="usd"></gecko-coin-price-marquee-widget>`,
                          }
                        : undefined
                }
            />
        </>
    );
}

export default CoinGecko;
