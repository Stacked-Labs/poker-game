import {
    Button,
    useColorMode,
    IconButton,
    Icon,
    Tooltip,
} from '@chakra-ui/react';
import { FaMoon } from 'react-icons/fa';
import { IoMdSunny } from 'react-icons/io';

export function ColorModeButton({
    variant = 'default',
}: {
    variant?: 'default' | 'menu';
}) {
    const { colorMode, toggleColorMode } = useColorMode();

    if (variant === 'menu') {
        return (
            <Tooltip label="Toggle theme" aria-label="Toggle theme">
                <IconButton
                    icon={
                        <Icon
                            as={colorMode === 'light' ? IoMdSunny : FaMoon}
                            boxSize={{ base: 4, md: 5 }}
                        />
                    }
                    aria-label="Toggle color mode"
                    size={{ base: 'md', md: 'md' }}
                    px={2}
                    py={2}
                    width={{ base: '40px', sm: '40px', md: '48px' }}
                    height={{ base: '40px', sm: '40px', md: '48px' }}
                    onClick={toggleColorMode}
                    bg="btn.lightGray"
                    color="text.secondary"
                    border="none"
                    borderRadius="12px"
                    _hover={{
                        bg: 'brand.navy',
                        color: 'white',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(51, 68, 121, 0.3)',
                    }}
                    transition="all 0.2s ease"
                />
            </Tooltip>
        );
    }

    return (
        <Button
            aria-label="Toggle color mode"
            color="text.primary"
            variant={'themeButton'}
            onClick={toggleColorMode}
        >
            {colorMode === 'light' ? <IoMdSunny /> : <FaMoon />}
        </Button>
    );
}
