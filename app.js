require("dotenv").config();
const express = require("express");
const { sequelize } = require("./models");
const cors = require("cors");
const middleware = require("./middlewares/error");
const fs = require("fs");
const http = require("http");
const io = require("socket.io");
const cron = require("node-cron");
const multer = require("./multer");
const xml2js = require("xml2js");
const { StatusDocAbbyy } = require("./models");

const xmlRoute = require("./routes/xmlRoute");
const logVerificationRoute = require("./routes/logVerificationRoute");
const easyOcrRoute = require("./routes/easyOcrRoute");
const kmpRoute = require("./routes/kmpRoute");
const logSearchRoute = require("./routes/logSearchRoute");
const abbyyRoute = require("./routes/abbyyRoute");
const userRoute = require("./routes/userRoute");
const roleRoute = require("./routes/roleRoute");
const suggestRoute = require("./routes/suggestRoute");

const app = express();
const server = http.Server(app);
const parser = new xml2js.Parser();
let valueEmit = "";
let updateData = "";

app.use(express.json({ limit: "1gb" }));
app.use(express.urlencoded({ limit: "1gb", extended: false }));

app.use(cors());
app.use("/role", roleRoute);
app.use("/user", userRoute);
app.use("/xml", xmlRoute);
app.use("/logVerification", logVerificationRoute);
app.use("/easyOcr", easyOcrRoute);
app.use("/kmp", kmpRoute);
app.use("/logSearch", logSearchRoute);
app.use("/abbyy", abbyyRoute);
app.use("/suggest", suggestRoute);

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

app.use("/createData", multer.upload.array("files", 2000), async (req, res, next) => {
  try {
    const { projectName } = req.body;
    valueEmit = `Update data project ${projectName}`;
    res.status(201).json({ message: "OK" });
  } catch (err) {
    next(err);
  }
});

app.use((req, res, next) => {
  res
    .status(404)
    .json({ message: "Path not found in this server, please make sure that your path or method is correct." });
});

app.use(middleware);

const socketIo = io(server, {
  cors: {
    origin: "*"
  }
});

cron.schedule("*/60 * * * *", async function getDataAbbyy(req, res, next) {
  try {
    let status = await StatusDocAbbyy.findAll({
      where: {
        status: "complete",
        notificationStatus: false
      },
      order: [["priority", "DESC"]]
    });

    if (status.length > 0) {
      status.forEach(item => {
        let xmlDir = `public/dataFile/xmlFile/${item.projectName}`;
        let pdfDir = `public/dataFile/pdfFile/${item.projectName}`;
        if (!fs.existsSync(xmlDir)) {
          fs.mkdirSync(xmlDir, { recursive: true });
          let xmlFilesCenter = fs.readdirSync(`./public/centerFile/xmlFile/${item.projectName}`);
          for (let i = 0; i < xmlFilesCenter.length; i++) {
            let pathFile = __dirname + `/public/centerFile/xmlFile/${item.projectName}/${xmlFilesCenter[i]}`;
            let pathNewDir = __dirname + `/public/dataFile/xmlFile/${item.projectName}/${xmlFilesCenter[i]}`;
            fs.copyFileSync(pathFile, pathNewDir);
          }
        } else {
          let xmlFiles = fs.readdirSync(`./public/dataFile/xmlFile/${item.projectName}`);
          let xmlFilesCenter = fs.readdirSync(`./public/centerFile/xmlFile/${item.projectName}`);
          for (let i = 0; i < xmlFilesCenter.length; i++) {
            if (!xmlFiles.includes(xmlFilesCenter[i])) {
              let pathFile = __dirname + `/public/centerFile/xmlFile/${item.projectName}/${xmlFilesCenter[i]}`;
              let pathNewDir = __dirname + `/public/dataFile/xmlFile/${item.projectName}/${xmlFilesCenter[i]}`;
              fs.copyFileSync(pathFile, pathNewDir);
            }
          }
        }

        if (!fs.existsSync(pdfDir)) {
          fs.mkdirSync(pdfDir, { recursive: true });
          let pdfFilesCenter = fs.readdirSync(`./public/centerFile/pdfFile/${item.projectName}`);
          for (let i = 0; i < pdfFilesCenter.length; i++) {
            let pathFile = __dirname + `/public/centerFile/pdfFile/${item.projectName}/${pdfFilesCenter[i]}`;
            let pathNewDir = __dirname + `/public/dataFile/pdfFile/${item.projectName}/${pdfFilesCenter[i]}`;
            fs.copyFileSync(pathFile, pathNewDir);
          }
        } else {
          let pdfFiles = fs.readdirSync(`./public/dataFile/pdfFile/${item.projectName}`);
          let pdfFilesCenter = fs.readdirSync(`./public/centerFile/pdfFile/${item.projectName}`);
          for (let i = 0; i < pdfFilesCenter.length; i++) {
            if (!pdfFiles.includes(pdfFilesCenter[i])) {
              let pathFile = __dirname + `/public/centerFile/pdfFile/${item.projectName}/${pdfFilesCenter[i]}`;
              let pathNewDir = __dirname + `/public/dataFile/pdfFile/${item.projectName}/${pdfFilesCenter[i]}`;
              fs.copyFileSync(pathFile, pathNewDir);
            }
          }
        }
      });

      let newDateTime = new Date();
      let newDate = `${newDateTime.getDate()}/${newDateTime.getMonth() + 1}/${newDateTime.getFullYear()}`;
      let completeUpdate = status.filter(
        item =>
          `${new Date(item.updatedAt).getDate()}/${new Date(item.updatedAt).getMonth() + 1}/${new Date(
            item.updatedAt
          ).getFullYear()}` === newDate
      );

      if (completeUpdate.length > 0) {
        completeUpdate.forEach(async (element, index) => {
          if (index === 0) {
            updateData += `Update data project name ${element.projectName} of ${newDate}.`;
          } else if (index === completeUpdate.length - 1) {
            updateData = `${updateData.split("of")[0]} and ${element.projectName} of ${newDate}.`;
          } else {
            updateData = `${updateData.split("of")[0]} and ${element.projectName}`;
          }
          await StatusDocAbbyy.update(
            { notificationStatus: true },
            { where: { id: element.id, projectName: element.projectName } }
          );
        });
      } else {
        updateData = "";
      }
    } else {
      updateData = "";
    }
  } catch (err) {
    next(err);
  }
});

socketIo.on("connection", socket => {
  console.log("user connected1");

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("upload file", data => {
    console.log(data);
    if (valueEmit) {
      socketIo.sockets.emit("Notification upload file", valueEmit);
      valueEmit = "";
    }
  });

  socket.on("update data", data => {
    console.log(data);
    if (updateData) {
      socketIo.sockets.emit("Notification data update", updateData);
      updateData = "";
    }
  });
});

// sequelize
//   .sync({ force: true })
//   .then(() => console.log("DB sync"))
//   .catch(err => console.log(err));

const port = process.env.PORT || 8000;
server.listen(port, () => console.log(`This server is running on ${port}`));
