import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#080b0f",
        panel: "#121721",
        primary: "#3b82f6",
        accent: "#10b981",
        nodeReady: "#6b7280",
        nodeActive: "#3b82f6",
        nodeDone: "#10b981",
        nodeError: "#ef4444",
      },
    },
  },
  plugins: [],
};
export default config;
