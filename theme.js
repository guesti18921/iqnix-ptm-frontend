import { createTheme, alpha } from '@mui/material/styles';

const VIOLET = {
  50:  '#EDE9FE',
  100: '#DDD6FE',
  200: '#C4B5FD',
  300: '#A78BFA',
  400: '#8B5CF6',
  500: '#7C3AED',
  600: '#6D28D9',
  700: '#5B21B6',
  800: '#4C1D95',
  900: '#2E1065',
};

const DARK = {
  default:  '#0F1117',
  paper:    '#161B27',
  elevated: '#1E2535',
  border:   '#2A3347',
  hover:    '#232D41',
};

const LIGHT = {
  default:  '#F4F5F7',
  paper:    '#FFFFFF',
  elevated: '#F9FAFB',
  border:   '#E5E7EB',
  hover:    '#F3F4F6',
};

export const buildTheme = (mode) => {
  const dark = mode === 'dark';
  const bg = dark ? DARK : LIGHT;

  return createTheme({
    palette: {
      mode,
      primary: {
        main:         VIOLET[500],
        light:        VIOLET[300],
        dark:         VIOLET[700],
        contrastText: '#FFFFFF',
      },
      background: {
        default: bg.default,
        paper:   bg.paper,
      },
      text: {
        primary:   dark ? '#F1F3F8' : '#111827',
        secondary: dark ? '#8A95A8' : '#6B7280',
        disabled:  dark ? '#4A5568' : '#9CA3AF',
      },
      divider: bg.border,
      success: { main: '#10B981', light: '#34D399', dark: '#065F46', contrastText: '#fff' },
      warning: { main: '#F59E0B', light: '#FCD34D', dark: '#92400E', contrastText: '#fff' },
      error:   { main: '#EF4444', light: '#FCA5A5', dark: '#991B1B', contrastText: '#fff' },
      info:    { main: VIOLET[400], light: VIOLET[200], dark: VIOLET[700], contrastText: '#fff' },
      action: {
        hover:    alpha(VIOLET[500], 0.08),
        selected: alpha(VIOLET[500], 0.16),
        focus:    alpha(VIOLET[500], 0.20),
      },
    },

    typography: {
      fontFamily: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'].join(','),
      fontWeightRegular: 400,
      fontWeightMedium:  500,
      fontWeightBold:    600,
      h5:     { fontSize: '1.25rem',   fontWeight: 600, letterSpacing: '-0.01em' },
      h6:     { fontSize: '1rem',      fontWeight: 600 },
      body1:  { fontSize: '0.9375rem', lineHeight: 1.6 },
      body2:  { fontSize: '0.8125rem', lineHeight: 1.55 },
      caption:{ fontSize: '0.75rem',   color: dark ? '#8A95A8' : '#6B7280' },
      button: { fontSize: '0.875rem',  fontWeight: 500, letterSpacing: '0.01em', textTransform: 'none' },
    },

    shape: { borderRadius: 8 },

    shadows: [
      'none',
      dark ? '0 1px 3px rgba(0,0,0,0.5)' : '0 1px 3px rgba(0,0,0,0.08)',
      dark ? '0 2px 8px rgba(0,0,0,0.55)' : '0 2px 8px rgba(0,0,0,0.09)',
      dark ? '0 4px 16px rgba(0,0,0,0.6)' : '0 4px 16px rgba(0,0,0,0.10)',
      ...Array(21).fill('none'),
    ],

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          '*': {
            scrollbarWidth: 'thin',
            scrollbarColor: dark ? `${DARK.border} transparent` : `${LIGHT.border} transparent`,
          },
          '*::-webkit-scrollbar':       { width: 6, height: 6 },
          '*::-webkit-scrollbar-track': { background: 'transparent' },
          '*::-webkit-scrollbar-thumb': { backgroundColor: bg.border, borderRadius: 3 },
          'html, body': { backgroundColor: bg.default },
          'input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus, input:-webkit-autofill:active': {
            WebkitBoxShadow: `0 0 0 100px ${dark ? DARK.elevated : '#fff'} inset !important`,
            WebkitTextFillColor: `${dark ? '#F1F3F8' : '#111827'} !important`,
            caretColor: dark ? '#F1F3F8' : '#111827',
            transition: 'background-color 9999s ease-in-out 0s',
          },
        },
      },

      MuiAppBar: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            backgroundColor: dark ? DARK.paper : '#FFFFFF',
            borderBottom:    'none',
            color:           dark ? '#F1F3F8' : '#111827',
          },
        },
      },

      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: dark ? DARK.paper : '#FFFFFF',
            borderRight:     'none',
            backgroundImage: 'none',
          },
        },
      },

      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { borderRadius: 8, fontWeight: 500 },
          contained: {
            backgroundColor: VIOLET[500],
            '&:hover': { backgroundColor: VIOLET[600] },
          },
          outlined: {
            borderColor: dark ? VIOLET[700] : VIOLET[200],
            color:       dark ? VIOLET[300] : VIOLET[700],
            '&:hover': { backgroundColor: alpha(VIOLET[500], 0.08), borderColor: VIOLET[500] },
          },
          text: {
            color: dark ? VIOLET[300] : VIOLET[600],
            '&:hover': { backgroundColor: alpha(VIOLET[500], 0.08) },
          },
        },
      },

      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            '&:hover': { backgroundColor: alpha(VIOLET[500], 0.10) },
          },
        },
      },

      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            margin: '2px 8px',
            padding: '8px 12px',
            '&:hover': {
              backgroundColor: dark ? DARK.hover : alpha(VIOLET[500], 0.06),
            },
            '&.Mui-selected': {
              backgroundColor: dark ? alpha(VIOLET[500], 0.16) : alpha(VIOLET[500], 0.10),
              color:           dark ? VIOLET[300] : VIOLET[700],
              '& .MuiListItemIcon-root': { color: dark ? VIOLET[400] : VIOLET[600] },
              '&:hover': { backgroundColor: dark ? alpha(VIOLET[500], 0.22) : alpha(VIOLET[500], 0.14) },
            },
          },
        },
      },

      MuiListItemIcon: {
        styleOverrides: {
          root: { minWidth: 36, color: dark ? '#8A95A8' : '#6B7280' },
        },
      },

      MuiListItemText: {
        styleOverrides: {
          primary: { fontSize: '0.9rem', fontWeight: 500 },
        },
      },

      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            backgroundColor: dark ? DARK.paper : '#FFFFFF',
            border:          `1px solid ${bg.border}`,
            borderRadius:    12,
            backgroundImage: 'none',
          },
        },
      },

      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: dark ? DARK.paper : '#FFFFFF',
          },
          elevation0: { border: 'none' },
        },
      },

      MuiTableContainer: {
        styleOverrides: {
          root: {
            border:          `1px solid ${bg.border}`,
            borderRadius:    12,
            backgroundColor: dark ? DARK.paper : '#FFFFFF',
            overflowX:       'auto',            // горизонтальная прокрутка на узких экранах
            WebkitOverflowScrolling: 'touch',   // плавная прокрутка на iOS
          },
        },
      },
      MuiTable: {
        styleOverrides: {
          root: {
            borderCollapse: 'separate',
            borderSpacing: 0,
            minWidth: 600,   // таблица не сжимается в кашу, а прокручивается
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-head': {
              backgroundColor: dark ? DARK.elevated : '#F9FAFB',
              color:           dark ? '#8A95A8' : '#6B7280',
              fontSize:        '0.75rem',
              fontWeight:      600,
              letterSpacing:   '0.06em',
              textTransform:   'uppercase',
              padding:         '10px 16px',
              borderBottom:    `1px solid ${bg.border}`,
            },
          },
        },
      },
      MuiTableBody: {
        styleOverrides: {
          root: {
            '& .MuiTableRow-root': {
              transition: 'background 0.12s',
              '&:hover': { backgroundColor: dark ? DARK.hover : '#F9FAFB' },
              '&:last-child .MuiTableCell-root': { borderBottom: 'none' },
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: { borderBottom: `1px solid ${bg.border}`, padding: '12px 16px', fontSize: '0.9rem' },
        },
      },

      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            backgroundColor: dark ? DARK.elevated : '#FFFFFF',
            '& .MuiOutlinedInput-notchedOutline': { borderColor: bg.border },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: dark ? VIOLET[600] : VIOLET[300] },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: VIOLET[500], borderWidth: 1 },
          },
          input: { fontSize: '0.9375rem', padding: '10px 14px' },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: { fontSize: '0.9rem', '&.Mui-focused': { color: VIOLET[400] } },
        },
      },

      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 6, fontWeight: 500, fontSize: '0.75rem' },
          colorPrimary: {
            backgroundColor: dark ? alpha(VIOLET[500], 0.18) : VIOLET[50],
            color:           dark ? VIOLET[300] : VIOLET[700],
          },
          colorSuccess: {
            backgroundColor: dark ? alpha('#10B981', 0.18) : '#D1FAE5',
            color:           dark ? '#34D399' : '#065F46',
          },
          colorWarning: {
            backgroundColor: dark ? alpha('#F59E0B', 0.18) : '#FEF3C7',
            color:           dark ? '#FCD34D' : '#92400E',
          },
          colorError: {
            backgroundColor: dark ? alpha('#EF4444', 0.18) : '#FEE2E2',
            color:           dark ? '#FCA5A5' : '#991B1B',
          },
        },
      },

      MuiDialog: {
        defaultProps: { slotProps: { paper: { elevation: 0 } } },
        styleOverrides: {
          paper: {
            backgroundColor: dark ? DARK.elevated : '#FFFFFF',
            border:          `1px solid ${bg.border}`,
            borderRadius:    16,
            backgroundImage: 'none',
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: { fontSize: '1.0625rem', fontWeight: 600, padding: '20px 24px 12px' },
        },
      },
      MuiDialogContent: {
        styleOverrides: { root: { padding: '8px 24px 16px' } },
      },
      MuiDialogActions: {
        styleOverrides: {
          root: { padding: '12px 24px 20px', borderTop: `1px solid ${bg.border}`, gap: 8 },
        },
      },

      MuiAlert: {
        styleOverrides: {
          root: { borderRadius: 8, fontSize: '0.875rem' },
          standardSuccess: {
            backgroundColor: dark ? alpha('#10B981', 0.12) : '#D1FAE5',
            color:           dark ? '#34D399' : '#065F46',
          },
          standardError: {
            backgroundColor: dark ? alpha('#EF4444', 0.12) : '#FEE2E2',
            color:           dark ? '#FCA5A5' : '#991B1B',
          },
          standardInfo: {
            backgroundColor: dark ? alpha(VIOLET[500], 0.12) : VIOLET[50],
            color:           dark ? VIOLET[300] : VIOLET[800],
          },
        },
      },

      MuiDivider: {
        styleOverrides: { root: { borderColor: bg.border } },
      },

      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: dark ? DARK.elevated : '#1F2937',
            color:           '#F9FAFB',
            fontSize:        '0.8rem',
            borderRadius:    6,
            padding:         '6px 10px',
          },
        },
      },
    },
  });
};

export const darkTheme  = buildTheme('dark');
export const lightTheme = buildTheme('light');
export { VIOLET };