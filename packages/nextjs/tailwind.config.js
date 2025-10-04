/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        monad: {
          green: '#00FF8C',
          'dark-green': '#004D29',
          black: '#000000',
          'dark-gray': '#111111',
          'light-gray': '#2D2D2D',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
      backdropBlur: {
        xs: '2px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass': 'linear-gradient(135deg, rgba(30, 41, 59, 0.1), rgba(51, 65, 85, 0.05))',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-inset': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
