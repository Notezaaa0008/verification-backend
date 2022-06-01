const express = require("express");
const logVerificationController = require("../controllers/logVerificationController");

const router = express.Router();

router.get("/getLog", logVerificationController.getLog);
router.post("/createLogVerify", logVerificationController.createLogVerify);
router.put("/cancelVerify", logVerificationController.cancelVerify);
router.delete("/deleteLog", logVerificationController.deleteLog);

module.exports = router;
