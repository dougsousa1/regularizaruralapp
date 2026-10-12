import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // fundo verde-quase-preto da identidade
        noite: {
          950: "#030806",
          900: "#06100c",
          850: "#091610",
          800: "#0c1d16",
          700: "#12291f",
          600: "#1a372b",
        },
        // dourado do monograma RR
        ouro: {
          50: "#fbf4e4",
          100: "#f5e6c2",
          200: "#ecd197",
          300: "#e2b96b",
          400: "#d4a253",
          500: "#be8a3d",
          600: "#a07030",
          700: "#7d5626",
          800: "#5a3e1d",
        },
        // verde-petróleo das ações (referências)
        mata: {
          100: "#d5f0e7",
          200: "#a9e0cf",
          300: "#79c9b1",
          400: "#4fae93",
          500: "#35917a",
          600: "#2a7765",
          700: "#225f52",
          800: "#1b4a41",
          900: "#143831",
        },
      },
      fontFamily: {
        sans: ["var(--font-marca)", "var(--font-apoio)", "system-ui", "sans-serif"],
        display: ["var(--font-marca)", "var(--font-apoio)", "system-ui", "sans-serif"],
      },
      keyframes: {
        surgir: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "none" },
        },
        brilho: {
          "0%,100%": { opacity: "0.55" },
          "50%": { opacity: "0.9" },
        },
      },
      animation: {
        surgir: "surgir .45s cubic-bezier(.2,.7,.2,1) both",
        brilho: "brilho 6s ease-in-out infinite",
      },
      boxShadow: {
        vidro: "0 1px 0 0 rgba(255,255,255,0.06) inset, 0 20px 40px -24px rgba(0,0,0,0.8)",
        ouro: "0 10px 30px -12px rgba(212,162,83,0.45)",
      },
    },
  },
  plugins: [typography],
} satisfies Config;
