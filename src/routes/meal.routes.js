const express = require('express');
const router = express.Router();
const mealController = require('../controllers/meal.controller');
const authController = require('../controllers/authentication.controller')


//UC-201 Add a meal
router.post("/api/meal", authController.validate, mealController.validateMeal, mealController.addMeal);

//UC-202 Update a meal
router.put("/api/meal/:id", authController.validate, mealController.mealExists, mealController.validateMeal, mealController.updateMeal);

//UC-203 Get all meals
router.get("/api/meal", mealController.getAllMeals);

//UC-204 Get info of specific meal 
router.get("/api/meal/:mealId", mealController.getMealById);

//UC-205 Delete a meal
router.delete("/api/meal/:mealId", authController.validate, mealController.mealExists, mealController.deleteMeal);

module.exports = router;