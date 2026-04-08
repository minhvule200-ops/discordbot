const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');

const app = express();
const PORT = process.env.PORT || 10000;

// Keep-alive for Render free tier
app.get('/', (req, res) => {
    res.send('✅ Bot is alive!');
});

app.listen(PORT, () => {
    console.log(`🌐 Server running on port ${PORT}`);
});

// Discord Client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

client.once('ready', () => {
    console.log(`🤖 Logged in as ${client.user.tag}`);
});

client.on('error', err => {
    console.error('Discord client error:', err);
});

// Login
if (!process.env.DISCORD_TOKEN) {
    console.error('❌ DISCORD_TOKEN is missing in Environment variables!');
    process.exit(1);   // This can cause exit 254
}

client.login(process.env.DISCORD_TOKEN);
// Main Command Handler
client.on('messageCreate', async (message) => {
    // Ignore messages from bots
    if (message.author.bot) return;

    // !rpg command
    if (message.content.toLowerCase() === '!rpg') {
        await message.channel.send({
            content: `🎮 **Welcome to the RPG Adventure, ${message.author}!** 🎮\n\n` +
                     `You have entered a mysterious world full of quests, monsters, and treasures!\n\n` +
                     `**Your Adventure Begins Now!**\n` +
                     `• Type \`!rpg help\` to see available commands\n` +
                     `• Type \`!rpg profile\` to check your character\n` +
                     `• Type \`!rpg adv\` to start fighting\n\n` +
                     `Good luck, brave adventurer! ⚔️`,
            flags: [] // You can add ephemeral later if needed
        });
    }
});
// Path to players data file
const DATA_FILE = path.join(__dirname, 'players.json');

// Load players from JSON (or create empty)
let players = {};

function loadPlayers() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const data = fs.readFileSync(DATA_FILE, 'utf8');
            players = JSON.parse(data || '{}');
            console.log(`✅ Loaded ${Object.keys(players).length} player profiles`);
        }
    } catch (err) {
        console.error('Error loading players.json:', err);
        players = {};
    }
}

function savePlayers() {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(players, null, 2));
        console.log('💾 Player data saved');
    } catch (err) {
        console.error('Error saving players.json:', err);
    }
}

// Load data when bot starts
loadPlayers();

// Discord Bot
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

client.once('ready', () => {
    console.log(`🤖 RPG Bot is online as ${client.user.tag}`);
});

// Command Handler
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const content = message.content.toLowerCase();

    if (content === '!rpg') {
        const userId = message.author.id;

        if (!players[userId]) {
            // Create new player profile
            players[userId] = {
                username: message.author.username,
                level: 1,
                xp: 0,
                gold: 50,
                health: 100,
                createdAt: new Date().toISOString(),
                lastPlayed: new Date().toISOString()
            };

            savePlayers();   // Save immediately

            await message.channel.send({
                content: `🎉 **Welcome to the Adventure, ${message.author}!** 🎉\n\n` +
                         `Your character has been created!\n\n` +
                         `**Player Profile:**\n` +
                         `• **Level:** ${players[userId].level}\n` +
                         `• **XP:** ${players[userId].xp}\n` +
                         `• **Gold:** ${players[userId].gold} 🪙\n` +
                         `• **Health:** ${players[userId].health} ❤️\n\n` +
                         `Type \`!status\` to check your profile anytime.\n` +
                         `Type \`!help\` for more commands.\n\n` +
                         `Let the journey begin! ⚔️`
            });
        } else {
            await message.channel.send(`Welcome back, ${message.author}! Your adventure continues... ⚔️`);
        }
    }
