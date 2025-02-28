// src/components/common/EmptyState.jsx
import { Link } from "react-router-dom";
import { Button } from "./Button";

export const EmptyState = ({
  title = "Немає даних",
  description = "Поки що немає даних для відображення",
  icon,
  actionText,
  actionLink,
  actionOnClick,
  className = "",
}) => {
  const DefaultIcon = () => (
    <svg
      className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-2"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
      />
    </svg>
  );

  return (
    <div className={`text-center py-10 px-6 ${className}`}>
      <div className="flex flex-col items-center">
        {icon || <DefaultIcon />}
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mt-2">
          {title}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
          {description}
        </p>
        
        {actionText && (actionLink || actionOnClick) && (
          <div className="mt-5">
            {actionLink ? (
              <Link to={actionLink}>
                <Button variant="primary" size="medium">
                  {actionText}
                </Button>
              </Link>
            ) : (
              <Button variant="primary" size="medium" onClick={actionOnClick}>
                {actionText}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};