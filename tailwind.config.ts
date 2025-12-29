import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Vos couleurs personnalisées
        orange: { 500: "#f97316", 600: "#ea580c" },
        blue: { 500: "#3b82f6", 600: "#2563eb", 700: "#1d4ed8" }
      },
    },
  },
  plugins: [],
};
export default config;