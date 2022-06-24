const express = require("express");
const xmlController = require("../controllers/xmlController");

const router = express.Router();

router.get("/getData/:projectName/:documentName", xmlController.getData);
router.get("/getEditData/:projectName/:documentName", xmlController.getEditData);
router.get("/getListDoc/", xmlController.getListDoc);
router.put("/updateDoc/:projectName/:documentName", xmlController.updateDoc);

module.exports = router;
