// src/utils/scoringSystem.js

/**
 * Константи для системи нарахування балів
 */
export const POINTS = {
  GAME_WIN: 1,    // Бали за виграний гейм
  SET_WIN: 5,     // Додаткові бали за виграний сет
  MATCH_WIN: 10   // Додаткові бали за виграний матч
};

/**
 * Розрахунок балів на основі результатів матчу
 * @param {Object} matchData - Дані матчу
 * @returns {Object} Об'єкт з інформацією про нараховані бали
 */
export const calculateMatchPoints = (matchData) => {
  const result = {
    points: {},
    winner: null,
    totalSets: Object.keys(matchData.sets).length
  };
  
  // Підготовка об'єкту для підрахунку балів
  if (matchData.format === '1v1') {
    // Для одиночного формату
    const player1 = matchData.players[0];
    const player2 = matchData.players[1];
    
    result.points[player1] = 0;
    result.points[player2] = 0;
    
    // Підрахунок балів за гейми та сети
    let player1Sets = 0;
    let player2Sets = 0;
    
    Object.values(matchData.sets).forEach(set => {
      // Бали за гейми
      result.points[player1] += (set.games[player1] || 0) * POINTS.GAME_WIN;
      result.points[player2] += (set.games[player2] || 0) * POINTS.GAME_WIN;
      
      // Бали за виграний сет
      if (set.winner === player1) {
        result.points[player1] += POINTS.SET_WIN;
        player1Sets++;
      } else if (set.winner === player2) {
        result.points[player2] += POINTS.SET_WIN;
        player2Sets++;
      }
    });
    
    // Визначення переможця матчу
    if (player1Sets > player2Sets) {
      result.winner = player1;
      result.points[player1] += POINTS.MATCH_WIN;
    } else if (player2Sets > player1Sets) {
      result.winner = player2;
      result.points[player2] += POINTS.MATCH_WIN;
    } else {
      // Нічия не враховується в тенісі, але на всяк випадок
      result.winner = null;
    }
  } else if (matchData.format === '2v2') {
    // Для парного формату
    const team1Id = matchData.teams[0].join('-');
    const team2Id = matchData.teams[1].join('-');
    
    result.points[team1Id] = 0;
    result.points[team2Id] = 0;
    
    // Підрахунок балів за гейми та сети
    let team1Sets = 0;
    let team2Sets = 0;
    
    Object.values(matchData.sets).forEach(set => {
      // Бали за гейми
      result.points[team1Id] += (set.games[team1Id] || 0) * POINTS.GAME_WIN;
      result.points[team2Id] += (set.games[team2Id] || 0) * POINTS.GAME_WIN;
      
      // Бали за виграний сет
      if (set.winner === team1Id) {
        result.points[team1Id] += POINTS.SET_WIN;
        team1Sets++;
      } else if (set.winner === team2Id) {
        result.points[team2Id] += POINTS.SET_WIN;
        team2Sets++;
      }
    });
    
    // Визначення переможця матчу
    if (team1Sets > team2Sets) {
      // Use team ID string instead of array to avoid nested arrays in Firestore
      result.winner = team1Id;
      result.points[team1Id] += POINTS.MATCH_WIN;
    } else if (team2Sets > team1Sets) {
      // Use team ID string instead of array to avoid nested arrays in Firestore
      result.winner = team2Id;
      result.points[team2Id] += POINTS.MATCH_WIN;
    } else {
      // Нічия не враховується в тенісі, але на всяк випадок
      result.winner = null;
    }
  }
  
  return result;
};

/**
 * Розрахунок статистики виграних/програних геймів та сетів
 * @param {Array} matches - Список матчів
 * @param {String} playerId - ID гравця
 * @returns {Object} Об'єкт зі статистикою
 */
export const calculatePlayerStats = (matches, playerId) => {
  const stats = {
    totalMatches: 0,
    matchesWon: 0,
    totalSets: 0,
    setsWon: 0,
    totalGames: 0,
    gamesWon: 0,
    totalPoints: 0
  };
  
  matches.forEach(match => {
    // Перевірка, чи гравець брав участь у матчі
    const playerParticipated = match.players.includes(playerId);
    if (!playerParticipated) return;
    
    stats.totalMatches++;
    
    // Для одиночного формату
    if (match.format === '1v1') {
      // Перевірка, чи гравець виграв матч
      if (match.pointsEarned.winner === playerId) {
        stats.matchesWon++;
      }
      
      // Підрахунок сетів і геймів
      Object.values(match.sets).forEach(set => {
        stats.totalSets++;
        if (set.winner === playerId) {
          stats.setsWon++;
        }
        
        stats.totalGames += Object.values(set.games).reduce((sum, games) => sum + games, 0);
        stats.gamesWon += (set.games[playerId] || 0);
      });
      
      // Підрахунок балів
      stats.totalPoints += (match.pointsEarned.points[playerId] || 0);
    }
    // Для парного формату
    else if (match.format === '2v2') {
      // Визначення команди гравця
      const playerTeam = match.teams.find(team => team.includes(playerId));
      const teamId = playerTeam.join('-');
      
      // Перевірка, чи команда гравця виграла матч
      // Now winner is stored as a team ID string (not an array of player IDs)
      if (match.pointsEarned.winner === teamId) {
        stats.matchesWon++;
      }
      
      // Підрахунок сетів і геймів
      Object.values(match.sets).forEach(set => {
        stats.totalSets++;
        if (set.winner === teamId) {
          stats.setsWon++;
        }
        
        stats.totalGames += Object.values(set.games).reduce((sum, games) => sum + games, 0);
        stats.gamesWon += (set.games[teamId] || 0) / 2; // Ділимо на 2, оскільки це команда
      });
      
      // Підрахунок балів (розділені між членами команди)
      stats.totalPoints += (match.pointsEarned.points[teamId] || 0) / 2;
    }
  });
  
  return stats;
};
