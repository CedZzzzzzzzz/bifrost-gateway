/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        frost: {
          blue: '#2d7dd2',
          cyan: '#56c8e8',
          light: '#89dff0',
          ice: '#c8eef8',
        },
      },
    },
  },
  plugins: [],
}
