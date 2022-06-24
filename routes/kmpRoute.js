const express = require("express");
const kmpController = require("../controllers/kmpController");

const router = express.Router();

router.post("/create", kmpController.createLog);
router.get("/getLog/:params", kmpController.getLog);

module.exports = router;
