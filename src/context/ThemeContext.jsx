// src/context/ThemeContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  // Перевіряємо, чи є збережена тема в localStorage
  const storedTheme = localStorage.getItem("theme");

  // Встановлюємо початкову тему на основі localStorage або системних налаштувань
  const [theme, setTheme] = useState(
    storedTheme ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"),
  );

  // Функція для перемикання теми
  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === "light" ? "dark" : "light";
      // Зберігаємо нову тему в localStorage
      localStorage.setItem("theme", newTheme);
      return newTheme;
    });
  };

  // Застосовуємо тему до body при зміні
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  // Надаємо тему та функцію перемикання через контекст
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
