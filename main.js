import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';

// Main GeoQuest component
export default function GeoQuest() {
  // Game states
  const [gameMode, setGameMode] = useState('country'); // 'country', 'capital', 'flag'
  const [countries, setCountries] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackClass, setFeedbackClass] = useState('');
  const [streakCount, setStreakCount] = useState(0);
  const [highestStreak, setHighestStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [history, setHistory] = useState([]);

  // Load country data
  useEffect(() => {
    // Example data - in a real implementation, this would be fetched from an API
    const countriesData = [
      { name: 'United States', capital: 'Washington D.C.', code: 'US', continent: 'North America' },
      { name: 'Canada', capital: 'Ottawa', code: 'CA', continent: 'North America' },
      { name: 'Mexico', capital: 'Mexico City', code: 'MX', continent: 'North America' },
      { name: 'Brazil', capital: 'Brasília', code: 'BR', continent: 'South America' },
      { name: 'Argentina', capital: 'Buenos Aires', code: 'AR', continent: 'South America' },
      { name: 'United Kingdom', capital: 'London', code: 'GB', continent: 'Europe' },
      { name: 'France', capital: 'Paris', code: 'FR', continent: 'Europe' },
      { name: 'Germany', capital: 'Berlin', code: 'DE', continent: 'Europe' },
      { name: 'Italy', capital: 'Rome', code: 'IT', continent: 'Europe' },
      { name: 'Spain', capital: 'Madrid', code: 'ES', continent: 'Europe' },
      { name: 'Russia', capital: 'Moscow', code: 'RU', continent: 'Europe/Asia' },
      { name: 'China', capital: 'Beijing', code: 'CN', continent: 'Asia' },
      { name: 'Japan', capital: 'Tokyo', code: 'JP', continent: 'Asia' },
      { name: 'India', capital: 'New Delhi', code: 'IN', continent: 'Asia' },
      { name: 'Australia', capital: 'Canberra', code: 'AU', continent: 'Oceania' },
      { name: 'New Zealand', capital: 'Wellington', code: 'NZ', continent: 'Oceania' },
      { name: 'South Africa', capital: 'Pretoria', code: 'ZA', continent: 'Africa' },
      { name: 'Egypt', capital: 'Cairo', code: 'EG', continent: 'Africa' },
      { name: 'Nigeria', capital: 'Abuja', code: 'NG', continent: 'Africa' },
      { name: 'Kenya', capital: 'Nairobi', code: 'KE', continent: 'Africa' },
    ];
    setCountries(countriesData);
  }, []);

  // Start a new game
  const startGame = () => {
    setGameActive(true);
    setScore(0);
    setTotalQuestions(0);
    setStreakCount(0);
    setHistory([]);
    setTimeLeft(30);
    nextQuestion();
  };

  // Timer effect
  useEffect(() => {
    let timer;
    if (gameActive && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && gameActive) {
      endGame();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, gameActive]);

  // Get a new question
  const nextQuestion = () => {
    if (countries.length === 0) return;

    // Pick a random country for the answer
    const correctCountry = countries[Math.floor(Math.random() * countries.length)];
    
    // Create 4 options (1 correct, 3 wrong)
    let options = [correctCountry];
    while (options.length < 4) {
      const randomCountry = countries[Math.floor(Math.random() * countries.length)];
      if (!options.some(c => c.name === randomCountry.name)) {
        options.push(randomCountry);
      }
    }
    
    // Shuffle options
    options = options.sort(() => Math.random() - 0.5);
    
    setCurrentQuestion({
      correctCountry,
      options
    });
    
    setFeedback('');
    setFeedbackClass('');
  };

  // Handle user's answer
  const handleAnswer = (selectedCountry) => {
    setTotalQuestions(totalQuestions + 1);
    
    const isCorrect = selectedCountry.name === currentQuestion.correctCountry.name;
    let newHistory = [...history];
    
    if (isCorrect) {
      setScore(score + 1);
      const newStreak = streakCount + 1;
      setStreakCount(newStreak);
      if (newStreak > highestStreak) {
        setHighestStreak(newStreak);
      }
      setFeedback('Correct!');
      setFeedbackClass('text-green-500');
      
      // Add to history
      newHistory.push({
        question: getQuestionText(),
        answer: selectedCountry.name,
        correct: true
      });
    } else {
      setStreakCount(0);
      setFeedback(`Wrong! The correct answer is ${currentQuestion.correctCountry.name}`);
      setFeedbackClass('text-red-500');
      
      // Add to history
      newHistory.push({
        question: getQuestionText(),
        answer: selectedCountry.name,
        correct: false,
        correctAnswer: currentQuestion.correctCountry.name
      });
    }
    
    setHistory(newHistory);
    
    // Wait a moment before showing the next question
    setTimeout(() => {
      nextQuestion();
    }, 1500);
  };

  // End the game
  const endGame = () => {
    setGameActive(false);
    setFeedback(`Game Over! Final Score: ${score}/${totalQuestions}`);
    setFeedbackClass('text-blue-500 font-bold');
  };

  // Get the question text based on current game mode
  const getQuestionText = () => {
    if (!currentQuestion) return "";
    
    switch (gameMode) {
      case 'country':
        return `Find the country: ${currentQuestion.correctCountry.name}`;
      case 'capital':
        return `Which country has the capital: ${currentQuestion.correctCountry.capital}`;
      case 'flag':
        return `Identify the country with this flag code: ${currentQuestion.correctCountry.code}`;
      default:
        return "";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-blue-600 flex items-center justify-center">
          <Globe className="mr-2" size={36} /> GeoQuest
        </h1>
        <p className="text-lg text-gray-600">Test your geography knowledge!</p>
      </header>

      {/* Game controls */}
      <div className="mb-6 w-full max-w-2xl">
        {!gameActive ? (
          <div className="text-center">
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2">Select Game Mode:</h2>
              <div className="flex justify-center gap-2">
                <button 
                  onClick={() => setGameMode('country')} 
                  className={`px-4 py-2 rounded ${gameMode === 'country' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                  Country Names
                </button>
                <button 
                  onClick={() => setGameMode('capital')} 
                  className={`px-4 py-2 rounded ${gameMode === 'capital' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                  Capitals
                </button>
                <button 
                  onClick={() => setGameMode('flag')} 
                  className={`px-4 py-2 rounded ${gameMode === 'flag' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                  Country Codes
                </button>
              </div>
            </div>
            <button 
              onClick={startGame} 
              className="bg-green-500 text-white px-6 py-3 rounded-lg font-bold text-lg hover:bg-green-600 transition"
            >
              Start Game
            </button>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-md">
            {/* Game info */}
            <div className="flex justify-between items-center mb-4">
              <div>
                <span className="font-semibold">Score: {score}/{totalQuestions}</span>
              </div>
              <div>
                <span className="font-semibold">Streak: {streakCount}</span>
              </div>
              <div>
                <span className="font-semibold">Best Streak: {highestStreak}</span>
              </div>
              <div>
                <span className={`font-semibold ${timeLeft <= 10 ? 'text-red-500' : ''}`}>Time: {timeLeft}s</span>
              </div>
            </div>

            {/* Current Question */}
            <div className="mb-4 text-center">
              <h2 className="text-xl font-bold mb-2">{getQuestionText()}</h2>
              {gameMode === 'flag' && currentQuestion && (
                <div className="text-4xl mb-4">
                  {/* In a real app, we'd display an actual flag image here */}
                  <div className="bg-gray-200 rounded p-2 inline-block">
                    {currentQuestion.correctCountry.code}
                  </div>
                </div>
              )}
              {feedback && <p className={`text-lg ${feedbackClass}`}>{feedback}</p>}
            </div>

            {/* World Map (simplified) */}
            <div className="mb-6 bg-blue-100 p-4 rounded-lg text-center">
              <p className="text-blue-800 mb-2">World Map Visualization</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {currentQuestion && currentQuestion.options.map((country, idx) => (
                  <button
                    key={idx}
                    className="bg-white border border-gray-300 rounded-lg p-3 hover:bg-blue-50 transition"
                    onClick={() => handleAnswer(country)}
                  >
                    <div className="font-bold">{country.name}</div>
                    <div className="text-sm text-gray-600">{country.continent}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Game Controls */}
            <div className="text-center">
              <button 
                onClick={endGame} 
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
              >
                End Game
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Game History & Stats */}
      {!gameActive && totalQuestions > 0 && (
        <div className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-md mt-6">
          <h2 className="text-xl font-bold mb-2">Game Stats</h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <div className="text-sm text-gray-600">Score</div>
              <div className="text-2xl font-bold">{score}/{totalQuestions}</div>
              <div className="text-sm text-gray-600">
                {totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0}%
              </div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <div className="text-sm text-gray-600">Highest Streak</div>
              <div className="text-2xl font-bold">{highestStreak}</div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <div className="text-sm text-gray-600">Game Mode</div>
              <div className="text-lg font-bold capitalize">{gameMode}</div>
            </div>
          </div>

          {history.length > 0 && (
            <div>
              <h3 className="font-bold mb-2">Answer History</h3>
              <div className="max-h-40 overflow-y-auto">
                {history.map((item, idx) => (
                  <div key={idx} className={`mb-1 p-2 rounded ${item.correct ? 'bg-green-50' : 'bg-red-50'}`}>
                    <p className="text-sm">{item.question}</p>
                    <p className="text-xs">
                      {item.correct 
                        ? `✓ Correct: ${item.answer}` 
                        : `✗ Wrong: ${item.answer} (Correct: ${item.correctAnswer})`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      <footer className="mt-8 text-center text-gray-500 text-sm">
        GeoQuest - Test your knowledge of countries, capitals, and flags around the world
      </footer>
    </div>
  );
}