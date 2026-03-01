const express = require("express");
const { registerUser, verification, login, logout, forgotPassword, verifyOTP, passwordChange } = require("../controllers/user.controller");
const { isAuthenticated } = require("../middleware/isAuthenticated");
const { validateUser, validschema } = require("../validator/user.validate");
const router = express.Router();

router.post("/register" , validateUser(validschema), registerUser);
router.post("/verify" , verification);
router.post("/login" , login);
router.post("/logout" , isAuthenticated, logout);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp/:email", verifyOTP);
router.post("/password-change/:email", passwordChange);

module.exports = router ;