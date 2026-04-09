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
