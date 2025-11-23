/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    // 🛑 CRITICAL: Scan all JS/JSX files in the src folder
    "./src/**/*.{js,ts,jsx,tsx}", 
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
