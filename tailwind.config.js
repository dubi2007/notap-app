/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: '#F8F9FF',
        surface: '#EFF4FF',
        primary: '#5148D8',
        textMain: '#05345C',
        textSec: '#3D618C',
      }
    },
  },
  plugins: [],
}
