// app.js
const version = "1.0";
const maxPlayers = 10;

const themeManager = new ThemeManager();
const gameManager = new GameManager(themeManager);

// --- UI Elements ---
const setupScreen = document.getElementById("setupScreen");
const choiceScreen = document.getElementById("choiceScreen");
const questionScreen = document.getElementById("questionScreen");
const passActionScreen = document.getElementById("passActionScreen");
const resultsScreen = document.getElementById("resultsScreen");
const playersContainer = document.getElementById("playersContainer");
const addPlayerButton = document.getElementById("addPlayerButton");
const startGameButton = document.getElementById("startGameButton");
const themeSelect = document.getElementById("themeSelect");
const questionLimitSelect = document.getElementById("questionLimit");
const truthButton = document.getElementById("truthButton");
const dareButton = document.getElementById("dareButton");
const questionText = document.getElementById("questionText");
const passButton = document.getElementById("passButton");
const nextPlayerButton = document.getElementById("nextPlayerButton");
const passActionText = document.getElementById("passActionText");
const resultsTableBody = document.getElementById("resultsTableBody");
const currentPlayerSpan = document.getElementById("currentPlayer");
const versionNumberSpan = document.getElementById("versionNumber");
const choicePlayerName = document.getElementById("choicePlayerName");
const currentQuestionNumber = document.getElementById("currentQuestionNumber");



// --- Event Listeners ---
addPlayerButton.addEventListener("click", addPlayerInput);
startGameButton.addEventListener("click", startGame);
truthButton.addEventListener("click", showQuestion);
dareButton.addEventListener("click", showQuestion);
passButton.addEventListener("click", showPassAction);
nextPlayerButton.addEventListener("click", nextPlayer);



// --- Functions ---
function addPlayerInput() {
    const playerInputs = playersContainer.querySelectorAll(".playerName");
    if (playerInputs.length < maxPlayers) {
        const newInput = document.createElement("input");
        newInput.type = "text";
        newInput.className = "playerName"; 
        newInput.placeholder = `Player ${playerInputs.length + 1}`;
        newInput.required = true;
        newInput.minlength = "3";
        newInput.maxlength = "20";
        playersContainer.appendChild(newInput);
    }
}

async function startGame() {
    const playerNames = Array.from(document.querySelectorAll('.playerName'))
        .map(input => input.value.trim())
        .filter(name => name !== '');

    if (playerNames.length < 2) {
        alert("Please enter at least two player names.");
        return;
    }

    const themeName = themeSelect.value;
    const questionLimit = parseInt(questionLimitSelect.value, 10);

    const themeLoaded = await themeManager.loadTheme(themeName);
    if (!themeLoaded) {
        alert(`Error loading ${themeName} theme.`);
        return;
    }

    gameManager.setupGame(playerNames, themeName, questionLimit);
    showChoiceScreen();
}

function showChoiceScreen() {
    setupScreen.style.display = "none";
    choiceScreen.style.display = "block";
    const currentPlayer = gameManager.getCurrentPlayer();
    const questionCount = gameManager.askedQuestions[currentPlayer].truths.length + gameManager.askedQuestions[currentPlayer].dares.length;

    choicePlayerName.textContent = `${currentPlayer}: `;
    currentQuestionNumber.textContent = `${questionCount + 1}/${gameManager.questionLimit}`;
}

function showQuestion(event) {
    const questionType = event.target.id === "truthButton" ? "truths" : "dares";
    const question = gameManager.getNextQuestion(questionType);

    questionText.textContent = question;
    choiceScreen.style.display = "none";
    questionScreen.style.display = "block";
}

function showPassAction() {
    passActionText.textContent = gameManager.getPassAction();
    passActionScreen.style.display = "block";
    questionScreen.classList.add("grayed-out"); 
}

function nextPlayer() {
    passActionScreen.style.display = "none"; 
    questionScreen.classList.remove("grayed-out"); 
    questionScreen.style.display = "none";

    gameManager.nextPlayer();
    if (gameManager.isGameOver()) {
        showResultsScreen();
    } else {
        showChoiceScreen();
    }
}

function showResultsScreen() {
    resultsTableBody.innerHTML = "";

    gameManager.players.forEach(player => {
        const playerStats = gameManager.askedQuestions[player];
        const truths = playerStats.truths.length;
        const dares = playerStats.dares.length;
        const passes = gameManager.questionLimit - truths - dares;

        const row = resultsTableBody.insertRow();
        const playerCell = row.insertCell();
        const truthsCell = row.insertCell();
        const daresCell = row.insertCell();
        const passesCell = row.insertCell();

        playerCell.textContent = player;
        truthsCell.textContent = truths;
        daresCell.textContent = dares;
        passesCell.textContent = passes;
    });

    questionScreen.style.display = "none";
    choiceScreen.style.display = "none"; 
    resultsScreen.style.display = "block";
}


// --- Initialization ---
versionNumberSpan.textContent = version;


themeManager.loadTheme("general").then(() => { // Make sure these match your theme JSON file names
    themeManager.loadTheme("outdoor").then(() => {
        const themes = themeManager.getAvailableThemes();
        themes.forEach(theme => {
            const option = document.createElement("option");
            option.value = theme;
            option.textContent = theme;
            themeSelect.appendChild(option);
        });
    });

});
