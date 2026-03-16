import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cash Closers Premium Black & Gold Theme
        gold: {
          50: "#FDF8E7",
          100: "#FAF0CF",
          200: "#F5E1A0",
          300: "#F0D270",
          400: "#EBC341",
          500: "#D4AF37", // Primary Gold
          600: "#B8962F",
          700: "#9C7D27",
          800: "#80641F",
          900: "#644B17",
          950: "#4A380F",
        },
        dark: {
          50: "#E8E8E8",
          100: "#D1D1D1",
          200: "#A3A3A3",
          300: "#757575",
          400: "#474747",
          500: "#1A1A1A",
          600: "#151515",
          700: "#101010",
          800: "#0A0A0A", // Main Background
          900: "#050505",
          950: "#000000",
        },
        panel: {
          DEFAULT: "#111111",
          light: "#1A1A1A",
          border: "#2A2A2A",
        },
        accent: {
          success: "#10B981",
          warning: "#F59E0B",
          error: "#EF4444",
          info: "#3B82F6",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-in": "slideIn 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "pulse-gold": "pulseGold 2s infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(212, 175, 55, 0.4)" },
          "50%": { boxShadow: "0 0 0 8px rgba(212, 175, 55, 0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      boxShadow: {
        gold: "0 0 20px rgba(212, 175, 55, 0.3)",
        "gold-lg": "0 0 40px rgba(212, 175, 55, 0.4)",
        panel: "0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -2px rgba(0, 0, 0, 0.5)",
      },
      backgroundImage: {
        "gradient-gold": "linear-gradient(135deg, #D4AF37 0%, #F5C842 50%, #D4AF37 100%)",
        "gradient-dark": "linear-gradient(180deg, #0A0A0A 0%, #111111 100%)",
        "shimmer-gold": "linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.1), transparent)",
      },
    },
  },
  plugins: [],
};

export default config;
