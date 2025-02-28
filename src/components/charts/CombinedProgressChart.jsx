// src/components/charts/CombinedProgressChart.jsx
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
 * Компонент для відображення графіку прогресу всіх гравців разом
 */
export const CombinedProgressChart = ({ matches, players, format = "1v1" }) => {
  const [chartData, setChartData] = useState([]);
  const [playerLines, setPlayerLines] = useState([]);
  const [teamLines, setTeamLines] = useState([]);
  
  // Масив кольорів для різних ліній графіка
  const colorPalette = [
    "#4F46E5", // Indigo
    "#16A34A", // Green
    "#EA580C", // Orange 
    "#2563EB", // Blue
    "#DC2626", // Red
    "#7C3AED", // Purple
    "#0891B2", // Cyan
    "#CA8A04", // Yellow
    "#DB2777", // Pink
    "#059669", // Emerald
  ];
  
  useEffect(() => {
    if (!matches || matches.length === 0 || !players || players.length === 0) {
      return;
    }
    
    // Відсортовані матчі за зростанням дати
    const sortedMatches = [...matches]
      .filter(match => match.format === format) // Фільтруємо за вказаним форматом
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    
    if (sortedMatches.length === 0) {
      return;
    }
    
    // Підготуємо масив дат для осі X
    const allDates = sortedMatches.map(match => {
      return {
        date: new Date(match.createdAt),
        formattedDate: new Date(match.createdAt).toLocaleDateString("uk-UA", {
          day: "numeric",
          month: "short"
        }),
        id: match.id
      };
    });
    
    // Створюємо об'єкт для відстеження балів для кожного гравця/команди
    const pointsTracker = {};
    const playerIds = players.map(p => p.id);
    const lines = [];
    
    if (format === "1v1") {
      // Для одиночних матчів відстежуємо бали кожного гравця
      playerIds.forEach(playerId => {
        pointsTracker[playerId] = { 
          cumulativePoints: 0, 
          name: players.find(p => p.id === playerId)?.name || "Невідомий",
          id: playerId
        };
      });
      
      // Обробляємо матчі та оновлюємо бали
      sortedMatches.forEach(match => {
        Object.entries(match.pointsEarned?.points || {}).forEach(([id, points]) => {
          if (pointsTracker[id]) {
            pointsTracker[id].cumulativePoints += points;
          }
        });
      });
      
      // Готуємо дані для ліній графіка
      Object.values(pointsTracker).forEach((player, index) => {
        if (player.cumulativePoints > 0) {
          lines.push({
            id: player.id,
            name: player.name,
            color: colorPalette[index % colorPalette.length]
          });
        }
      });
      
      setPlayerLines(lines);
    } else if (format === "2v2") {
      // Для парних матчів відстежуємо унікальні команди
      const teamTracker = {};
      
      sortedMatches.forEach(match => {
        match.teams.forEach(team => {
          const teamId = team.join('-');
          if (!teamTracker[teamId]) {
            const teamMembers = team.map(id => 
              players.find(p => p.id === id)?.name || "Невідомий"
            );
            teamTracker[teamId] = {
              id: teamId,
              name: teamMembers.join(' і '),
              cumulativePoints: 0,
              members: team
            };
          }
          
          // Додаємо бали, зароблені в цьому матчі
          if (match.pointsEarned?.points && match.pointsEarned.points[teamId]) {
            teamTracker[teamId].cumulativePoints += match.pointsEarned.points[teamId];
          }
        });
      });
      
      // Готуємо дані для ліній графіка
      Object.values(teamTracker).forEach((team, index) => {
        if (team.cumulativePoints > 0) {
          lines.push({
            id: team.id,
            name: team.name,
            color: colorPalette[index % colorPalette.length]
          });
        }
      });
      
      setTeamLines(lines);
    }
    
    // Створюємо дані для графіка з прогресом по датах
    const resultData = [];
    
    allDates.forEach((dateObj, index) => {
      const dataPoint = {
        date: dateObj.formattedDate,
        timestamp: dateObj.date.getTime()
      };
      
      // Додаємо значення для кожного гравця/команди
      const currentMatch = sortedMatches.find(m => m.id === dateObj.id);
      
      if (format === "1v1") {
        // Оновлюємо значення для гравців в одиночному форматі
        Object.keys(pointsTracker).forEach(playerId => {
          // Перевіряємо, чи отримав гравець бали в цьому матчі
          if (currentMatch && currentMatch.pointsEarned?.points && 
              currentMatch.pointsEarned.points[playerId]) {
            // Оновлюємо накопичені бали
            pointsTracker[playerId].cumulativePoints = 
              (pointsTracker[playerId].cumulativePoints || 0) + 
              currentMatch.pointsEarned.points[playerId];
          }
          
          // Додаємо поточне значення балів для цього гравця
          dataPoint[`player_${playerId}`] = pointsTracker[playerId].cumulativePoints;
        });
      } else if (format === "2v2") {
        // Для парного формату обробляємо команди
        const teams = currentMatch?.teams || [];
        teams.forEach(team => {
          const teamId = team.join('-');
          
          // Якщо в матчі є бали для цієї команди, оновлюємо накопичені бали
          if (currentMatch && currentMatch.pointsEarned?.points && 
              currentMatch.pointsEarned.points[teamId]) {
            const teamData = Object.values(teamTracker).find(t => t.id === teamId);
            if (teamData) {
              teamData.cumulativePoints = 
                (teamData.cumulativePoints || 0) + 
                currentMatch.pointsEarned.points[teamId];
                
              // Додаємо значення для команди
              dataPoint[`team_${teamId}`] = teamData.cumulativePoints;
            }
          }
        });
        
        // Додаємо всі команди, які не були в поточному матчі, але мають накопичені бали
        Object.values(teamTracker).forEach(team => {
          if (dataPoint[`team_${team.id}`] === undefined) {
            dataPoint[`team_${team.id}`] = team.cumulativePoints;
          }
        });
      }
      
      resultData.push(dataPoint);
    });
    
    // Сортуємо дані за часом для коректного відображення
    const preparedData = resultData
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(point => {
        // Видаляємо timestamp, він нам більше не потрібен
        const { timestamp, ...rest } = point;
        return rest;
      });
      
    setChartData(preparedData);
  }, [matches, players, format]);
  
  // Якщо немає даних, показуємо повідомлення
  if (chartData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Недостатньо даних для відображення графіка для формату {format === "1v1" ? "одиночних" : "парних"} матчів
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
            formatter={(value, name, props) => {
              // Знаходимо назву гравця/команди за ідентифікатором
              const key = name.split('_')[0];
              const id = name.split('_')[1];
              
              if (key === 'player') {
                const playerLine = playerLines.find(p => p.id === id);
                return [`${value} балів`, playerLine?.name || id];
              } else if (key === 'team') {
                const teamLine = teamLines.find(t => t.id === id);
                return [`${value} балів`, teamLine?.name || id];
              }
              
              return [value, name];
            }}
            labelFormatter={(label) => `Дата: ${label}`}
          />
          <Legend 
            formatter={(value, entry) => {
              // Знаходимо назву гравця/команди за ідентифікатором
              const key = value.split('_')[0];
              const id = value.split('_')[1];
              
              if (key === 'player') {
                const playerLine = playerLines.find(p => p.id === id);
                return playerLine?.name || id;
              } else if (key === 'team') {
                const teamLine = teamLines.find(t => t.id === id);
                return teamLine?.name || id;
              }
              
              return value;
            }}
          />
          
          {/* Рендеримо лінії для кожного гравця (1v1) */}
          {format === "1v1" && playerLines.map((player, index) => (
            <Line
              key={player.id}
              type="monotone"
              dataKey={`player_${player.id}`}
              name={`player_${player.id}`} // Буде замінено в Legend formatter
              stroke={player.color}
              activeDot={{ r: 8 }}
              strokeWidth={2}
            />
          ))}
          
          {/* Рендеримо лінії для кожної команди (2v2) */}
          {format === "2v2" && teamLines.map((team, index) => (
            <Line
              key={team.id}
              type="monotone"
              dataKey={`team_${team.id}`}
              name={`team_${team.id}`} // Буде замінено в Legend formatter
              stroke={team.color}
              activeDot={{ r: 8 }}
              strokeWidth={2}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};