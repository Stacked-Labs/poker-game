import { extendTheme } from '@chakra-ui/react';

const breakpoints = {
  xs: '450px',
  sm: '770px',
  md: '1290px',
  lg: '1800px',
};

const tokens = {
  colors: {
    light: {
      'bg-default': 'linear-gradient(to top, #323232 30%, rgba(0, 0, 0, 0.9))',
      'fg-default': '#000000',
      'text-primary': '#ffffff',
      'text-secondary': '#ffffff',
      'text-tertiary': 'black',
      'btn-border': '#ffffff',
      'btn-selected': '#c6c6c6',
      'btn-hover': '#424242',
      'btn-empty': 'transparent',
      'btn-dark': '#101010',
      'twitter-blue': '#1DA1F2',
    },

    dark: {
      'bg-default': 'linear-gradient(to top, #323232 20%, rgba(0, 0, 0, 0.9))',
      'fg-default': '#000000',
      'text-primary': '#ffffff',
      'text-secondary': '#ffffff',
      'text-tertiary': 'black',
      'btn-border': '#ffffff',
      'btn-selected': '#c6c6c6',
      'btn-hover': '#424242',
      'btn-empty': 'transparent',
      'btn-dark': 'black',
      'twitter-blue': '#1DA1F2',
    },
    // Add shadows here
  },
};

const semanticTokens = {
  colors: {
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
    'twitter-blue': {
      default: tokens.colors.light['twitter-blue'],
      _dark: tokens.colors.dark['twitter-blue'],
    },
    // Add shadows here
  },
};

const styles = {
  global: {
    body: {
      fontFamily: 'inter, sans-serif',
      background: '#323232 10%',
      backgroundAttachment: 'scroll',
      backgroundRepeat: 'repeat',
      overflowY: 'auto',
      _before: {
        content: "''",
        position: 'fixed',
        top: 0,
        bottom: 0,
        width: '100%',
        background: 'linear-gradient(to top, #000000, rgba(0, 0, 0, 0.99))',
        zIndex: -1,
      },
    },
  },
};

const components = {
  Text: {
    baseStyle: {

    },
    variants: {
      secondary: {
        color: 'text-secondary',
      },
    },
  },
  Button: {
    baseStyle: {
    },
    variants: {
      base: {},
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
  },
};

// eslint-disable-next-line import/prefer-default-export
export const theme = extendTheme({
  styles,
  semanticTokens,
  components,
  breakpoints,
});
