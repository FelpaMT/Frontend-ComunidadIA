/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        mariner: {
          50:  '#eff8ff',
          100: '#dbeffe',
          200: '#bee3fd',
          300: '#91cbfc',
          400: '#5eaaf8',
          500: '#3b8bf4',
          600: '#266ce9',
          700: '#1d55d5',
          800: '#1e45ae',
          900: '#1e3c87',
          950: '#172d54',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
