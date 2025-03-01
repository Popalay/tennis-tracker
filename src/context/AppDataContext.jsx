// src/context/AppDataContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  query,
  orderBy,
  serverTimestamp,
  updateDoc,
  doc,
  increment,
  Timestamp
} from "firebase/firestore";

// Utility function to sanitize data for Firebase (handle nested arrays)
const sanitizeForFirebase = (data) => {
  if (data === null || data === undefined) {
    return data;
  }
  
  if (Array.isArray(data)) {
    // Convert arrays to objects with numeric keys
    const result = {};
    data.forEach((item, index) => {
      result[`${index}`] = sanitizeForFirebase(item);
    });
    return result;
  }
  
  if (typeof data === 'object') {
    // Process each property of the object
    const result = {};
    Object.keys(data).forEach(key => {
      result[key] = sanitizeForFirebase(data[key]);
    });
    return result;
  }
  
  // Return primitive values as is
  return data;
};

// Utility function to restore arrays from Firebase object representation
const restoreArraysFromFirebase = (obj) => {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'object') {
    // Check if this object represents an array (has only numeric keys in sequence)
    const keys = Object.keys(obj);
    const isArray = keys.length > 0 && 
                    keys.every((key, index) => key === index.toString());
    
    if (isArray) {
      // Convert back to an array
      return keys.map(key => restoreArraysFromFirebase(obj[key]));
    }
    
    // Process each property of regular objects
    const result = {};
    keys.forEach(key => {
      result[key] = restoreArraysFromFirebase(obj[key]);
    });
    return result;
  }
  
  // Return primitive values as is
  return obj;
};

import { db } from "../api/firebase";
import { calculateMatchPoints } from "../utils/scoringSystem";

// Create context
const AppDataContext = createContext();

export const useAppData = () => useContext(AppDataContext);

