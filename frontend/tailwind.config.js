export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f5f0ff",
          100: "#ece3ff",
          200: "#d8c4ff",
          300: "#bb96ff",
          400: "#9b62ff",
          500: "#7c2cf0",
          600: "#6a1fd1",
          700: "#5618ab",
          800: "#451586",
          900: "#39126c",
          950: "#220a47",
        },
        navy: {
          50: "#eef0fb",
          100: "#d6daf3",
          500: "#1c2470",
          700: "#0e1352",
          900: "#060958",
        }
      }
    },
  },
  plugins: [],
}
