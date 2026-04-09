const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'players.json');
let playersData = {};

function loadPlayers() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            playersData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8') || '{}');
            console.log(`✅ Loaded ${Object.keys(playersData).length} players`);
        }
    } catch (e) {
        console.error('❌ Load players error:', e);
        playersData = {};
    }
    return playersData;
}

function savePlayers() {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(playersData, null, 2));
    } catch (e) {
        console.error('❌ Save players error:', e);
    }
}

module.exports = { 
    players: playersData, 
    loadPlayers, 
    savePlayers 
};
