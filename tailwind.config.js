/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef3fb",
          100: "#d7e3f7",
          200: "#b0c8ef",
          300: "#7da6e3",
          400: "#4f7fd2",
          500: "#2e5fbe",
          600: "#204aa0",
          700: "#163b7e",
          800: "#0C2C55",
          900: "#071f3c",
        },
      },
      boxShadow: {
        soft: "0 10px 25px rgba(2, 6, 23, 0.08)",
      },
    },
  },
  plugins: [],
};
