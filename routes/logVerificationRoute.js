const express = require("express");
const logVerificationController = require("../controllers/logVerificationController");

const router = express.Router();

router.get("/getLog", logVerificationController.getLog);
router.post("/createLogVerify", logVerificationController.createLogVerify);
router.put("/cancelVerify", logVerificationController.cancelVerify);
router.put("/editVerify", logVerificationController.editVerify);
router.get("/compareValue", logVerificationController.getCompareValue);

module.exports = router;
