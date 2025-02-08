import { extendTheme } from '@chakra-ui/react';

const breakpoints = {
    sm: "30em",
    md: "48em",
    lg: "62em",
    xl: "80em",
    "2xl": "96em",
}

const tokens = {
    colors: {
        light: {
            'bg-default':
                'linear-gradient(to top, #323232 30%, rgba(0, 0, 0, 0.9))',
            'fg-default': '#000000',
            'text-primary': '#ffffff',
            'text-secondary': '#ffffff',
            'text-tertiary': 'black',
            'btn-border': '#ffffff',
            'btn-selected': '#c6c6c6',
            'btn-hover': '#424242',
            'btn-empty': 'transparent',
            'btn-dark': '#101010',
            'charcoal': '#171717',
            'gray.50': '#212121', // Lightest gray
            'gray.100': '#191414',
            'gray.200': '#121212', // Darkest gray
            'green.50': '#1ed760', // Lighter green
            'green.100': '#1db954',
            'red.100': '#eb4034',
        },

        dark: {
            'bg-default':
                'linear-gradient(to top, #323232 20%, rgba(0, 0, 0, 0.9))',
            'fg-default': '#000000',
            'text-primary': '#ffffff',
            'text-secondary': '#ffffff',
            'text-tertiary': 'black',
            'btn-border': '#ffffff',
            'btn-selected': '#c6c6c6',
            'btn-hover': '#424242',
            'btn-empty': 'transparent',
            'btn-dark': 'black',
            'gray.50': '#212121', // Lightest gray
            'gray.100': '#191414',
            'gray.200': '#121212', // Darkest gray
            'green.50': '#1ed760', // Lighter green
            'green.100': '#1db954', // Darker green
            'red.100': '#eb4034',
            charcoal: '#171717',
        },
        // Add shadows here
    },
};

const colors = {
    'charcoal.800': '#262626',
    'charcoal.600': '#363535',
    'charcoal.400': '#363535',
};

const semanticTokens = {
    colors: {
        'gray.50': {
            default: tokens.colors.light['gray.50'],
            _dark: tokens.colors.dark['gray.50'],
        },
        'gray.100': {
            default: tokens.colors.light['gray.100'],
            _dark: tokens.colors.dark['gray.100'],
        },
        'gray.200': {
            default: tokens.colors.light['gray.200'],
            _dark: tokens.colors.dark['gray.200'],
        },
        'green.50': {
            default: tokens.colors.light['green.50'],
            _dark: tokens.colors.dark['green.50'],
        },
        'green.100': {
            default: tokens.colors.light['green.100'],
            _dark: tokens.colors.dark['green.100'],
        },
        'bg-default': {
            default: tokens.colors.light['bg-default'],
            _dark: tokens.colors.dark['bg-default'],
        },
        'fg-default': {
            default: tokens.colors.light['fg-default'],
            _dark: tokens.colors.dark['fg-default'],
        },
        'text-primary': {
            default: tokens.colors.light['text-primary'],
            _dark: tokens.colors.dark['text-primary'],
        },
        'text-secondary': {
            default: tokens.colors.light['text-secondary'],
            _dark: tokens.colors.dark['text-secondary'],
        },
        'btn-border': {
            default: tokens.colors.light['btn-border'],
            _dark: tokens.colors.dark['btn-border'],
        },
        'btn-selected': {
            default: tokens.colors.light['btn-selected'],
            _dark: tokens.colors.dark['btn-selected'],
        },
        'btn-hover': {
            default: tokens.colors.light['btn-hover'],
            _dark: tokens.colors.dark['btn-hover'],
        },
        'btn-empty': {
            default: tokens.colors.light['btn-empty'],
            _dark: tokens.colors.dark['btn-empty'],
        },
        'red.100': {
            default: tokens.colors.light['red.100'],
            _dark: tokens.colors.dark['red.100'],
        },
        // Add shadows here
    },
};

const styles = {
    global: {
        html: {
            backgroundColor: tokens.colors.dark['gray.200'],
        },
        body: {
            backgrondCcolor: tokens.colors.dark['gray.200'],
            color: tokens.colors.dark['gray.200'],
            fontFamily: 'Poppins, sans-serif',
            background: 'white',
            backgroundAttachment: 'scroll',
            backgroundRepeat: 'repeat',
            overflowY: 'auto',
            bg: 'white',
            _before: {
                content: "''",
                position: 'fixed',
                top: 0,
                bottom: 0,
                width: '100%',
                background: 'charcoal',
                zIndex: -1,
            },
        },
    },
};

