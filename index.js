const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');
const { loadPlayers } = require('./players');

// Keep-alive server
const app = express();
app.get('/', (req, res) => res.send('✅ RPG Bot is Running 24/7'));
app.listen(process.env.PORT || 10000, () => {
    console.log('🌐 Keep-alive server running');
});

// Load data
const { players, savePlayers } = loadPlayers();   // Wait, fix this line later if needed

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

// Import handler
const handleMessage = require('./handlers/messageCreate');

// Handle messages
client.on('messageCreate', (message) => {
    handleMessage(message, players, savePlayers);
});

client.login(process.env.DISCORD_TOKEN).catch(err => {
    console.error('Login error:', err.message);
});
