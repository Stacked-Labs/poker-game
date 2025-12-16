'use client'

import { useContext } from "react"
import { AppContext } from "../contexts/AppStoreProvider"
import { Box, Heading } from "@chakra-ui/react";

const PauseBanner = () => {
    const { appState } = useContext(AppContext);

    if (appState.game?.paused) {
        return (
            <Box
                className="pause-banner"
                position="absolute"
                top="12%"
                left="50%"
                transform="translateX(-50%)"
                bg="brand.yellow"
                color="text.white"
                px="3%"
                py="1.5%"
                borderRadius="16px"
                boxShadow="0 8px 24px rgba(253, 197, 29, 0.4)"
                zIndex={990}
                textAlign="center"
                border="2px solid white"
            >
                <Heading size="md" fontWeight="bold">
                    Paused
                </Heading>
            </Box>
        )
    }

    return null;
}

export default PauseBanner
