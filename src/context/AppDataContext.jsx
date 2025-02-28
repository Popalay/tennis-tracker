// src/context/AppDataContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  query,
  orderBy,
  limit as firestoreLimit,
} from "firebase/firestore";
import { db } from "../api/firebase";
import { calculateMatchPoints } from "../utils/scoringSystem";

// Sample data (with Ukrainian and western names)
const samplePlayers = [
  {
    id: "p1",
    name: "Олександр Зверєв",
    totalPoints: 1250,
    matchesPlayed: 15,
    matchesWon: 9,
    setsWon: 25,
    gamesWon: 120,
  },
  {
    id: "p2",
    name: "Андрій Кравченко",
    totalPoints: 980,
    matchesPlayed: 12,
    matchesWon: 7,
    setsWon: 19,
    gamesWon: 95,
  },
  {
    id: "p3",
    name: "Роджер Федерер",
    totalPoints: 1560,
    matchesPlayed: 18,
    matchesWon: 14,
    setsWon: 32,
    gamesWon: 167,
  },
  {
    id: "p4",
    name: "Рафаель Надаль",
    totalPoints: 1340,
    matchesPlayed: 16,
    matchesWon: 11,
    setsWon: 28,
    gamesWon: 145,
  },
  {
    id: "p5",
    name: "Карлос Алкарас",
    totalPoints: 890,
    matchesPlayed: 10,
    matchesWon: 5,
    setsWon: 17,
    gamesWon: 78,
  },
  {
    id: "p6",
    name: "Новак Джокович",
    totalPoints: 1420,
    matchesPlayed: 14,
    matchesWon: 12,
    setsWon: 30,
    gamesWon: 156,
  },
];

const sampleMatches = [
  {
    id: "m1",
    format: "1v1",
    players: ["p1", "p2"],
    createdAt: new Date(2024, 1, 5, 14, 30).toISOString(),
    sets: {
      1: {
        games: {
          p1: 6,
          p2: 4,
        },
      },
      2: {
        games: {
          p1: 7,
          p2: 6,
        },
      },
    },
    pointsEarned: {
      winner: "p1",
      points: {
        p1: 150,
        p2: 45,
      },
    },
  },
  {
    id: "m2",
    format: "1v1",
    players: ["p3", "p4"],
    createdAt: new Date(2024, 1, 12, 16, 0).toISOString(),
    sets: {
      1: {
        games: {
          p3: 4,
          p4: 6,
        },
      },
      2: {
        games: {
          p3: 6,
          p4: 3,
        },
      },
      3: {
        games: {
          p3: 7,
          p4: 5,
        },
      },
    },
    pointsEarned: {
      winner: "p3",
      points: {
        p3: 180,
        p4: 60,
      },
    },
  },
  {
    id: "m3",
    format: "2v2",
    players: ["p1", "p3", "p2", "p4"],
    teams: [
      ["p1", "p3"],
      ["p2", "p4"],
    ],
    createdAt: new Date(2024, 1, 18, 10, 15).toISOString(),
    sets: {
      1: {
        games: {
          "p1-p3": 6,
          "p2-p4": 3,
        },
      },
      2: {
        games: {
          "p1-p3": 6,
          "p2-p4": 4,
        },
      },
    },
    pointsEarned: {
      winner: ["p1", "p3"],
      points: {
        "p1-p3": 120,
        "p2-p4": 40,
      },
    },
  },
  {
    id: "m4",
    format: "1v1",
    players: ["p5", "p6"],
    createdAt: new Date(2024, 1, 25, 18, 30).toISOString(),
    sets: {
      1: {
        games: {
          p5: 3,
          p6: 6,
        },
      },
      2: {
        games: {
          p5: 4,
          p6: 6,
        },
      },
    },
    pointsEarned: {
      winner: "p6",
      points: {
        p5: 35,
        p6: 140,
      },
    },
  },
  {
    id: "m5",
    format: "1v1",
    players: ["p2", "p5"],
    createdAt: new Date(2024, 2, 2, 15, 0).toISOString(),
    sets: {
      1: {
        games: {
          p2: 6,
          p5: 4,
        },
      },
      2: {
        games: {
          p2: 3,
          p5: 6,
        },
      },
      3: {
        games: {
          p2: 6,
          p5: 3,
        },
      },
    },
    pointsEarned: {
      winner: "p2",
      points: {
        p2: 160,
        p5: 50,
      },
    },
  },
];

// Create context
const AppDataContext = createContext();

export const useAppData = () => useContext(AppDataContext);

