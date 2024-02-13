const express = require("express");
const router = express.Router({caseSensitive:true,strict:true});
const loginController = require("../controllers/LoginController");


router.route("/").post(loginController.Login);

router.route("/status").post(loginController.status);

router.route("/logout").post(loginController.logout);

module.exports = router;
