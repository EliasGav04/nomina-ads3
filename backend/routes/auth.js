const express = require("express");
const { login, logout } = require("../controllers/authController");
const { ensureAuthenticated } = require("../middleware/auth");
const router = express.Router();

router.post("/login", login);
router.get("/logout", ensureAuthenticated, logout);

module.exports = router;