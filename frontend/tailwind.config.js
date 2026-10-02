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
          void: "#070d18",
          hull: "#0f172a",
          panel: "#131e33",
          border: "#1e293b",
          borderGlow: "#00e5ff33",
        },
        telemetry: {
          cyan: "#00e5ff",
          seafoam: "#10b981",
          amber: "#f59e0b",
          violet: "#d946ef",
          muted: "#94a3b8",
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
