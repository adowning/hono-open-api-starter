/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Onacona', 'sans-serif'],
      },
       animation: {
        'deal-card': 'deal-card 0.6s linear forwards',
        'loading': 'loading-animation 1s ease infinite',
      },
      keyframes: {
        'deal-card': {
          '0%, 50%': { transform: 'rotateY(-180deg)' },
          '100%': { transform: 'rotateY(0deg)' },
        },
        'loading-animation': {
            '0%': { transform: 'translateX(-100%)' },
            '50%': { transform: 'translateX(100%)' },
            '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@inspira-ui/plugins'),
  ],
}