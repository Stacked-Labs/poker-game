import { extendTheme } from '@chakra-ui/react';
import { StyleFunctionProps } from '@chakra-ui/theme-tools';

const config = {
    initialColorMode: 'light',
    useSystemColorMode: false,
};

// ============================================
// 1. BREAKPOINTS
// ============================================
const breakpoints = {
    sm: '30em', // 480px
    md: '48em', // 768px
    lg: '62em', // 992px
    xl: '80em', // 1280px
    '2xl': '96em', // 1536px
};

// ============================================
// 2. COLORS
// ============================================
const colors = {
    // Legacy charcoal colors (consider migrating to brand colors)
    charcoal: {
        400: '#363535',
        600: '#363535',
        800: '#262626',
    },
    black: {
        dark: '#191414',
    },
    // New brand colors
    brand: {
        navy: '#334479',
        'navy.80': 'rgba(51, 68, 121, 0.8)',
        darkNavy: '#0B1430',
        lightGray: '#ECEEF5',
        pink: '#EB0B5C',
        green: '#36A37B',
        yellow: '#FDC51D',
    },
    // Legacy colors (consider migrating)
    legacy: {
        grayDarkest: '#121212',
        grayDark: '#191414',
        grayLight: '#212121',
        greenLight: '#1ed760',
        greenDark: '#1db954',
        red: '#eb4034',
        btnHover: '#424242',
        btnSelected: '#c6c6c6',
    },
};

