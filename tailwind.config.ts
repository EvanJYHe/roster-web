import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#050505",
        paper: "#f3f3f1",
      },
      opacity: {
        12: "0.12",
        14: "0.14",
        16: "0.16",
        22: "0.22",
        32: "0.32",
        35: "0.35",
        38: "0.38",
        42: "0.42",
        45: "0.45",
        55: "0.55",
        56: "0.56",
        65: "0.65",
        75: "0.75",
        82: "0.82",
        88: "0.88",
        92: "0.92",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Display"',
          '"Helvetica Neue"',
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "SFMono-Regular",
          '"Roboto Mono"',
          '"Cascadia Code"',
          '"Liberation Mono"',
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
