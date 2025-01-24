import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      gridTemplateColumns: {
        '7': 'repeat(7, minmax(0, 1fr))',
        '9': 'repeat(9, minmax(0, 1fr))',
      }
    },
  },
  plugins: [],
}

export default config