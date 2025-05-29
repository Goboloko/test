import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const url = "https://growagardenvalues.com/stock/get_stock_data.php";
const webhookUrl = process.env.WEBHOOK_URL;

let prevState = "";

// Manual seed data
const seedInfo = {
    "Carrot": { rarity: "Common", price: 10 },
    "Strawberry": { rarity: "Common", price: 50 },
    "Blueberry": { rarity: "Uncommon", price: 400 },
    "Orange Tulip": { rarity: "Uncommon", price: 600 },
    "Daffodil": { rarity: "Rare", price: 1000 },
    "Tomato": { rarity: "Rare", price: 800 },
    "Corn": { rarity: "Rare", price: 1300 },
    "Bamboo": { rarity: "Legendary", price: 4000 },
    "Apple": { rarity: "Legendary", price: 3250 },
    "Watermelon": { rarity: "Legendary", price: 2500 },
    "Pumpkin": { rarity: "Legendary", price: 3000 },
    "Dragon Fruit": { rarity: "Mythical", price: 50000 },
    "Mango": { rarity: "Mythical", price: 100000 },
    "Coconut": { rarity: "Mythical", price: 6000 },
    "Cactus": { rarity: "Mythical", price: 15000 },
    "Pepper": { rarity: "Divine", price: 1000000 },
    "Mushroom": { rarity: "Divine", price: 150000 },
    "Grape": { rarity: "Divine", price: 850000 },
    "Cacao": { rarity: "Divine", price: 2500000 },
    "Beanstalk": { rarity: "Prismatic", price: 10000000 }
};

const emojiMap = {
    "Carrot": "<:Carrot:1376892104600457298>",
    "Strawberry": "<:Strawberry:1376892102327402517>",
    "Apple": "<:Apple:1376892083218026548>",
    "Tomato": "<:Tomato:1376892093510713394>",
    "Orange Tulip": "<:OrangeTulip:1376892098112000221>",
    "Blueberry": "<:Blueberry:1376892100225798185>",
    "Daffodil": "<:Daffodil:1376892095825973288>",
    "Corn": "<:Corn:1376892078554087484>",
    "Bamboo": "<:Bamboo:1376892087374581910>",
    "Watermelon": "<:Watermelon:1376892080885858477>",
    "Pumpkin": "<:Pumkin:1376892078554087484>",
    "Dragon Fruit": "<:DragonFruit:1376892076121133157>",
    "Mango": "<:Mango:1376892073487237120>",
    "Coconut": "<:Coconut:1376892071176048750>",
    "Cactus": "<:Cactus:1376892068751741009>",
    "Pepper": "<:Pepper:1376892066092679168>",
    "Mushroom": "<:Mushroom:1376892063974690816>",
    "Grape": "<:Grape:1376892061495726192>",
    "Cacao": "<:Cacao:1376889865928704141>",
    "Beanstalk": "<:Beanstalk:1376889862611009578>"
};

function buildEmbed(data) {
    const seeds = data.seeds.map(item => {
        const info = seedInfo[item.name] || { rarity: "Unknown", price: 0 };
        const emoji = emojiMap[item.name] || "🌱";
        return `${emoji} ${item.name} (${info.rarity})\nQuantity: **X${item.quantity}**\nPrice Each: $${info.price}`;
    }).join("\n\n");

    const now = Math.floor(Date.now() / 1000);
    const fiveMinLater = now + 4 * 60;

    return {
        title: "🌿 ThunderZ • Grow a Garden Stocks",
        color: 0xffff00,
        fields: [
            {
                name: "",
                value: seeds || "_No seeds available_",
                inline: true
            },
            {
                name: "[ ⌛ ] The Stock will change in",
                value: `<t:${fiveMinLater}:R>`,
                inline: false
            }
        ],
        timestamp: new Date().toISOString()
    };
}

function buildMessage(data) {
    const seedsText = data.seeds.map(item => {
        const info = seedInfo[item.name] || { rarity: "Unknown", price: 0 };
        return `° ${item.name} (${info.rarity})\nQuantity: ${item.quantity}\nPrice Each: $${info.price}`;
    }).join("\n\n");

    return seedsText;
}

async function sendWebhook(data) {
    const embed = buildEmbed(data);
    await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ embeds: [embed] })
    });
}

async function checkStock() {
    try {
        const res = await fetch(url);
        const data = await res.json();

        if (data.usingFallback) {
            console.log(`[${new Date().toLocaleTimeString()}] Skipped (using fallback = true)`);
            return;
        }

        const message = buildMessage(data);

        if (message !== prevState) {
            prevState = message;
            await sendWebhook(data);
            console.log(`[${new Date().toLocaleTimeString()}] Webhook sent.`);
        } else {
            console.log(`[${new Date().toLocaleTimeString()}] No change.`);
        }

    } catch (err) {
        console.error("Error checking stock:", err.message);
    }
}

setInterval(checkStock, 1000);
checkStock();
