/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // PRIMARY: Serene Blue (#2F6FED)
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2f6fed',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // SECONDARY: Teal / Soft Healthcare Green (#2A9D8F)
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#2a9d8f',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        // Support medgreen for existing components
        medgreen: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#2a9d8f',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        // EMOTIONAL ACCENT: Soft Pinkish-Red / Muted Rose (#D96C7B)
        warmrose: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#f48291',
          500: '#e05d70',
          600: '#d96c7b',
          700: '#be4354',
          800: '#9f2e3e',
          900: '#881b29',
        },
        roseaccent: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          500: '#e05d70',
          600: '#d96c7b',
          700: '#be4354',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 10px -1px rgba(15, 23, 42, 0.05), 0 1px 3px -1px rgba(15, 23, 42, 0.03)',
        'soft-lg': '0 8px 24px -4px rgba(15, 23, 42, 0.08), 0 2px 6px -2px rgba(15, 23, 42, 0.04)',
      }
    },
  },
  plugins: [],
}
