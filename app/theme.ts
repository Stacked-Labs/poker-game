import { extendTheme } from '@chakra-ui/react';

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
    // New brand colors
    brand: {
        navy: '#334479',
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
            default: 'linear-gradient(to top, #323232 30%, rgba(0, 0, 0, 0.9))',
            _dark: 'linear-gradient(to top, #323232 20%, rgba(0, 0, 0, 0.9))',
        },
        'bg.surface': {
            default: 'legacy.grayDark',
            _dark: 'legacy.grayDarkest',
        },
        'bg.charcoal': {
            default: '#171717',
            _dark: '#171717',
        },

        // Text colors
        'text.primary': {
            default: '#ffffff',
            _dark: '#ffffff',
        },
        'text.secondary': {
            default: '#ffffff',
            _dark: '#ffffff',
        },
        'text.tertiary': {
            default: 'black',
            _dark: 'black',
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
            social: {
                border: 'none',
                bg: 'transparent',
                _hover: {
                    bg: 'transparent',
                    color: 'green.400',
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
                fontSize: { base: '10px', sm: '11px', md: 'sm', lg: 'sm' },
                width: '80px',
                height: 'auto',
                minH: { base: '28px', sm: '30px', md: '32px', lg: '32px' },
                maxH: { base: '30px', sm: '32px', md: '36px', lg: '36px' },
                padding: { base: 1, sm: 1, md: 1.5, lg: 1.5 },
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
            navButton: {
                border: 0,
                textTransform: 'uppercase',
                fontFamily: 'Poppins',
                fontSize: '2xl',
                borderRadius: 0,
                _hover: {
                    bg: 'transparent',
                    borderBottom: '2px solid red',
                },
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
};

// ============================================
// 7. DESIGN TOKENS
// ============================================
const radii = {
    default: '0.625rem',
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
});
