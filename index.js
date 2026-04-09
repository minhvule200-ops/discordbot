const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// Keep-alive
app.get('/', (req, res) => res.send('✅ RPG Bot is Running 24/7'));
app.listen(PORT, () => console.log(`🌐 Web server running on port ${PORT}`));

// ====================== PLAYER DATA ======================
const DATA_FILE = path.join(__dirname, 'players.json');
let players = {};
let battles = {}; // Store active battles: userId -> battle data

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
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.once('ready', () => {
    console.log(`🤖 RPG Bot online as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
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
            savePlayers();
            return message.channel.send(`🎉 **Welcome, ${message.author}!** Type \`!rpg class\` to choose your class.`);
        }
        return message.channel.send("❌ Type `!rpg` first to create your character!");
    }

    const p = players[userId];

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

    // !status
    if (content === '!rpg profile') {
        const classText = p.class || "Not chosen";
        await message.channel.send(
            `**${p.username}'s Profile**\n\n` +
            `📜 Class: ${classText} | Level: ${p.level} |  XP: ${p.xp}\n` +
            `❤️ Health: ${p.health}/${p.hp} | 🪙 VND: ${p.gold}\n` +
            `⚔️ ATK: ${p.atk} | 📖 MP: ${p.mp} | 🛡️ DEF: ${p.def}\n` +
            `🏃 AGI: ${p.agi} | 🎯 CRT: ${p.crt} | 🍀 Lucky: ${p.lucky}%\n` +
            `🔨 Weapon: ${p.weapon || "None"} | 🛡️ Armor: ${p.armor || "None"}`
        );
        return;
    }

        // ====================== SHOP SYSTEM ======================
    if (content === '!rpg shop') {
        await message.channel.send(
            `🛒 **RPG Shop** (Currency: VND)\n\n` +
            `Items you can buy:\n` +
            `1️⃣ HP Potion — 10 VND (Restore 50 HP)\n` +
            `2️⃣ Lucky Potion — 15 VND (+10% Lucky for 2 fights)\n` +
            `3️⃣ Speed Potion — 15 VND (+20 AGI for 2 fights)\n` +
            `4️⃣ EXP Potion — 15 VND (+20% EXP for 5 fights)\n\n` +
            `Items you can sell:\n` +
            `• Cánh gián — 20 VND\n` +
            `• Lông vũ — 15 VND\n` +
            `• Chân nhện — 10 VND\n` +
            `• Tơ đậm đặc — 40 VND\n\n` +
            `How to use:\n` +
            `Buy: !rpg buy 1   (or 2, 3, 4)\n` +
            `Sell: !rpg sell Cánh gián\n\n` +
            `Your current VND: ${p.gold}`
        );
        return;
    }

    // Buy items
    if (args[0] === '!rpg' && args[1] === 'buy') {
        const choice = parseInt(args[2]);

        if (!choice || choice < 1 || choice > 4) {
            return message.channel.send("❌ Invalid item! Use !rpg buy 1, !rpg buy 2, etc.");
        }

        if (choice === 1) { // HP Potion
            if (p.gold < 10) return message.channel.send("❌ Not enough VND!");
            p.gold -= 10;
            const heal = Math.min(50, p.hp - p.health);
            p.health += heal;
            await message.channel.send(`✅ Bought HP Potion! Restored ${heal} HP. Current HP: ${p.health}/${p.hp}`);
        } 
        else if (choice === 2) { // Lucky Potion
            if (p.gold < 15) return message.channel.send("❌ Not enough VND!");
            p.gold -= 15;
            p.lucky += 10;
            await message.channel.send(`✅ Bought Lucky Potion! Lucky +10% for next 2 fights.`);
        } 
        else if (choice === 3) { // Speed Potion
            if (p.gold < 15) return message.channel.send("❌ Not enough VND!");
            p.gold -= 15;
            p.agi += 20;
            await message.channel.send(`✅ Bought Speed Potion! AGI +20 for next 2 fights.`);
        } 
        else if (choice === 4) { // EXP Potion
            if (p.gold < 15) return message.channel.send("❌ Not enough VND!");
            p.gold -= 15;
            p.bonusExp += 20;
            await message.channel.send(`✅ Bought EXP Potion! +20% EXP for next 5 fights.`);
        }

        savePlayers();
        return;
    }

    // Simple Sell (for drop items)
    if (args[0] === '!rpg' && args[1] === 'sell') {
        const itemName = args.slice(2).join(' ').trim().toLowerCase();

        const sellPrices = {
            "cánh gián": 20,
            "lông vũ": 15,
            "chân nhện": 10,
            "tơ đậm đặc": 40
        };

        const price = sellPrices[itemName];

        if (!price) {
            return message.channel.send("❌ This item cannot be sold or doesn't exist.");
        }

        p.gold += price;
        await message.channel.send(`✅ Sold ${itemName} for ${price} VND!`);
        savePlayers();
        return;
    }
    
      // ====================== COMBAT SYSTEM (Improved with HP display) ======================
    if (battles[userId]) {
        const battle = battles[userId];
        const mob = battle.mob;
        const p = players[userId];

        // Player's turn
        if (battle.turn === 'player') {

            let damage = 0;
            let actionText = "";

            if (content === '!rpg 1') { // Basic Attack
                damage = Math.max(1, p.atk - Math.floor(mob.atk * 0.2));
                mob.currentHp -= damage;
                actionText = `⚔️ You attacked for **${damage}** damage!`;
            } 
            else if (content === '!rpg 2') { // Skill (simple version)
                if (p.mp < 20) {
                    return message.channel.send("❌ Not enough MP!");
                }
                p.mp -= 20;
                damage = Math.floor(p.atk * 1.3); // Skill does 30% more damage
                mob.currentHp -= damage;
                actionText = `🔥 You used Skill and dealt **${damage}** damage!`;
            } 
            else {
                return message.channel.send("❌ Invalid action! Use `!rpg 1` (Attack) or `!rpg 2` (Skill)");
            }

            // Show attack result + current mob HP
            await message.channel.send(
                `${actionText}\n` +
                `**${mob.name}** HP: ${Math.max(0, mob.currentHp)} / ${mob.maxHp}`
            );

            // Check if mob is defeated
            if (mob.currentHp <= 0) {
                const expGain = Math.floor(mob.exp * (1 + p.bonusExp / 100));
                p.xp += expGain;

                await message.channel.send(`🎉 **Victory!** You gained **${expGain}** EXP.`);

                // Simple drop (you can improve later)
                if (mob.drop && mob.drop.length > 0) {
                    await message.channel.send(`🎁 Dropped: **${mob.drop[0].name}**`);
                }

                delete battles[userId];
                savePlayers();
                return;
            }

            // Mob's turn
            battle.turn = 'mob';
            const mobDamage = Math.max(1, mob.atk - Math.floor(p.def / 2));
            p.health = Math.max(0, p.health - mobDamage);

            await message.channel.send(
                `💥 **${mob.name}** attacked you for **${mobDamage}** damage!\n` +
                `Your HP: **${p.health} / ${p.hp}**`
            );

            // Check if player died
            if (p.health <= 0) {
                await message.channel.send("💀 **You have been defeated!** Your HP has been reset to 50.");
                p.health = 50;
                delete battles[userId];
            } else {
                battle.turn = 'player';
                await message.channel.send(`\nYour turn again! Use \`!rpg 1\` or \`!rpg 2\``);
            }

            savePlayers();
            return;
        }
    }

    // Basic help
    if (content === '!rpg help') {
        await message.channel.send(
            `**RPG Commands**\n` +
            `!rpg → Create character\n` +
            `!rpg class → Choose class\n` +
            `!rpg adv → Start adventure / fight\n` +
            `!status → View profile\n` +
            `!rpg 1 / !rpg 2 → Combat actions`
        );
    }
});

client.login(process.env.DISCORD_TOKEN);
