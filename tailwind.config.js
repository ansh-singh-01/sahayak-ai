/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        saffron: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
        },
        navy: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          700: '#1b365d',
          800: '#102a43',
          900: '#0b1d33',
        },
        indiaGreen: {
          50: '#f0fdf4',
          500: '#16a34a',
          600: '#15803d',
          700: '#166534',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
