/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2ECC71',
        primaryDark: '#1B8F4C',
        ink: '#141A17',
        muted: '#6B7570',
        surface: '#FFFFFF',
        bg: '#F7F9F8',
        gold: '#F1C40F',
      },
      borderRadius: {
        xl2: '20px',
      },
    },
  },
  plugins: [],
};
