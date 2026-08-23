const GENDERS = ["male", "female", "other"];

const ACTIVITY_LEVELS = ["sedentary", "light", "moderate", "active"];

const ACTIVITY_MULTIPLIERS = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725
};

const DAILY_DEFICIT = 500;
const MIN_CALORIE_FLOOR = 1200;

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

function calculateDailyCalorieGoal(tdee) {
    return Math.max(MIN_CALORIE_FLOOR, Math.round(tdee - DAILY_DEFICIT));
}

module.exports = {
    GENDERS,
    ACTIVITY_LEVELS,
    DAILY_DEFICIT,
    MIN_CALORIE_FLOOR,
    calculateBmr,
    calculateTdee,
    calculateDailyCalorieGoal
};
