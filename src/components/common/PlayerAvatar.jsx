// src/components/common/PlayerAvatar.jsx
export const PlayerAvatar = ({ playerId, size = "medium", className = "" }) => {
  // Палітра кольорів для більш естетичного вигляду
  const colorPalette = [
    "from-blue-500 to-blue-700",
    "from-purple-500 to-purple-700",
    "from-green-500 to-green-700",
    "from-red-500 to-red-700",
    "from-yellow-500 to-yellow-700",
    "from-pink-500 to-pink-700",
    "from-indigo-500 to-indigo-700",
    "from-teal-500 to-teal-700"
  ];

  // Розміри аватару
  const sizes = {
    small: "w-8 h-8 text-xs",
    medium: "w-10 h-10 text-sm",
    large: "w-16 h-16 text-base",
  };

  // Вибір кольору із палітри на основі ID гравця
  const getGradient = (id) => {
    // Проста хеш-функція для вибору кольору
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colorPalette[Math.abs(hash) % colorPalette.length];
  };

  // Отримання ініціалів гравця
  const getInitials = (id) => {
    // В реальному додатку тут можна використовувати ім'я гравця
    return id.substring(0, 2).toUpperCase();
  };

  const gradient = getGradient(playerId);

  return (
    <div
      className={`
        ${sizes[size]} 
        bg-gradient-to-br ${gradient}
        rounded-full flex items-center justify-center 
        text-white font-bold shadow-md
        ${className}
      `}
    >
      {getInitials(playerId)}
    </div>
  );
};
