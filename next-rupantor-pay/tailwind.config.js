/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb', // Tailwind blue-600
        secondary: '#4f46e5', // indigo-600
      },
    },
  },
  plugins: [],
};
