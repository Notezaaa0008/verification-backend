const multer = require("multer");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { projectName } = req.body;

    if (file.mimetype.split("/")[1] === "xml") {
      let dir = `public/dataFile/xmlFile/${projectName}`;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    } else if (file.mimetype.split("/")[1] === "pdf") {
      let dir = `public/dataFile/pdfFile/${projectName}`;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }

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
    cb(null, `${file.originalname}`);
  }
});

exports.upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.split("/")[1] === "xml" || file.mimetype.split("/")[1] === "pdf") {
      cb(null, true);
    } else {
      cb(new Error("this file is not support"));
    }
  }
});
