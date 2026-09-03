const express = require("express");
const { ObjectId } = require("mongodb");

const { getDb } = require("../db");
const { requireAuth } = require("../middleware/auth.middleware");
const { GENDERS, ACTIVITY_LEVELS, GOALS, calculateBmr, calculateTdee, calculateDailyCalorieGoal } = require("../utils/calories");

const router = express.Router();

function validateProfilePayload({ name, gender, age, heightCm, weightKg, activityLevel, goal }) {
    if (!name || typeof name !== "string" || name.trim().length < 2) {
        return "Name must be at least 2 characters long";
    }
    if (!GENDERS.includes(gender)) {
        return `Gender must be one of: ${GENDERS.join(", ")}`;
    }
    if (!Number.isFinite(age) || age < 10 || age > 100) {
        return "Age must be between 10 and 100";
    }
    if (!Number.isFinite(heightCm) || heightCm < 100 || heightCm > 250) {
        return "Height must be between 100 and 250 cm";
    }
    if (!Number.isFinite(weightKg) || weightKg < 30 || weightKg > 300) {
        return "Weight must be between 30 and 300 kg";
    }
    if (!ACTIVITY_LEVELS.includes(activityLevel)) {
        return `Activity level must be one of: ${ACTIVITY_LEVELS.join(", ")}`;
    }
    if (!GOALS.includes(goal)) {
        return `Goal must be one of: ${GOALS.join(", ")}`;
    }
    return null;
}

router.get("/me", requireAuth, async (req, res) => {
    try {
        const db = getDb();
        const user = await db.collection("users").findOne(
            { _id: new ObjectId(req.user.id) },
            { projection: { password: 0 } }
        );

        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        res.send({ profile: user.profile ?? null });
    } catch (e) {
        console.error(e);
        res.status(500).send({ message: "Something went wrong fetching the profile" });
    }
});

router.put("/me", requireAuth, async (req, res) => {
    try {
        const payload = {
            ...req.body,
            age: Number(req.body.age),
            heightCm: Number(req.body.heightCm),
            weightKg: Number(req.body.weightKg)
        };

        const validationError = validateProfilePayload(payload);
        if (validationError) {
            return res.status(400).send({ message: validationError });
        }

        const { name, gender, age, heightCm, weightKg, activityLevel, goal } = payload;

        const db = getDb();
        const userId = new ObjectId(req.user.id);

        const existingUser = await db.collection("users").findOne(
            { _id: userId },
            { projection: { profile: 1 } }
        );

        if (!existingUser) {
            return res.status(404).send({ message: "User not found" });
        }

        const isFirstTimeSetup = !existingUser.profile;

        const bmr = calculateBmr({ gender, weightKg, heightCm, age });
        const tdee = calculateTdee(bmr, activityLevel);
        const dailyCalorieGoal = calculateDailyCalorieGoal(tdee, goal);

        const profile = {
            name: name.trim(),
            gender,
            age,
            heightCm,
            weightKg,
            activityLevel,
            goal,
            bmr: Math.round(bmr),
            tdee: Math.round(tdee),
            dailyCalorieGoal,
            updatedAt: new Date()
        };

        await db.collection("users").updateOne(
            { _id: userId },
            { $set: { profile } }
        );

        if (isFirstTimeSetup) {
            await db.collection("weight_entries").insertOne({
                userId,
                weightKg,
                date: new Date(),
                createdAt: new Date()
            });
        }

        res.send({ message: "Profile saved", profile });
    } catch (e) {
        console.error(e);
        res.status(500).send({ message: "Something went wrong saving the profile" });
    }
});

router.delete("/me", requireAuth, async (req, res) => {
    try {
        const db = getDb();
        const userId = new ObjectId(req.user.id);

        await db.collection("users").updateOne(
            { _id: userId },
            { $unset: { profile: "" } }
        );

        res.send({ message: "Profile deleted" });
    } catch (e) {
        console.error(e);
        res.status(500).send({ message: "Something went wrong deleting the profile" });
    }
});

module.exports = router;
