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

// ====================== Command Handler ======================
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const content = message.content.toLowerCase().trim();
    const args = content.split(/\s+/);
    const userId = message.author.id;

    // !rpg - Create character
    if (content === '!rpg') {
        if (!players[userId]) {
            players[userId] = {
                username: message.author.username,
                class: null,
                level: 1,
                xp: 0,
                gold: 50,
                atk: 10,
                hp: 100,
                mp: 50,
                health: 100,
                def: 0,           // New: Defense
                weapon: null,
                armor: null,
                ring: null,
                bonusExp: 0,      // % bonus EXP
                luckyChance: 0,   // % lucky chance
                createdAt: new Date().toISOString(),
                lastPlayed: new Date().toISOString()
            };
            savePlayers();

            await message.channel.send(`🎉 **Welcome to the RPG World, ${message.author}!**\n\nYour character is ready!\nType \`!rpg class\` to choose your class.`);
        } else {
            await message.channel.send(`Welcome back, ${message.author}! ⚔️`);
        }
        return;
    }

    // !rpg class - Show classes
    if (args[0] === '!rpg' && args[1] === 'class' && !args[2]) {
        if (!players[userId]) return message.channel.send("❌ Type `!rpg` first to create your character.");

        if (players[userId].class) {
            return message.channel.send(`❌ You already made your choice of **${players[userId].class}**!`);
        }

        const classList = `🏛️ **Choose your Class**\n\n` +
            `1️⃣ **Chuyên Văn** → (ATK++, HP-, MP+)\n` +
            `2️⃣ **Chuyên Toán** → (ATK+, HP++, MP-)\n` +
            `3️⃣ **Chuyên Anh** → (ATK+, HP+, MP)\n\n` +
            `Reply with: \`!rpg class 1\` | \`!rpg class 2\` | \`!rpg class 3\``;

        await message.channel.send(classList);
        return;
    }

    // !rpg class {number} - Choose class + Give starter items
    if (args[0] === '!rpg' && args[1] === 'class' && args[2]) {
        if (!players[userId]) return message.channel.send("❌ Type `!rpg` first!");
        if (players[userId].class) {
            return message.channel.send(`❌ You already made your choice of **${players[userId].class}**!`);
        }

        const choice = args[2];
        let chosenClass = '';
        let atkBonus = 0, hpBonus = 0, mpBonus = 0;

        if (choice === '1') {                    // Chuyên Văn
            chosenClass = 'Chuyên Văn';
            atkBonus = 10;
            hpBonus = -10;
            mpBonus = 10;

            players[userId].weapon = "Bút bi (+5ATK)";
            players[userId].armor = "Áo Tân Định (+10HP, +2DEF)";
            players[userId].ring = "Nguyễn Du (+5MP, +2% Bonus EXP)";

            players[userId].atk += 5;      // Weapon
            players[userId].mp += 5;       // Ring
            players[userId].bonusExp += 2;

        } else if (choice === '2') {             // Chuyên Toán
            chosenClass = 'Chuyên Toán';
            atkBonus = 5;
            hpBonus = 20;
            mpBonus = -10;

            players[userId].weapon = "Máy tính Casio (+3ATK)";
            players[userId].armor = "Áo Tân Định (+10HP, +2DEF)";
            players[userId].ring = "Nhẫn Pytago (+10MP, +1% Bonus EXP)";

            players[userId].atk += 3;      // Weapon
            players[userId].mp += 10;      // Ring
            players[userId].bonusExp += 1;

        } else if (choice === '3') {             // Chuyên Anh
            chosenClass = 'Chuyên Anh';
            atkBonus = 5;
            hpBonus = 10;
            mpBonus = 0;

            players[userId].weapon = "Từ điển (+4ATK)";
            players[userId].armor = "Áo Tân Định (+10HP, +2DEF)";
            players[userId].ring = "PPF (+6MP, +2% Lucky Chance)";

            players[userId].atk += 4;      // Weapon
            players[userId].mp += 6;       // Ring
            players[userId].luckyChance = 2;

        } else {
            return message.channel.send("❌ Invalid choice! Use `!rpg class 1`, `!rpg class 2`, or `!rpg class 3`.");
        }

        // Apply base class bonuses
        players[userId].class = chosenClass;
        players[userId].atk += atkBonus;
        players[userId].hp += hpBonus;
        players[userId].mp += mpBonus;
        players[userId].health = players[userId].hp;   // Set current health
        players[userId].def += 2;                      // Armor DEF

        savePlayers();

        await message.channel.send(`✅ **Class Selected: ${chosenClass}**\n\n` +
            `🎁 **You received starter items:**\n` +
            `⚔️ Weapon: **${players[userId].weapon}**\n` +
            `🛡️ Armor: **${players[userId].armor}**\n` +
            `💍 Ring: **${players[userId].ring}**\n\n` +
            `Type \`!status\` to see your full character!`);
        return;
    }

    // !status command
    if (content === '!status') {
        const p = players[userId];
        if (!p) {
            return message.channel.send("❌ You don't have a character yet! Type `!rpg` to start.");
        }

        const classText = p.class ? p.class : "Not chosen yet";

        await message.channel.send(
            `**${message.author.username}'s Profile**\n\n` +
            `📜 **Class:** ${classText}\n` +
            `⭐ **Level:** ${p.level}  |  **XP:** ${p.xp}\n` +
            `🪙 **Gold:** ${p.gold}\n` +
            `❤️ **Health:** ${p.health}/${p.hp}\n` +
            `⚔️ **ATK:** ${p.atk}\n` +
            `🛡️ **DEF:** ${p.def}\n` +
            `📖 **MP:** ${p.mp}\n` +
            `🔨 **Weapon:** ${p.weapon || "None"}\n` +
            `🛡️ **Armor:** ${p.armor || "None"}\n` +
            `💍 **Ring:** ${p.ring || "None"}\n` +
            `📈 **Bonus EXP:** ${p.bonusExp || 0}%\n` +
            `🍀 **Lucky Chance:** ${p.luckyChance || 0}%`
        );
    }
});

client.login(process.env.DISCORD_TOKEN);

// Login
client.login(process.env.DISCORD_TOKEN).catch(err => {
    console.error('Login error:', err.message);
});
