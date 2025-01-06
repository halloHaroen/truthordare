// game-manager.js
class GameManager {
    constructor(themeManager) {
        this.themeManager = themeManager;
        this.players = [];
        this.currentTheme = null;
        this.questionLimit = 0;
        this.currentPlayerIndex = 0;
        this.askedQuestions = {}; 
    }

    setupGame(players, themeName, questionLimit) {
        this.players = players;
        this.currentTheme = this.themeManager.getTheme(themeName);
        this.questionLimit = questionLimit;
        this.currentPlayerIndex = 0;
        this.askedQuestions = {};
        for (const player of this.players) {
            this.askedQuestions[player] = { truths: [], dares: [] };
        }
    }

    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    getNextQuestion(type) {
        const availableQuestions = this.currentTheme[type].filter(question => !this.askedQuestions[this.getCurrentPlayer()][type].includes(question));
        if (availableQuestions.length === 0) {
            return "No more questions of this type available for this player."; // Or handle this differently
        }
        const randomIndex = Math.floor(Math.random() * availableQuestions.length);
        const question = availableQuestions[randomIndex];
        this.askedQuestions[this.getCurrentPlayer()][type].push(question);
        return question;
    }

    getPassAction() {
        const passActions = this.currentTheme.pass;
        const randomIndex = Math.floor(Math.random() * passActions.length);
        return passActions[randomIndex];
    }

    nextPlayer() {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    }


    isGameOver() {
        for (const player of this.players) {
            const playerQuestions = this.askedQuestions[player];
            if (playerQuestions.truths.length + playerQuestions.dares.length < this.questionLimit) {
                return false;
            }
        }
        return true;
    }
}