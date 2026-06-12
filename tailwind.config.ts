import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/shared/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
        sans: ["sohne", "Helvetica Neue", "Arial", "sans-serif"],
      },
      colors: {
        brand: {
          green: "#1a8917",
          "green-dark": "#156912",
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",
            color: "#292929",
            a: { color: "#1a8917" },
            "h1,h2,h3,h4": { fontFamily: "Georgia, serif", fontWeight: "700" },
            p: { lineHeight: "1.8", marginBottom: "1.5em" },
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
