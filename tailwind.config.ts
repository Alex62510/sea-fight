import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './features/**/*.{js,ts,jsx,tsx,mdx}',
    './widgets/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      keyframes: {
        shine: {
          '0%': { backgroundPosition: '-200% 0%' },
          '100%': { backgroundPosition: '200% 0%' },
        },
      },
      animation: {
        shine: 'shine 2s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
