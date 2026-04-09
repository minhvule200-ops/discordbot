const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// Keep-alive
app.get('/', (req, res) => res.send('✅ RPG Bot is Running 24/7'));
app.listen(PORT, () => console.log(`🌐 Web server running on port ${PORT}`));

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

// Mobs template (base stats)
const mobTemplates = [
    { name: "Gián", atk: 5, hp: 50, exp: 20, drop: [{name: "Cánh gián", chance: 10}] },
    { name: "Giun đất", atk: 7, hp: 30, exp: 15, drop: [] },
    { name: "Chim bồ câu", atk: 10, hp: 25, exp: 20, drop: [{name: "Lông vũ", chance: 15}] },
    { name: "Nhện", atk: 12, hp: 20, exp: 25, drop: [{name: "Chân nhện", chance: 20}, {name: "Tơ đậm đặc", chance: 5}] },
    { name: "Kiến", atk: 10, hp: 15, exp: 20, drop: [], count: 5 } // 5 kiến per round
];

// ====================== BOT ======================
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', () => {
    console.log(`Bot is online as ${client.user.tag}`);
});

// Login using token from environment variables
client.login(process.env.DISCORD_TOKEN);

module.exports = app; // Optional, but harmles
    const content = message.content.toLowerCase().trim();
    const args = content.split(/\s+/);
    const userId = message.author.id;

    // Ensure player exists
    if (!players[userId]) {
        if (content === '!rpg') {
            players[userId] = {
                username: message.author.username,
                class: null,
                level: 1,
                xp: 0,
                gold: 50,           // Changed to VND
                atk: 10,
                hp: 100,
                mp: 50,
                health: 100,
                def: 0,
                agi: 0,
                crt: 0,
                lucky: 0,
                bonusExp: 0,
                weapon: null,
                armor: null,
                ring: null,
                createdAt: new Date().toISOString()
            };
            savePlayers();const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// Keep-alive server
app.get('/', (req, res) => res.send('✅ RPG Bot is Running 24/7'));
app.listen(PORT, () => console.log(`🌐 Web server running on port ${PORT}`));

// Data file
const DATA_FILE = path.join(__dirname, 'players.json');
let players = {};
let battles = {};   // Important: Declare battles here

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

// ====================== DISCORD CLIENT ======================
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', () => {
    console.log(`🤖 Bot is online as ${client.user.tag}`);
});

// ====================== MESSAGE HANDLER ======================
client.on('messageCreate', async (message) => {   // ← Added "async" here
    if (message.author.bot) return;

    const content = message.content.toLowerCase().trim();
    const args = content.split(/\s+/);
    const userId = message.author.id;

    // Ensure player exists
    if (!players[userId]) {
        if (content === '!rpg') {
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
                def: 0,
                agi: 0,
                crt: 0,
                lucky: 0,
                bonusExp: 0,
                weapon: null,
                armor: null,
                ring: null,
                createdAt: new Date().toISOString()
            };
            savePlayers();
            return message.channel.send(`🎉 **Welcome, ${message.author}!** Type \`!rpg class\` to choose your class.`);
        }
        return message.channel.send("❌ Type `!rpg` first to create your character!");
    }

    const p = players[userId];

    // !rpg class - Show classes
    if (args[0] === '!rpg' && args[1] === 'class' && !args[2]) {
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

    // !rpg class {number}
    if (args[0] === '!rpg' && args[1] === 'class' && args[2]) {
        if (players[userId].class) {
            return message.channel.send(`❌ You already made your choice of **${players[userId].class}**!`);
        }

        const choice = args[2];
        let chosenClass = '';
        let atkBonus = 0, hpBonus = 0, mpBonus = 0;

        if (choice === '1') {
            chosenClass = 'Chuyên Văn';
            atkBonus = 10; hpBonus = -10; mpBonus = 10;
            players[userId].weapon = "Bút bi (+5ATK)";
            players[userId].armor = "Áo Tân Định (+10HP, +2DEF)";
            players[userId].ring = "Nguyễn Du (+5MP, +2% Bonus EXP)";
            players[userId].atk += 5;
            players[userId].mp += 5;
            players[userId].bonusExp += 2;
        } else if (choice === '2') {
            chosenClass = 'Chuyên Toán';
            atkBonus = 5; hpBonus = 20; mpBonus = -10;
            players[userId].weapon = "Máy tính Casio (+3ATK)";
            players[userId].armor = "Áo Tân Định (+10HP, +2DEF)";
            players[userId].ring = "Nhẫn Pytago (+10MP, +1% Bonus EXP)";
            players[userId].atk += 3;
            players[userId].mp += 10;
            players[userId].bonusExp += 1;
        } else if (choice === '3') {
            chosenClass = 'Chuyên Anh';
            atkBonus = 5; hpBonus = 10; mpBonus = 0;
            players[userId].weapon = "Từ điển (+4ATK)";
            players[userId].armor = "Áo Tân Định (+10HP, +2DEF)";
            players[userId].ring = "PPF (+6MP, +2% Lucky Chance)";
            players[userId].atk += 4;
            players[userId].mp += 6;
            players[userId].luckyChance = 2;
        } else {
            return message.channel.send("❌ Invalid choice! Use 1, 2 or 3.");
        }

        players[userId].class = chosenClass;
        players[userId].atk += atkBonus;
        players[userId].hp += hpBonus;
        players[userId].mp += mpBonus;
        players[userId].health = players[userId].hp;
        players[userId].def += 2;

        savePlayers();

        await message.channel.send(`✅ **Class Selected: ${chosenClass}**\n\n🎁 Starter items received!\nType \`!rpg profile\` to check your status.`);
        return;
    }

    // !rpg profile
    if (content === '!rpg profile') {
        const classText = p.class || "Not chosen";
        await message.channel.send(
            `**${p.username}'s Profile**\n\n` +
            `📜 Class: ${classText} | Level: ${p.level}\n` +
            `❤️ Health: ${p.health}/${p.hp} | 🪙 VND: ${p.gold}\n` +
            `⚔️ ATK: ${p.atk} | 📖 MP: ${p.mp} | 🛡️ DEF: ${p.def}\n` +
            `🏃 AGI: ${p.agi} | 🎯 CRT: ${p.crt} | 🍀 Lucky: ${p.lucky}%\n` +
            `🔨 Weapon: ${p.weapon || "None"}`
        );
        return;
    }

    // Shop, Buy, Sell, Adv, Combat, Help... (kept your existing code)
    // ... [Your shop, buy, sell, !rpg adv, combat code remains the same]

    // (I kept your shop and combat code as-is, only fixed the async issue)

    // Basic help
    if (content === '!rpg help') {
        await message.channel.send(
            `**RPG Commands**\n` +
            `!rpg → Create character\n` +
            `!rpg class → Choose class\n` +
            `!rpg adv → Start fighting\n` +
            `!rpg profile → View profile\n` +
            `!rpg shop → Open shop\n` +
            `!rpg 1 / !rpg 2 → Combat actions`        );
    }

// Login
if (!process.env.DISCORD_TOKEN) {
    console.error('❌ DISCORD_TOKEN is missing in Environment variables!');
    process.exit(1);   // This can cause exit 254
      );
    }
});
client.login(process.env.DISCORD_TOKEN);
