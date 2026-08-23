const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { getDb } = require("../db");
const { requireAuth, JWT_SECRET } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).send({ message: "Username, email and password are required" });
        }

        if (password.length < 6) {
            return res.status(400).send({ message: "Password must be at least 6 characters long" });
        }

        const db = getDb();
        const users = db.collection("users");

        const existing = await users.findOne({ email: email.toLowerCase() });
        if (existing) {
            return res.status(409).send({ message: "User with this email already exists" });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const result = await users.insertOne({
            username,
            email: email.toLowerCase(),
            password: passwordHash,
            createdAt: new Date()
        });

        const user = { id: result.insertedId, username, email: email.toLowerCase(), profileCompleted: false };
        const token = jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });

        res.status(201).send({ message: "Registration successful", token, user });
    } catch (e) {
        console.error(e);
        res.status(500).send({ message: "Something went wrong during registration" });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).send({ message: "Email and password are required" });
        }

        const db = getDb();
        const users = db.collection("users");

        const existingUser = await users.findOne({ email: email.toLowerCase() });
        if (!existingUser) {
            return res.status(401).send({ message: "Invalid email or password" });
        }

        const passwordMatches = await bcrypt.compare(password, existingUser.password);
        if (!passwordMatches) {
            return res.status(401).send({ message: "Invalid email or password" });
        }

        const user = { id: existingUser._id, username: existingUser.username, email: existingUser.email, profileCompleted: !!existingUser.profile, name: existingUser.profile?.name ?? null };
        const token = jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });

        res.send({ message: "Login successful", token, user });
    } catch (e) {
        console.error(e);
        res.status(500).send({ message: "Something went wrong during login" });
    }
});

router.get("/me", requireAuth, (req, res) => {
    res.send({ user: req.user });
});

module.exports = router;
