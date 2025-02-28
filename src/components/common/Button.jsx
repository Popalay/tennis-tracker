// src/components/common/Button.jsx
export const Button = ({
  children,
  variant = "primary",
  size = "medium",
  onClick,
  disabled = false,
  fullWidth = false,
  type = "button",
  className = "",
}) => {
  // Класи для різних варіантів кнопок
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800",
    success: "bg-green-600 hover:bg-green-700 text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    link: "bg-transparent text-blue-600 hover:underline",
  };

  // Класи для різних розмірів кнопок, оптимізовані для мобільних
  const sizes = {
    small: "py-1 px-2 sm:px-3 text-xs sm:text-sm",
    medium: "py-2 px-3 sm:px-4 text-sm sm:text-base",
    large: "py-2 px-4 sm:py-3 sm:px-6 text-base sm:text-lg",
  };

  // Об'єднання всіх класів
  const classes = `
    ${variants[variant]}
    ${sizes[size]}
    ${fullWidth ? "w-full" : ""}
    rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
    transition-colors duration-200 ease-in-out
    active:opacity-90 touch-action-manipulation
    ${disabled ? "opacity-50 cursor-not-allowed" : ""}
    ${className}
  `;

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
    >
      {children}
    </button>
  );
};
