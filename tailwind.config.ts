import { mijnui } from "@mijn-ui/react"
import tailwindTypography from "@tailwindcss/typography"
import animationPlugin from "tailwindcss-animate"

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}", "./node_modules/@mijn-ui/**/dist/*.js", "./node_modules/streamdown/dist/**/*.js"],
  theme: {
    extend: {
      fontFamily: {
        inter: ["var(--font-inter)", "sans-serif"],
        lora: ["var(--font-lora)", "serif"],
      },
    },
  },
  plugins: [animationPlugin, mijnui({}), tailwindTypography],
}
