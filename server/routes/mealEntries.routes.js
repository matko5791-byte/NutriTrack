const express = require("express");
const { ObjectId } = require("mongodb");

const { getDb } = require("../db");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

function getTodayRange() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start, end };
}

function sumTotals(entries) {
    return entries.reduce((totals, entry) => ({
        calories: totals.calories + entry.calories,
        protein: totals.protein + entry.protein,
        carbs: totals.carbs + entry.carbs,
        fat: totals.fat + entry.fat,
        salt: totals.salt + entry.salt
    }), { calories: 0, protein: 0, carbs: 0, fat: 0, salt: 0 });
}

function roundTotals(totals) {
    return {
        calories: Math.round(totals.calories),
        protein: Math.round(totals.protein * 10) / 10,
        carbs: Math.round(totals.carbs * 10) / 10,
        fat: Math.round(totals.fat * 10) / 10,
        salt: Math.round(totals.salt * 100) / 100
    };
}

async function getTodaysSummary(db, userId) {
    const { start, end } = getTodayRange();

    const entries = await db.collection("meal_entries")
        .find({ userId, loggedAt: { $gte: start, $lt: end } })
        .sort({ loggedAt: 1 })
        .toArray();

    const user = await db.collection("users").findOne({ _id: userId }, { projection: { profile: 1 } });

    return {
        entries,
        totals: roundTotals(sumTotals(entries)),
        dailyCalorieGoal: user?.profile?.dailyCalorieGoal ?? null
    };
}

router.get("/", requireAuth, async (req, res) => {
    try {
        const db = getDb();
        const summary = await getTodaysSummary(db, new ObjectId(req.user.id));
        res.send(summary);
    } catch (e) {
        console.error(e);
        res.status(500).send({ message: "Something went wrong fetching today's meals" });
    }
});

router.post("/", requireAuth, async (req, res) => {
    try {
        const grams = Number(req.body.grams);
        const foodId = req.body.foodId;

        if (!foodId || !ObjectId.isValid(foodId)) {
            return res.status(400).send({ message: "A valid food must be selected" });
        }
        if (!Number.isFinite(grams) || grams <= 0 || grams > 5000) {
            return res.status(400).send({ message: "Grams must be between 1 and 5000" });
        }

        const db = getDb();
        const userId = new ObjectId(req.user.id);

        const food = await db.collection("foods").findOne({
            _id: new ObjectId(foodId),
            $or: [{ userId: { $exists: false } }, { userId }]
        });

        if (!food) {
            return res.status(404).send({ message: "Food not found" });
        }

        const ratio = grams / 100;

        await db.collection("meal_entries").insertOne({
            userId,
            foodId: food._id,
            foodName: food.name,
            grams,
            calories: food.caloriesPer100g * ratio,
            protein: food.proteinPer100g * ratio,
            carbs: food.carbsPer100g * ratio,
            fat: food.fatPer100g * ratio,
            salt: food.saltPer100g * ratio,
            loggedAt: new Date()
        });

        const summary = await getTodaysSummary(db, userId);
        res.status(201).send({ message: "Meal logged", ...summary });
    } catch (e) {
        console.error(e);
        res.status(500).send({ message: "Something went wrong logging the meal" });
    }
});

router.delete("/:id", requireAuth, async (req, res) => {
    try {
        if (!ObjectId.isValid(req.params.id)) {
            return res.status(400).send({ message: "Invalid entry id" });
        }

        const db = getDb();
        const userId = new ObjectId(req.user.id);

        await db.collection("meal_entries").deleteOne({ _id: new ObjectId(req.params.id), userId });

        const summary = await getTodaysSummary(db, userId);
        res.send({ message: "Entry removed", ...summary });
    } catch (e) {
        console.error(e);
        res.status(500).send({ message: "Something went wrong removing the entry" });
    }
});

module.exports = router;
