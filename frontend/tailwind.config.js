/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        oceanic: {
          void: "#050811",
          hull: "#0b1220",
          panel: "#111b2e",
          border: "#1a273f",
          borderGlow: "#00f0ff33",
        },
        telemetry: {
          cyan: "#00f0ff",
          seafoam: "#00ff9d",
          amber: "#ffb703",
          violet: "#d946ef",
          muted: "#64748b",
        }
      },
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        sans: ['"Space Grotesk"', '"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
}
