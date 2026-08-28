const { MongoClient } = require("mongodb");

const foodsSeed = require("./data/foods.seed");

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

function getDb() {
    if (!db) {
        throw new Error("Database not initialized. Call connectToDb() first.");
    }
    return db;
}

module.exports = { connectToDb, getDb };
