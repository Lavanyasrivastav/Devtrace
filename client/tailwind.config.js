/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // DevTrace's own palette — deep slate + a signal-orange accent,
        // distinct from Sentry's purple/violet branding.
        brand: {
          50: '#fff7ed',
          100: '#ffedd5',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
        },
        surface: {
          DEFAULT: '#0b0f19',
          raised: '#111827',
          border: '#1f2937',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
