'use client'

import { Box, useColorMode } from "@chakra-ui/react";
import Script from "next/script";
import { useEffect } from "react";

const CoinGecko = () => {
    const { colorMode } = useColorMode();

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

    return (
        <>
            {/* Load CoinGecko widget script */}
            <Script
                src="https://widgets.coingecko.com/gecko-coin-price-marquee-widget.js"
                strategy="afterInteractive"
            />
            {/* CoinGecko price marquee placed directly under the navbar */}
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
                dangerouslySetInnerHTML={{
                    __html: `<gecko-coin-price-marquee-widget dark-mode="${colorMode === 'dark'}" locale="en" transparent-background="true" coin-ids="bitcoin,ethereum,usd-coin,tether,spx6900,virtual-protocol,aerodrome-finance,based-brett,degen-base,cookie,ponke" initial-currency="usd"></gecko-coin-price-marquee-widget>`,
                }}
            />
        </>
    )
}

export default CoinGecko
