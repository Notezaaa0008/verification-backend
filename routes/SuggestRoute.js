const express = require("express");
const suggestController = require("../controllers/suggestController");

const router = express.Router();

router.post("/create", suggestController.create);

module.exports = router;
