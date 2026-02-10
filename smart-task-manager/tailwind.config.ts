import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f4f6f9',
          100: '#e9ecf2',
          200: '#c7d0e0',
          300: '#a5b4ce',
          400: '#617daa',
          500: '#1d4586',
          600: '#1a3e79',
          700: '#163465',
          800: '#112951',
          900: '#0e2242',
        },
        accent: {
          50: '#fdfcf9',
          100: '#faf8f3',
          200: '#f3eee1',
          300: '#ebe4cf',
          400: '#dcd0ab',
          500: '#cdbc87',
          600: '#b9a979',
          700: '#9a8d65',
          800: '#7b7151',
          900: '#655d42',
        },
        neutral: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
        },
      },
      spacing: {},
      boxShadow: {
        elegant: '0 4px 6px -1px rgba(29, 69, 134, 0.1), 0 2px 4px -1px rgba(29, 69, 134, 0.06)',
        'elegant-lg': '0 10px 15px -3px rgba(29, 69, 134, 0.1), 0 4px 6px -2px rgba(29, 69, 134, 0.05)',
        'elegant-xl': '0 20px 25px -5px rgba(29, 69, 134, 0.1), 0 10px 10px -5px rgba(29, 69, 134, 0.04)',
        'inner-elegant': 'inset 0 2px 4px 0 rgba(29, 69, 134, 0.06)',
      },
      animation: {
        'pulse-elegant': 'pulse-elegant 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'pulse-elegant': {
          '0%, 100%': { opacity: '0.5', transform: 'scale(0.98)' },
          '50%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
