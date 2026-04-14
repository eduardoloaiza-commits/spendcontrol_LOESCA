import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0A0A0A",
        graphite: "#1C1F24",
        mist: "#F4F5F7",
        silver: "#D9DCE1",
        slate: { DEFAULT: "#6B7280" },
        mint: "#00E28A",
        coral: "#FF5A4E",
        deep: "#1E40FF",
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      borderRadius: { card: "12px", chip: "999px" },
      boxShadow: {
        card: "0 1px 2px rgba(10,10,10,0.04), 0 4px 16px rgba(10,10,10,0.06)",
      },
      fontSize: {
        display: ["3rem", { lineHeight: "1.1", fontWeight: "700" }],
      },
    },
  },
  plugins: [],
};
export default config;
