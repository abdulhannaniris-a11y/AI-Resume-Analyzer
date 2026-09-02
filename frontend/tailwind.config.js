/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#F6F5F1",
        ink: "#1B2A2E",
        "ink-soft": "#4A5A5E",
        line: "#DAD6CC",
        signal: {
          DEFAULT: "#1F7A5C",
          50: "#EAF4F0",
          600: "#1F7A5C",
          700: "#175D46",
        },
        amber: {
          DEFAULT: "#B9821A",
          50: "#FBF3E4",
        },
        clay: {
          DEFAULT: "#B4482F",
          50: "#F7E9E5",
        },
      },
      fontFamily: {
        serif: ["Source Serif 4", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "14px",
      },
    },
  },
  plugins: [],
};
