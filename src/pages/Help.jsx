// src/pages/Help.jsx
import { Card } from "../components/common/Card";

export const Help = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        Допомога та інформація
      </h1>

      {/* Про додаток */}
      <Card className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
          Про Tennis Tracker
        </h2>
        <p className="mb-4">
          Tennis Tracker - це зручний інструмент для запису та аналізу результатів тенісних матчів. 
          Додаток дозволяє вести облік матчів, відстежувати статистику гравців, та зручно переглядати історію ігор.
        </p>
        <p>
          За допомогою Tennis Tracker ви можете:
        </p>
        <ul className="list-disc pl-5 space-y-2 my-4">
          <li>Записувати результати одиночних (1 на 1) та парних (2 на 2) матчів</li>
          <li>Відстежувати загальну статистику гравців</li>
          <li>Аналізувати розподіл перемог і поразок</li>
          <li>Переглядати історію матчів з можливістю фільтрації</li>
          <li>Візуалізувати прогрес гравців у часі</li>
        </ul>
      </Card>

      {/* Система нарахування балів */}
      <Card className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
          Система нарахування балів
        </h2>
        <p className="mb-4">
          У Tennis Tracker використовується гнучка система нарахування балів, яка враховує різні аспекти гри:
        </p>

        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
          <h3 className="font-semibold mb-2 text-blue-600 dark:text-blue-400">Базові бали</h3>
          <p className="mb-2">Переможець матчу отримує базову кількість балів:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Одиночний матч (1v1): 100 балів</li>
            <li>Парний матч (2v2): 80 балів на кожного гравця команди-переможця</li>
          </ul>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
          <h3 className="font-semibold mb-2 text-blue-600 dark:text-blue-400">Бонусні бали</h3>
          <p className="mb-2">Додаткові бали нараховуються за різницю сетів та ігор:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>За кожен виграний сет: +20 балів</li>
            <li>За кожен виграний гейм: +5 балів</li>
          </ul>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h3 className="font-semibold mb-2 text-blue-600 dark:text-blue-400">Рейтингові коефіцієнти</h3>
          <p className="mb-2">Система також враховує рейтинг гравців:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Перемога над гравцем з вищим рейтингом: множник х1.5</li>
            <li>Перемога над гравцем з нижчим рейтингом: множник х0.8</li>
            <li>Перемога над гравцем з приблизно однаковим рейтингом: множник х1.0</li>
          </ul>
        </div>
      </Card>

      {/* Корисні поради */}
      <Card>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
          Корисні поради
        </h2>
        <ul className="list-disc pl-5 space-y-3">
          <li>
            <strong>Починайте з фіксації результатів:</strong> Регулярно записуйте всі ваші матчі для отримання точної статистики.
          </li>
          <li>
            <strong>Аналізуйте статистику:</strong> Використовуйте сторінку "Статистика" для аналізу прогресу та ідентифікації сильних і слабких сторін.
          </li>
          <li>
            <strong>Використовуйте фільтри:</strong> На сторінці "Історія" ви можете фільтрувати матчі за гравцем, форматом та датою для зручного пошуку.
          </li>
          <li>
            <strong>Темна тема:</strong> Для комфортного використання в умовах слабкого освітлення, ви можете увімкнути темну тему, натиснувши на іконку в правому верхньому куті.
          </li>
        </ul>
      </Card>
    </div>
  );
};