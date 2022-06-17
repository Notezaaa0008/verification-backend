const express = require("express");
const xmlController = require("../controllers/xmlController");
const logVerification = require("../controllers/logVerificationController");

const router = express.Router();

router.get("/getData/:projectName/:documentName", xmlController.getData);
router.get("/getListDoc/", xmlController.getListDoc);
router.put("/updateDoc/:projectName/:documentName", xmlController.updateDoc, logVerification.CheckChange);

module.exports = router;
