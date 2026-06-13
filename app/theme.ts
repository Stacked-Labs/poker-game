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
        pinkDark: '#C00A4D',
        pinkEdge: '#950839',
        green: '#36A37B',
        greenDark: '#2A8463',
        greenEdge: '#22674E',
        yellow: '#FDC51D',
        yellowDark: '#B78900',
        yellowEdge: '#8A6A00',
        base: '#0052FF',
        telegram: '#0088CC',
        telegramDark: '#0077B5',
        telegramEdge: '#006A9D',
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
        'bg.letterbox': {
            default: '#D8D8DD',
            _dark: '#141418',
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
        'text.muted': {
            default: 'gray.500',
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

        // Felt-Green tint family — for soft confirm/positive surfaces
        'bg.greenSubtle': {
            default: 'rgba(54, 163, 123, 0.06)',
            _dark: 'rgba(54, 163, 123, 0.10)',
        },
        'bg.greenTint': {
            default: 'rgba(54, 163, 123, 0.10)',
            _dark: 'rgba(54, 163, 123, 0.16)',
        },
        'border.greenSubtle': {
            default: 'rgba(54, 163, 123, 0.15)',
            _dark: 'rgba(54, 163, 123, 0.22)',
        },
        'border.greenStrong': {
            default: 'rgba(54, 163, 123, 0.30)',
            _dark: 'rgba(54, 163, 123, 0.40)',
        },

        // Felt Table — a card-room "felt" surface (newsletter, future seat-pickers)
        // Penthouse-Midnight ground in both modes; the felt is the room, not the color.
        'card.felt': {
            default: 'brand.darkNavy',
            _dark: 'brand.darkNavy',
        },
        'border.felt': {
            default: 'rgba(255, 255, 255, 0.10)',
            _dark: 'rgba(255, 255, 255, 0.08)',
        },

        // Tournament reminder surfaces — adaptive, unlike the always-dark felt.
        // Warm paper in light mode, penthouse felt in dark. The countdown "chip"
        // sits raised on top with a tactile edge; state chips tint green (soon).
        'reminder.surface': {
            default: '#FAF9F6',
            _dark: 'brand.darkNavy',
        },
        'reminder.border': {
            default: 'rgba(11, 20, 48, 0.08)',
            _dark: 'rgba(255, 255, 255, 0.08)',
        },
        'reminder.chipBg': {
            default: '#FFFFFF',
            _dark: 'rgba(255, 255, 255, 0.06)',
        },
        'reminder.chipBorder': {
            default: 'rgba(11, 20, 48, 0.10)',
            _dark: 'rgba(255, 255, 255, 0.12)',
        },
        'reminder.chipEdge': {
            default: 'rgba(11, 20, 48, 0.14)',
            _dark: 'rgba(0, 0, 0, 0.45)',
        },
        'reminder.soonBg': {
            default: 'rgba(54, 163, 123, 0.12)',
            _dark: 'rgba(54, 163, 123, 0.18)',
        },
        'reminder.soonText': {
            default: 'brand.greenDark',
            _dark: 'brand.green',
        },
        'reminder.lateRegText': {
            default: 'brand.yellowDark',
            _dark: 'brand.yellow',
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
            default: 'rgba(255, 255, 255, 0.95)',
            _dark: 'rgba(23, 23, 23, 0.95)',
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
        // Standard card lift — replacement for legacy `glass` / `glass-hover`
        'card.lift': {
            default: '0 8px 24px rgba(11, 20, 48, 0.10)',
            _dark: '0 8px 24px rgba(0, 0, 0, 0.45)',
        },
        'card.liftHover': {
            default: '0 14px 36px rgba(11, 20, 48, 0.16)',
            _dark: '0 14px 36px rgba(0, 0, 0, 0.55)',
        },
    },
};

// ============================================
// 4. TYPOGRAPHY
// ============================================
const fonts = {
    heading: 'var(--font-poppins), system-ui, sans-serif',
    body: 'var(--font-poppins), system-ui, sans-serif',
};

const fontWeights = {
    heading: 700,
    body: 500,
    normal: 500,
    medium: 600,
    semibold: 600,
    bold: 700,
    extrabold: 700,
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
            borderRadius: '12px',
            border: '2px solid',
            borderColor: 'btn.border',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            _hover: {
                bg: '#2e2e2e',
            },
            _active: {
                transform: 'scale(0.97)',
                transition: 'transform 0.1s ease',
            },
            // Shared disabled treatment for the whole app.
            //
            // `filter` desaturates the live variant uniformly (solid fills,
            // outlines, text-only variants) and keeps full alpha so the chip
            // stays opaque against any bg (light or dark). No `opacity` here —
            // that lets light-mode page bg bleed through.
            //
            // `pointerEvents: 'none'` is the load-bearing line. Chakra's
            // framework default has `_hover: { _disabled: { bg: 'initial' } }`,
            // which wipes the chip's bg to transparent the moment you hover a
            // disabled button. `:hover:disabled` has higher specificity than
            // `:disabled`, so it can't be cascaded over from _disabled.
            // Disabling pointer events on the button itself stops `:hover`
            // from ever firing, sidestepping the reset. Wrapping Tooltips
            // still detect hover on their parent <Box>, so they continue to
            // show their label (e.g. the Cloudflare-pending tooltip).
            _disabled: {
                filter: 'saturate(0.45) brightness(0.92)',
                cursor: 'not-allowed',
                pointerEvents: 'none',
                boxShadow: 'none',
                _active: { transform: 'none' },
            },
            // Loading: a lighter desaturation so the spinner reads against
            // the chip while the live identity is mostly preserved.
            _loading: {
                filter: 'saturate(0.75)',
                pointerEvents: 'none',
                _active: { transform: 'none' },
            },
        },
        variants: {
            base: {},

            // ─── Tactile feel — Group A (hero / marketing CTAs) ──────────────
            // Recipe: hairline highlight on top, dark "edge" underneath, no
            // hover lift, press sinks 2px and the edge collapses. 80ms snap.
            //
            // tactilePrimary    — solid green. Default brand action.
            // tactileOutline    — green outline. Secondary action paired with primary.
            // tactileNeutral    — charcoal outline. Neutral secondary (no go/stop tone).
            // tactileDestructive — pink outline. Destructive secondary.
            // tactileTelegram   — solid telegram-blue. Newsletter/community CTA.
            //
            // Sizes (44 / 48 / 56 px) come from the consumer via `height` or
            // Chakra's `size` prop; the variant only owns the mechanic.
            tactilePrimary: {
                bg: 'brand.green',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 700,
                letterSpacing: '0.02em',
                boxShadow:
                    'inset 0 1px 0 rgba(255,255,255,0.18), 0 2px 0 #22674E',
                transition:
                    'transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 80ms ease, background-color 80ms ease',
                _hover: { bg: 'brand.green' },
                _active: {
                    bg: 'brand.greenDark',
                    transform: 'translateY(2px)',
                    boxShadow:
                        'inset 0 2px 4px rgba(0,0,0,0.18), 0 0 0 #22674E',
                },
            },
            tactileOutline: {
                bg: 'transparent',
                color: 'brand.green',
                border: '2px solid',
                borderColor: 'brand.green',
                borderRadius: '12px',
                fontWeight: 700,
                letterSpacing: '0.02em',
                boxShadow: '0 2px 0 #22674E',
                transition:
                    'transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 80ms ease, background-color 80ms ease, border-color 80ms ease, color 80ms ease',
                _hover: {
                    bg: 'rgba(54, 163, 123, 0.12)',
                    borderColor: 'brand.greenDark',
                    color: 'brand.greenDark',
                },
                _active: {
                    bg: 'rgba(54, 163, 123, 0.18)',
                    borderColor: 'brand.greenDark',
                    color: 'brand.greenDark',
                    transform: 'translateY(2px)',
                    boxShadow: '0 0 0 #22674E',
                },
            },
            // tactileNeutral — charcoal outline. Low-stakes secondary action with
            // no go/stop connotation (e.g. viewing an ended tournament's results).
            tactileNeutral: {
                bg: 'transparent',
                color: 'text.secondary',
                border: '2px solid',
                borderColor: 'currentColor',
                borderRadius: '12px',
                fontWeight: 700,
                letterSpacing: '0.02em',
                boxShadow: '0 2px 0 rgba(11, 20, 48, 0.18)',
                _dark: { boxShadow: '0 2px 0 rgba(0, 0, 0, 0.45)' },
                transition:
                    'transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 80ms ease, background-color 80ms ease, color 80ms ease',
                _hover: {
                    bg: 'rgba(128, 128, 128, 0.14)',
                    color: 'text.primary',
                },
                _active: {
                    bg: 'rgba(128, 128, 128, 0.2)',
                    transform: 'translateY(2px)',
                    boxShadow: '0 0 0',
                },
            },
            tactileDestructive: {
                bg: 'transparent',
                color: 'brand.pink',
                border: '2px solid',
                borderColor: 'brand.pink',
                borderRadius: '12px',
                fontWeight: 700,
                letterSpacing: '0.02em',
                boxShadow: '0 2px 0 #950839',
                transition:
                    'transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 80ms ease, background-color 80ms ease, border-color 80ms ease, color 80ms ease',
                _hover: {
                    bg: 'rgba(235, 11, 92, 0.12)',
                    borderColor: 'brand.pinkDark',
                    color: 'brand.pinkDark',
                },
                _active: {
                    bg: 'rgba(235, 11, 92, 0.18)',
                    borderColor: 'brand.pinkDark',
                    color: 'brand.pinkDark',
                    transform: 'translateY(2px)',
                    boxShadow: '0 0 0 #950839',
                },
            },
            tactileTelegram: {
                bg: 'brand.telegram',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 700,
                letterSpacing: '0.02em',
                boxShadow:
                    'inset 0 1px 0 rgba(255,255,255,0.18), 0 2px 0 #006A9D',
                transition:
                    'transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 80ms ease, background-color 80ms ease',
                _hover: { bg: 'brand.telegram' },
                _active: {
                    bg: 'brand.telegramDark',
                    transform: 'translateY(2px)',
                    boxShadow:
                        'inset 0 2px 4px rgba(0,0,0,0.18), 0 0 0 #006A9D',
                },
            },
            // tactileGold — solid brand yellow. Celebratory CTA (tournament win).
            // Dark ink for contrast on the bright fill.
            tactileGold: {
                bg: 'brand.yellow',
                color: '#3D2C00',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 700,
                letterSpacing: '0.02em',
                boxShadow:
                    'inset 0 1px 0 rgba(255,255,255,0.4), 0 2px 0 #8A6A00',
                transition:
                    'transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 80ms ease, background-color 80ms ease',
                _hover: { bg: 'brand.yellow' },
                _active: {
                    bg: 'brand.yellowDark',
                    transform: 'translateY(2px)',
                    boxShadow:
                        'inset 0 2px 4px rgba(0,0,0,0.18), 0 0 0 #8A6A00',
                },
            },

            themeButton: {
                border: 'none',
                bg: 'transparent',
                color: 'brand.darkNavy',
                _hover: {
                    bg: 'transparent',
                    color: 'brand.pink',
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
            // Tactile preset chips — Group B (raise presets: 1/2 Pot, Pot, +5, etc.)
            // Sizing preserved verbatim from prior variant; visual recipe is a
            // solid navy chip so the chips read on any surrounding bg (light
            // page bg, dark page bg, or the felt strip in the Footer). Mode-
            // invariant — brand.navy reads on both light and dark.
            // _disabled handled by Button.baseStyle.
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
                borderRadius: '10px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
                boxShadow:
                    'inset 0 1px 0 rgba(255,255,255,0.18), 0 1.5px 0 #1B2754',
                transition:
                    'transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 80ms ease, background-color 80ms ease',
                _hover: { bg: 'brand.navy' },
                _active: {
                    bg: 'brand.darkNavy',
                    transform: 'translateY(1.5px)',
                    boxShadow:
                        'inset 0 2px 4px rgba(0,0,0,0.18), 0 0 0 #1B2754',
                },
            },
            // Desktop nav links — Group F (top-of-page nav on home/marketing).
            //
            // Typography-only chrome: no bg, no edge, no border. Hover is
            // a color shift to brand.pink — kept deliberately as the brand
            // accent for nav (the rest of the system uses pink only for
            // destructive, but desktop nav is the one place where pink is
            // the brand-voice nav highlight). Press is a 1px sink + color
            // darken; no bg/inset since there's no surface to indent. Snap
            // 80ms transitions.
            //
            // The disabled "Leaderboard" consumer in HomeNavBar overrides
            // `_hover.color` back to `text.primary` so the pink hover
            // doesn't fire on the soon-coming entry.
            navLink: {
                bg: 'none',
                fontSize: { base: '2xl', md: '2xl' },
                fontWeight: 'black',
                color: 'text.primary',
                textTransform: 'uppercase',
                border: 'none',
                outline: 'none',
                boxShadow: 'none',
                transition:
                    'transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), color 120ms ease, background-color 120ms ease',
                _hover: {
                    color: 'brand.pink',
                    bg: 'none',
                    border: 'none',
                    outline: 'none',
                    boxShadow: 'none',
                },
                _focus: {
                    border: 'none',
                    outline: 'none',
                    boxShadow: 'none',
                    bg: 'none',
                },
                _active: {
                    color: 'brand.pinkDark',
                    transform: 'translateY(1px)',
                    bg: 'none',
                    border: 'none',
                    outline: 'none',
                    boxShadow: 'none',
                },
            },
            // Tactile chrome — Group C (table NavBar utility chips)
            //
            // For *secondary* chrome (settings, volume, chat, away, leave,
            // burger, etc.) — the same family as primary tactile actions but
            // quieter: 1px edge, lower-contrast bg, snap 80ms press, no hover
            // lift. Mode-aware so the chip reads on both light and dark page
            // bg. _disabled handled by Button.baseStyle.
            //
            // For ACTIVE toggle states (Leave queued, Away rejoin pending,
            // Pause active, etc.) consumers render a solid-tone tactile chip
            // inline — see the consumers in NavBar/* for the pattern.
            tactileChrome: {
                bg: 'rgba(0,0,0,0.05)',
                color: 'text.secondary',
                border: '1px solid',
                borderColor: 'rgba(0,0,0,0.10)',
                borderRadius: '12px',
                boxShadow:
                    'inset 0 1px 0 rgba(255,255,255,0.50), 0 1px 0 rgba(0,0,0,0.10)',
                transition:
                    'transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 80ms ease, background-color 80ms ease, color 80ms ease, border-color 80ms ease',
                _hover: {
                    bg: 'rgba(0,0,0,0.08)',
                    color: 'text.primary',
                    borderColor: 'rgba(0,0,0,0.18)',
                },
                _active: {
                    bg: 'rgba(0,0,0,0.12)',
                    transform: 'translateY(1px)',
                    boxShadow:
                        'inset 0 1px 2px rgba(0,0,0,0.15), 0 0 0 transparent',
                },
                _dark: {
                    bg: 'rgba(255,255,255,0.06)',
                    color: 'rgba(255,255,255,0.85)',
                    borderColor: 'rgba(255,255,255,0.14)',
                    boxShadow:
                        'inset 0 1px 0 rgba(255,255,255,0.06), 0 1px 0 rgba(0,0,0,0.4)',
                    _hover: {
                        bg: 'rgba(255,255,255,0.10)',
                        color: 'white',
                        borderColor: 'rgba(255,255,255,0.20)',
                    },
                    _active: {
                        bg: 'rgba(0,0,0,0.20)',
                        transform: 'translateY(1px)',
                        boxShadow:
                            'inset 0 1px 2px rgba(0,0,0,0.30), 0 0 0 transparent',
                    },
                },
            },
            // Tactile ghost — for in-card utility toggles (chat header
            // buttons, scroll arrows in dense surfaces) where the chip-
            // style chrome of `tactileChrome` would add too much visual
            // weight. Transparent resting, hover fills with a light bg
            // tint, snap 80ms press with subtle translateY(1px).
            // Mode-aware via semantic tokens. _disabled handled by
            // Button.baseStyle.
            tactileGhost: {
                bg: 'transparent',
                color: 'text.secondary',
                border: 'none',
                borderRadius: '8px',
                transition:
                    'transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), background-color 80ms ease, color 80ms ease',
                _hover: {
                    bg: 'card.lightGray',
                    color: 'text.primary',
                },
                _active: {
                    bg: 'border.lightGray',
                    transform: 'translateY(1px)',
                },
                _focus: { boxShadow: 'none' },
                _focusVisible: {
                    boxShadow: '0 0 0 2px rgba(54, 163, 123, 0.4)',
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

    // MENU COMPONENT
    // Chakra v2's default MenuItem _focus/_hover uses a dark fill that's
    // correct in dark mode but breaks in light mode (auto-focus on open
    // makes it visible immediately). This baseline gives every Menu in
    // the app a sane mode-aware default; specific menus can still
    // override _focus/_hover per use case.
    Menu: {
        baseStyle: {
            list: {
                bg: 'card.white',
                borderColor: 'border.lightGray',
                _dark: {
                    bg: 'card.darkNavy',
                    borderColor: 'whiteAlpha.200',
                },
            },
            item: {
                bg: 'transparent',
                color: 'text.primary',
                _hover: { bg: 'card.lightGray' },
                _focus: { bg: 'card.lightGray' },
                _active: { bg: 'card.lightGray' },
                _dark: {
                    _hover: { bg: 'whiteAlpha.100' },
                    _focus: { bg: 'whiteAlpha.100' },
                    _active: { bg: 'whiteAlpha.100' },
                },
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
    // Premium layered shadows
    glass: '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
    'glass-hover':
        '0 16px 48px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
    'glass-active':
        '0 4px 16px rgba(0, 0, 0, 0.1), 0 1px 4px rgba(0, 0, 0, 0.06)',
    'glow-green':
        '0 0 20px rgba(54, 163, 123, 0.4), 0 0 60px rgba(54, 163, 123, 0.15)',
    'glow-pink':
        '0 0 20px rgba(235, 11, 92, 0.4), 0 0 60px rgba(235, 11, 92, 0.15)',
    'glow-yellow':
        '0 0 20px rgba(253, 197, 29, 0.4), 0 0 60px rgba(253, 197, 29, 0.15)',
    'btn-premium':
        '0 4px 14px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
    'btn-premium-hover':
        '0 8px 24px rgba(0, 0, 0, 0.15), 0 2px 6px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.25)',
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
