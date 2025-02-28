// src/pages/Home.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { MatchCard } from "../components/common/MatchCard";
import { LoadingState } from "../components/common/LoadingState";
import { EmptyState } from "../components/common/EmptyState";
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
      <LoadingState 
        message="Завантаження даних..." 
        size="large"
      />
    );
  }

  // Відображення помилки
  if (error) {
    return (
      <EmptyState
        title="Помилка завантаження"
        description={error}
        icon={
          <svg className="w-16 h-16 text-red-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        }
        actionText="Оновити сторінку"
        actionOnClick={() => window.location.reload()}
      />
    );
  }

  // Отримання топ-5 гравців за кількістю балів
  const topPlayers = [...players]
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto px-4 py-3 sm:py-5">
      {/* Banner as a full clickable button - responsive for both mobile and desktop */}
      <div className="mb-3 sm:mb-5">
        <Link to="/new-match" className="block">
          <Card className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 border-0 overflow-hidden p-0 
                          hover:shadow-lg transition-shadow duration-200 active:bg-blue-700 active:scale-[0.995] transform">
            <div className="relative py-3 sm:py-4 px-4 sm:px-6 flex justify-between items-center">
              {/* Tennis ball icon - responsive sizing */}
              <div className="absolute -bottom-3 -left-3 opacity-10 hidden sm:block">
                <svg width="100" height="100" viewBox="0 0 24 24" className="text-white">
                  <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                  <path fill="currentColor" d="M12 4c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"/>
                </svg>
              </div>
              
              {/* Main content - centered on mobile, left-aligned on desktop */}
              <div className="flex-grow text-white z-10 flex items-center justify-center sm:justify-start">
                <svg className="w-5 h-5 mr-2 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <h2 className="text-base sm:text-xl font-bold">
                  Записати новий матч
                </h2>
                <p className="ml-2 text-white/80 text-sm hidden sm:block">
                  Фіксуйте результати та відстежуйте прогрес
                </p>
              </div>
              
              {/* Button-like element on desktop */}
              <div className="hidden sm:flex items-center bg-white/10 rounded-lg px-3 py-1.5 text-white text-sm font-medium hover:bg-white/20 transition-colors">
                <span>Створити</span>
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Stats and Recent Matches - Responsive Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {/* Quick Stats - Horizontal cards on mobile, vertical on desktop */}
        <div className="flex md:flex-col gap-2 md:gap-3">
          {/* Matches Stat */}
          <div className="flex-1 bg-white dark:bg-gray-800 shadow-sm rounded-lg p-3 sm:p-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 mr-2 sm:mr-3">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Матчі</div>
                <div className="font-semibold sm:text-lg">{recentMatches.length}</div>
              </div>
            </div>
            <div className="md:hidden text-blue-600 dark:text-blue-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
          
          {/* Players Stat */}
          <div className="flex-1 bg-white dark:bg-gray-800 shadow-sm rounded-lg p-3 sm:p-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-400 mr-2 sm:mr-3">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Гравці</div>
                <div className="font-semibold sm:text-lg">{players.length}</div>
              </div>
            </div>
            <div className="md:hidden text-green-600 dark:text-green-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
          
          {/* Stats Link - More prominent on desktop */}
          <div className="hidden md:block mt-3">
            <Link to="/statistics" className="text-blue-600 hover:text-blue-700 hover:underline text-sm flex items-center">
              <span>Повна статистика</span>
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Recent Matches Section - takes 2 columns on desktop */}
        <div className="md:col-span-2">
          <div className="flex justify-between items-center mb-2 sm:mb-3">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
              Останні матчі
            </h2>
            <Link to="/history" className="text-blue-600 hover:text-blue-700 hover:underline text-sm flex items-center">
              <span>Усі матчі</span>
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {recentMatches.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {recentMatches.slice(0, 2).map((match) => (
                <MatchCard key={match.id} match={match} players={players} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Немає матчів"
              description="Поки що немає зіграних матчів"
              icon={
                <svg className="w-16 h-16 text-blue-300 dark:text-blue-800 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
                </svg>
              }
              actionText="Зареєструвати матч"
              actionLink="/new-match"
              className="py-6 sm:py-8"
            />
          )}
        </div>
      </div>

      {/* Top Players Section - Responsive for Mobile and Desktop */}
      <div className="mt-6 sm:mt-8">
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
            Топ гравців
          </h2>
          <Link to="/statistics" className="text-blue-600 hover:text-blue-700 hover:underline text-sm flex items-center">
            <span>Всі гравці</span>
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {topPlayers.length > 0 ? (
          <>
            {/* Desktop View - Table */}
            <div className="hidden sm:block bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Місце
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Гравець
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Бали
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
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
                      <td className="py-3 px-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {index + 1}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        <Link
                          to={`/statistics?player=${player.id}`}
                          className="flex items-center hover:text-blue-600"
                        >
                          <div className="mr-2">
                            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                              {player.name.substring(0, 2).toUpperCase()}
                            </div>
                          </div>
                          <span className="truncate max-w-[200px] md:max-w-none">
                            {player.name}
                          </span>
                        </Link>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {player.totalPoints || 0}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {player.matchesPlayed || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View - Cards */}
            <div className="sm:hidden space-y-3">
              {topPlayers.map((player, index) => (
                <div 
                  key={player.id} 
                  className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 mr-3 flex flex-col items-center">
                      <div className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-1">#{index + 1}</div>
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                        {player.name.substring(0, 2).toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <Link to={`/statistics?player=${player.id}`}>
                        <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                          {player.name}
                        </h3>
                      </Link>
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex space-x-2">
                        <span>{player.matchesPlayed || 0} матчів</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                    {player.totalPoints || 0}
                    <span className="text-xs ml-1 text-gray-500 dark:text-gray-400">очк.</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <EmptyState
            title="Немає гравців"
            description="Додайте гравців для відображення рейтингу"
            icon={
              <svg className="w-16 h-16 text-blue-300 dark:text-blue-800 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
            actionText="Додати гравця"
            actionLink="/new-match"
          />
        )}
      </div>
    </div>
  );
};
