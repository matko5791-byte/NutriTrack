const { MongoClient } = require("mongodb");

const foodsSeed = require("./data/foods.seed");
const servingsSeed = require("./data/servings.seed");

const url = process.env.MONGO_URL;
const dbName = process.env.DB_NAME;

let db = null;

async function connectToDb() {
    if (db) return db;

    const client = new MongoClient(url);

    try {
        await client.connect();
        console.log("Successfully connected to MongoDB");
    } catch (e) {
        console.error("Failed to connect to MongoDB", e);
        throw e;
    }

    db = client.db(dbName);
    await seedFoods(db);
    await seedServings(db);
    return db;
}

async function seedFoods(db) {
    const foods = db.collection("foods");
    const count = await foods.countDocuments();

    if (count === 0) {
        await foods.insertMany(foodsSeed);
        console.log(`Seeded foods collection with ${foodsSeed.length} default items`);
    }
}

async function seedServings(db) {
    const servings = db.collection("food_servings");
    const count = await servings.countDocuments({ userId: { $exists: false } });
    if (count > 0) return;

    const foods = db.collection("foods");
    const docs = [];

    for (const entry of servingsSeed) {
        const food = await foods.findOne({ name: entry.foodName, userId: { $exists: false } });
        if (!food) continue;

        for (const serving of entry.servings) {
            docs.push({ foodId: food._id, name: serving.name, grams: serving.grams, createdAt: new Date() });
        }
    }

    if (docs.length > 0) {
        await servings.insertMany(docs);
        console.log(`Seeded food_servings collection with ${docs.length} default servings`);
    }
}

function getDb() {
    if (!db) {
        throw new Error("Database not initialized. Call connectToDb() first.");
    }
    return db;
}

module.exports = { connectToDb, getDb };
