const express = require("express");
const multer = require("../multer");
const easyOcrController = require("../controllers/easyOcrController");

const router = express.Router();

router.post("/uploadFile", multer.upload.array("files", 2000));
router.get("/getLog", easyOcrController.getLog);

module.exports = router;
