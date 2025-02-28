// src/pages/History.jsx
import { useState, useEffect } from "react";
import { Card } from "../components/common/Card";
import { MatchCard } from "../components/common/MatchCard";
import { Button } from "../components/common/Button";
import { useAppData } from "../context/AppDataContext";

export const History = () => {
  const { getAllMatches, getAllPlayers, loading: contextLoading, error: contextError } = useAppData();
  const [matches, setMatches] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    player: "",
    format: "",
    dateFrom: "",
    dateTo: "",
  });
  const [showFilters, setShowFilters] = useState(false);

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

      // Get data directly from context functions
      const matchesData = getAllMatches();
      const playersData = getAllPlayers();

      setMatches(matchesData);
      setPlayers(playersData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data for history page:", err);
      setError("Не вдалося завантажити дані. Спробуйте оновити сторінку.");
      setLoading(false);
    }
  }, [getAllMatches, getAllPlayers, contextLoading, contextError]);

  // Обробник зміни фільтрів
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Функція для скидання фільтрів
  const resetFilters = () => {
    setFilters({
      player: "",
      format: "",
      dateFrom: "",
      dateTo: "",
    });
  };

  // Фільтрація матчів - використовуємо функцію з контексту
  const filteredMatches = getAllMatches(filters);

  // Відображення завантаження
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        Історія матчів
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
          <button className="underline ml-2" onClick={() => setError(null)}>
            Закрити
          </button>
        </div>
      )}

      {/* Компактний блок фільтрів з кнопкою показу/приховування */}
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-gray-800 shadow-sm rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2 sm:mb-0">
          <Button 
            variant={showFilters ? "primary" : "secondary"} 
            size="small" 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {showFilters ? 'Сховати фільтри' : 'Показати фільтри'}
          </Button>
          
          {/* Quick filter badges - only show if any filter is active */}
          {(filters.player || filters.format || filters.dateFrom || filters.dateTo) && (
            <div className="flex flex-wrap gap-1">
              {filters.player && (
                <div className="bg-blue-100 text-blue-800 text-xs rounded-full px-2 py-1 flex items-center">
                  {players.find(p => p.id === filters.player)?.name || 'Гравець'}
                  <button 
                    className="ml-1 text-blue-500 hover:text-blue-700" 
                    onClick={() => setFilters({...filters, player: ""})}
                  >
                    ×
                  </button>
                </div>
              )}
              {filters.format && (
                <div className="bg-blue-100 text-blue-800 text-xs rounded-full px-2 py-1 flex items-center">
                  {filters.format === "1v1" ? "Одиночний" : "Парний"}
                  <button 
                    className="ml-1 text-blue-500 hover:text-blue-700" 
                    onClick={() => setFilters({...filters, format: ""})}
                  >
                    ×
                  </button>
                </div>
              )}
              {(filters.dateFrom || filters.dateTo) && (
                <div className="bg-blue-100 text-blue-800 text-xs rounded-full px-2 py-1 flex items-center">
                  {filters.dateFrom && filters.dateTo ? `${filters.dateFrom} - ${filters.dateTo}` :
                   filters.dateFrom ? `Від ${filters.dateFrom}` : `До ${filters.dateTo}`}
                  <button 
                    className="ml-1 text-blue-500 hover:text-blue-700" 
                    onClick={() => setFilters({...filters, dateFrom: "", dateTo: ""})}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Reset button - only if filters are active */}
        {(filters.player || filters.format || filters.dateFrom || filters.dateTo) && (
          <Button variant="secondary" size="small" onClick={resetFilters}>
            Скинути всі
          </Button>
        )}
      </div>
      
      {/* Розгорнуті фільтри */}
      {showFilters && (
        <Card className="mb-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label htmlFor="player" className="block text-xs font-medium text-gray-500 mb-1">
                Гравець
              </label>
              <select
                id="player"
                name="player"
                value={filters.player}
                onChange={handleFilterChange}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Всі гравці</option>
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="format" className="block text-xs font-medium text-gray-500 mb-1">
                Формат
              </label>
              <select
                id="format"
                name="format"
                value={filters.format}
                onChange={handleFilterChange}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Всі формати</option>
                <option value="1v1">Одиночний (1 на 1)</option>
                <option value="2v2">Парний (2 на 2)</option>
              </select>
            </div>

            <div>
              <label htmlFor="dateFrom" className="block text-xs font-medium text-gray-500 mb-1">
                Дата від
              </label>
              <input
                type="date"
                id="dateFrom"
                name="dateFrom"
                value={filters.dateFrom}
                onChange={handleFilterChange}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="dateTo" className="block text-xs font-medium text-gray-500 mb-1">
                Дата до
              </label>
              <input
                type="date"
                id="dateTo"
                name="dateTo"
                value={filters.dateTo}
                onChange={handleFilterChange}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <Button variant="secondary" size="small" onClick={resetFilters}>
              Скинути фільтри
            </Button>
          </div>
        </Card>
      )}

      {/* Список матчів */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Знайдено матчів: {filteredMatches.length}
          </h2>
        </div>

        {filteredMatches.length > 0 ? (
          <div className="space-y-4">
            {filteredMatches.map((match) => (
              <MatchCard key={match.id} match={match} players={players} />
            ))}
          </div>
        ) : (
          <Card>
            <div className="text-center py-6">
              <p className="text-gray-500 mb-4">
                {matches.length > 0
                  ? "Немає матчів, що відповідають вибраним фільтрам"
                  : "Поки що немає зіграних матчів"}
              </p>
              {matches.length === 0 && (
                <a href="/new-match">
                  <Button variant="primary">Зареєструвати перший матч</Button>
                </a>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
