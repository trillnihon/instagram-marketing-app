/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        instagram: {
          primary: '#E4405F',
          secondary: '#F77737',
          gradient: 'linear-gradient(45deg, #F77737, #E4405F, #C13584, #833AB4, #5851DB)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 