// theme-manager.js
class ThemeManager {
    constructor() {
        this.themes = {};
    }

    async loadTheme(themeName) {
        try {
            const response = await fetch(`themes/${themeName}.json`);
            const data = await response.json();
            this.themes[themeName] = data;
            return true;
        } catch (error) {
            console.error(`Error loading theme ${themeName}:`, error);
            return false;
        }
    }


    getTheme(themeName) {
        return this.themes[themeName];
    }

    getAvailableThemes() {
        return Object.keys(this.themes);
    }
}