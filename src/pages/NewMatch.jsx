// src/pages/NewMatch.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/common/Card";
import { MatchForm } from "../components/forms/MatchForm";
import { PlayerForm } from "../components/forms/PlayerForm";
import { Button } from "../components/common/Button";
import { useAppData } from "../context/AppDataContext";

export const NewMatch = () => {
  const {
    addMatch,
    addPlayer,
    getAllPlayers,
    loading: contextLoading,
    error: contextError,
  } = useAppData();
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPlayerForm, setShowPlayerForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        const playersData = await getAllPlayers();
        setPlayers(playersData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching players:", err);
        setError(
          "Не вдалося завантажити список гравців. Спробуйте оновити сторінку.",
        );
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [getAllPlayers, contextLoading, contextError]);

  const handleAddPlayer = async (playerData) => {
    try {
      setSubmitting(true);
      const newPlayer = await addPlayer(playerData);
      setPlayers((prev) => [...prev, newPlayer]);
      setShowPlayerForm(false);
      setSubmitting(false);
    } catch (err) {
      console.error("Error adding player:", err);
      setError("Не вдалося створити гравця. Спробуйте ще раз.");
      setSubmitting(false);
    }
  };

  const handleCreateMatch = async (matchData) => {
    try {
      setSubmitting(true);
      await addMatch(matchData);
      setSubmitting(false);
      // Перенаправлення на головну сторінку після успішного створення матчу
      navigate("/", { state: { message: "Матч успішно створено!" } });
    } catch (err) {
      console.error("Error creating match:", err);
      setError("Не вдалося зберегти матч. Спробуйте ще раз.");
      setSubmitting(false);
    }
  };

  // Відображення завантаження
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        Новий матч
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
          <button className="underline ml-2" onClick={() => setError(null)}>
            Закрити
          </button>
        </div>
      )}

      {/* Блок додавання нового гравця */}
      {players.length === 0 && (
        <Card className="mb-6">
          <div className="text-center py-4">
            <p className="text-gray-500 mb-4">
              Ще немає зареєстрованих гравців. Додайте першого гравця для
              початку.
            </p>
            <Button variant="primary" onClick={() => setShowPlayerForm(true)}>
              Додати гравця
            </Button>
          </div>
        </Card>
      )}

      {showPlayerForm ? (
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Новий гравець</h2>
          <PlayerForm onSubmit={handleAddPlayer} loading={submitting} />
          <div className="mt-4">
            <Button
              variant="secondary"
              onClick={() => setShowPlayerForm(false)}
              disabled={submitting}
            >
              Скасувати
            </Button>
          </div>
        </Card>
      ) : (
        players.length > 0 && (
          <div className="mb-6 flex justify-end">
            <Button variant="secondary" onClick={() => setShowPlayerForm(true)}>
              + Додати гравця
            </Button>
          </div>
        )
      )}

      {/* Форма для створення матчу */}
      {players.length >= 2 && !showPlayerForm && (
        <Card>
          <MatchForm
            players={players}
            onSubmit={handleCreateMatch}
            loading={submitting}
          />
        </Card>
      )}

      {players.length > 0 && players.length < 2 && !showPlayerForm && (
        <Card>
          <div className="text-center py-4">
            <p className="text-gray-500 mb-4">
              Для створення матчу потрібно мінімум 2 гравця. Додайте ще одного
              гравця.
            </p>
            <Button variant="primary" onClick={() => setShowPlayerForm(true)}>
              + Додати гравця
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
