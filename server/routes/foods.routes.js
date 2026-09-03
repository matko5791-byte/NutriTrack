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

function validateServingPayload({ name, grams }) {
    if (!name || typeof name !== "string" || name.trim().length < 1 || name.trim().length > 40) {
        return "Serving name must be between 1 and 40 characters long";
    }
    if (!Number.isFinite(grams) || grams <= 0 || grams > 2000) {
        return "Serving amount must be between 1 and 2000 g";
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

        const foodIds = foods.map(food => food._id);
        const servings = await db.collection("food_servings")
            .find({ foodId: { $in: foodIds }, $or: [{ userId: { $exists: false } }, { userId }] })
            .sort({ name: 1 })
            .toArray();

        const servingsByFood = new Map();
        for (const serving of servings) {
            const key = serving.foodId.toString();
            const list = servingsByFood.get(key) ?? [];
            list.push({
                _id: serving._id,
                name: serving.name,
                grams: serving.grams,
                isCustom: !!serving.userId
            });
            servingsByFood.set(key, list);
        }

        const foodsWithServings = foods.map(food => ({
            ...food,
            servings: servingsByFood.get(food._id.toString()) ?? []
        }));

        res.send({ foods: foodsWithServings });
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

router.post("/:foodId/servings", requireAuth, async (req, res) => {
    try {
        if (!ObjectId.isValid(req.params.foodId)) {
            return res.status(400).send({ message: "Invalid food id" });
        }

        const payload = { name: req.body.name, grams: Number(req.body.grams) };
        const validationError = validateServingPayload(payload);
        if (validationError) {
            return res.status(400).send({ message: validationError });
        }

        const db = getDb();
        const userId = new ObjectId(req.user.id);
        const foodId = new ObjectId(req.params.foodId);

        const food = await db.collection("foods").findOne({
            _id: foodId,
            $or: [{ userId: { $exists: false } }, { userId }]
        });
        if (!food) {
            return res.status(404).send({ message: "Food not found" });
        }

        const serving = {
            foodId,
            userId,
            name: payload.name.trim(),
            grams: payload.grams,
            createdAt: new Date()
        };

        const result = await db.collection("food_servings").insertOne(serving);

        res.status(201).send({
            message: "Serving added",
            serving: { _id: result.insertedId, name: serving.name, grams: serving.grams, isCustom: true }
        });
    } catch (e) {
        console.error(e);
        res.status(500).send({ message: "Something went wrong adding the serving" });
    }
});

router.delete("/:foodId/servings/:servingId", requireAuth, async (req, res) => {
    try {
        if (!ObjectId.isValid(req.params.foodId) || !ObjectId.isValid(req.params.servingId)) {
            return res.status(400).send({ message: "Invalid id" });
        }

        const db = getDb();
        const userId = new ObjectId(req.user.id);

        const result = await db.collection("food_servings").deleteOne({
            _id: new ObjectId(req.params.servingId),
            foodId: new ObjectId(req.params.foodId),
            userId
        });

        if (result.deletedCount === 0) {
            return res.status(404).send({ message: "Serving not found" });
        }

        res.send({ message: "Serving removed" });
    } catch (e) {
        console.error(e);
        res.status(500).send({ message: "Something went wrong removing the serving" });
    }
});

module.exports = router;

