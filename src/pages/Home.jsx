// src/pages/Home.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { MatchCard } from "../components/common/MatchCard";
import { useAppData } from "../context/AppDataContext";

export const Home = () => {
  const { getRecentMatches, getAllPlayers, loading: contextLoading, error: contextError } = useAppData();
  const [recentMatches, setRecentMatches] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Wait for the context data to be ready
    if (contextLoading) return;

    try {
      // If there's an error in the context, show it
      if (contextError) {
        setError(contextError);
        setLoading(false);
        return;
      }

      // Get data from context
      const matchesData = getRecentMatches(5);
      const playersData = getAllPlayers();

      setRecentMatches(matchesData);
      setPlayers(playersData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data for home page:", err);
      setError("Не вдалося завантажити дані. Спробуйте оновити сторінку.");
      setLoading(false);
    }
  }, [getRecentMatches, getAllPlayers, contextLoading, contextError]);

  // Відображення завантаження
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Відображення помилки
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={() => window.location.reload()}>
          Оновити сторінку
        </Button>
      </div>
    );
  }

  // Отримання топ-5 гравців за кількістю балів
  const topPlayers = [...players]
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Banner Section - more compact and consistent with design */}
      <div className="mb-6">
        <Card className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 border-0 overflow-hidden p-0">
          <div className="relative p-4 flex justify-between items-center">
            {/* Tennis ball icon */}
            <div className="absolute -bottom-4 -left-4 opacity-10">
              <svg width="100" height="100" viewBox="0 0 24 24" className="text-white">
                <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                <path fill="currentColor" d="M12 4c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"/>
              </svg>
            </div>
            
            {/* Main content */}
            <div className="text-white z-10">
              <h2 className="text-lg md:text-xl font-bold">
                Зафіксуйте результати гри
              </h2>
              <p className="text-sm text-white/80 mt-1">
                Записуйте матчі та відстежуйте прогрес
              </p>
            </div>
            
            {/* Button */}
            <Link to="/new-match">
              <Button
                variant="secondary"
                size="medium"
                className="bg-white/95 hover:bg-white text-blue-700 hover:text-blue-800 shadow-md border border-blue-200"
              >
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Записати новий матч
                </span>
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Stats and Recent Matches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Statistics */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            Загальна статистика
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">
                Всього матчів:
              </span>
              <span className="font-semibold">{recentMatches.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">
                Всього гравців:
              </span>
              <span className="font-semibold">{players.length}</span>
            </div>
            <div className="mt-4">
              <Link to="/statistics" className="text-blue-600 hover:underline">
                Докладна статистика →
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Matches Section - takes 2 columns on desktop */}
        <div className="md:col-span-2">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Останні матчі
            </h2>
            <Link to="/history" className="text-blue-600 hover:underline text-sm">
              Переглянути всі →
            </Link>
          </div>

          {recentMatches.length > 0 ? (
            <div className="space-y-4">
              {recentMatches.slice(0, 2).map((match) => (
                <MatchCard key={match.id} match={match} players={players} />
              ))}
            </div>
          ) : (
            <Card>
              <div className="text-center py-4 md:py-6">
                <p className="text-gray-500 mb-4">
                  Поки що немає зіграних матчів
                </p>
                <Link to="/new-match">
                  <Button variant="primary">Зареєструвати перший матч</Button>
                </Link>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Top Players Section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
          Топ гравців
        </h2>

        {topPlayers.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="py-3 px-3 md:px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Місце
                    </th>
                    <th className="py-3 px-3 md:px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Гравець
                    </th>
                    <th className="py-3 px-3 md:px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Бали
                    </th>
                    <th className="py-3 px-3 md:px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Матчі
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {topPlayers.map((player, index) => (
                    <tr
                      key={player.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="py-3 px-3 md:px-6 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {index + 1}
                      </td>
                      <td className="py-3 px-3 md:px-6 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        <Link
                          to={`/player/${player.id}`}
                          className="flex items-center hover:text-blue-600"
                        >
                          <div className="mr-2">
                            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                              {player.name.substring(0, 2).toUpperCase()}
                            </div>
                          </div>
                          <span className="truncate max-w-[150px] sm:max-w-[200px] md:max-w-none">
                            {player.name}
                          </span>
                        </Link>
                      </td>
                      <td className="py-3 px-3 md:px-6 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {player.totalPoints}
                      </td>
                      <td className="py-3 px-3 md:px-6 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {player.matchesPlayed}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <Card>
            <div className="text-center py-4 md:py-6">
              <p className="text-gray-500">Ще немає зареєстрованих гравців</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