const components = {
    Text: {
        baseStyle: { color: 'charcoal' },
        variants: {
            secondary: {
                color: 'text-secondary',
            },
            seatText: {
                fontSize: {
                    base: '10px',
                    md: 'smaller',
                    lg: 'small',
                    xl: 'medium',
                    '2xl': 'large',
                }
            }
        },
    },
    Button: {
        baseStyle: {
            bg: 'charcoal',
            color: 'white',
            borderRadius: '10px',
            border: '2px solid white',
            _hover: {
                bg: '#2e2e2e', // Adjust this color to your preference for a lighter color on hover
            },
        },
        variants: {
            base: {},
            social: {
                border: 'none',
                bg: 'none',
                _hover: {
                    bg: 'none',
                    color: 'green.400',
                },
            },
            underlined: {
                bg: 'transparent',
                border: 'none',
                color: 'text-primary',
                textDecoration: 'underline',
                _hover: {
                    background: 'transparent',
                    border: 'none',
                    color: 'text-secondary',
                },
                _focus: {
                    outline: 'none',
                    boxShadow: 'none',
                },
            },
            raiseActionButton: {
                fontSize: { base: '10px', md: 'sm', lg: 'md' },
                width: '80px',
                height: 'fit-content',
            },
            navButton: {
                border: 0,
                textTransform: 'uppercase',
                fontFamily: 'Poppins',
                fontSize: '2xl',
                borderRadius: 0,
                _hover: {
                    bg: 'none',
                    borderBottom: '2px solid red',
                },
            },
            homeSectionButton: {
                paddingY: 8,
                border: 0,
                fontSize: 'xl',
            },
            settingsSmallButton: {
                width: '50%',
                border: 0,
            },
        },
        defaultProps: {
            variant: 'base',
        },
        sizes: {
            sm: {
                py: '2',
                px: '2',
                fontSize: 'sm',
                fontWeight: 'normal',
            },
            md: {
                py: '2',
                px: '3',
                fontSize: 'md',
                fontWeight: 'normal',
            },
            lg: {
                py: '2',
                px: '4',
                fontSize: 'lg',
                fontWeight: 'normal',
            },
            xl: {
                py: '3',
                px: '4',
                fontSize: 'xl',
                fontWeight: 'bold',
            },
            '2xl': {
                py: '3',
                px: '4',
                fontSize: '2xl',
                fontWeight: 'bold',
            },
            '3xl': {
                py: '3',
                px: '4',
                fontSize: '3xl',
                fontWeight: 'bold',
            },
            '4xl': {
                py: '3',
                px: '4',
                fontSize: '4xl',
                fontWeight: 'bold',
            },
        },
        emptySeatButton: {
            width: '100%',
            height: {
                base: 'fit-content',
                sm: '100%',
            },
            border: '2px dashed',
            color: 'lightGray',
            fontSize: {
                base: '0.95rem',
                sm: '1rem',
                md: '1.5rem',
                lg: '2.3rem',
            },
            paddingY: {
                base: '1rem ',
                xs: '2rem',
            },
        },
    },
    Input: {
        baseStyle: {},
        variants: {
            outlined: {
                field: {
                    variant: 'outlined',
                    bgColor: 'charcoal.600',
                    flex: '1',
                    paddingY: '2',
                    paddingX: '5',
                    borderRadius: '4',
                    borderWidth: '1',
                    borderColor: 'grey',
                    textAlign: 'left',
                },
            },
        },
    },
    Icon: {
        variants: {
            socialIcon: {
                width: '300px',
                height: '300px',
            },
        },
    },
};

// eslint-disable-next-line import/prefer-default-export
export const theme = extendTheme({
    styles,
    semanticTokens,
    components,
    breakpoints,
    colors,
    radii: {
        default: '0.625rem',
    },
    shadows: {
        default: '0px 0px 8px 0px rgba(0, 0, 0, 0.15)',
    },
    fonts: {
        heading: `'Poppins', sans-serif`,
        body: `'Poppins', sans-serif`,
    },
});
