import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#141414",
        indigo: "#1C2541",
        vermillion: "#C8452C",
        stone: "#EDE8DD",
        gold: "#B08D57",
        moss: "#3F5F4F",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        gate: "2px",
      },
    },
  },
  plugins: [],
};
export default config;
