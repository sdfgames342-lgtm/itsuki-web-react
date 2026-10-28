/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        pink:    { DEFAULT: '#FFB7C5', dark: '#F497A9' },
        bg:      { DEFAULT: '#0f0c0e', deep: '#0a0809' },
        success: '#22c55e',
        warning: '#eab308',
        danger:  '#ef4444',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        mono:  ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      fontSize: {
        'fluid-xs':   'clamp(0.7rem, 1.5vw, 0.8rem)',
        'fluid-sm':   'clamp(0.8rem, 2vw, 0.95rem)',
        'fluid-base': 'clamp(0.95rem, 2.5vw, 1.1rem)',
        'fluid-lg':   'clamp(1.1rem, 3vw, 1.4rem)',
        'fluid-xl':   'clamp(1.4rem, 4vw, 2rem)',
        'fluid-2xl':  'clamp(1.8rem, 5vw, 2.8rem)',
      },
      spacing: {
        'phi-xs': '0.382rem', 'phi-sm': '0.618rem', 'phi-md': '1rem',
        'phi-lg': '1.618rem', 'phi-xl': '2.618rem',
      },
    },
  },
  plugins: [],
};
