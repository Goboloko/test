import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const url = "https://growagardenvalues.com/stock/get_stock_data.php";
const webhookUrl = process.env.WEBHOOK_URL;
const eggWebhookUrl = process.env.EGG_WEBHOOK_URL;
const gearWebhookUrl = process.env.GEAR_WEBHOOK_URL;

let prevState = "";
let prevGearState = "";
let prevEggState = "";


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

// Manual seed data
const gearInfo = {
    "Watering Can": { rarity: "Common", price: 50000 },
    "Trowel": { rarity: "Common", price: 100000 },
    "Recall Wrench": { rarity: "Uncommon", price: 150000 },
    "Basic Sprinkler": { rarity: "Rare", price: 25000 },
    "Advanced Sprinkler": { rarity: "Legendary", price: 50000 },
    "Godly Sprinkler": { rarity: "Mytical", price: 120000 },
    "Lightning Rod": { rarity: "Mytical", price: 1000000 },
    "Master Sprinkler": { rarity: "Divine", price: 10000000 },
    "Favorite Tool": { rarity: "Divine", price: 20000000 },
    "Harvest Tool": { rarity: "Divine", price: 30000000 },
    "Common Egg": { rarity: "Common", price: 50000 },
    "Uncommon Egg": { rarity: "UnCommon", price: 150000 },
    "Rare Egg": { rarity: "Rare", price: 600000 },
    "Legendary Egg": { rarity: "Legendary", price: 600000 },
    "Mytical Egg": { rarity: "Mytical", price: 8000000 },
    "Bug Egg": { rarity: "Rare", price: 50000000 },
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

const emojiGear = {
    "Watering Can": "<:WateringCan:1377796751028781086>",
    "Trowel": "<:Trowel:1377796747270688839>",
    "Recall Wrench": "<:RecallWrench:1377796744338870413>",
    "Basic Sprinkler": "<:BasicSprinkler:1377796741297995886>",
    "Advanced Sprinkler": "<:AdvancedSprinkler:1377796737636499506>",
    "Godly Sprinkler": "<:GodlySprinkler:1377796735430037546>",
    "Lightning Rod": "<:LightingRod:1377796733475749898>",
    "Master Sprinkler": "<:MasterSprinkler:1377796730875154432>",
    "Favorite Tool": "<:FavoriteTool:1377796727913844766>",
    "Harvest Tool": "<:HarvestTool:1377795857155358740>",
    "Common Egg": "<:CommonEgg:1377802264336666685>",
    "Uncommon Egg": "<:UncommonEgg:1377802262432448643>",
    "Rare Egg": "<:RareEgg:1377802259877859420>",
    "Legendary Egg": "<:LegendaryEgg:1377802258141548664>",
    "Mytical Egg": "<:MyticalEgg:1377802256036135003>",
    "Bug Egg": "<:BugEgg:1377802252802326569>"
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

function buildEggEmbed(data) {
    if (data.eggs.length === 0) {
        return {
            title: "🥚 ThunderZ • Grow a Garden Egg Stocks",
            color: 0xff66cc,
            fields: [{ name: "", value: "_No Eggs available_", inline: true }],
            timestamp: new Date().toISOString()
        };
    }

    const itemText = data.eggs.map(item => {
        const info = gearInfo[item.name] || { rarity: "Unknown", price: 0 };
        const emoji = emojiGear[item.name] || "❔";
        return `${emoji} ${item.name} (${info.rarity})\nQuantity: **X${item.quantity}**\nPrice: $${info.price}`;
    }).join("\n\n");

    return {
        title: "🥚 ThunderZ • Grow a Garden Egg Stocks",
        color: 0xff66cc,
        fields: [{ name: "", value: itemText, inline: false }],
        timestamp: new Date().toISOString()
    };
}

function buildGearEmbed(data) {
    if (data.gear.length === 0) {
        return {
            title: "⚙️ ThunderZ • Grow a Garden Gear Stocks",
            color: 0x00ccff,
            fields: [{ name: "", value: "_No Gear available_", inline: true }],
            timestamp: new Date().toISOString()
        };
    }

    const itemText = data.gear.map(item => {
        const info = gearInfo[item.name] || { rarity: "Unknown", price: 0 };
        const emoji = emojiGear[item.name] || "❔";
        return `${emoji} ${item.name} (${info.rarity})\nQuantity: **X${item.quantity}**\nPrice: $${info.price}`;
    }).join("\n\n");

    return {
        title: "⚙️ ThunderZ • Grow a Garden Gear Stocks",
        color: 0x00ccff,
        fields: [{ name: "", value: itemText, inline: false }],
        timestamp: new Date().toISOString()
    };
}

async function sendEggWebhook(data) {
    const embed = buildEggEmbed(data);
    await fetch(eggWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ embeds: [embed] })
    });
}

async function sendGearWebhook(data) {
    const embed = buildGearEmbed(data);
    await fetch(gearWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ embeds: [embed] })
    });
}


async function sendEggGearWebhook(data) {
    const embed = buildEggGearEmbed(data);
    await fetch(eggGearWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ embeds: [embed] })
    });
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

        // Check seed
        const seedMessage = buildMessage(data);
        if (seedMessage !== prevState) {
            prevState = seedMessage;
            await sendWebhook(data);
            console.log(`[${new Date().toLocaleTimeString()}] Seed webhook sent.`);
        } else {
            console.log(`[${new Date().toLocaleTimeString()}] Seed: No change.`);
        }

        // Check gear
        const gearMessage = data.gear.map(item => `${item.name}|${item.quantity}|${item.price}`).join(";");
        if (gearMessage !== prevGearState) {
            prevGearState = gearMessage;
            await sendGearWebhook(data);
            console.log(`[${new Date().toLocaleTimeString()}] Gear webhook sent.`);
        } else {
            console.log(`[${new Date().toLocaleTimeString()}] Gear: No change.`);
        }

        // Check egg
        const eggMessage = data.eggs.map(item => `${item.name}|${item.quantity}|${item.price}`).join(";");
        if (eggMessage !== prevEggState) {
            prevEggState = eggMessage;
            await sendEggWebhook(data);
            console.log(`[${new Date().toLocaleTimeString()}] Egg webhook sent.`);
        } else {
            console.log(`[${new Date().toLocaleTimeString()}] Egg: No change.`);
        }

    } catch (err) {
        console.error("Error checking stock:", err.message);
    }
}



setInterval(checkStock, 1000);
checkStock();
