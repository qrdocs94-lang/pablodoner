/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        pablo: {
          red: '#C0392B',
          darkred: '#A01F1F',
          orange: '#F39C12',
          cream: '#FFF8F0',
          beige: '#F5E6D0',
          brown: '#1A0800',
        }
      }
    },
  },
  plugins: [],
}