export const AppDataProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState(null);
  const [useFirebase, setUseFirebase] = useState(true);

  // Load data from Firebase on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

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
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || data.createdAt, // Convert Firestore timestamp if needed
          };
        });

        // If Firebase data is empty, use sample data as fallback
        if (playersData.length === 0 || matchesData.length === 0) {
          console.log(
            "Using sample data as fallback because Firebase returned empty data",
          );
          setPlayers(samplePlayers);
          setMatches(sampleMatches);
          setUseFirebase(false);
        } else {
          setPlayers(playersData);
          setMatches(matchesData);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data from Firebase:", error);
        setError("Failed to connect to database. Using sample data instead.");
        setPlayers(samplePlayers);
        setMatches(sampleMatches);
        setUseFirebase(false);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // API functions - with fallback to sample data
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

      // Add timestamp
      const matchWithTimestamp = {
        ...matchData,
        createdAt: new Date(),
        pointsEarned: pointsData,
      };

      let newMatch;

      if (useFirebase) {
        // Save to Firebase
        const docRef = await addDoc(
          collection(db, "matches"),
          matchWithTimestamp,
        );
        newMatch = { id: docRef.id, ...matchWithTimestamp };

        // Update player stats in Firebase
        // This would normally be done here, but for simplicity we'll skip it
      } else {
        // Save to local state only
        newMatch = {
          ...matchWithTimestamp,
          id: `m${matches.length + 1}`,
        };
        setMatches((prev) => [...prev, newMatch]);

        // Update local player stats
        updateLocalPlayerStats(matchData, pointsData);
      }

      return newMatch;
    } catch (error) {
      console.error("Error adding match:", error);
      throw error;
    }
  };

  const updateLocalPlayerStats = (matchData, pointsData) => {
    setPlayers((prevPlayers) => {
      const updatedPlayers = [...prevPlayers];

      if (matchData.format === "1v1") {
        // Update stats for singles match
        const player1Id = matchData.players[0];
        const player2Id = matchData.players[1];
        const player1Won = pointsData.winner === player1Id;

        const p1Index = updatedPlayers.findIndex((p) => p.id === player1Id);
        const p2Index = updatedPlayers.findIndex((p) => p.id === player2Id);

        if (p1Index >= 0) {
          updatedPlayers[p1Index] = {
            ...updatedPlayers[p1Index],
            totalPoints:
              (updatedPlayers[p1Index].totalPoints || 0) +
              (pointsData.points[player1Id] || 0),
            matchesPlayed: (updatedPlayers[p1Index].matchesPlayed || 0) + 1,
            matchesWon:
              (updatedPlayers[p1Index].matchesWon || 0) + (player1Won ? 1 : 0),
          };
        }

        if (p2Index >= 0) {
          updatedPlayers[p2Index] = {
            ...updatedPlayers[p2Index],
            totalPoints:
              (updatedPlayers[p2Index].totalPoints || 0) +
              (pointsData.points[player2Id] || 0),
            matchesPlayed: (updatedPlayers[p2Index].matchesPlayed || 0) + 1,
            matchesWon:
              (updatedPlayers[p2Index].matchesWon || 0) + (!player1Won ? 1 : 0),
          };
        }
      } else if (matchData.format === "2v2") {
        // Update stats for doubles match
        matchData.players.forEach((playerId) => {
          const index = updatedPlayers.findIndex((p) => p.id === playerId);
          if (index >= 0) {
            const playerTeam = matchData.teams.find((team) =>
              team.includes(playerId),
            );
            const teamId = playerTeam.join("-");
            const isWinner = pointsData.winner.includes(playerId);

            updatedPlayers[index] = {
              ...updatedPlayers[index],
              totalPoints:
                (updatedPlayers[index].totalPoints || 0) +
                (pointsData.points[teamId] || 0) / 2,
              matchesPlayed: (updatedPlayers[index].matchesPlayed || 0) + 1,
              matchesWon:
                (updatedPlayers[index].matchesWon || 0) + (isWinner ? 1 : 0),
            };
          }
        });
      }

      return updatedPlayers;
    });
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
        createdAt: new Date(),
      };

      let newPlayer;

      // if (useFirebase) {
      // Save to Firebase
      const docRef = await addDoc(collection(db, "players"), newPlayerData);
      newPlayer = { id: docRef.id, ...newPlayerData };
      // } else {
      //   // Save to local state only
      //   newPlayer = {
      //     ...newPlayerData,
      //     id: `p${players.length + 1}`,
      //   };
      //   setPlayers((prev) => [...prev, newPlayer]);
      // }

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
