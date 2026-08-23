const express = require("express");
const { ObjectId } = require("mongodb");

const { getDb } = require("../db");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

function validateFoodPayload({ name, caloriesPer100g, proteinPer100g, carbsPer100g, fatPer100g, saltPer100g }) {
    if (!name || typeof name !== "string" || name.trim().length < 2) {
        return "Name must be at least 2 characters long";
    }
    if (!Number.isFinite(caloriesPer100g) || caloriesPer100g < 0 || caloriesPer100g > 900) {
        return "Calories per 100g must be between 0 and 900";
    }
    if (!Number.isFinite(proteinPer100g) || proteinPer100g < 0 || proteinPer100g > 100) {
        return "Protein per 100g must be between 0 and 100";
    }
    if (!Number.isFinite(carbsPer100g) || carbsPer100g < 0 || carbsPer100g > 100) {
        return "Carbs per 100g must be between 0 and 100";
    }
    if (!Number.isFinite(fatPer100g) || fatPer100g < 0 || fatPer100g > 100) {
        return "Fat per 100g must be between 0 and 100";
    }
    if (!Number.isFinite(saltPer100g) || saltPer100g < 0 || saltPer100g > 100) {
        return "Salt per 100g must be between 0 and 100";
    }
    return null;
}

router.get("/", requireAuth, async (req, res) => {
    try {
        const db = getDb();
        const userId = new ObjectId(req.user.id);

        const foods = await db.collection("foods")
            .find({ $or: [{ userId: { $exists: false } }, { userId }] })
            .sort({ name: 1 })
            .toArray();

        res.send({ foods });
    } catch (e) {
        console.error(e);
        res.status(500).send({ message: "Something went wrong fetching foods" });
    }
});

router.post("/", requireAuth, async (req, res) => {
    try {
        const payload = {
            name: req.body.name,
            caloriesPer100g: Number(req.body.caloriesPer100g),
            proteinPer100g: Number(req.body.proteinPer100g),
            carbsPer100g: Number(req.body.carbsPer100g),
            fatPer100g: Number(req.body.fatPer100g),
            saltPer100g: Number(req.body.saltPer100g)
        };

        const validationError = validateFoodPayload(payload);
        if (validationError) {
            return res.status(400).send({ message: validationError });
        }

        const food = {
            name: payload.name.trim(),
            caloriesPer100g: payload.caloriesPer100g,
            proteinPer100g: payload.proteinPer100g,
            carbsPer100g: payload.carbsPer100g,
            fatPer100g: payload.fatPer100g,
            saltPer100g: payload.saltPer100g,
            userId: new ObjectId(req.user.id)
        };

        const db = getDb();
        const result = await db.collection("foods").insertOne(food);

        res.status(201).send({ message: "Food created", food: { ...food, _id: result.insertedId } });
    } catch (e) {
        console.error(e);
        res.status(500).send({ message: "Something went wrong creating the food" });
    }
});

module.exports = router;

