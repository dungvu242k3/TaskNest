/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0B0F17',
        surface: {
          DEFAULT: '#131927',
          hover: '#1B2436',
          border: '#2A364F',
        },
        primary: {
          DEFAULT: '#6366F1',
          hover: '#4F46E5',
          light: 'rgba(99, 102, 241, 0.15)',
        },
        private: {
          DEFAULT: '#F59E0B',
          light: 'rgba(245, 158, 11, 0.15)',
        },
        shared: {
          DEFAULT: '#6366F1',
          light: 'rgba(99, 102, 241, 0.15)',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        glow: '0 4px 20px -2px rgba(99, 102, 241, 0.25)',
        'glow-amber': '0 4px 20px -2px rgba(245, 158, 11, 0.25)',
        card: '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
};
