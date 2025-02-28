// src/components/forms/MatchForm.jsx
import { useState, useEffect } from "react";
import { Button } from "../common/Button";
import { Card } from "../common/Card";
import { PlayerAvatar } from "../common/PlayerAvatar";

export const MatchForm = ({ players, onSubmit, initialValues = {} }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [matchData, setMatchData] = useState({
    format: initialValues.format || "1v1",
    players: initialValues.players || [],
    teams: initialValues.teams || [[], []],
    sets: initialValues.sets || {},
    date: initialValues.date || new Date().toISOString().split("T")[0],
  });

  const [errors, setErrors] = useState({});

  // Ефект для заповнення даних за умовчанням при зміні формату
  useEffect(() => {
    if (matchData.format === "1v1") {
      setMatchData((prev) => ({
        ...prev,
        teams: [[], []],
      }));
    }
  }, [matchData.format]);

  // Функції валідації для кожного кроку
  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 0: // Вибір формату і гравців
        if (matchData.format === "1v1") {
          if (matchData.players.length !== 2) {
            newErrors.players = "Виберіть двох гравців";
          } else if (matchData.players[0] === matchData.players[1]) {
            newErrors.players = "Гравці повинні бути різними";
          }
        } else if (matchData.format === "2v2") {
          const allPlayers = [...matchData.teams[0], ...matchData.teams[1]];
          if (allPlayers.length !== 4) {
            newErrors.teams =
              "Виберіть чотирьох гравців (по два в кожній команді)";
          } else {
            const uniquePlayers = new Set(allPlayers);
            if (uniquePlayers.size !== 4) {
              newErrors.teams =
                "Кожен гравець може бути вибраний тільки один раз";
            }
          }
        }
        break;

      case 1: // Введення результатів сетів
        const setNumbers = Object.keys(matchData.sets);
        if (setNumbers.length === 0) {
          newErrors.sets = "Додайте хоча б один сет";
        } else {
          for (const setNumber of setNumbers) {
            const currentSet = matchData.sets[setNumber];

            if (matchData.format === "1v1") {
              const player1Games = currentSet.games[matchData.players[0]] || 0;
              const player2Games = currentSet.games[matchData.players[1]] || 0;

              if (player1Games === player2Games) {
                newErrors[`set_${setNumber}`] = "У тенісі не може бути нічиїх";
              }

              if (!currentSet.winner) {
                newErrors[`set_${setNumber}_winner`] =
                  "Виберіть переможця сету";
              }
            } else if (matchData.format === "2v2") {
              const team1Id = matchData.teams[0].join("-");
              const team2Id = matchData.teams[1].join("-");

              const team1Games = currentSet.games[team1Id] || 0;
              const team2Games = currentSet.games[team2Id] || 0;

              if (team1Games === team2Games) {
                newErrors[`set_${setNumber}`] = "У тенісі не може бути нічиїх";
              }

              if (!currentSet.winner) {
                newErrors[`set_${setNumber}_winner`] =
                  "Виберіть переможця сету";
              }
            }
          }
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Функція для переходу на наступний крок
  const handleNextStep = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  // Функція для повернення на попередній крок
  const handlePrevStep = () => {
    setActiveStep((prev) => prev - 1);
  };

  // Функція для обробки подання форми
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateStep(activeStep)) {
      onSubmit(matchData);
    }
  };

  // Функція для обробки вибору гравців
  const handlePlayerSelect = (playerId) => {
    if (matchData.format === "1v1") {
      // Для одиночного формату
      if (matchData.players.includes(playerId)) {
        // Видаляємо гравця, якщо він вже вибраний
        setMatchData((prev) => ({
          ...prev,
          players: prev.players.filter((id) => id !== playerId),
        }));
      } else if (matchData.players.length < 2) {
        // Додаємо гравця, якщо ще не вибрано двох
        setMatchData((prev) => ({
          ...prev,
          players: [...prev.players, playerId],
        }));
      }
    } else if (matchData.format === "2v2") {
      // Для парного формату

      // Перевірка, чи гравець вже вибраний у якійсь команді
      const team1Has = matchData.teams[0].includes(playerId);
      const team2Has = matchData.teams[1].includes(playerId);

      if (team1Has || team2Has) {
        // Видаляємо гравця з команди
        setMatchData((prev) => ({
          ...prev,
          teams: [
            team1Has
              ? prev.teams[0].filter((id) => id !== playerId)
              : prev.teams[0],
            team2Has
              ? prev.teams[1].filter((id) => id !== playerId)
              : prev.teams[1],
          ],
        }));
      } else {
        // Визначаємо, в яку команду додати гравця
        let teamIndex = 0;
        if (matchData.teams[0].length >= 2) {
          teamIndex = 1;
        }

        // Перевіряємо, чи команда не заповнена
        if (matchData.teams[teamIndex].length < 2) {
          setMatchData((prev) => {
            const newTeams = [...prev.teams];
            newTeams[teamIndex] = [...newTeams[teamIndex], playerId];
            return {
              ...prev,
              teams: newTeams,
            };
          });
        }
      }
    }
  };

  // Функція для додавання сету
  const handleAddSet = () => {
    const nextSetNumber = Object.keys(matchData.sets).length + 1;

    setMatchData((prev) => {
      const newSet = {
        games: {},
        winner: null,
      };

      // Ініціалізуємо рахунок геймів
      if (prev.format === "1v1") {
        newSet.games[prev.players[0]] = 0;
        newSet.games[prev.players[1]] = 0;
      } else if (prev.format === "2v2") {
        newSet.games[prev.teams[0].join("-")] = 0;
        newSet.games[prev.teams[1].join("-")] = 0;
      }

      return {
        ...prev,
        sets: {
          ...prev.sets,
          [nextSetNumber]: newSet,
        },
      };
    });
  };

  // Функція для видалення сету
  const handleRemoveSet = (setNumber) => {
    setMatchData((prev) => {
      const newSets = { ...prev.sets };
      delete newSets[setNumber];

      // Перенумеровуємо сети
      const renumberedSets = {};
      let index = 1;

      Object.values(newSets).forEach((set) => {
        renumberedSets[index] = set;
        index++;
      });

      return {
        ...prev,
        sets: renumberedSets,
      };
    });
  };

  // Функція для оновлення рахунку в сеті
  const handleSetScoreChange = (setNumber, playerId, value) => {
    const numValue = parseInt(value, 10) || 0;

    setMatchData((prev) => {
      const updatedSet = {
        ...prev.sets[setNumber],
        games: {
          ...prev.sets[setNumber].games,
          [playerId]: numValue,
        },
      };

      // Автоматичне визначення переможця сету
      if (prev.format === "1v1") {
        const player1Games =
          playerId === prev.players[0]
            ? numValue
            : updatedSet.games[prev.players[0]] || 0;
        const player2Games =
          playerId === prev.players[1]
            ? numValue
            : updatedSet.games[prev.players[1]] || 0;

        if (player1Games > player2Games) {
          updatedSet.winner = prev.players[0];
        } else if (player2Games > player1Games) {
          updatedSet.winner = prev.players[1];
        } else {
          updatedSet.winner = null;
        }
      } else if (prev.format === "2v2") {
        const team1Id = prev.teams[0].join("-");
        const team2Id = prev.teams[1].join("-");

        const team1Games =
          playerId === team1Id ? numValue : updatedSet.games[team1Id] || 0;
        const team2Games =
          playerId === team2Id ? numValue : updatedSet.games[team2Id] || 0;

        if (team1Games > team2Games) {
          updatedSet.winner = team1Id;
        } else if (team2Games > team1Games) {
          updatedSet.winner = team2Id;
        } else {
          updatedSet.winner = null;
        }
      }

      return {
        ...prev,
        sets: {
          ...prev.sets,
          [setNumber]: updatedSet,
        },
      };
    });

    // Скидання помилки при зміні значення
    if (errors[`set_${setNumber}`]) {
      setErrors((prev) => ({
        ...prev,
        [`set_${setNumber}`]: null,
      }));
    }
  };

  // Функція для отримання імені гравця за ID
  const getPlayerName = (playerId) => {
    const player = players.find((p) => p.id === playerId);
    return player ? player.name : "Невідомий гравець";
  };

  // Рендеринг кроку 1: Вибір формату і гравців
  const renderFormatAndPlayersStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Формат матчу</h3>
        <div className="flex space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="format"
              value="1v1"
              checked={matchData.format === "1v1"}
              onChange={() =>
                setMatchData((prev) => ({
                  ...prev,
                  format: "1v1",
                  players: [],
                }))
              }
              className="text-blue-600"
            />
            <span className="ml-2">Одиночний (1 на 1)</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="format"
              value="2v2"
              checked={matchData.format === "2v2"}
              onChange={() =>
                setMatchData((prev) => ({
                  ...prev,
                  format: "2v2",
                  teams: [[], []],
                }))
              }
              className="text-blue-600"
            />
            <span className="ml-2">Парний (2 на 2)</span>
          </label>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">
          {matchData.format === "1v1" ? "Виберіть гравців" : "Виберіть команди"}
        </h3>

        {errors.players && (
          <p className="text-red-500 text-sm mb-2">{errors.players}</p>
        )}

        {errors.teams && (
          <p className="text-red-500 text-sm mb-2">{errors.teams}</p>
        )}

        {matchData.format === "1v1" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-md font-medium mb-2">Гравець 1</h4>
              <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-md min-h-12 flex items-center">
                {matchData.players[0] ? (
                  <div className="flex items-center">
                    <PlayerAvatar
                      playerId={matchData.players[0]}
                      size="small"
                    />
                    <span className="ml-2">
                      {getPlayerName(matchData.players[0])}
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-500">Не вибрано</span>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-md font-medium mb-2">Гравець 2</h4>
              <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-md min-h-12 flex items-center">
                {matchData.players[1] ? (
                  <div className="flex items-center">
                    <PlayerAvatar
                      playerId={matchData.players[1]}
                      size="small"
                    />
                    <span className="ml-2">
                      {getPlayerName(matchData.players[1])}
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-500">Не вибрано</span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-md font-medium mb-2">Команда 1</h4>
              <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-md min-h-24">
                {matchData.teams[0].length === 0 ? (
                  <span className="text-gray-500">Не вибрано</span>
                ) : (
                  <div className="space-y-2">
                    {matchData.teams[0].map((playerId) => (
                      <div key={playerId} className="flex items-center">
                        <PlayerAvatar playerId={playerId} size="small" />
                        <span className="ml-2">{getPlayerName(playerId)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-md font-medium mb-2">Команда 2</h4>
              <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-md min-h-24">
                {matchData.teams[1].length === 0 ? (
                  <span className="text-gray-500">Не вибрано</span>
                ) : (
                  <div className="space-y-2">
                    {matchData.teams[1].map((playerId) => (
                      <div key={playerId} className="flex items-center">
                        <PlayerAvatar playerId={playerId} size="small" />
                        <span className="ml-2">{getPlayerName(playerId)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Доступні гравці</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {players.map((player) => {
            // Визначення, чи вибраний гравець
            let isSelected = false;
            if (matchData.format === "1v1") {
              isSelected = matchData.players.includes(player.id);
            } else if (matchData.format === "2v2") {
              isSelected =
                matchData.teams[0].includes(player.id) ||
                matchData.teams[1].includes(player.id);
            }

            return (
              <div
                key={player.id}
                onClick={() => handlePlayerSelect(player.id)}
                className={`
                  p-2 rounded-md cursor-pointer flex items-center
                  ${
                    isSelected
                      ? "bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700"
                      : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }
                `}
              >
                <PlayerAvatar playerId={player.id} size="small" />
                <span className="ml-2">{player.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Рендеринг кроку 2: Введення результатів сетів
  const renderSetsStep = () => (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium">Результати сетів</h3>
          <Button variant="secondary" size="small" onClick={handleAddSet}>
            Додати сет
          </Button>
        </div>

        {errors.sets && (
          <p className="text-red-500 text-sm mb-2">{errors.sets}</p>
        )}

        {Object.keys(matchData.sets).length === 0 ? (
          <p className="text-gray-500">Додайте перший сет</p>
        ) : (
          <div className="space-y-4">
            {Object.entries(matchData.sets).map(([setNumber, setData]) => (
              <Card key={setNumber} className="relative">
                {Object.keys(matchData.sets).length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSet(setNumber)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    aria-label="Видалити сет"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}

                <h4 className="text-md font-medium mb-3">Сет {setNumber}</h4>

                {errors[`set_${setNumber}`] && (
                  <p className="text-red-500 text-sm mb-2">
                    {errors[`set_${setNumber}`]}
                  </p>
                )}

                {matchData.format === "1v1" ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {getPlayerName(matchData.players[0])}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={setData.games[matchData.players[0]] || ""}
                        onChange={(e) =>
                          handleSetScoreChange(
                            setNumber,
                            matchData.players[0],
                            e.target.value,
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {getPlayerName(matchData.players[1])}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={setData.games[matchData.players[1]] || ""}
                        onChange={(e) =>
                          handleSetScoreChange(
                            setNumber,
                            matchData.players[1],
                            e.target.value,
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Команда 1
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={
                          setData.games[matchData.teams[0].join("-")] || ""
                        }
                        onChange={(e) =>
                          handleSetScoreChange(
                            setNumber,
                            matchData.teams[0].join("-"),
                            e.target.value,
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Команда 2
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={
                          setData.games[matchData.teams[1].join("-")] || ""
                        }
                        onChange={(e) =>
                          handleSetScoreChange(
                            setNumber,
                            matchData.teams[1].join("-"),
                            e.target.value,
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Рендеринг кроку 3: Підтвердження
  const renderConfirmationStep = () => {
    // Визначення переможця матчу
    let matchWinner = "";

    if (matchData.format === "1v1") {
      const player1Sets = Object.values(matchData.sets).filter(
        (set) => set.winner === matchData.players[0],
      ).length;
      const player2Sets = Object.values(matchData.sets).filter(
        (set) => set.winner === matchData.players[1],
      ).length;

      if (player1Sets > player2Sets) {
        matchWinner = getPlayerName(matchData.players[0]);
      } else if (player2Sets > player1Sets) {
        matchWinner = getPlayerName(matchData.players[1]);
      }
    } else if (matchData.format === "2v2") {
      const team1Id = matchData.teams[0].join("-");
      const team2Id = matchData.teams[1].join("-");

      const team1Sets = Object.values(matchData.sets).filter(
        (set) => set.winner === team1Id,
      ).length;
      const team2Sets = Object.values(matchData.sets).filter(
        (set) => set.winner === team2Id,
      ).length;

      if (team1Sets > team2Sets) {
        matchWinner = "Команда 1";
      } else if (team2Sets > team1Sets) {
        matchWinner = "Команда 2";
      }
    }

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-medium mb-4">Підтвердження матчу</h3>

        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md space-y-4">
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300">
              Формат:
            </h4>
            <p>
              {matchData.format === "1v1"
                ? "Одиночний (1 на 1)"
                : "Парний (2 на 2)"}
            </p>
          </div>

          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300">
              {matchData.format === "1v1" ? "Гравці:" : "Команди:"}
            </h4>
            {matchData.format === "1v1" ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <PlayerAvatar playerId={matchData.players[0]} size="small" />
                  <span className="ml-2">
                    {getPlayerName(matchData.players[0])}
                  </span>
                </div>
                <div className="flex items-center">
                  <PlayerAvatar playerId={matchData.players[1]} size="small" />
                  <span className="ml-2">
                    {getPlayerName(matchData.players[1])}
                  </span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h5 className="text-sm font-medium mb-1">Команда 1:</h5>
                  {matchData.teams[0].map((playerId) => (
                    <div key={playerId} className="flex items-center mt-1">
                      <PlayerAvatar playerId={playerId} size="small" />
                      <span className="ml-2">{getPlayerName(playerId)}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <h5 className="text-sm font-medium mb-1">Команда 2:</h5>
                  {matchData.teams[1].map((playerId) => (
                    <div key={playerId} className="flex items-center mt-1">
                      <PlayerAvatar playerId={playerId} size="small" />
                      <span className="ml-2">{getPlayerName(playerId)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300">
              Результати сетів:
            </h4>
            <div className="space-y-2 mt-2">
              {Object.entries(matchData.sets).map(([setNumber, setData]) => (
                <div key={setNumber} className="flex">
                  <span className="w-12">Сет {setNumber}:</span>
                  {matchData.format === "1v1" ? (
                    <span>
                      {getPlayerName(matchData.players[0])}{" "}
                      {setData.games[matchData.players[0]] || 0} -{" "}
                      {setData.games[matchData.players[1]] || 0}{" "}
                      {getPlayerName(matchData.players[1])}
                    </span>
                  ) : (
                    <span>
                      Команда 1:{" "}
                      {setData.games[matchData.teams[0].join("-")] || 0} -{" "}
                      {setData.games[matchData.teams[1].join("-")] || 0} Команда
                      2
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300">
              Переможець:
            </h4>
            <p className="text-green-600 dark:text-green-500 font-semibold">
              {matchWinner}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Рендеринг поточного кроку
  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return renderFormatAndPlayersStep();
      case 1:
        return renderSetsStep();
      case 2:
        return renderConfirmationStep();
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Индикатор кроків */}
      <div className="flex mb-4">
        {["Вибір гравців", "Результати сетів", "Підтвердження"].map(
          (stepTitle, index) => (
            <div
              key={index}
              className={`flex-1 text-center py-2 ${
                index === activeStep
                  ? "text-blue-600 font-medium border-b-2 border-blue-600"
                  : index < activeStep
                    ? "text-gray-500 border-b border-gray-300"
                    : "text-gray-400 border-b border-gray-200"
              }`}
            >
              {stepTitle}
            </div>
          ),
        )}
      </div>

      {/* Вміст поточного кроку */}
      {renderStep()}

      {/* Навігація між кроками */}
      <div className="flex justify-between pt-4">
        {activeStep > 0 ? (
          <Button variant="secondary" onClick={handlePrevStep}>
            Назад
          </Button>
        ) : (
          <div></div>
        )}

        {activeStep < 2 ? (
          <Button variant="primary" onClick={handleNextStep}>
            Далі
          </Button>
        ) : (
          <Button type="submit" variant="success">
            Зберегти матч
          </Button>
        )}
      </div>
    </form>
  );
};
