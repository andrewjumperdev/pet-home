module.exports = {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
      extend: {
        // Personalizaciones aquí
      },
    },
    plugins: [
      require('tailwind-scrollbar-hide')
    ],
  };
  