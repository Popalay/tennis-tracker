import { useTheme } from "../../context/ThemeContext";

export const ThemeToggle = ({ isMobile = false }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`rounded-full transition-all duration-200 ${
        isMobile
          ? ""
          : "p-2 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      }`}
      aria-label={
        theme === "dark" ? "Перейти на світлу тему" : "Перейти на темну тему"
      }
    >
      {theme === "dark" ? (
        <svg
          className={`${isMobile ? "w-6 h-6" : "w-5 h-5"} ${isMobile ? "text-yellow-500" : "text-yellow-400"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        <svg
          className={`${isMobile ? "w-6 h-6" : "w-5 h-5"} ${isMobile ? "text-blue-600" : "text-gray-700 dark:text-gray-300"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </button>
  );
};
