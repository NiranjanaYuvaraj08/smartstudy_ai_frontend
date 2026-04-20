/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#ecfdf5',
                    100: '#d1fae5',
                    200: '#a7f3d0',
                    300: '#6ee7b7',
                    400: '#34d399',
                    500: '#10b981', // Emerald 500
                    600: '#059669', // Emerald 600
                    700: '#047857',
                    800: '#065f46',
                    900: '#064e3b',
                    DEFAULT: '#10b981',
                },
                emeraldPrimary: "#10b981",
                emeraldDark: "#065f46",
                blackDeep: "#050505",
                darkbg: '#0a0f0d',
                darkpanel: '#111827',
                dark: {
                    bg: '#0a0f0d',
                    card: '#111827',
                    surface: '#1f2937',
                    text: '#f8fafc',
                    muted: '#94a3b8'
                }
            },
            boxShadow: {
                'glow': '0 0 15px rgba(16, 185, 129, 0.5)',
                'glow-hover': '0 0 25px rgba(16, 185, 129, 0.7)',
                'emeraldGlow': '0 0 20px rgba(16, 185, 129, 0.6)',
                'emeraldStrong': '0 0 40px rgba(16, 185, 129, 0.8)',
                'emeraldGlowSoft': '0 0 30px rgba(16, 185, 129, 0.1)',
                'emeraldGlowMedium': '0 0 30px rgba(16, 185, 129, 0.25)',
                'emeraldGlowHover': '0 0 40px rgba(16, 185, 129, 0.2)',
            },
            fontFamily: {
                sans: ['Candara', 'sans-serif'],
                candara: ['Candara', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-in-out',
                'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                'shimmer': 'shimmer 2s linear infinite',
                'float': 'float 6s ease-in-out infinite',
                'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-1000px 0' },
                    '100%': { backgroundPosition: '1000px 0' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                pulseGlow: {
                    '0%, 100%': { opacity: '1', transform: 'scale(1)' },
                    '50%': { opacity: '.8', transform: 'scale(1.05)' },
                }
            }
        }
    },
    darkMode: 'class',
    plugins: [],
}
