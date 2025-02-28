// src/pages/Statistics.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "../components/common/Card";
import { PlayerProgressChart } from "../components/charts/PlayerProgressChart";
import { ScoreDistributionChart } from "../components/charts/ScoreDistributionChart";
import { Button } from "../components/common/Button";
import { useAppData } from "../context/AppDataContext";

export const Statistics = () => {
  const { getAllPlayers, getAllMatches, loading: contextLoading, error: contextError } = useAppData();
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState("");
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

      // Get data directly from context
      const playersData = getAllPlayers();
      const matchesData = getAllMatches();

      setPlayers(playersData);
      setMatches(matchesData);

      // Встановлюємо першого гравця за замовчуванням, якщо є гравці
      if (playersData.length > 0) {
        setSelectedPlayer(playersData[0].id);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching data for statistics page:", err);
      setError("Не вдалося завантажити дані. Спробуйте оновити сторінку.");
      setLoading(false);
    }
  }, [getAllPlayers, getAllMatches, contextLoading, contextError]);

  // Знаходимо обраного гравця
  const player = players.find((p) => p.id === selectedPlayer);

  // Фільтруємо матчі, в яких брав участь обраний гравець
  const playerMatches = selectedPlayer
    ? matches.filter((match) => match.players.includes(selectedPlayer))
    : [];

  // Розрахунок базової статистики
  const calculateStats = () => {
    if (!player) return null;

    const stats = {
      totalMatches: playerMatches.length,
      matchesWon: 0,
      totalSets: 0,
      setsWon: 0,
      totalGames: 0,
      gamesWon: 0,
    };

    playerMatches.forEach((match) => {
      // Перевірка, чи гравець виграв матч
      if (match.format === "1v1") {
        if (match.pointsEarned?.winner === selectedPlayer) {
          stats.matchesWon++;
        }
      } else if (match.format === "2v2") {
        // Для парного формату знаходимо команду гравця
        const playerTeam = match.teams.find((team) =>
          team.includes(selectedPlayer),
        );
        if (
          playerTeam &&
          match.pointsEarned?.winner &&
          Array.isArray(match.pointsEarned.winner) &&
          match.pointsEarned.winner.some((id) => playerTeam.includes(id))
        ) {
          stats.matchesWon++;
        }
      }

      // Підрахунок сетів і геймів
      Object.values(match.sets || {}).forEach((set) => {
        stats.totalSets++;

        if (match.format === "1v1") {
          if (set.winner === selectedPlayer) {
            stats.setsWon++;
          }

          // Рахуємо загальну кількість геймів у сеті
          const totalGamesInSet = Object.values(set.games || {}).reduce(
            (sum, count) => sum + count,
            0,
          );
          stats.totalGames += totalGamesInSet;

          // Рахуємо гейми, виграні гравцем
          stats.gamesWon += set.games[selectedPlayer] || 0;
        } else if (match.format === "2v2") {
          const playerTeam = match.teams.find((team) =>
            team.includes(selectedPlayer),
          );
          if (playerTeam) {
            const teamId = playerTeam.join("-");

            if (set.winner === teamId) {
              stats.setsWon++;
            }

            // Для командної гри також рахуємо загальну кількість геймів
            const totalGamesInSet = Object.values(set.games || {}).reduce(
              (sum, count) => sum + count,
              0,
            );
            stats.totalGames += totalGamesInSet;

            // Гейми команди діляться між гравцями
            stats.gamesWon += (set.games[teamId] || 0) / 2;
          }
        }
      });
    });

    return stats;
  };

  const stats = calculateStats();

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
        Статистика
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
          <button className="underline ml-2" onClick={() => setError(null)}>
            Закрити
          </button>
        </div>
      )}

      {/* Вибір гравця */}
      <Card className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Вибір гравця</h2>
        {players.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {players.map((p) => (
              <Button
                key={p.id}
                variant={selectedPlayer === p.id ? "primary" : "secondary"}
                size="small"
                onClick={() => setSelectedPlayer(p.id)}
              >
                {p.name}
              </Button>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Немає зареєстрованих гравців</p>
        )}
      </Card>

      {/* Статистика гравця */}
      {player && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Основна статистика */}
          <Card>
            <h2 className="text-xl font-semibold mb-4">
              Статистика гравця: {player.name}
            </h2>

            {stats && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Всього матчів
                    </div>
                    <div className="text-2xl font-bold">
                      {stats.totalMatches}
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Перемоги
                    </div>
                    <div className="text-2xl font-bold">{stats.matchesWon}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {stats.totalMatches > 0
                        ? `(${Math.round((stats.matchesWon / stats.totalMatches) * 100)}%)`
                        : "(0%)"}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Виграно сетів
                    </div>
                    <div className="text-2xl font-bold">{stats.setsWon}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {stats.totalSets > 0
                        ? `(${Math.round((stats.setsWon / stats.totalSets) * 100)}%)`
                        : "(0%)"}
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Виграно геймів
                    </div>
                    <div className="text-2xl font-bold">
                      {Math.round(stats.gamesWon)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {stats.totalGames > 0
                        ? `(${Math.round((stats.gamesWon / stats.totalGames) * 100)}%)`
                        : "(0%)"}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Загальні бали
                  </div>
                  <div className="text-2xl font-bold">
                    {player.totalPoints || 0}
                  </div>
                </div>
              </div>
            )}

            {(!stats || playerMatches.length === 0) && (
              <p className="text-gray-500">
                Немає даних для відображення. Гравець ще не брав участі в
                матчах.
              </p>
            )}
          </Card>

          {/* Графік розподілу перемог/поразок */}
          <Card>
            <h2 className="text-xl font-semibold mb-4">Розподіл результатів</h2>
            <ScoreDistributionChart
              matches={playerMatches}
              playerId={selectedPlayer}
            />
          </Card>

          {/* Графік прогресу за балами */}
          <Card className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Прогрес за балами</h2>
            <PlayerProgressChart
              matches={playerMatches}
              playerId={selectedPlayer}
            />
          </Card>

          {/* Останні матчі гравця */}
          <Card className="lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Останні матчі</h2>
              <Link
                to={`/history?player=${selectedPlayer}`}
                className="text-blue-600 hover:underline"
              >
                Переглянути всі →
              </Link>
            </div>

            {playerMatches.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Дата
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Формат
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Суперник
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Результат
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {playerMatches.slice(0, 5).map((match) => {
                      // Визначення суперника (для 1v1) або команди суперника (для 2v2)
                      let opponent = "";
                      let result = "";

                      if (match.format === "1v1") {
                        // Знаходимо суперника
                        const opponentId = match.players.find(
                          (id) => id !== selectedPlayer,
                        );
                        const opponentPlayer = players.find(
                          (p) => p.id === opponentId,
                        );
                        opponent = opponentPlayer
                          ? opponentPlayer.name
                          : "Невідомий гравець";

                        // Визначаємо результат
                        const isWinner =
                          match.pointsEarned?.winner === selectedPlayer;
                        result = isWinner ? "Перемога" : "Поразка";
                      } else if (match.format === "2v2") {
                        // Знаходимо команду гравця
                        const playerTeamIndex = match.teams.findIndex((team) =>
                          team.includes(selectedPlayer),
                        );
                        const opponentTeamIndex = playerTeamIndex === 0 ? 1 : 0;

                        // Формуємо імена суперників
                        const opponentTeam =
                          match.teams[opponentTeamIndex] || [];
                        const opponentNames = opponentTeam.map((id) => {
                          const player = players.find((p) => p.id === id);
                          return player ? player.name : "Невідомий гравець";
                        });

                        opponent = opponentNames.join(" і ");

                        // Визначаємо результат
                        if (
                          match.pointsEarned?.winner &&
                          Array.isArray(match.pointsEarned.winner)
                        ) {
                          const isWinner =
                            match.pointsEarned.winner.includes(selectedPlayer);
                          result = isWinner ? "Перемога" : "Поразка";
                        } else {
                          result = "Не визначено";
                        }
                      }

                      return (
                        <tr
                          key={match.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {new Date(match.createdAt).toLocaleDateString(
                              "uk-UA",
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {match.format === "1v1" ? "Одиночний" : "Парний"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {opponent}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                result === "Перемога"
                                  ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                                  : result === "Поразка"
                                    ? "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                                    : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {result}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">
                Гравець ще не брав участі в матчах
              </p>
            )}
          </Card>
        </div>
      )}

      {!player && players.length > 0 && (
        <Card>
          <div className="text-center py-6">
            <p className="text-gray-500">
              Виберіть гравця для перегляду статистики
            </p>
          </div>
        </Card>
      )}

      {players.length === 0 && (
        <Card>
          <div className="text-center py-6">
            <p className="text-gray-500 mb-4">
              Немає зареєстрованих гравців для відображення статистики
            </p>
            <Link to="/new-match">
              <Button variant="primary">Додати гравців</Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
};
