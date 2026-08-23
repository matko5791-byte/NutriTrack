const express = require("express");
const { ObjectId } = require("mongodb");

const { getDb } = require("../db");
const { requireAuth } = require("../middleware/auth.middleware");
const { calculateBmr, calculateTdee, calculateDailyCalorieGoal } = require("../utils/calories");

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
    try {
        const db = getDb();
        const entries = await db.collection("weight_entries")
            .find({ userId: new ObjectId(req.user.id) })
            .sort({ date: 1 })
            .toArray();

        res.send({ entries });
    } catch (e) {
        console.error(e);
        res.status(500).send({ message: "Something went wrong fetching weight history" });
    }
});

router.post("/", requireAuth, async (req, res) => {
    try {
        const weightKg = Number(req.body.weightKg);

        if (!Number.isFinite(weightKg) || weightKg < 30 || weightKg > 300) {
            return res.status(400).send({ message: "Weight must be between 30 and 300 kg" });
        }

        const db = getDb();
        const userId = new ObjectId(req.user.id);

        const user = await db.collection("users").findOne({ _id: userId });

        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        if (!user.profile) {
            return res.status(400).send({ message: "Complete your profile before logging weight" });
        }

        const entry = {
            userId,
            weightKg,
            date: new Date(),
            createdAt: new Date()
        };

        await db.collection("weight_entries").insertOne(entry);

        const { gender, heightCm, age, activityLevel } = user.profile;
        const bmr = calculateBmr({ gender, weightKg, heightCm, age });
        const tdee = calculateTdee(bmr, activityLevel);
        const dailyCalorieGoal = calculateDailyCalorieGoal(tdee);

        const profile = {
            ...user.profile,
            weightKg,
            bmr: Math.round(bmr),
            tdee: Math.round(tdee),
            dailyCalorieGoal,
            updatedAt: new Date()
        };

        await db.collection("users").updateOne(
            { _id: userId },
            { $set: { profile } }
        );

        res.status(201).send({ message: "Weight logged", entry, profile });
    } catch (e) {
        console.error(e);
        res.status(500).send({ message: "Something went wrong logging weight" });
    }
});

module.exports = router;
