import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        mata: {
          50: "#f2f7f3",
          100: "#e0ece3",
          200: "#c2d9c8",
          300: "#97bea3",
          400: "#679c78",
          500: "#467f59",
          600: "#336545",
          700: "#2a5139",
          800: "#23412f",
          900: "#1d3628",
          950: "#0f1e16",
        },
        terra: {
          50: "#fbf7f1",
          100: "#f5ecdd",
          200: "#ead6b8",
          300: "#dcba8a",
          400: "#cd985b",
          500: "#c27f3d",
          600: "#b06a32",
          700: "#92522b",
          800: "#764329",
          900: "#613824",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
    },
  },
  plugins: [typography],
} satisfies Config;
