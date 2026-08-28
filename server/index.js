require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { connectToDb } = require("./db");
const authRoutes = require("./routes/auth.routes");
const profileRoutes = require("./routes/profile.routes");
const weightRoutes = require("./routes/weight.routes");
const foodsRoutes = require("./routes/foods.routes");
const mealEntriesRoutes = require("./routes/mealEntries.routes");

const port = process.env.PORT;

(async () => {
    await connectToDb();

    const app = express();

    app.use(cors());
    app.use(express.json());

    app.use("/api/auth", authRoutes);
    app.use("/api/profile", profileRoutes);
    app.use("/api/weight", weightRoutes);
    app.use("/api/foods", foodsRoutes);
    app.use("/api/meal-entries", mealEntriesRoutes);

    app.listen(port, () => {
        console.log(`Server is listening at ${port}`);
    });
})();
