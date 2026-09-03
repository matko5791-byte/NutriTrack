const GENDERS = ["male", "female", "other"];

const ACTIVITY_LEVELS = ["sedentary", "light", "moderate", "active"];

const GOALS = ["muscle_gain", "weight_loss", "maintenance"];

const ACTIVITY_MULTIPLIERS = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725
};

const DAILY_DEFICIT = 500;
const DAILY_SURPLUS = 300;
const MIN_CALORIE_FLOOR = 1200;

const GOAL_ADJUSTMENTS = {
    muscle_gain: DAILY_SURPLUS,
    weight_loss: -DAILY_DEFICIT,
    maintenance: 0
};

function calculateBmr({ gender, weightKg, heightCm, age }) {
    const base = 10 * weightKg + 6.25 * heightCm - 5 * age;

    if (gender === "male") return base + 5;
    if (gender === "female") return base - 161;
    return base - 78;
}

function calculateTdee(bmr, activityLevel) {
    const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] ?? ACTIVITY_MULTIPLIERS.sedentary;
    return bmr * multiplier;
}

function calculateDailyCalorieGoal(tdee, goal) {
    const adjustment = GOAL_ADJUSTMENTS[goal] ?? GOAL_ADJUSTMENTS.maintenance;
    return Math.max(MIN_CALORIE_FLOOR, Math.round(tdee + adjustment));
}

module.exports = {
    GENDERS,
    ACTIVITY_LEVELS,
    GOALS,
    DAILY_DEFICIT,
    DAILY_SURPLUS,
    MIN_CALORIE_FLOOR,
    calculateBmr,
    calculateTdee,
    calculateDailyCalorieGoal
};
