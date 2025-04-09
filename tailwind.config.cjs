module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    // Add any other template paths here
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4f46e5', // Example custom color
        secondary: '#10b981',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Example custom font
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'), // Optional form plugin
    require('@tailwindcss/typography'), // Optional typography plugin
  ],
  corePlugins: {
    preflight: true, // Ensures Tailwind's base styles are loaded
  }
}