// ============================================
// 3. SEMANTIC TOKENS (for light/dark mode)
// ============================================
const semanticTokens = {
    colors: {
        // Background colors
        'bg.default': {
            default:
                'linear-gradient(to top, rgb(237, 237, 237) 45%,rgb(238, 238, 238) 100%)',
            _dark: 'linear-gradient(to bottom,rgb(25, 25, 25) 50%,rgb(25, 25, 25) 100%)',
        },
        'bg.surface': {
            default: 'legacy.grayDark',
            _dark: 'legacy.grayDarkest',
        },
        'bg.charcoal': {
            default: '#171717',
            _dark: '#171717',
        },
        'bg.navbar': {
            default: 'rgba(255, 255, 255, 0.85)',
            _dark: 'rgba(46, 46, 54, 0.95)',
        },
        'bg.scrollIndicator': {
            default: 'white',
            _dark: '#191919',
        },
        'bg.scrollIndicatorMid': {
            default: 'rgba(255, 255, 255, 0.5)',
            _dark: 'rgba(25, 25, 25, 0.5)',
        },

        // Text colors
        'text.primary': {
            default: 'brand.darkNavy',
            _dark: 'white',
        },
        'text.secondary': {
            default: 'brand.navy',
            _dark: 'brand.lightGray',
        },
        'text.white': {
            default: 'white',
            _dark: 'brand.lightGray',
        },
        'text.gray600': {
            default: 'gray.600',
            _dark: 'gray.400',
        },
        'text.gray700': {
            default: 'gray.700',
            _dark: 'gray.500',
        },

        // Button states
        'btn.border': {
            default: '#ffffff',
            _dark: '#ffffff',
        },
        'btn.selected': {
            default: 'legacy.btnSelected',
            _dark: 'legacy.btnSelected',
        },
        'btn.hover': {
            default: 'legacy.btnHover',
            _dark: 'legacy.btnHover',
        },
        'btn.lightGray': {
            default: 'brand.lightGray',
            _dark: 'charcoal.600',
        },

        // Border
        'border.lightGray': {
            default: 'brand.lightGray',
            _dark: 'charcoal.600',
        },

        // Input
        'input.white': {
            default: 'white',
            _dark: 'charcoal.600',
        },
        'input.lightGray': {
            default: 'brand.lightGray',
            _dark: 'charcoal.800',
        },

        // Card
        'card.white': {
            default: 'white',
            _dark: 'legacy.grayLight',
        },
        'card.darkNavy': {
            default: 'brand.darkNavy',
            _dark: 'legacy.grayLight',
        },
        'card.lightGray': {
            default: 'brand.lightGray',
            _dark: 'legacy.grayDark',
        },
        'card.heroBg': {
            default: 'white',
            _dark: 'rgba(23, 23, 23, 0.8)',
        },
        'card.heroInnerBg': {
            default: 'white',
            _dark: '#171717',
        },

        // Chat UI
        'chat.border': {
            default: 'rgba(0, 0, 0, 0.08)',
            _dark: 'rgba(255, 255, 255, 0.15)',
        },
        'chat.rowEven': {
            default: 'brand.lightGray',
            _dark: 'charcoal.800',
        },
        'chat.rowOdd': {
            default: 'white',
            _dark: 'charcoal.600',
        },
        'chat.rowEvenHover': {
            default: '#dfe3ef',
            _dark: '#1f1f1f',
        },
        'chat.rowOddHover': {
            default: '#f7f7f7',
            _dark: '#2b2b2b',
        },
        'chat.scrollThumb': {
            default: 'rgba(51, 68, 121, 0.2)',
            _dark: 'rgba(255, 255, 255, 0.25)',
        },
        'chat.scrollThumbHover': {
            default: 'rgba(51, 68, 121, 0.3)',
            _dark: 'rgba(255, 255, 255, 0.4)',
        },

        // Legacy semantic colors (used throughout app)
        'gray.50': {
            default: 'legacy.grayLight',
            _dark: 'legacy.grayLight',
        },
        'gray.100': {
            default: 'legacy.grayDark',
            _dark: 'legacy.grayDark',
        },
        'gray.200': {
            default: 'legacy.grayDarkest',
            _dark: 'legacy.grayDarkest',
        },
        'green.50': {
            default: 'legacy.greenLight',
            _dark: 'legacy.greenLight',
        },
        'green.100': {
            default: 'legacy.greenDark',
            _dark: 'legacy.greenDark',
        },
        'red.100': {
            default: 'legacy.red',
            _dark: 'legacy.red',
        },
    },
    shadows: {
        'chat.inputFocus': {
            default: '0 0 0 2px rgba(51, 68, 121, 0.2)',
            _dark: '0 0 0 2px rgba(255, 255, 255, 0.2)',
        },
        'card.hero': {
            default:
                '0 25px 80px rgba(0, 0, 0, 0.12), 0 8px 32px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.9)',
            _dark: '0 25px 80px rgba(0, 0, 0, 0.5), 0 10px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        },
    },
};

// ============================================
// 4. TYPOGRAPHY
// ============================================
const fonts = {
    heading: `'Geist Sans', 'Poppins', sans-serif`,
    body: `'Geist Sans', 'Poppins', sans-serif`,
};

const fontWeights = {
    heading: 800, // Geist ExtraBold - Thicker headings
    body: 600, // Geist SemiBold - Thicker body text
    normal: 500,
    medium: 600,
    semibold: 700,
    bold: 800,
    extrabold: 900, // Geist Black - Heaviest weight
};

// ============================================
// 5. GLOBAL STYLES
// ============================================
const styles = {
    global: {
        html: {
            backgroundColor: 'legacy.grayDarkest',
        },
        body: {
            backgroundColor: 'legacy.grayDarkest',
            color: 'text.primary',
            fontFamily: 'body',
            overflowY: 'auto',
            _before: {
                content: "''",
                position: 'fixed',
                top: 0,
                bottom: 0,
                width: '100%',
                background: 'bg.charcoal',
                zIndex: -1,
            },
        },
    },
};

// ============================================
// 6. COMPONENT STYLES
// ============================================
const components = {
    Alert: {
        baseStyle: {
            container: {
                borderRadius: 'md',
                fontSize: 'sm',
                lineHeight: 'short',
                width: '100%',
                px: 3,
                py: 2,
                gap: 2,
                boxShadow: 'lg',
            },
            title: {
                fontSize: 'sm',
                fontWeight: 'semibold',
                lineHeight: 'shorter',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: '1',
            },
            description: {
                fontSize: 'sm',
                lineHeight: 'short',
                marginTop: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: '2',
            },
            icon: {
                mt: 0.5,
                width: 4,
                height: 4,
            },
        },
        variants: {
            solidCompact: (props: StyleFunctionProps) => {
                const { colorScheme = 'gray' } = props;
                return {
                    container: {
                        bg: `${colorScheme}.500`,
                        color: 'white',
                    },
                    icon: {
                        color: 'white',
                    },
                };
            },
        },
        defaultProps: {
            variant: 'solidCompact',
            colorScheme: 'gray',
        },
    },
    // HEADING COMPONENT
    Heading: {
        baseStyle: {
            fontWeight: 'bold', // Uses 800 from fontWeights
            letterSpacing: '-0.02em', // Tighter spacing for thicker appearance
        },
    },

    // TEXT COMPONENT
    Text: {
        baseStyle: {
            color: 'charcoal.800',
        },
        variants: {
            secondary: {
                color: 'text.secondary',
            },
            seatText: {
                fontSize: {
                    base: '10px',
                    md: 'smaller',
                    lg: 'small',
                    xl: 'medium',
                    '2xl': 'large',
                },
            },
            statSubHead: {
                fontSize: 'lg',
                fontWeight: 'semibold',
                color: 'gray.500',
            },
            statBody: {
                fontSize: 'sm',
                fontWeight: 'medium',
            },
        },
    },

    // BUTTON COMPONENT
    Button: {
        baseStyle: {
            bg: 'bg.charcoal',
            color: 'white',
            borderRadius: '10px',
            border: '2px solid',
            borderColor: 'btn.border',
            _hover: {
                bg: '#2e2e2e',
            },
        },
        variants: {
            base: {},
            themeButton: {
                border: 'none',
                bg: 'transparent',
                color: 'brand.darkNavy',
                _hover: {
                    bg: 'transparent',
                    color: 'brand.pink',
                },
            },
            social: {
                bg: 'btn.lightGray',
                border: 'none',
                borderRadius: { base: '10px', md: '12px' },
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                _hover: {
                    color: 'white',
                },
            },
            underlined: {
                bg: 'transparent',
                border: 'none',
                color: 'text.primary',
                textDecoration: 'underline',
                _hover: {
                    background: 'transparent',
                    border: 'none',
                    color: 'text.secondary',
                },
                _focus: {
                    outline: 'none',
                    boxShadow: 'none',
                },
            },
            raiseActionButton: {
                fontSize: { base: '8px', sm: '10px', md: 'sm', lg: 'sm' },
                width: { base: '70px', sm: '75px', md: '80px', lg: '85px' },
                height: 'auto',
                minH: { base: '28px', sm: '28px', md: '34px', lg: '36px' },
                maxH: { base: '34px', sm: '36px', md: '38px', lg: '40px' },
                padding: { base: 1 },
                bg: 'brand.navy',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                _hover: {
                    bg: 'brand.green',
                    transform: 'translateY(-1px)',
                    boxShadow: 'lg',
                },
                _active: {
                    transform: 'translateY(0px)',
                },
                _disabled: {
                    opacity: 0.4,
                    cursor: 'not-allowed',
                },
                transition: 'all 0.2s',
            },
            navLink: {
                bg: 'none',
                fontSize: { base: '2xl', md: '2xl' },
                fontWeight: 'black',
                color: 'text.primary',
                textTransform: 'uppercase',
                border: 'none',
                outline: 'none',
                boxShadow: 'none',
                _hover: {
                    transform: 'translateY(-3px)',
                    color: 'brand.pink',
                    border: 'none',
                    outline: 'none',
                    boxShadow: 'none',
                    bg: 'none',
                },
                _focus: {
                    border: 'none',
                    outline: 'none',
                    boxShadow: 'none',
                    bg: 'none',
                },
                _active: {
                    border: 'none',
                    outline: 'none',
                    boxShadow: 'none',
                    bg: 'none',
                },
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            },
            homeSectionButton: {
                paddingY: 8,
                border: 0,
            },
            settingsSmallButton: {
                width: '50px',
                border: 0,
            },
            connectButton: {
                paddingY: 8,
                border: '2px',
                bg: '#2D2D2D',
            },
            outlined: {
                bg: 'gray.200',
                _focus: {
                    boxShadow: 'outline',
                },
            },
            emptySeat: {
                width: '100%',
                height: {
                    base: 'fit-content',
                    sm: '100%',
                },
                border: '2px dashed',
                borderColor: 'gray.400',
                color: 'gray.400',
                fontSize: {
                    base: '0.95rem',
                    sm: '1rem',
                    md: '1.5rem',
                    lg: '2.3rem',
                },
                paddingY: {
                    base: '1rem',
                    xs: '2rem',
                },
            },
            gameSettingsButton: {
                bg: 'btn.lightGray',
                color: 'text.secondary',
                border: 'none',
                borderRadius: '12px',
                transition: 'all 0.2s ease',
                _hover: {
                    bg: 'brand.navy',
                    color: 'white',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(51, 68, 121, 0.3)',
                },
            },
            homeNav: {
                size: 'lg',
                fontWeight: 'semibold',
                bg: 'btn.lightGray',
                color: 'text.secondary',
                borderRadius: '16px',
                height: '56px',
                justifyContent: 'flex-start',
                px: 6,
                transition: 'all 0.2s ease',
                _hover: {
                    bg: 'rgba(12, 21, 49, 0.12)',
                    transform: 'translateX(4px)',
                },
            },
        },
        sizes: {
            sm: {
                py: 2,
                px: 2,
                fontSize: 'sm',
                fontWeight: 'normal',
            },
            md: {
                py: 2,
                px: 3,
                fontSize: 'md',
                fontWeight: 'normal',
            },
            lg: {
                py: 2,
                px: 4,
                fontSize: 'lg',
                fontWeight: 'normal',
            },
            xl: {
                py: 3,
                px: 4,
                fontSize: 'xl',
                fontWeight: 'bold',
            },
            '2xl': {
                py: 3,
                px: 4,
                fontSize: '2xl',
                fontWeight: 'bold',
            },
            '3xl': {
                py: 3,
                px: 4,
                fontSize: '3xl',
                fontWeight: 'bold',
            },
            '4xl': {
                py: 3,
                px: 4,
                fontSize: '4xl',
                fontWeight: 'bold',
            },
        },
        defaultProps: {
            variant: 'base',
        },
    },

    // INPUT COMPONENT
    Input: {
        baseStyle: {},
        variants: {
            outlined: {
                field: {
                    bgColor: 'charcoal.600',
                    flex: 1,
                    paddingY: 2,
                    paddingX: 5,
                    borderRadius: 4,
                    borderWidth: 1,
                    borderColor: 'gray.500',
                    textAlign: 'left',
                },
            },
            white: {
                field: {
                    bg: 'input.white',
                    borderWidth: '2px',
                    borderColor: 'border.lightGray',
                    borderRadius: '10px',
                    _focus: {
                        borderColor: 'brand.pink',
                        boxShadow: '0 0 0 1px #EB0B5C',
                    },
                    _hover: {
                        borderColor: 'brand.pink',
                    },
                    color: 'text.primary',
                    height: '40px',
                    fontSize: 'sm',
                    width: '120px',
                },
            },
            takeSeatModal: {
                field: {
                    bg: 'input.lightGray',
                    color: 'text.secondary',
                    height: '56px',
                    border: '2px solid transparent',
                    borderRadius: '12px',
                    fontSize: 'md',
                    fontWeight: 'semibold',
                    transition: 'all 0.2s ease',
                    _placeholder: { color: 'gray.400' },
                    _hover: {
                        borderColor: 'brand.green',
                    },
                    _focus: {
                        borderColor: 'brand.pink',
                        boxShadow: '0 0 0 3px rgba(235, 11, 92, 0.1)',
                        bg: 'input.white',
                    },
                },
            },
            settings: {
                field: {
                    size: 'sm',
                    bg: 'input.white',
                    color: 'text.tertiary',
                    borderColor: 'input.lightGray',
                    borderWidth: '2px',
                    borderRadius: '8px',
                    fontWeight: 'semibold',
                    _hover: {
                        borderColor: 'brand.green',
                    },
                    _focus: {
                        borderColor: 'brand.pink',
                        boxShadow: '0 0 0 3px rgba(235, 11, 92, 0.1)',
                    },
                    _placeholder: { color: 'gray.400' },
                },
            },
        },
    },

    // ICON COMPONENT
    Icon: {
        variants: {
            socialIcon: {
                width: '300px',
                height: '300px',
            },
        },
    },

    FormLabel: {
        variants: {
            createGame: {
                color: 'text.secondary',
                mb: 0,
                fontWeight: 'bold',
                fontSize: 'lg',
            },
        },
    },
};

// ============================================
// 7. DESIGN TOKENS
// ============================================
const radii = {
    default: '0.625rem',
    bigButton: '1rem',
};

const shadows = {
    default: '0px 0px 8px 0px rgba(0, 0, 0, 0.15)',
};

// ============================================
// 8. EXPORT THEME
// ============================================
export const theme = extendTheme({
    breakpoints,
    colors,
    semanticTokens,
    fonts,
    fontWeights,
    styles,
    components,
    radii,
    shadows,
    config,
});
