/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", "sans-serif"],
      },
    },
  },
  plugins: [],
};
