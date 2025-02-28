// src/components/common/LoadingState.jsx
export const LoadingState = ({ message = "Завантаження...", size = "medium" }) => {
  const sizeClasses = {
    small: "h-6 w-6 border-2",
    medium: "h-10 w-10 border-2",
    large: "h-16 w-16 border-4"
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent mb-3`}></div>
      {message && <p className="text-gray-500 dark:text-gray-400">{message}</p>}
    </div>
  );
};