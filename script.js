document.addEventListener('DOMContentLoaded', () => {
    const setupForm = document.getElementById('setup-form');
    const gameArea = document.getElementById('game-area');
    const playerInputs = document.getElementById('player-inputs');
    const additionalPlayerInputs = document.getElementById('additional-player-inputs');
    const addPlayerButton = document.getElementById('add-player-button');
    const currentPlayerDisplay = document.getElementById('current-player');
    const currentQuestionDisplay = document.getElementById('current-question');
    const truthButton = document.getElementById('truth-button');
    const dareButton = document.getElementById('dare-button');
    const passButton = document.getElementById('pass-button');
    const nextPlayerButton = document.getElementById('next-player-button');
    const startGameButton = document.getElementById('start-game-button');

    let players = [];
    let currentPlayerIndex = 0;
    let questionsPerPlayer;
    let theme;
    let questions = [];
    let currentPlayerQuestions = [];

    // Add additional player input
     addPlayerButton.addEventListener('click', () => {
      const newPlayerIndex = additionalPlayerInputs.children.length + 3;
      if(newPlayerIndex > 6){
        return alert("Maximum 6 players")
      }
      const newPlayerDiv = document.createElement('div');
       newPlayerDiv.innerHTML = `
        <label for="player${newPlayerIndex}">Player ${newPlayerIndex}:</label>
        <input type="text" id="player${newPlayerIndex}" required>`;
        additionalPlayerInputs.appendChild(newPlayerDiv);
    });

    // Start Game Logic
    startGameButton.addEventListener('click', async () => {
        players = [];
        const allPlayerInputs = playerInputs.querySelectorAll('input[type="text"]');
        allPlayerInputs.forEach(input => {
            if (input.value.trim() !== '') {
              players.push(input.value.trim());
            }
        });
        const additionalPlayerInputsElements = additionalPlayerInputs.querySelectorAll('input[type="text"]');
         additionalPlayerInputsElements.forEach(input => {
            if(input.value.trim() !== ''){
             players.push(input.value.trim());
            }
         })

        if (players.length < 2) {
           return alert("Please enter at least two players to start.");
         }

         theme = document.getElementById('theme').value;
         questionsPerPlayer = parseInt(document.getElementById('questionsPerPlayer').value);

        //Load the selected theme questions
          try {
            const response = await fetch(`data/${theme}.json`);
            if (!response.ok) {
                throw new Error(`Failed to load ${theme}.json`);
            }
            const data = await response.json();
            questions = data;
           } catch (error) {
               console.error("Error loading questions:", error);
               alert("Error loading game data. Please try again.");
             return;
           }

        // Setup Game
        setupForm.style.display = 'none';
        gameArea.style.display = 'block';
        startNewTurn();
      });

    // Start a new player's turn
     function startNewTurn(){
          currentPlayerQuestions = [];
         currentPlayerDisplay.textContent = `Current Player: ${players[currentPlayerIndex]}`;
         truthButton.disabled = false;
         dareButton.disabled = false;
         passButton.disabled = false;
         currentQuestionDisplay.textContent = "Select Truth or Dare";
         nextPlayerButton.style.display = 'none';
     }

    // Truth logic
    truthButton.addEventListener('click', () => {
        showTruthOrDare('truths');
        truthButton.disabled = true;
        dareButton.disabled = true;
        passButton.disabled = true;
        nextPlayerButton.style.display = 'inline-block';
    });

    // Dare logic
    dareButton.addEventListener('click', () => {
        showTruthOrDare('dares');
        truthButton.disabled = true;
        dareButton.disabled = true;
        passButton.disabled = true;
        nextPlayerButton.style.display = 'inline-block';
    });

    // Pass Logic
    passButton.addEventListener('click', () => {
        showPassAction();
        truthButton.disabled = true;
        dareButton.disabled = true;
         passButton.disabled = true;
         nextPlayerButton.style.display = 'inline-block';
    });

    // Next player Logic
     nextPlayerButton.addEventListener('click', () => {
          currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
         startNewTurn();
     });

    // Show the action (truth or dare)
    function showTruthOrDare(type) {
        if(currentPlayerQuestions.length >= questionsPerPlayer){
          return currentQuestionDisplay.textContent = "You've reached your question limit!";
        }
        const items = questions[type];
        if(items.length === 0){
          return currentQuestionDisplay.textContent = "There are no "+type +" in this theme";
        }
        const randomIndex = Math.floor(Math.random() * items.length);
         const randomItem = items[randomIndex];
          let text = randomItem.text;
        if (randomItem.target === "player") {
            const otherPlayers = players.filter((_, index) => index !== currentPlayerIndex);
            const targetPlayer = otherPlayers[Math.floor(Math.random() * otherPlayers.length)];
            text = text.replace("{{player}}", targetPlayer);
        }
        currentQuestionDisplay.textContent = text;
          currentPlayerQuestions.push(randomItem);
    }

     // Show pass action
    function showPassAction(){
      if(theme === 'general'){
        const passes = questions.passes;
         const randomIndex = Math.floor(Math.random() * passes.length);
        currentQuestionDisplay.textContent = `Pass action: ${passes[randomIndex]}`;
      } else if (theme === 'outdoor'){
        currentQuestionDisplay.textContent = `Pass action: ${questions.passes} (for outdoor theme)`;
      }
    }

});