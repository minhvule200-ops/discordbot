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
                     `• Type \`!help\` to see available commands\n` +
                     `• Type \`!status\` to check your character\n` +
                     `• Type \`!quest\` to get your first quest\n\n` +
                     `Good luck, brave adventurer! ⚔️`,
            flags: [] // You can add ephemeral later if needed
        });
    }
});
