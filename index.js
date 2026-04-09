const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// Keep-alive
app.get('/', (req, res) => {
    res.send('✅ RPG Bot is Running 24/7');
});

app.listen(PORT, () => {
    console.log(`🌐 Web server running on port ${PORT}`);
});

// Data file
const DATA_FILE = path.join(__dirname, 'players.json');
let players = {};

function loadPlayers() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            players = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8') || '{}');
            console.log(`✅ Loaded ${Object.keys(players).length} players`);
        }
    } catch (e) {
        console.error('Load error:', e);
        players = {};
    }
}

function savePlayers() {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(players, null, 2));
    } catch (e) {
        console.error('Save error:', e);
    }
}

loadPlayers();

// Bot setup
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

client.once('ready', () => {
    console.log(`🤖 RPG Bot online as ${client.user.tag}`);
});

// Command Handler
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const content = message.content.toLowerCase().trim();
    const userId = message.author.id;
    const args = content.split(/\s+/);   // Split for "!rpg class 1"

    // ====================== !rpg ======================
    if (content === '!rpg start') {
        if (!players[userId]) {
            players[userId] = {
                username: message.author.username,
                class: null,
                level: 1,
                xp: 0,
                gold: 50,
                atk: 10,      // Default
                hp: 100,      // Default
                mp: 50,       // Default
                health: 100,  // Current health
                createdAt: new Date().toISOString(),
                lastPlayed: new Date().toISOString()
            };
            savePlayers();

        }
        if (players[userId]) {
            return message.channel.send(`Your adventure has already begin!`)
            await message.channel.send(`🎉 **Welcome to the RPG World, ${message.author}!**\n\n` +
                `Your character has been created!\n` +
                `Type \`!rpg class\` to choose your class.`);
        } else {
            await message.channel.send(`Welcome back, ${message.author}! ⚔️`);
        }
        return;
    }

    // ====================== Class Selection: !rpg class {number} ======================
    if (args[0] === '!rpg' && args[1] === 'class' && args[2]) {
        const choice = args[2];

        if (!players[userId]) {
            return message.channel.send("❌ You don't have a character! Type `!rpg start` first.");
        }

        if (players[userId].class) {
            return message.channel.send(`❌ You already made your choice of **${players[userId].class}**!`);
        }

        let chosenClass = '';
        let atkBonus = 0, hpBonus = 0, mpBonus = 0;

        if (choice === '1') {
            chosenClass = 'Chuyên Văn';
            atkBonus = 10;   // ++ = +10 (2 × 5)
            hpBonus = -10;   // -  = -10
            mpBonus = 10;    // +  = +10
        } 
        else if (choice === '2') {
            chosenClass = 'Chuyên Toán';
            atkBonus = 5;    // + = +5
            hpBonus = 20;    // ++ = +20 (2 × 10)
            mpBonus = -10;   // - = -10
        } 
        else if (choice === '3') {
            chosenClass = 'Chuyên Anh';
            atkBonus = 5;    // +
            hpBonus = 10;    // +
            mpBonus = 0;     // (no change)
        } 
        else {
            return message.channel.send("❌ Invalid choice! Please use `!rpg class 1`, `!rpg class 2`, or `!rpg class 3`.");
        }

        // Apply bonuses
        players[userId].class = chosenClass;
        players[userId].atk += atkBonus;
        players[userId].hp += hpBonus;
        players[userId].mp += mpBonus;
        players[userId].health = players[userId].hp;   // Set current health to max

        savePlayers();

        await message.channel.send(`✅ **Class Selected Successfully!**\n\n` +
            `🏷️ **Class:** ${chosenClass}\n` +
            `⚔️ **ATK:** ${players[userId].atk}\n` +
            `❤️ **HP:** ${players[userId].hp}\n` +
            `📖 **MP:** ${players[userId].mp}\n\n` +
            `Type \`!status\` to check your full profile.`);
        return;
    }
    
    // ====================== !status ======================
    if (content === '!rpg profile') {
        const p = players[userId];
        if (!p) {
            return message.channel.send("❌ You don't have a character yet! Type `!rpg start` to begin your journey.");
        }

        const classText = p.class ? p.class : "Not chosen yet";

        await message.channel.send(
            `**${message.author.username}'s Profile**\n\n` +
            `📜 **Class:** ${classText}\n` +
            `⭐ **Level:** ${p.level}  |  **XP:** ${p.xp}\n` +
            `🪙 **Gold:** ${p.gold}\n` +
            `❤️ **Health:** ${p.health}/${p.hp}\n` +
            `⚔️ **ATK:** ${p.atk}   |   📖 **MP:** ${p.mp}`
        );
    }
});

client.login(process.env.DISCORD_TOKEN);
