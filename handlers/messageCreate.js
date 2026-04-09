const rpgCommands = require('../commands/rpg');
const combatCommands = require('../commands/combat');
const shopCommands = require('../commands/shop');

module.exports = async (message, players, savePlayers) => {
    if (message.author.bot) return;

    const content = message.content.toLowerCase().trim();
    const args = content.split(/\s+/);
    const userId = message.author.id;

    // Make sure player exists for most commands
    if (!players[userId] && content !== '!rpg') {
        return message.channel.send("❌ Type `!rpg` first to create your character!");
    }

    // Route commands
    if (content.startsWith('!rpg')) {
        await rpgCommands(message, args, players, savePlayers);
    } 
    else if (battles && battles[userId]) {   // We'll define battles later
        await combatCommands(message, players, savePlayers);
    }
};
