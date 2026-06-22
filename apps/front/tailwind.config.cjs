/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  important: '#root',
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#0EA5E9', dark: '#0284C7', light: '#38BDF8' },
        teal: { DEFAULT: '#14B8A6', dark: '#0D9488' },
        navy: { DEFAULT: '#0F172A', light: '#1E293B' },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        display: ['Sora', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

