import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors - Black / White / Red
        'bg-main': '#FFFFFF',
        'bg-card': '#FFFFFF',
        'text-primary': '#1A1A1A',
        'text-secondary': '#555',
        'text-accent': '#B00',
      },
      fontFamily: {
        sans: ['var(--font-main)', 'Noto Sans KR', 'system-ui', 'sans-serif'],
        hand: ['var(--font-hand)', 'cursive'],
        display: ['var(--font-display)', 'sans-serif'],
      },
      borderRadius: {
        'sticky': '20px',
        'sticky-lg': '24px',
        'sticky-xl': '28px',
        'sticky-2xl': '32px',
      },
      boxShadow: {
        'sticky': '0 8px 24px rgba(0, 0, 0, 0.08)',
        'sticky-lg': '0 12px 32px rgba(0, 0, 0, 0.12)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.08)',
      },
      height: {
        'dvh': '100dvh',
      },
      minHeight: {
        'dvh': '100dvh',
      },
      spacing: {
        'touch': '44px',
        'touch-lg': '48px',
      },
    },
  },
  plugins: [],
};

export default config;
