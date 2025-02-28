// src/components/charts/PlayerProgressChart.jsx
import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

/**
 * Компонент для відображення графіку прогресу гравця по балах за час
 */
export const PlayerProgressChart = ({ matches, playerId }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    // Функція для підготовки даних
    const prepareData = () => {
      if (!matches || !matches.length || !playerId) return [];

      // Відсортуємо матчі за датою (від найстаріших до найновіших)
      const sortedMatches = [...matches].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      );

      const pointsHistory = [];
      let cumulativePoints = 0;

      // Для відстеження матчів, у яких брав участь гравець
      sortedMatches.forEach((match) => {
        // Перевірка чи гравець брав участь у матчі
        const playerParticipated = match.players.includes(playerId);
        if (!playerParticipated) return;

        // Отримання дати у форматі для графіка
        const date = new Date(match.createdAt).toLocaleDateString("uk-UA", {
          day: "numeric",
          month: "short",
        });

        // Отримання балів за матч
        let pointsEarned = 0;
        if (match.format === "1v1") {
          pointsEarned = match.pointsEarned?.points?.[playerId] || 0;
        } else if (match.format === "2v2") {
          // Для парного формату знаходимо команду гравця
          const playerTeam = match.teams.find((team) =>
            team.includes(playerId),
          );
          if (playerTeam) {
            const teamId = playerTeam.join("-");
            pointsEarned = (match.pointsEarned?.points?.[teamId] || 0) / 2; // Ділимо на 2 для команди
          }
        }

        // Оновлення накопичених балів
        cumulativePoints += pointsEarned;

        // Додавання точки графіка
        pointsHistory.push({
          date,
          points: pointsEarned,
          cumulativePoints,
        });
      });

      return pointsHistory;
    };

    setChartData(prepareData());
  }, [matches, playerId]);

  // Якщо немає даних, показуємо повідомлення
  if (chartData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Недостатньо даних для відображення графіка
      </div>
    );
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" stroke="#718096" fontSize={12} />
          <YAxis stroke="#718096" fontSize={12} />
          <Tooltip
            formatter={(value) => [`${value} балів`, ""]}
            labelFormatter={(label) => `Дата: ${label}`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="points"
            name="Бали за матч"
            stroke="#4F46E5"
            activeDot={{ r: 8 }}
          />
          <Line
            type="monotone"
            dataKey="cumulativePoints"
            name="Загальна кількість балів"
            stroke="#16A34A"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
