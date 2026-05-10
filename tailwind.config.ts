import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#dbe6ff",
          200: "#bfd2ff",
          300: "#93b2ff",
          400: "#6088ff",
          500: "#3a62ff",
          600: "#2440f5",
          700: "#1b30d1",
          800: "#1a2ba8",
          900: "#1c2a85",
        },
        violet: {
          500: "#8b5cf6",
          600: "#7c3aed",
        },
        teal: {
          400: "#2dd4bf",
          500: "#14b8a6",
        },
      },
      boxShadow: {
        soft: "0 10px 30px -10px rgba(36, 64, 245, 0.25)",
        glow: "0 0 0 1px rgba(139, 92, 246, 0.2), 0 12px 40px -12px rgba(139, 92, 246, 0.35)",
        card: "0 1px 2px rgba(16, 24, 40, 0.04), 0 4px 20px -4px rgba(16, 24, 40, 0.08)",
      },
      backgroundImage: {
        "mesh-light":
          "radial-gradient(at 20% 20%, rgba(99, 102, 241, 0.18) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(20, 184, 166, 0.15) 0px, transparent 50%), radial-gradient(at 80% 80%, rgba(139, 92, 246, 0.18) 0px, transparent 50%)",
        "grid-fade":
          "linear-gradient(to right, rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.08) 1px, transparent 1px)",
      },
      animation: {
        shimmer: "shimmer 2.2s linear infinite",
        "fade-in": "fadeIn 0.4s ease-out",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
