const express = require("express");
const multer = require("../multer");
const easyOcrController = require("../controllers/easyOcrController");

const router = express.Router();

router.post("/uploadFile", multer.upload.array("files", 2000));
router.post("/create", easyOcrController.createLog);
router.get("/getLog/:params", easyOcrController.getLog);

module.exports = router;
