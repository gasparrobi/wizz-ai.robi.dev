/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        appear: "appear 250ms linear forwards",
      },
      keyframes: {
        appear: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
      },
    },
    fontFamily: {
      mona: ["Mona Sans", "sans-serif"],
    },
  },
  plugins: [],
};

module.exports = config;