export const AppDataProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState(null);

  // Load data from Firebase on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Attempt to get players from Firebase
        const playersQuery = query(
          collection(db, "players"),
          orderBy("totalPoints", "desc"),
        );
        const playersSnapshot = await getDocs(playersQuery);
        const playersData = playersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Attempt to get matches from Firebase
        const matchesQuery = query(
          collection(db, "matches"),
          orderBy("createdAt", "desc"),
        );
        const matchesSnapshot = await getDocs(matchesQuery);
        const matchesData = matchesSnapshot.docs.map((doc) => {
          const data = doc.data();
          
          // Restore arrays from Firebase object representation
          const processedData = restoreArraysFromFirebase(data);
          
          // Convert legacy format (if needed)
          if (processedData.format === "2v2" && processedData.teamsMap && !processedData.teams) {
            processedData.teams = [
              processedData.teamsMap.team1 || [],
              processedData.teamsMap.team2 || []
            ];
            delete processedData.teamsMap;
          }
          
          return {
            id: doc.id,
            ...processedData,
            createdAt: data.createdAt instanceof Timestamp 
              ? data.createdAt.toDate() 
              : data.createdAt ? new Date(data.createdAt) : new Date(),
          };
        });

        setPlayers(playersData);
        setMatches(matchesData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data from Firebase:", error);
        setError("Не вдалося завантажити дані. Будь ласка, перевірте з'єднання та спробуйте пізніше.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Refresh data from Firebase
  const refreshData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch updated players
      const playersQuery = query(
        collection(db, "players"),
        orderBy("totalPoints", "desc"),
      );
      const playersSnapshot = await getDocs(playersQuery);
      const playersData = playersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Fetch updated matches
      const matchesQuery = query(
        collection(db, "matches"),
        orderBy("createdAt", "desc"),
      );
      const matchesSnapshot = await getDocs(matchesQuery);
      const matchesData = matchesSnapshot.docs.map((doc) => {
        const data = doc.data();
        
        // Restore arrays from Firebase object representation
        const processedData = restoreArraysFromFirebase(data);
        
        // Convert legacy format (if needed)
        if (processedData.format === "2v2" && processedData.teamsMap && !processedData.teams) {
          processedData.teams = [
            processedData.teamsMap.team1 || [],
            processedData.teamsMap.team2 || []
          ];
          delete processedData.teamsMap;
        }
        
        return {
          id: doc.id,
          ...processedData,
          createdAt: data.createdAt instanceof Timestamp 
            ? data.createdAt.toDate() 
            : data.createdAt ? new Date(data.createdAt) : new Date(),
        };
      });

      setPlayers(playersData);
      setMatches(matchesData);
      setLoading(false);
      
      return { players: playersData, matches: matchesData };
    } catch (error) {
      console.error("Error refreshing data:", error);
      setError("Не вдалося оновити дані. Будь ласка, спробуйте пізніше.");
      setLoading(false);
      throw error;
    }
  };

  // API functions
  const getRecentMatches = (limit = 5) => {
    return matches
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  };

  const getAllMatches = (filters = {}) => {
    let filteredMatches = [...matches];

    // Apply filters if provided
    if (filters.player) {
      filteredMatches = filteredMatches.filter((match) =>
        match.players.includes(filters.player),
      );
    }

    if (filters.format) {
      filteredMatches = filteredMatches.filter(
        (match) => match.format === filters.format,
      );
    }

    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filteredMatches = filteredMatches.filter(
        (match) => new Date(match.createdAt) >= fromDate,
      );
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      filteredMatches = filteredMatches.filter(
        (match) => new Date(match.createdAt) <= toDate,
      );
    }

    return filteredMatches.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
  };

  const getMatchById = (id) => {
    return matches.find((match) => match.id === id);
  };

  const getAllPlayers = () => {
    return players;
  };

  const getPlayerById = (id) => {
    return players.find((player) => player.id === id);
  };

  const addMatch = async (matchData) => {
    try {
      // Calculate points
      const pointsData = calculateMatchPoints(matchData);

      // Create a completely Firebase-safe version of matchData
      // This will convert all nested arrays to objects with numeric keys
      const rawData = JSON.parse(JSON.stringify(matchData));
      
      // Process the points data similarly
      const rawPointsData = JSON.parse(JSON.stringify(pointsData));
      
      // Completely sanitize the data for Firebase
      const firebaseSafeData = sanitizeForFirebase(rawData);
      const firebaseSafePointsData = sanitizeForFirebase(rawPointsData);
      
      // Create a timestamp object
      const timestampData = {
        createdAt: serverTimestamp(),
        pointsEarned: firebaseSafePointsData
      };
      
      // Combine everything into a Firebase-safe object
      const matchWithTimestamp = {
        ...firebaseSafeData,
        ...timestampData
      };

      // Save to Firebase
      const docRef = await addDoc(
        collection(db, "matches"),
        matchWithTimestamp,
      );
      
      // Update player stats in Firebase
      await updatePlayerStats(matchData, pointsData);
      
      // Get the new match with the ID and restore the original structure for the app state
      const newMatch = { 
        id: docRef.id, 
        ...matchData,
        createdAt: new Date(), // Use current date for display until refreshed
        pointsEarned: pointsData
      };
      
      // Update local state with the new match
      setMatches(prev => [newMatch, ...prev]);
      
      return newMatch;
    } catch (error) {
      console.error("Error adding match:", error);
      throw error;
    }
  };

  const updatePlayerStats = async (matchData, pointsData) => {
    try {
      if (matchData.format === "1v1") {
        // Update stats for singles match
        const player1Id = matchData.players[0];
        const player2Id = matchData.players[1];
        const player1Won = pointsData.winner === player1Id;

        // Update player 1 stats
        await updateDoc(doc(db, "players", player1Id), {
          totalPoints: increment(pointsData.points[player1Id] || 0),
          matchesPlayed: increment(1),
          matchesWon: increment(player1Won ? 1 : 0),
        });

        // Update player 2 stats
        await updateDoc(doc(db, "players", player2Id), {
          totalPoints: increment(pointsData.points[player2Id] || 0),
          matchesPlayed: increment(1),
          matchesWon: increment(!player1Won ? 1 : 0),
        });

        // Update local state
        setPlayers(prevPlayers => {
          return prevPlayers.map(player => {
            if (player.id === player1Id) {
              return {
                ...player,
                totalPoints: (player.totalPoints || 0) + (pointsData.points[player1Id] || 0),
                matchesPlayed: (player.matchesPlayed || 0) + 1,
                matchesWon: (player.matchesWon || 0) + (player1Won ? 1 : 0),
              };
            }
            if (player.id === player2Id) {
              return {
                ...player,
                totalPoints: (player.totalPoints || 0) + (pointsData.points[player2Id] || 0),
                matchesPlayed: (player.matchesPlayed || 0) + 1,
                matchesWon: (player.matchesWon || 0) + (!player1Won ? 1 : 0),
              };
            }
            return player;
          });
        });
      } else if (matchData.format === "2v2") {
        // Get the teams from either the teams array or teamsMap structure
        const teams = matchData.teams || (matchData.teamsMap ? [matchData.teamsMap.team1 || [], matchData.teamsMap.team2 || []] : [[], []]);
        
        // Update stats for doubles match
        for (const playerId of matchData.players) {
          const playerTeam = teams.find(team => team.includes(playerId));
          const teamId = playerTeam.join("-");
          const isWinner = pointsData.winner === teamId; // Compare with teamId string
          const pointsEarned = (pointsData.points[teamId] || 0) / 2; // Split team points

          // Update player stats in Firebase
          await updateDoc(doc(db, "players", playerId), {
            totalPoints: increment(pointsEarned),
            matchesPlayed: increment(1),
            matchesWon: increment(isWinner ? 1 : 0),
          });
        }

        // Update local state
        setPlayers(prevPlayers => {
          return prevPlayers.map(player => {
            const playerInMatch = matchData.players.includes(player.id);
            if (playerInMatch) {
              const playerTeam = teams.find(team => team.includes(player.id));
              const teamId = playerTeam.join("-");
              const isWinner = pointsData.winner === teamId; // Compare with teamId string
              const pointsEarned = (pointsData.points[teamId] || 0) / 2;

              return {
                ...player,
                totalPoints: (player.totalPoints || 0) + pointsEarned,
                matchesPlayed: (player.matchesPlayed || 0) + 1,
                matchesWon: (player.matchesWon || 0) + (isWinner ? 1 : 0),
              };
            }
            return player;
          });
        });
      }
    } catch (error) {
      console.error("Error updating player stats:", error);
      throw error;
    }
  };

  const addPlayer = async (playerData) => {
    try {
      const newPlayerData = {
        ...playerData,
        totalPoints: 0,
        matchesPlayed: 0,
        matchesWon: 0,
        setsWon: 0,
        gamesWon: 0,
        createdAt: serverTimestamp(),
      };

      // Save to Firebase
      const docRef = await addDoc(collection(db, "players"), newPlayerData);
      
      // Get the new player with the ID
      const newPlayer = { 
        id: docRef.id, 
        ...newPlayerData,
        createdAt: new Date() // Use current date for display until refreshed
      };
      
      // Update local state with the new player
      setPlayers(prev => [newPlayer, ...prev]);

      return newPlayer;
    } catch (error) {
      console.error("Error adding player:", error);
      throw error;
    }
  };

  return (
    <AppDataContext.Provider
      value={{
        loading,
        error,
        players,
        matches,
        refreshData,
        getRecentMatches,
        getAllMatches,
        getMatchById,
        getAllPlayers,
        getPlayerById,
        addMatch,
        addPlayer,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};
