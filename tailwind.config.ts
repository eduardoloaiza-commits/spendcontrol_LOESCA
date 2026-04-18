import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#004bba",
        "primary-container": "#2a64d9",
        "primary-fixed": "#dae2ff",
        "primary-fixed-dim": "#b2c5ff",
        "on-primary": "#ffffff",
        "on-primary-container": "#e8ecff",
        "on-primary-fixed": "#001848",
        "on-primary-fixed-variant": "#0040a1",
        "inverse-primary": "#b2c5ff",

        secondary: "#515e7c",
        "secondary-container": "#cddafd",
        "secondary-fixed": "#d8e2ff",
        "secondary-fixed-dim": "#b9c6e9",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#525f7d",
        "on-secondary-fixed": "#0d1b35",
        "on-secondary-fixed-variant": "#3a4763",

        tertiary: "#006117",
        "tertiary-container": "#237b2c",
        "tertiary-fixed": "#9df898",
        "tertiary-fixed-dim": "#82db7e",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#b6ffae",
        "on-tertiary-fixed": "#002204",
        "on-tertiary-fixed-variant": "#005312",

        error: "#ba1a1a",
        "error-container": "#ffdad6",
        "on-error": "#ffffff",
        "on-error-container": "#93000a",

        surface: "#f7f9ff",
        "surface-bright": "#f7f9ff",
        "surface-dim": "#d7dae0",
        "surface-tint": "#1357cc",
        "surface-variant": "#dfe3e8",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f1f4fa",
        "surface-container": "#ebeef4",
        "surface-container-high": "#e5e8ee",
        "surface-container-highest": "#dfe3e8",
        "on-surface": "#181c20",
        "on-surface-variant": "#434654",
        background: "#f7f9ff",
        "on-background": "#181c20",
        "inverse-surface": "#2d3135",
        "inverse-on-surface": "#eef1f7",

        outline: "#737785",
        "outline-variant": "#c3c6d6",
      },
      fontFamily: {
        headline: ["Plus Jakarta Sans", "Inter", "sans-serif"],
        body: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        card: "12px",
        bento: "2rem",
        chip: "9999px",
        full: "9999px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(10,10,10,0.04), 0 4px 16px rgba(10,10,10,0.06)",
        hero: "0 20px 60px -20px rgba(0,75,186,0.35)",
        sidebar: "4px 0 24px rgba(24,28,32,0.04)",
      },
      fontSize: {
        display: ["3rem", { lineHeight: "1.1", fontWeight: "800" }],
      },
    },
  },
  plugins: [],
};
export default config;
