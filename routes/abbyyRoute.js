const express = require("express");
const abbyyController = require("../controllers/abbyyController");

const router = express.Router();

router.post("/createStatus", abbyyController.create);
router.put("/updateStatus", abbyyController.update);

module.exports = router;
