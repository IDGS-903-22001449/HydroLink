/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'hydro-green': {
          DEFAULT: '#4CAF50',
          50: '#E8F5E8',
          100: '#C8E6C9',
          200: '#A5D6A7',
          300: '#81C784',
          400: '#66BB6A',
          500: '#4CAF50',
          600: '#43A047',
          700: '#388E3C',
          800: '#2E7D32',
          900: '#1B5E20',
        },
        'hydro-dark-green': {
          DEFAULT: '#274A26',
          50: '#F1F8F0',
          100: '#E2F0E0',
          200: '#C4E1C1',
          300: '#A7D3A2',
          400: '#89C483',
          500: '#6CB564',
          600: '#56924F',
          700: '#416E3A',
          800: '#2B4A25',
          900: '#274A26',
        }
      },
      spacing: {
        '15': '3.75rem',
      }
    },
  },
  plugins: [],
}
