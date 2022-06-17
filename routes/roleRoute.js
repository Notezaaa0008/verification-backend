const express = require("express");
const roleController = require("../controllers/roleController");

const router = express.Router();

router.post("/create", roleController.create);

module.exports = router;
