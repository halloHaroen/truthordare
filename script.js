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
    const buttonsDiv = document.getElementById('buttons');

    let players = [];
    let currentPlayerIndex = 0;
    let questionsPerPlayer;
    let theme;
    let questions = [];
    let usedQuestions = {};
    let gameData = {};

    // Add additional player input
    addPlayerButton.addEventListener('click', () => {
        const newPlayerIndex = additionalPlayerInputs.children.length + 3;
        if (newPlayerIndex > 6) {
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
            if (input.value.trim() !== '') {
                players.push(input.value.trim());
            }
        })

        if (players.length < 2) {
            return alert("Please enter at least two players to start.");
        }

        theme = document.getElementById('theme').value;
        questionsPerPlayer = parseInt(document.getElementById('questionsPerPlayer').value);

         // Initialize game data
        gameData = {};
        players.forEach(player => {
             gameData[player] = {
                  truths: 0,
                 dares: 0,
                 passes: 0,
                usedQuestions: []
              };
         });

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
     function startNewTurn() {
         currentPlayerDisplay.textContent = `Current Player: ${players[currentPlayerIndex]}`;
         truthButton.style.display = 'inline-block';
         dareButton.style.display = 'inline-block';
         passButton.style.display = 'none';
        currentQuestionDisplay.textContent = "Select Truth or Dare";
        nextPlayerButton.style.display = 'none';
        buttonsDiv.style.display = 'inline-block';
        nextPlayerButton.textContent = 'Next Player'; // Reset Next Player text
    }


   // Check if player has reached the question limit
    function checkPlayerQuestionLimit(){
       const currentPlayerName = players[currentPlayerIndex];
       const playerQuestionCount = gameData[currentPlayerName].truths + gameData[currentPlayerName].dares + gameData[currentPlayerName].passes;
        if(playerQuestionCount >= questionsPerPlayer){
           currentQuestionDisplay.textContent = "You've reached your question limit!";
            truthButton.style.display = 'none';
            dareButton.style.display = 'none';
            passButton.style.display = 'none';
          nextPlayerButton.style.display = 'inline-block';
          return true
      }
       return false
    }

    // Truth logic
    truthButton.addEventListener('click', () => {
         if(checkPlayerQuestionLimit()){
             return;
         }
       showTruthOrDare('truths');
       truthButton.style.display = 'none';
        dareButton.style.display = 'none';
        passButton.style.display = 'inline-block';
       nextPlayerButton.style.display = 'inline-block';
    });

    // Dare logic
    dareButton.addEventListener('click', () => {
        if(checkPlayerQuestionLimit()){
             return;
        }
        showTruthOrDare('dares');
        truthButton.style.display = 'none';
        dareButton.style.display = 'none';
        passButton.style.display = 'inline-block';
       nextPlayerButton.style.display = 'inline-block';
   });

    // Pass Logic
    passButton.addEventListener('click', () => {
          if(checkPlayerQuestionLimit()){
              return;
          }
         showPassAction();
          truthButton.style.display = 'none';
        dareButton.style.display = 'none';
       passButton.style.display = 'none';
        nextPlayerButton.style.display = 'inline-block';
   });

    // Next player Logic
    nextPlayerButton.addEventListener('click', () => {
        if (checkPlayerQuestionLimit()) {
            currentPlayerIndex++; // Move to the next player only if the current player has finished
        }

        if(currentPlayerIndex >= players.length){
            currentPlayerIndex = 0;
        }

      if (isGameOver()) {
          showGameSummary();
          return;
       }


      startNewTurn();

    });

    // Check if game is over
     function isGameOver(){
         for(const player in gameData){
               const data = gameData[player]
               if(data.truths + data.dares + data.passes < questionsPerPlayer){
                return false;
            }
         }
         return true;
      }

    // Show the action (truth or dare)
    function showTruthOrDare(type) {
         const currentPlayerName = players[currentPlayerIndex];
        const items = questions[type];
       let availableQuestions = items.filter((item, index) => !gameData[currentPlayerName].usedQuestions.includes(`${type}-${index}`));

       if (availableQuestions.length === 0) {
            currentQuestionDisplay.textContent = `There are no more ${type} for this game`;
            return;
        }
        const randomIndex = Math.floor(Math.random() * availableQuestions.length);
        const randomItem = availableQuestions[randomIndex];
         const questionIndex = items.indexOf(randomItem);
         let text = randomItem.text;

        if (randomItem.target === "player") {
            const otherPlayers = players.filter((_, index) => index !== currentPlayerIndex);
             if(otherPlayers.length > 0){
                 const targetPlayer = otherPlayers[Math.floor(Math.random() * otherPlayers.length)];
                 text = text.replace("{{player}}", targetPlayer);
             }else{
                 text = "No other players are available"
             }
        }
      currentQuestionDisplay.textContent = text;
      gameData[currentPlayerName].usedQuestions.push(`${type}-${questionIndex}`);
       if (type === 'truths') {
         gameData[currentPlayerName].truths++;
        } else if (type === 'dares') {
          gameData[currentPlayerName].dares++;
       }

    }

    // Show pass action
    function showPassAction() {
        const currentPlayerName = players[currentPlayerIndex];
         if (theme === 'general') {
            const passes = questions.passes;
            const randomIndex = Math.floor(Math.random() * passes.length);
            currentQuestionDisplay.textContent = `Pass action: ${passes[randomIndex]}`;
        } else if (theme === 'outdoor') {
            currentQuestionDisplay.textContent = `Pass action: ${questions.passes} (for outdoor theme)`;
        }
        gameData[currentPlayerName].passes++;
     }

      function showGameSummary() {
          gameArea.innerHTML = `<h2>Game Over</h2>`;
          const table = document.createElement('table');
          table.innerHTML = `
              <thead>
                  <tr>
                      <th>Player</th>
                      <th>Truths</th>
                      <th>Dares</th>
                      <th>Passes</th>
                      <th>Total</th>
                  </tr>
              </thead>
              <tbody></tbody>
          `;

          const tbody = table.querySelector('tbody');
          for (const player in gameData) {
             const data = gameData[player];
             const row = document.createElement('tr');
              row.innerHTML = `
                  <td>${player}</td>
                  <td>${data.truths}</td>
                  <td>${data.dares}</td>
                  <td>${data.passes}</td>
                  <td>${data.truths + data.dares + data.passes}</td>
               `;
             tbody.appendChild(row);
         }

          gameArea.appendChild(table);
     }

});