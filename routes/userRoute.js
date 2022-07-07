const express = require("express");
const userController = require("../controllers/userController");

const router = express.Router();

router.post("/register", userController.register);
router.post("/loginAndRegister", userController.loginAndRegister);

module.exports = router;
