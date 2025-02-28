// src/pages/MatchDetails.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { PlayerAvatar } from "../components/common/PlayerAvatar";
import { useAppData } from "../context/AppDataContext";

export const MatchDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getMatchById, getAllPlayers, loading: contextLoading, error: contextError } = useAppData();
  const [match, setMatch] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    // Wait for context data to be ready
    if (contextLoading) return;

    try {
      // If there's an error in the context, show it
      if (contextError) {
        setError(contextError);
        setLoading(false);
        return;
      }

      // Get data directly from context
      const matchData = getMatchById(id);
      const playersData = getAllPlayers();

      if (!matchData) {
        throw new Error("Match not found");
      }

      setMatch(matchData);
      setPlayers(playersData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching match details:", err);
      setError(
        "Не вдалося завантажити дані матчу. Спробуйте оновити сторінку.",
      );
      setLoading(false);
    }
  }, [id, getMatchById, getAllPlayers, contextLoading, contextError]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      // Since we're using mock data, just navigate back
      // In a real app, we would use deleteMatch(id) 
      setTimeout(() => {
        navigate("/history", { state: { message: "Матч успішно видалено" } });
      }, 1000);
    } catch (err) {
      console.error("Error deleting match:", err);
      setError("Не вдалося видалити матч. Спробуйте ще раз.");
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Функція для отримання імені гравця за ID
  const getPlayerName = (playerId) => {
    const player = players.find((p) => p.id === playerId);
    return player ? player.name : "Невідомий гравець";
  };

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
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
          <div className="mt-2">
            <Button variant="secondary" onClick={() => navigate("/history")}>
              Повернутися до історії
            </Button>
            <Button
              variant="primary"
              className="ml-2"
              onClick={() => window.location.reload()}
            >
              Спробувати ще раз
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Якщо матч не знайдено
  if (!match) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Card>
          <div className="text-center py-6">
            <p className="text-gray-500 mb-4">Матч не знайдено</p>
            <Button variant="primary" onClick={() => navigate("/history")}>
              Повернутися до історії
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Форматування дати
  const formatDate = (date) => {
    if (!date) return "Невідома дата";

    return new Date(date).toLocaleDateString("uk-UA", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Визначення переможця
  const getWinner = () => {
    if (!match.pointsEarned || !match.pointsEarned.winner) return null;

    if (match.format === "1v1") {
      return (
        <div className="flex items-center">
          <PlayerAvatar playerId={match.pointsEarned.winner} size="small" />
          <span className="ml-2">
            {getPlayerName(match.pointsEarned.winner)}
          </span>
        </div>
      );
    } else if (
      match.format === "2v2" &&
      Array.isArray(match.pointsEarned.winner)
    ) {
      return (
        <div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Команда:
          </div>
          {match.pointsEarned.winner.map((playerId) => (
            <div key={playerId} className="flex items-center mt-1">
              <PlayerAvatar playerId={playerId} size="small" />
              <span className="ml-2">{getPlayerName(playerId)}</span>
            </div>
          ))}
        </div>
      );
    }

    return "Не визначено";
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Деталі матчу
        </h1>
        <Button variant="secondary" onClick={() => navigate("/history")}>
          Повернутися до історії
        </Button>
      </div>

      {/* Основна інформація про матч */}
      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Загальна інформація</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Формат:
            </div>
            <div className="font-semibold">
              {match.format === "1v1"
                ? "Одиночний (1 на 1)"
                : "Парний (2 на 2)"}
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Дата:
            </div>
            <div className="font-semibold">{formatDate(match.createdAt)}</div>
          </div>

          <div className="md:col-span-2">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Учасники:
            </div>
            {match.format === "1v1" ? (
              <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                <div className="flex items-center">
                  <PlayerAvatar playerId={match.players[0]} size="medium" />
                  <span className="ml-2 font-semibold">
                    {getPlayerName(match.players[0])}
                  </span>
                </div>
                <div className="text-lg font-bold">vs</div>
                <div className="flex items-center">
                  <span className="mr-2 font-semibold">
                    {getPlayerName(match.players[1])}
                  </span>
                  <PlayerAvatar playerId={match.players[1]} size="medium" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                  <div className="text-center font-semibold mb-2">
                    Команда 1
                  </div>
                  {match.teams[0].map((playerId) => (
                    <div key={playerId} className="flex items-center mt-1">
                      <PlayerAvatar playerId={playerId} size="small" />
                      <span className="ml-2">{getPlayerName(playerId)}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                  <div className="text-center font-semibold mb-2">
                    Команда 2
                  </div>
                  {match.teams[1].map((playerId) => (
                    <div key={playerId} className="flex items-center mt-1">
                      <PlayerAvatar playerId={playerId} size="small" />
                      <span className="ml-2">{getPlayerName(playerId)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Переможець:
            </div>
            <div className="bg-green-50 dark:bg-green-900 p-3 rounded-md text-green-800 dark:text-green-100">
              {getWinner()}
            </div>
          </div>
        </div>
      </Card>

      {/* Результати сетів */}
      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Результати сетів</h2>
        <div className="space-y-4">
          {Object.entries(match.sets || {}).map(([setNumber, setData]) => (
            <div
              key={setNumber}
              className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md"
            >
              <div className="font-semibold mb-2">Сет {setNumber}</div>

              {match.format === "1v1" ? (
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="mr-2">
                      <PlayerAvatar playerId={match.players[0]} size="small" />
                    </div>
                    <div>
                      <div>{getPlayerName(match.players[0])}</div>
                      <div className="text-2xl font-bold">
                        {setData.games[match.players[0]] || 0}
                      </div>
                    </div>
                  </div>

                  <div className="text-gray-400">vs</div>

                  <div className="flex items-center">
                    <div>
                      <div className="text-right">
                        {getPlayerName(match.players[1])}
                      </div>
                      <div className="text-2xl font-bold text-right">
                        {setData.games[match.players[1]] || 0}
                      </div>
                    </div>
                    <div className="ml-2">
                      <PlayerAvatar playerId={match.players[1]} size="small" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <div>
                    <div>Команда 1</div>
                    <div className="text-2xl font-bold">
                      {setData.games[match.teams[0].join("-")] || 0}
                    </div>
                  </div>

                  <div className="text-gray-400">vs</div>

                  <div>
                    <div className="text-right">Команда 2</div>
                    <div className="text-2xl font-bold text-right">
                      {setData.games[match.teams[1].join("-")] || 0}
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-2 text-sm text-right">
                <span className="text-gray-600 dark:text-gray-400">
                  Переможець сету:{" "}
                </span>
                <span className="font-semibold">
                  {match.format === "1v1"
                    ? getPlayerName(setData.winner)
                    : setData.winner === match.teams[0].join("-")
                      ? "Команда 1"
                      : "Команда 2"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Нараховані бали */}
      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Нараховані бали</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Гравець
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Бали
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {match.format === "1v1" ? (
                match.players.map((playerId) => (
                  <tr key={playerId}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <PlayerAvatar playerId={playerId} size="small" />
                        <span className="ml-2">{getPlayerName(playerId)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {match.pointsEarned?.points?.[playerId] || 0}
                    </td>
                  </tr>
                ))
              ) : (
                <>
                  {match.teams[0].map((playerId) => (
                    <tr key={playerId}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <PlayerAvatar playerId={playerId} size="small" />
                          <span className="ml-2">
                            {getPlayerName(playerId)}
                          </span>
                          <span className="ml-2 text-gray-500">
                            (Команда 1)
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(match.pointsEarned?.points?.[
                          match.teams[0].join("-")
                        ] || 0) / 2}
                      </td>
                    </tr>
                  ))}
                  {match.teams[1].map((playerId) => (
                    <tr key={playerId}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <PlayerAvatar playerId={playerId} size="small" />
                          <span className="ml-2">
                            {getPlayerName(playerId)}
                          </span>
                          <span className="ml-2 text-gray-500">
                            (Команда 2)
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(match.pointsEarned?.points?.[
                          match.teams[1].join("-")
                        ] || 0) / 2}
                      </td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Кнопки дій */}
      <div className="flex justify-end space-x-4">
        {!showDeleteConfirm ? (
          <Button variant="danger" onClick={() => setShowDeleteConfirm(true)}>
            Видалити матч
          </Button>
        ) : (
          <>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deleting}
            >
              Скасувати
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Видалення..." : "Підтвердити видалення"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
