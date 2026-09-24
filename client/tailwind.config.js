/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        polar: {
          950: '#06111d',
          900: '#0a1d2d',
          850: '#0e2a40',
          800: '#153952',
          700: '#1f4e6c',
          600: '#2e698a',
          500: '#438bad',
          400: '#69b7d2',
          300: '#98d5e5',
          200: '#c2e8f0',
          100: '#e1f5f8',
          50: '#f3fbfc',
        },
        ice: {
          cyan: '#38ef7d',
          accent: '#00d2ff',
          frost: '#e0f7fa',
          glow: '#00f2fe',
        },
        blizzard: {
          red: '#ff4b4b',
          amber: '#f59e0b',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'polar-glow': '0 0 20px rgba(0, 210, 255, 0.15)',
        'frost-card': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      }
    },
  },
  plugins: [],
}
