import {nextui} from "@nextui-org/react"

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ["JetBrains Mono", "monospace"],
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        background: "#000000",
        foreground: "#FFFFFF",
      },
    },
  },
  darkMode: "class",
  plugins: [nextui()]
}

export default config 