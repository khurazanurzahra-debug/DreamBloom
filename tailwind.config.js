/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ivory: "#FFF8F1",
        champagne: "#F2E8D5",
        gold: "#C6A670",
        ink: "#1F1F1F",
        muted: "#8B8B82",
        border: "#F1EEE6",
        peach: "#F3C9B4",
        sage: "#BFD3BC",
        lavender: "#D9CFE8",
        skyblue: "#B9CBE0",
        beige: "#E4D9C4",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Fraunces", "Georgia", "serif"],
      },
      borderRadius: {
        xs: "12px",
        sm: "14px",
        md: "18px",
        lg: "20px",
        xl: "24px",
      },
      boxShadow: {
        soft: "0 6px 20px rgba(43,38,32,0.05)",
        card: "0 4px 14px rgba(43,38,32,0.045)",
        pop: "0 12px 28px rgba(43,38,32,0.12)",
      },
      keyframes: {
        shimmer: {
          "0%, 100%": { opacity: "0.15", transform: "translateX(-10%)" },
          "50%": { opacity: "0.35", transform: "translateX(10%)" },
        },
      },
      animation: {
        shimmer: "shimmer 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
