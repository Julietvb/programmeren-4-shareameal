const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authController = require('../controllers/authentication.controller')


router.get("/", (req, res) => {
    res.status(200).json({
      status: 200,
      result: "Welcome to Juliet's share a meal server",
    });
  });

//UC-201 Add a user
router.post("/api/user", userController.validateUser, userController.addUser);

//UC-202 Get all users
router.get("/api/user", authController.validate, userController.getAllUsers);

//UC-203 Request personal user profile
router.get("/api/user/profile", authController.validate, userController.getUserProfile);

//UC-204 Get info of specific user 
router.get("/api/user/:userId", authController.validate, userController.getUserById);

//UC-205 Update a user
router.put("/api/user/:id", authController.validate, userController.userExists, userController.validateUserUpdate, userController.updateUser);

//UC-206 Delete a user
router.delete("/api/user/:userId", authController.validate, userController.userExists, userController.deleteUser);

module.exports = router;