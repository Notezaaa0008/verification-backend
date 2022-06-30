const { LogVerification } = require("../models");
const xml2js = require("xml2js");
const fs = require("fs");
const { Op } = require("sequelize");

const parser = new xml2js.Parser();

exports.getListDoc = async (req, res, next) => {
  try {
    let ListDoc = {};
    let xmlFiles = fs.readdirSync(`./public/dataFile/xmlFile`);
    for (let i = 0; i < xmlFiles.length; i++) {
      let project = fs.readdirSync(`./public/dataFile/xmlFile/${xmlFiles[i]}`);
      let document = [];
      for (let j = 0; j < project.length; j++) {
        let dataLog = await LogVerification.findAll({
          where: {
            documentName: project[j].split(".")[0],
            [Op.not]: [
              {
                documentStatus: "cancel"
              }
            ]
          },
          order: [["startVerification", "DESC"]]
        });

        if (dataLog.length > 0) {
          document = [
            ...document,
            {
              documentName: dataLog[0].documentName,
              status: dataLog[0].documentStatus,
              startVerification: dataLog[0].startVerification ? dataLog[0].startVerification : "",
              endVerification: dataLog[0].endVerification ? dataLog[0].endVerification : "",
              cancelVerification: dataLog[0].cancelVerification ? dataLog[0].cancelVerification : ""
            }
          ];
        } else {
          document = [
            ...document,
            {
              documentName: project[j].split(".")[0],
              status: "",
              startVerification: "",
              endVerification: "",
              cancelVerification: ""
            }
          ];
        }
      }
      ListDoc[xmlFiles[i]] = document;
    }
    res.status(200).json(ListDoc);
  } catch (err) {
    next(err);
  }
};

exports.getEditData = async (req, res, next) => {
  try {
    const { projectName, documentName } = req.params;

    let dataLog = await LogVerification.findOne({
      where: { editorId: 2, projectName, documentName, documentStatus: "edit" }
    });
    if (dataLog) {
      let xmlFiles = fs.readdirSync(`./public/dataFile/xmlFileVerified`);
      if (!xmlFiles.includes(projectName)) {
        res.status(400).json({ message: `The ${projectName} does NOT exist` });
      } else {
        let project = fs.readdirSync(`./public/dataFile/xmlFileVerified/${projectName}`);
        if (!project.includes(`${documentName}.xml`)) {
          res.status(400).json({ message: `The ${documentName}.xml does NOT exist` });
        } else {
          let xml_string = fs.readFileSync(
            `./public/dataFile/xmlFileVerified/${projectName}/${documentName}.xml`,
            "utf8"
          );
          parser.parseString(xml_string, function (error, result) {
            if (error === null) {
              res.status(200).json({ data: result, logVerifyId: dataLog.id });
            } else {
              console.log(error);
            }
          });
        }
      }
    } else {
      res.status(400).json({
        message: `This document cannot be edited. Due to data not create or someone has edited this ${documentName}.`
      });
    }
  } catch (err) {
    next(err);
  }
};

exports.getData = async (req, res, next) => {
  try {
    const { projectName, documentName } = req.params;

    let dataLog = await LogVerification.findOne({
      where: { userId: 2, projectName, documentName, documentStatus: { [Op.or]: ["verifying", "verified"] } }
    });
    if (dataLog) {
      if (dataLog.documentStatus === "verifying") {
        let xmlFiles = fs.readdirSync(`./public/dataFile/xmlFile`);
        if (!xmlFiles.includes(projectName)) {
          res.status(400).json({ message: `The ${projectName} does NOT exist` });
        } else {
          let project = fs.readdirSync(`./public/dataFile/xmlFile/${projectName}`);
          if (!project.includes(`${documentName}.xml`)) {
            res.status(400).json({ message: `The ${documentName}.xml does NOT exist` });
          } else {
            let xml_string = fs.readFileSync(`./public/dataFile/xmlFile/${projectName}/${documentName}.xml`, "utf8");
            parser.parseString(xml_string, function (error, result) {
              if (error === null) {
                res.status(200).json({ data: result, logVerifyId: dataLog.id });
              } else {
                console.log(error);
              }
            });
          }
        }
      } else if (dataLog.documentStatus === "verified") {
        let xmlFiles = fs.readdirSync(`./public/dataFile/xmlFileVerified`);
        if (!xmlFiles.includes(projectName)) {
          res.status(400).json({ message: `The ${projectName} does NOT exist` });
        } else {
          let project = fs.readdirSync(`./public/dataFile/xmlFileVerified/${projectName}`);
          if (!project.includes(`${documentName}.xml`)) {
            res.status(400).json({ message: `The ${documentName}.xml does NOT exist` });
          } else {
            let xml_string = fs.readFileSync(
              `./public/dataFile/xmlFileVerified/${projectName}/${documentName}.xml`,
              "utf8"
            );
            parser.parseString(xml_string, function (error, result) {
              if (error === null) {
                res.status(200).json({ data: result, logVerifyId: dataLog.id });
              } else {
                console.log(error);
              }
            });
          }
        }
      }
    } else {
      res.status(400).json({
        message: `Not found data in the log verify. Due to data not create or someone has reviewed this ${documentName}.`
      });
    }
  } catch (err) {
    next(err);
  }
};

