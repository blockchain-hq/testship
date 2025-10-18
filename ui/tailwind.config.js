/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#F5F5F5", // very light grey
          dark: "#1E1E2E", // deep navy/indigo
        },
        foreground: {
          DEFAULT: "#101010", // dark black
          dark: "#E0E0E0", // light grey for dark mode
        },
        surface: {
          DEFAULT: "#FFFFFF", // white
          secondary: "#F8F9FA", // very light grey
          dark: "#2A2A3B", // dark navy
          "dark-secondary": "#242436", // darker navy
        },
        accent: {
          primary: "#5C7CFA", // electric blue
          secondary: "#2DD4BF", // teal
          error: "#F87566", // coral/red
          success: "#2DD4BF", // teal
          warning: "#FBBF24", // amber
        },
        border: {
          DEFAULT: "#E5E7EB", // light grey
          dark: "#374151", // dark grey
        },
        input: {
          DEFAULT: "#FFFFFF", // white
          dark: "#1F2937", // dark grey
          border: "#D1D5DB", // light border
          "border-dark": "#4B5563", // dark border
        },
        card: {
          DEFAULT: "#FFFFFF", // white
          dark: "#2A2A3B", // dark navy
          border: "#E5E7EB", // light border
          "border-dark": "#374151", // dark border
        },
        log: {
          success: "#10B981", // emerald
          error: "#EF4444", // red
          warning: "#F59E0B", // amber
          info: "#3B82F6", // blue
        },
      },
      fontFamily: {
        mono: [
          "JetBrains Mono",
          "Fira Code",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
