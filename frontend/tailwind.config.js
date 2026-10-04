/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          base: "#08080a",
          panel: "#111114",
          card: "#16161a",
          subsurface: "#1c1c22",
          border: "rgba(255, 255, 255, 0.08)",
          borderHover: "rgba(255, 255, 255, 0.18)",
        },
        safety: {
          amber: "#ff6b00",
          amberMuted: "rgba(255, 107, 0, 0.15)",
          amberGlow: "rgba(255, 107, 0, 0.35)",
          amberHover: "#ff8533",
        },
        telemetry: {
          chalk: "#fafafa",
          sub: "#a1a1aa",
          dim: "#71717a",
          grid: "rgba(255, 255, 255, 0.05)",
        }
      },
      fontFamily: {
        display: ['"Space Grotesk"', '"Syne"', 'sans-serif'],
        headline: ['"Syne"', '"Space Grotesk"', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', '"Instrument Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Menlo', 'monospace'],
        editorial: ['"Instrument Sans"', '"Plus Jakarta Sans"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
