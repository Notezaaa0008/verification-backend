const express = require("express");
const kmpController = require("../controllers/kmpController");

const router = express.Router();

router.get("/getLog", kmpController.getLog);

module.exports = router;
