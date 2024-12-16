import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

// Question banks
const QUESTIONS = {
  General: {
    truths: [
      "What's the most embarrassing thing you've ever done?",
      "What's a secret you've never told anyone?",
      "What's your biggest fear?",
      "Who in this room do you have a crush on?",
      "What's the biggest lie you've ever told?",
      "What's the most bizarre dream you've had?",
      "What's something you've done that you hope no one ever finds out about?",
      "What's the most awkward date you've been on?",
      "What's a talent you wish you had?",
      "If you could swap lives with anyone for a day, who would it be?"
    ],
    dares: [
      "Take a selfie with the weirdest facial expression possible",
      "Do your best impression of another player",
      "Call a friend and sing them a love song",
      "Post something embarrassing on social media",
      "Dance without music for 30 seconds",
      "Let another player draw on your face with a marker",
      "Do a TikTok dance in front of everyone",
      "Eat a spoonful of something spicy",
      "Send a ridiculous text to your last contact",
      "Wear your clothes backwards for the next round"
    ]
  },
  Outdoor: {
    truths: [
      "What's the wildest outdoor adventure you've ever been on?",
      "Have you ever gotten lost while hiking?",
      "What's your favorite outdoor activity?",
      "Tell a story about a camping trip gone wrong",
      "What's the most beautiful natural place you've ever visited?",
      "Have you ever been camping?",
      "What outdoor skill do you wish you had?",
      "What's the longest hike you've ever done?",
      "Do you prefer beaches or mountains?",
      "What's an outdoor activity that scares you?"
    ],
    dares: [
      "Do 10 jumping jacks",
      "Walk like a penguin for a full minute",
      "Find and collect 3 pieces of trash",
      "Do a cartwheel",
      "Climb a tree (safely)",
      "Run around the block",
      "Do a bear crawl for 10 meters",
      "Spin around 5 times and try to walk in a straight line",
      "Do push-ups outside",
      "Make an animal sound and imitate its movement"
    ]
  }
};

const TruthOrDareApp = () => {
  const [screen, setScreen] = useState('setup');
  const [players, setPlayers] = useState(['', '', '', '']);
  const [theme, setTheme] = useState('General');
  const [questionsPerPlayer, setQuestionsPerPlayer] = useState(10);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentQuestionType, setCurrentQuestionType] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [questionCounts, setQuestionCounts] = useState({});

  const updatePlayerName = (index, name) => {
    const newPlayers = [...players];
    newPlayers[index] = name;
    setPlayers(newPlayers);
  };

  const startGame = () => {
    // Validate at least 2 players
    const activePlayers = players.filter(player => player.trim() !== '');
    if (activePlayers.length < 2) {
      alert('Please enter at least 2 player names');
      return;
    }

    // Initialize question counts
    const initialQuestionCounts = {};
    activePlayers.forEach(player => {
      initialQuestionCounts[player] = 0;
    });
    setQuestionCounts(initialQuestionCounts);
    setCurrentPlayerIndex(0);
    setScreen('game');
  };

  const selectQuestionType = (type) => {
    const currentPlayer = players[currentPlayerIndex];
    setCurrentQuestionType(type);

    // Select random question based on type and theme
    const questions = QUESTIONS[theme][type.toLowerCase()];
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    setCurrentQuestion(randomQuestion);
  };

  const nextTurn = () => {
    const activePlayers = players.filter(player => player.trim() !== '');
    
    // Increment question count for current player
    const newQuestionCounts = {...questionCounts};
    newQuestionCounts[players[currentPlayerIndex]]++;

    // Check if all players have completed their questions
    const allPlayersCompleted = activePlayers.every(
      player => newQuestionCounts[player] >= questionsPerPlayer
    );

    if (allPlayersCompleted) {
      // Game over, return to setup
      setScreen('setup');
      return;
    }

    // Move to next player
    let nextIndex = (currentPlayerIndex + 1) % activePlayers.length;
    
    // Skip players who have completed their questions
    while (newQuestionCounts[activePlayers[nextIndex]] >= questionsPerPlayer) {
      nextIndex = (nextIndex + 1) % activePlayers.length;
    }

    setCurrentPlayerIndex(nextIndex);
    setCurrentQuestionType(null);
    setQuestionCounts(newQuestionCounts);
  };

  const renderSetupScreen = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Truth or Dare Setup</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {players.map((player, index) => (
            <Input
              key={index}
              placeholder={`Player ${index + 1} Name`}
              value={player}
              onChange={(e) => updatePlayerName(index, e.target.value)}
              className="w-full"
            />
          ))}

          <Select value={theme} onValueChange={setTheme}>
            <SelectTrigger>
              <SelectValue placeholder="Select Game Theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="General">General</SelectItem>
              <SelectItem value="Outdoor">Outdoor</SelectItem>
            </SelectContent>
          </Select>

          <Select 
            value={questionsPerPlayer.toString()} 
            onValueChange={(val) => setQuestionsPerPlayer(Number(val))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Questions per Player" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 Questions</SelectItem>
              <SelectItem value="20">20 Questions</SelectItem>
              <SelectItem value="40">40 Questions</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={startGame} className="w-full">Start Game</Button>
      </CardFooter>
    </Card>
  );

  const renderGameScreen = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Truth or Dare</CardTitle>
        <p className="text-muted-foreground">
          {players[currentPlayerIndex]}'s Turn
        </p>
      </CardHeader>
      <CardContent>
        {!currentQuestionType ? (
          <div className="flex space-x-4">
            <Button 
              variant="outline" 
              className="w-1/2"
              onClick={() => selectQuestionType('Truth')}
            >
              Truth
            </Button>
            <Button 
              variant="outline" 
              className="w-1/2"
              onClick={() => selectQuestionType('Dare')}
            >
              Dare
            </Button>
          </div>
        ) : (
          <div>
            <p className="mb-4 text-center font-semibold">{currentQuestionType}:</p>
            <p className="text-center">{currentQuestion}</p>
            <div className="mt-4 flex space-x-4">
              <Button 
                variant="outline"
                className="w-1/2"
                onClick={() => setCurrentQuestionType(null)}
              >
                Pass
              </Button>
              <Button 
                className="w-1/2"
                onClick={nextTurn}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      {screen === 'setup' ? renderSetupScreen() : renderGameScreen()}
    </div>
  );
};

export default TruthOrDareApp;
