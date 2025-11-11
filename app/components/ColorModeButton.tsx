import { Button, useColorMode } from "@chakra-ui/react";
import { FaMoon } from "react-icons/fa";
import { IoMdSunny } from "react-icons/io";

export function ColorModeButton() {
    const { colorMode, toggleColorMode } = useColorMode();

    return (
        <Button
            aria-label="Toggle color mode"
            color="text.primary"
            variant={'themeButton'}
            onClick={toggleColorMode}
        >
            {
                colorMode === "light" ? <IoMdSunny /> : <FaMoon />
            }
        </Button>
    );
}
