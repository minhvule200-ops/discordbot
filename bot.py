import discord
from discord.ext import commands
import random
import json
import os

intents = discord.Intents.default()
intents.message_content = True
bot = commands.Bot(command_prefix="!", intents=intents)

# ====================== CLASS DATA ======================
CLASSES = {
    "1": {
        "name": "Chuyên Văn",
        "desc": "ATK+ HP-- MP+",
        "atk": 5,
        "hp": -10,
        "mp": 10
    },
    "2": {
        "name": "Chuyên Toán",
        "desc": "ATK-- HP++ MP",
        "atk": -5,
        "hp": 20,
        "mp": 0
    },
    "3": {
        "name": "Chuyên Anh",   # Bạn ghi nhầm "Chuyên Văn", mình đổi thành Chuyên Anh cho cân bằng
        "desc": "ATK HP MP (Cân bằng)",
        "atk": 0,
        "hp": 0,
        "mp": 0
    }
}

# ====================== PLAYER CLASS ======================
class Player:
    def __init__(self, name, class_id):
        cls = CLASSES[class_id]
        self.name = name
        self.class_id = class_id
        self.class_name = cls["name"]
        
        self.hp = 100 + cls["hp"]
        self.max_hp = self.hp
        self.atk = 15 + cls["atk"]
        self.mp = 50 + cls["mp"]
        self.crt = 0
        self.agi = 0
        self.level = 1
        self.exp = 0
        self.gold = 50
        self.inventory = ["Thuốc hồi máu nhỏ", "Kiếm gỗ"]
        self.location = "Rừng Cổ"

    def to_dict(self):
        return self.__dict__

    @classmethod
    def from_dict(cls, data):
        p = cls(data["name"], data["class_id"])
        p.__dict__.update(data)
        return p

# ====================== DATA ======================
players = {}  # user_id: Player

def save_players():
    with open("players.json", "w", encoding="utf-8") as f:
        json.dump({str(k): v.to_dict() for k, v in players.items()}, f, ensure_ascii=False, indent=2)

def load_players():
    global players
    if os.path.exists("players.json"):
        with open("players.json", "r", encoding="utf-8") as f:
            data = json.load(f)
            players = {int(k): Player.from_dict(v) for k, v in data.items()}

# ====================== COMMANDS ======================
@bot.event
async def on_ready():
    print(f"Bot đã sẵn sàng! {bot.user}")
    load_players()

@bot.command(name="rpg")
async def rpg(ctx, action=None, arg=None):
    user_id = ctx.author.id
    action = action.lower() if action else None

    # ====================== TẠO NHÂN VẬT ======================
    if action == "start":
        if user_id in players:
            await ctx.send("✅ Bạn đã có nhân vật rồi! Dùng `!rpg info` để xem.")
            return
        
        embed = discord.Embed(title="🎮 Chọn Class Nhân Vật", 
                            description="Hãy chọn class bằng lệnh:\n`!rpg class 1` | `!rpg class 2` | `!rpg class 3`",
                            color=0x00ff00)
        for k, v in CLASSES.items():
            embed.add_field(name=f"Class {k}: {v['name']}", 
                          value=v['desc'], inline=False)
        await ctx.send(embed=embed)
        return

    # ====================== XEM CLASS ======================
    if action == "class" and arg is None:
        embed = discord.Embed(title="📋 Danh sách Class", color=0x00ffff)
        for k, v in CLASSES.items():
            embed.add_field(name=f"Class {k}: {v['name']}", 
                          value=v['desc'], inline=False)
        embed.set_footer(text="Dùng !rpg class 1 / 2 / 3 để chọn")
        await ctx.send(embed=embed)
        return

    # ====================== CHỌN CLASS & TẠO NHÂN VẬT ======================
    if action == "class" and arg in ["1", "2", "3"]:
        if user_id in players:
            await ctx.send("Bạn đã chọn class rồi!")
            return
        
        name = ctx.author.display_name
        players[user_id] = Player(name, arg)
        save_players()
        
        p = players[user_id]
        embed = discord.Embed(title=f"✅ Nhân vật đã tạo thành công!", color=0x00ff00)
        embed.add_field(name="Tên", value=p.name, inline=False)
        embed.add_field(name="Class", value=f"{p.class_name} (Class {arg})", inline=False)
        embed.add_field(name="HP", value=f"{p.hp}/{p.max_hp}", inline=True)
        embed.add_field(name="ATK", value=p.atk, inline=True)
        embed.add_field(name="MP", value=p.mp, inline=True)
        embed.add_field(name="CRT", value=f"{p.crt} ({p.crt//2}% Crit)", inline=True)
        embed.add_field(name="AGI", value=f"{p.agi} ({p.agi//2}% Dodge)", inline=True)
        await ctx.send(embed=embed)
        return

    if user_id not in players:
        await ctx.send("❌ Bạn chưa có nhân vật! Dùng lệnh:\n`!rpg start`")
        return

    p = players[user_id]

    # ====================== XEM INFO ======================
    if action == "info":
        embed = discord.Embed(title=f"🛡️ {p.name} - {p.class_name}", color=0x00ff00)
        embed.add_field(name="Level", value=p.level, inline=True)
        embed.add_field(name="HP", value=f"{p.hp}/{p.max_hp}", inline=True)
        embed.add_field(name="ATK", value=p.atk, inline=True)
        embed.add_field(name="MP", value=p.mp, inline=True)
        embed.add_field(name="CRT", value=f"{p.crt} ({p.crt//2}% Crit)", inline=True)
        embed.add_field(name="AGI", value=f"{p.agi} ({p.agi//2}% Dodge)", inline=True)
        embed.add_field(name="EXP", value=p.exp, inline=True)
        embed.add_field(name="Gold", value=f"{p.gold} 💰", inline=True)
        embed.add_field(name="Vị trí", value=p.location, inline=False)
        embed.add_field(name="Inventory", value=", ".join(p.inventory) if p.inventory else "Trống", inline=False)
        await ctx.send(embed=embed)

    # ====================== KHÁM PHÁ (Combat) ======================
    elif action == "khám" or action == "explore":
        # ... (mình sẽ viết combat sau nếu bạn muốn)
        await ctx.send("🔍 Tính năng khám phá đang được phát triển. Sẽ cập nhật sớm!")
    
    else:
        await ctx.send("**Lệnh RPG khả dụng:**\n"
                       "`!rpg start` - Tạo nhân vật\n"
                       "`!rpg class` - Xem danh sách class\n"
                       "`!rpg class 1/2/3` - Chọn class\n"
                       "`!rpg info` - Xem thông tin nhân vật")

# ====================== CHẠY BOT ======================
if __name__ == "__main__":
    TOKEN = os.getenv("DISCORD_TOKEN")  # Dùng cho Render.com
    if not TOKEN:
        TOKEN = "YOUR_TOKEN_HERE"   # Dùng tạm khi test local
    bot.run(TOKEN)
