
const express = require("express");
const router = express.Router();
const {
    signup,
    login,
    googleLogin
} = require("../controllers/auth.controller");



router.post("/signup", signup);
router.post("/login", login);
router.post("/login", login);
router.post("/oauth-login", googleLogin);



module.exports = router;
