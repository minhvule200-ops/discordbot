const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// Keep-alive
app.get('/', (req, res) => res.send('✅ RPG Bot is Running 24/7'));
app.listen(PORT, () => console.log(`🌐 Web server running on port ${PORT}`));

// Data
const DATA_FILE = path.join(__dirname, 'players.json');
let players = {};
let battles = {};

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

// Mobs
const mobTemplates = [
    { name: "Gián", atk: 5, hp: 50, exp: 20, drop: [{name: "Cánh gián", chance: 10}] },
    { name: "Giun đất", atk: 7, hp: 30, exp: 15, drop: [] },
    { name: "Chim bồ câu", atk: 10, hp: 25, exp: 20, drop: [{name: "Lông vũ", chance: 15}] },
    { name: "Nhện", atk: 12, hp: 20, exp: 25, drop: [{name: "Chân nhện", chance: 20}, {name: "Tơ đậm đặc", chance: 5}] },
    { name: "Kiến", atk: 2, hp: 5, exp: 4, drop: [], count: 5 }
];

// Bot
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

// Main Handler
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const content = message.content.toLowerCase().trim();
    const args = content.split(/\s+/);
    const userId = message.author.id;

    // Create character
    if (!players[userId]) {
        if (content === '!rpg') {
            players[userId] = {
                username: message.author.username,
                class: null,
                level: 1,
                xp: 0,const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// Keep-alive
app.get('/', (req, res) => res.send('✅ RPG Bot is Running 24/7'));
app.listen(PORT, () => console.log(`🌐 Web server running on port ${PORT}`));

// Data
const DATA_FILE = path.join(__dirname, 'players.json');
let players = {};
let battles = {};

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

// Mobs
const mobTemplates = [
    { name: "Gián", atk: 5, hp: 50, exp: 20, drop: [{name: "Cánh gián", chance: 10}] },
    { name: "Giun đất", atk: 7, hp: 30, exp: 15, drop: [] },
    { name: "Chim bồ câu", atk: 10, hp: 25, exp: 20, drop: [{name: "Lông vũ", chance: 15}] },
    { name: "Nhện", atk: 12, hp: 20, exp: 25, drop: [{name: "Chân nhện", chance: 20}, {name: "Tơ đậm đặc", chance: 5}] },
    { name: "Kiến", atk: 2, hp: 5, exp: 4, drop: [], count: 5 }
];

// Bot
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

// Main Handler
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const content = message.content.toLowerCase().trim();
    const args = content.split(/\s+/);
    const userId = message.author.id;

    // Create character
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

    // Class
    if (args[0] === '!rpg' && args[1] === 'class') {
        if (!args[2]) {
            if (p.class) return message.channel.send(`❌ You already chose **${p.class}**!`);
            return message.channel.send(`🏛️ **Choose your Class**\n\n1️⃣ Chuyên Văn\n2️⃣ Chuyên Toán\n3️⃣ Chuyên Anh\n\nReply: !rpg class 1 / 2 / 3`);
        }
        // Simplified class choice for now
        const choice = args[2];
        if (['1','2','3'].includes(choice)) {
            p.class = choice === '1' ? 'Chuyên Văn' : choice === '2' ? 'Chuyên Toán' : 'Chuyên Anh';
            savePlayers();
            return message.channel.send(`✅ Class selected: **${p.class}**!`);
        }
    }

    // Profile
    if (content === '!rpg profile') {
        const classText = p.class || "Not chosen";
        return message.channel.send(
            `**${p.username}'s Profile**\n\n` +
            `Class: ${classText}\n` +
            `Level: ${p.level} | VND: ${p.gold}\n` +
            `HP: ${p.health}/${p.hp} | ATK: ${p.atk}`
        );
    }

    // Shop
    if (content === '!rpg shop') {
        return message.channel.send(`🛒 **Shop**\n!rpg buy 1 = HP Potion (10 VND)\n!rpg sell Cánh gián = Sell item`);
    }

    // Adventure
    if (content === '!rpg adv') {
        if (battles[userId]) return message.channel.send("⚔️ You are already in a battle!");

        const baseMob = mobTemplates[Math.floor(Math.random() * mobTemplates.length)];
        const mob = { ...baseMob, currentHp: baseMob.hp };

        battles[userId] = { mob, turn: 'player' };

        return message.channel.send(`⚔️ A wild **${mob.name}** appeared!\nHP: ${mob.currentHp}/${mob.hp}\n\nUse \`!rpg 1\` to attack`);
    }

    // Combat
    if (battles[userId] && battles[userId].turn === 'player') {
        const battle = battles[userId];
        const mob = battle.mob;

        if (content === '!rpg 1') {
            const damage = Math.max(1, p.atk - 2);
            mob.currentHp -= damage;

            await message.channel.send(`You dealt ${damage} damage! Mob HP: ${mob.currentHp}/${mob.hp}`);

            if (mob.currentHp <= 0) {
                await message.channel.send("🎉 Victory!");
                delete battles[userId];
                savePlayers();
                return;
            }

            const mobDmg = Math.max(1, mob.atk - 3);
            p.health -= mobDmg;
            await message.channel.send(`Mob attacked for ${mobDmg} damage! Your HP: ${p.health}/${p.hp}`);
        }
    }

    // Help
    if (content === '!rpg help') {
        return message.channel.send("Commands: !rpg, !rpg class, !rpg profile, !rpg adv, !rpg 1");
    }
});

// Login
client.login(process.env.DISCORD_TOKEN).catch(err => {
    console.error('Login error:', err.message);
});
