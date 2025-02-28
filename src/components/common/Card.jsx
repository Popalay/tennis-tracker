// src/components/common/Card.jsx
export const Card = ({ children, title, className = "", footer, onClick }) => {
  const cardClasses = `
    bg-white dark:bg-gray-800
    shadow-lg rounded-xl
    p-3 sm:p-5 my-3
    border border-gray-100 dark:border-gray-700
    transition-all duration-200
    ${onClick ? "cursor-pointer hover:shadow-xl hover:scale-[1.01] active:shadow-md active:scale-[0.99]" : ""}
    ${className}
  `;

  return (
    <div 
      className={cardClasses} 
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {title && (
        <div className="mb-3 sm:mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            {title}
          </h2>
        </div>
      )}

      <div className="text-gray-700 dark:text-gray-300">{children}</div>

      {footer && (
        <div className="mt-3 sm:mt-4 pt-2 border-t border-gray-200 dark:border-gray-700">
          {footer}
        </div>
      )}
    </div>
  );
};
