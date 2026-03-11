const express = require("express");
const passport = require("passport");
const { login, logout } = require("../controllers/authController");
const router = express.Router();

router.post("/login", passport.authenticate("local", { session: false }), login);
router.get("/logout", logout);

module.exports = router;