exports.updateDoc = async (req, res, next) => {
  try {
    const { projectName, documentName } = req.params;
    const { oldValue, currentValue, systemName } = req.body;
    console.log(systemName);
    if (systemName.toLowerCase() === "abbyy") {
      let xmlFiles = fs.readdirSync(`./public/dataFile/xmlFile`);
      if (!xmlFiles.includes(projectName)) {
        res.status(400).json({ message: `The ${projectName} does NOT exist` });
      } else {
        let project = fs.readdirSync(`./public/dataFile/xmlFile/${projectName}`);
        if (!project.includes(`${documentName}.xml`)) {
          res.status(400).json({ message: `The ${documentName}.xml does NOT exist` });
        } else {
          let dataLog = await LogVerification.findOne({
            where: {
              id: req.body.logVerifyId,
              projectName,
              documentName
            }
          });

          if (dataLog) {
            let dir = `public/dataFile/xmlFileVerified/${projectName}`;
            if (!fs.existsSync(dir)) {
              fs.mkdirSync(dir, { recursive: true });
            }

            // convert JSON objec to XML
            const builder = new xml2js.Builder();
            const xml = builder.buildObject(req.body.data);

            // write updated XML string to a file
            fs.writeFile(`./public/dataFile/xmlFileVerified/${projectName}/${documentName}.xml`, xml, err => {
              if (err) {
                throw err;
              }
              console.log(`Updated XML success.`);
            });

            const date = new Date();
            await LogVerification.update(
              {
                documentStatus: "verified",
                endVerification: date,
                oldValue: JSON.stringify(oldValue),
                currentValue: JSON.stringify(currentValue)
              },
              { where: { id: req.body.logVerifyId } }
            );
            res.status(200).json({
              message: `Update success`
            });
          } else {
            res.status(400).json({
              message: `Not found data in the log verify.`
            });
          }
        }
      }
    } else if (systemName.toLowerCase() === "ocr") {
      let dataLog = await LogVerification.findOne({
        where: {
          id: req.body.logVerifyId,
          projectName,
          documentName
        }
      });

      if (dataLog) {
        // let dir = `public/dataFile/xmlFileVerified/${projectName}`;
        // if (!fs.existsSync(dir)) {
        //   fs.mkdirSync(dir, { recursive: true });
        // }

        // // convert JSON objec to XML
        // const builder = new xml2js.Builder();
        // const xml = builder.buildObject(req.body.data);

        // // write updated XML string to a file
        // fs.writeFile(`./public/dataFile/xmlFileVerified/${projectName}/${documentName}.xml`, xml, err => {
        //   if (err) {
        //     throw err;
        //   }
        //   console.log(`Updated XML success.`);
        // });

        const date = new Date();
        await LogVerification.update(
          {
            documentStatus: "verified",
            endVerification: date,
            oldValue: JSON.stringify(oldValue),
            currentValue: JSON.stringify(currentValue)
          },
          { where: { id: req.body.logVerifyId } }
        );
        res.status(200).json({
          message: `Update success`
        });
      } else {
        res.status(400).json({
          message: `Not found data in the log verify.`
        });
      }
    }
  } catch (err) {
    next(err);
  }
};

exports.original = async (req, res, next) => {
  try {
    let { documentName, projectName } = req.body;
    let xmlFiles = fs.readdirSync(`./public/dataFile/xmlFile`);
    if (!xmlFiles.includes(projectName)) {
      res.status(400).json({ message: `The ${projectName} does NOT exist` });
    } else {
      let project = fs.readdirSync(`./public/dataFile/xmlFile/${projectName}`);
      if (!project.includes(`${documentName}.xml`)) {
        res.status(400).json({ message: `The ${documentName}.xml does NOT exist` });
      } else {
        let xml_string = fs.readFileSync(`./public/dataFile/xmlFile/${projectName}/${documentName}.xml`, "utf8");
        parser.parseString(xml_string, function (error, result) {
          if (error === null) {
            res.status(200).json({ data: result });
          } else {
            console.log(error);
          }
        });
      }
    }
  } catch (err) {
    next(err);
  }
};
