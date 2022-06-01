const express = require("express");
const xmlController = require("../controllers/xmlController");
const logVerification = require("../controllers/logVerificationController");
const multer = require("multer");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { projectName } = req.body;
    cb(
      null,
      file.mimetype.split("/")[1] === "xml"
        ? `public/dataFile/xmlFile/${projectName}`
        : file.mimetype.split("/")[1] === "pdf"
        ? `public/dataFile/pdfFile/${projectName}`
        : `public/files`
    );
  },
  filename: (req, file, cb) => {
    console.log(file);
    cb(null, `${Date.now()}.${file.mimetype.split("/")[1]}`);
  }
});
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.split("/")[1] === "xml" || file.mimetype.split("/")[1] === "pdf") {
      cb(null, true);
    } else {
      cb(new Error("this file is not support"));
    }
  }
});

router.get("/getData/:projectName/:documentName", xmlController.getData);
router.get("/getListDoc/", xmlController.getListDoc);
router.put("/updateDoc/:projectName/:documentName", xmlController.updateDoc, logVerification.CheckChange);
router.post("/createData", upload.array("files", 1000), xmlController.createData);
// upload.array("files", 1000)

module.exports = router;
