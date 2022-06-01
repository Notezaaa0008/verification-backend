require("dotenv").config();
const express = require("express");
const { sequelize } = require("./models");
const cors = require("cors");
const middleware = require("./middlewares/error");
const fs = require("fs");

const xmlRoute = require("./routes/xmlRoute");
const logVerificationRoute = require("./routes/logVerificationRoute");

const app = express();
app.use(express.json({ limit: "1gb" }));
app.use(express.urlencoded({ limit: "1gb", extended: false }));

app.use(cors());
app.use("/xml", xmlRoute);
app.use("/getPdf/:projectName/:documentName", async (req, res, next) => {
  try {
    const { projectName, documentName } = req.params;

    let pdfFiles = fs.readdirSync(`./public/dataFile/pdfFile`);
    if (!pdfFiles.includes(projectName)) {
      res.status(400).json({ message: `The ${projectName} does NOT exist` });
    } else {
      let project = fs.readdirSync(`./public/dataFile/pdfFile/${projectName}`);
      if (!project.includes(`${documentName}.pdf`)) {
        res.status(400).json({ message: `The ${documentName}.pdf does NOT exist` });
      } else {
        let pdfPath = __dirname + `/public/dataFile/pdfFile/${projectName}/${documentName}.pdf`;
        res.status(200).sendFile(pdfPath);
      }
    }
  } catch (err) {
    next(err);
  }
});
app.use("/logVerification", logVerificationRoute);

app.use((req, res, next) => {
  res
    .status(404)
    .json({ message: "Path not found in this server, please make sure that your path or method is correct." });
});

app.use(middleware);

// sequelize.sync({ force: true }).then(() => console.log('DB sync'))

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`This server is running on ${port}`));
