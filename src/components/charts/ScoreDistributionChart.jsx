// src/components/charts/ScoreDistributionChart.jsx
import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

/**
 * Компонент для відображення розподілу результатів гравця
 */
export const ScoreDistributionChart = ({ matches, playerId }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    // Функція для підготовки даних
    const prepareData = () => {
      if (!matches || !matches.length || !playerId) return [];

      // Підрахунок статистики
      let matchesWon = 0;
      let matchesLost = 0;

      matches.forEach((match) => {
        // Перевірка чи гравець брав участь у матчі
        const playerParticipated = match.players.includes(playerId);
        if (!playerParticipated) return;

        // Перевірка результату матчу
        if (match.format === "1v1") {
          if (match.pointsEarned?.winner === playerId) {
            matchesWon++;
          } else {
            matchesLost++;
          }
        } else if (match.format === "2v2") {
          // Для парного формату
          const playerTeam = match.teams.find((team) =>
            team.includes(playerId),
          );
          if (playerTeam && match.pointsEarned?.winner) {
            const isWinner = match.pointsEarned.winner.some((id) =>
              playerTeam.includes(id),
            );
            if (isWinner) {
              matchesWon++;
            } else {
              matchesLost++;
            }
          }
        }
      });

      return [
        { name: "Виграні матчі", value: matchesWon },
        { name: "Програні матчі", value: matchesLost },
      ];
    };

    setChartData(prepareData());
  }, [matches, playerId]);

  // Кольори для діаграми
  const COLORS = ["#16A34A", "#DC2626"];

  // Якщо немає даних, показуємо повідомлення
  if (chartData.length === 0 || chartData.every((item) => item.value === 0)) {
    return (
      <div className="text-center py-8 text-gray-500">
        Недостатньо даних для відображення графіка
      </div>
    );
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) =>
              `${name}: ${(percent * 100).toFixed(0)}%`
            }
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} матчів`, ""]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
