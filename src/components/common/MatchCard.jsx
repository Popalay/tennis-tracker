// src/components/common/MatchCard.jsx
import { Card } from "./Card";
import { PlayerAvatar } from "./PlayerAvatar";
import { useNavigate } from "react-router-dom";

export const MatchCard = ({ match, players }) => {
  const navigate = useNavigate();

  // Функція для отримання імені гравця за ID
  const getPlayerName = (playerId) => {
    const player = players.find((p) => p.id === playerId);
    return player ? player.name : "Невідомий гравець";
  };

  // Функція для визначення переможця - більш компактна версія
  const getWinnerDisplay = () => {
    if (!match.pointsEarned || !match.pointsEarned.winner) return null;

    const winnerPoints = match.pointsEarned.points 
      ? Object.values(match.pointsEarned.points)[0] 
      : null;

    if (match.format === "1v1") {
      const winnerName = getPlayerName(match.pointsEarned.winner);
      return (
        <div className="flex items-center text-green-600 dark:text-green-400">
          <span className="font-medium truncate max-w-[120px] sm:max-w-[160px] md:max-w-none">{winnerName}</span>
          {winnerPoints && (
            <span className="ml-1 text-xs bg-green-100 dark:bg-green-900/30 px-1 rounded-sm text-green-700 dark:text-green-300">
              +{winnerPoints}
            </span>
          )}
        </div>
      );
    } else if (
      match.format === "2v2" &&
      Array.isArray(match.pointsEarned.winner)
    ) {
      // For doubles, just show "Team X"
      const teamNumber = match.teams[0].some(id => match.pointsEarned.winner.includes(id)) ? "1" : "2";
      return (
        <div className="flex items-center text-green-600 dark:text-green-400">
          <span className="font-medium">Команда {teamNumber}</span>
          {winnerPoints && (
            <span className="ml-1 text-xs bg-green-100 dark:bg-green-900/30 px-1 rounded-sm text-green-700 dark:text-green-300">
              +{winnerPoints}
            </span>
          )}
        </div>
      );
    }

    return null;
  };

  // Формування відображення результатів сетів - компактніша версія
  const getSetsDisplay = () => {
    if (!match.sets) return null;

    return (
      <>
        {Object.entries(match.sets).map(([setNumber, setData]) => {
          // Determine scores based on match format
          let player1Score = 0;
          let player2Score = 0;
          
          if (match.format === "1v1") {
            player1Score = setData.games[match.players[0]] || 0;
            player2Score = setData.games[match.players[1]] || 0;
          } else {
            player1Score = setData.games[match.teams[0].join("-")] || 0;
            player2Score = setData.games[match.teams[1].join("-")] || 0;
          }
          
          // Determine winner for highlighting
          const isPlayer1Winner = player1Score > player2Score;
          const isPlayer2Winner = player2Score > player1Score;
          
          return (
            <div 
              key={setNumber} 
              className="rounded-md px-2 py-1 border border-gray-100 dark:border-gray-600 bg-white dark:bg-gray-700"
            >
              <div className="flex items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">С{setNumber}</span>
                <span className={`text-sm font-bold ${isPlayer1Winner ? "text-green-600 dark:text-green-400" : ""}`}>
                  {player1Score}
                </span>
                <span className="text-xs px-1">:</span>
                <span className={`text-sm font-bold ${isPlayer2Winner ? "text-green-600 dark:text-green-400" : ""}`}>
                  {player2Score}
                </span>
              </div>
            </div>
          );
        })}
      </>
    );
  };

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

  return (
    <Card
      className="overflow-hidden"
      onClick={() => navigate(`/match/${match.id}`)}
    >
      {/* Match type ribbon */}
      <div className="absolute top-0 right-0">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-2 py-0.5 shadow-md text-xs rounded-bl-lg">
          {match.format === "1v1" ? "1v1" : "2v2"}
        </div>
      </div>

      {/* Match date and player info in a more compact layout */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
          <svg className="w-4 h-4 mr-1 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {formatDate(match.createdAt)}
        </div>
      </div>

      {/* Players section - more compact */}
      <div className="mb-3">
        {match.format === "1v1" ? (
          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/60 rounded-lg p-2">
            {/* First player */}
            <div className="flex items-center">
              <PlayerAvatar playerId={match.players[0]} size="medium" />
              <span className="ml-2 text-sm font-medium truncate max-w-[90px] sm:max-w-[120px] md:max-w-none">
                {getPlayerName(match.players[0])}
              </span>
            </div>

            {/* VS badge */}
            <div className="mx-2 px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded-full text-xs font-bold">
              VS
            </div>

            {/* Second player */}
            <div className="flex items-center">
              <span className="mr-2 text-sm font-medium truncate max-w-[90px] sm:max-w-[120px] md:max-w-none text-right">
                {getPlayerName(match.players[1])}
              </span>
              <PlayerAvatar playerId={match.players[1]} size="medium" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 bg-gray-50 dark:bg-gray-800/60 rounded-lg p-2">
            {/* Team 1 */}
            <div className="col-span-1 flex flex-col items-center space-y-1">
              <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400">Команда 1</h4>
              {match.teams[0].map((playerId) => (
                <div key={playerId} className="flex items-center">
                  <PlayerAvatar playerId={playerId} size="small" />
                  <span className="ml-1 text-xs truncate max-w-[60px]">
                    {getPlayerName(playerId).split(' ')[0]}
                  </span>
                </div>
              ))}
            </div>

            {/* VS badge */}
            <div className="col-span-1 flex justify-center items-center">
              <div className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded-full text-xs font-bold">
                VS
              </div>
            </div>

            {/* Team 2 */}
            <div className="col-span-1 flex flex-col items-center space-y-1">
              <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400">Команда 2</h4>
              {match.teams[1].map((playerId) => (
                <div key={playerId} className="flex items-center">
                  <span className="mr-1 text-xs truncate max-w-[60px] text-right">
                    {getPlayerName(playerId).split(' ')[0]}
                  </span>
                  <PlayerAvatar playerId={playerId} size="small" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Score and winner in a more compact layout */}
      <div className="flex gap-2">
        {/* Score display */}
        <div className="flex-1">
          <div className="flex flex-wrap gap-1">
            {getSetsDisplay()}
          </div>
        </div>
        
        {/* Winner display - more compact */}
        {match.pointsEarned && match.pointsEarned.winner && (
          <div className="bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg border-l-2 border-green-500 flex items-center text-xs">
            <svg className="w-3 h-3 text-green-600 dark:text-green-400 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {getWinnerDisplay()}
          </div>
        )}
      </div>
    </Card>
  );
};
