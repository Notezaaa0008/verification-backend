const express = require("express");
const logSearchController = require("../controllers/logSearchController");

const router = express.Router();

router.post("/createLogSearch", logSearchController.createLogSearch);
router.get("/getLogSearch", logSearchController.getLogSearch);

module.exports = router;
