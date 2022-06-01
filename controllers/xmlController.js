const { LogVerification } = require("../models");
const xml2js = require("xml2js");
const fs = require("fs");
const { Op } = require("sequelize");

const parser = new xml2js.Parser();

exports.createData = async (req, res, next) => {
  try {
    // console.log(req.files);
    res.status(201).json({ message: "OK" });
  } catch (err) {
    next(err);
  }
};

exports.getListDoc = async (req, res, next) => {
  try {
    let ListDoc = {};
    let xmlFiles = fs.readdirSync(`./public/dataFile/xmlFile`);
    for (let i = 0; i < xmlFiles.length; i++) {
      let project = fs.readdirSync(`./public/dataFile/xmlFile/${xmlFiles[i]}`);
      let document = [];
      for (let j = 0; j < project.length; j++) {
        // let dataLog = await LogVerification.findAll({
        //   where: { documentName: project[j].split(".")[0] },
        //   order: [["startVerification", "DESC"]]
        // });

        // if (dataLog.length > 0) {
        // document = [
        //   ...document,
        //   {
        //     documentName: dataLog[0].documentName,
        //     status: dataLog[0].documentStatus,
        //     startVerification: dataLog[0].startVerification,
        //     endVerification: dataLog[0].endVerification,
        //     cancelVerification: dataLog[0].cancelVerification
        //   }
        // ];
        // } else {
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
      ListDoc[xmlFiles[i]] = document;
    }
    res.status(200).json(ListDoc);
  } catch (err) {
    next(err);
  }
};

exports.getData = async (req, res, next) => {
  try {
    const { projectName, documentName } = req.params;

    let xmlFiles = fs.readdirSync(`./public/dataFile/xmlFile`);
    if (!xmlFiles.includes(projectName)) {
      res.status(400).json({ message: `The ${projectName} does NOT exist` });
    } else {
      let project = fs.readdirSync(`./public/dataFile/xmlFile/${projectName}`);
      if (!project.includes(`${documentName}.xml`)) {
        res.status(400).json({ message: `The ${documentName}.xml does NOT exist` });
      } else {
        // let dataLog = await LogVerification.findOne({
        //   where: { [Op.and]: [{ userId: req.userId }, { documentName }, {documentStatus: "verifying"}] }
        // });

        // if (!(Object.keys(dataLog).length === 0)) {
        let xml_string = fs.readFileSync(`./public/dataFile/xmlFile/${projectName}/${documentName}.xml`, "utf8");
        parser.parseString(xml_string, function (error, result) {
          if (error === null) {
            res.status(200).json({ data: result, logVerifyId: "" });
            // console.log(result);
          } else {
            console.log(error);
          }
        });
        // } else {
        //   res.status(200).json({ message: "Someone has reviewed this ${documentName}." });
        // }
      }
    }
  } catch (err) {
    next(err);
  }
};

exports.updateDoc = async (req, res, next) => {
  try {
    const { projectName, documentName } = req.params;

    let xmlFiles = fs.readdirSync(`./public/dataFile/xmlFile`);
    if (!xmlFiles.includes(projectName)) {
      res.status(400).json({ message: `The ${projectName} does NOT exist` });
    } else {
      let project = fs.readdirSync(`./public/dataFile/xmlFile/${projectName}`);
      if (!project.includes(`${documentName}.xml`)) {
        res.status(400).json({ message: `The ${documentName}.xml does NOT exist` });
      } else {
        // let dataLog = await LogVerification.findOne({
        //   where: { id: req.body.logVerifyId }
        // });

        // if (!(Object.keys(dataLog).length === 0)) {
        // convert JSON objec to XML
        // const builder = new xml2js.Builder();
        // const xml = builder.buildObject(req.body.data);

        // write updated XML string to a file
        // fs.writeFile(`./public/dataFile/xmlFileVerified/${projectName}/${documentName}.xml`, xml, err => {
        //   if (err) {
        //     throw err;
        //   }
        //   console.log(`Updated XML success.`);
        // });

        // const date = new Date();
        // await LogVerification.update(
        //   { documentStatus: "verified", verificationDate: date },
        //   { where: { id: req.body.logVerifyId } }
        // );
        next();
        // res.status(200).json({ message: `Updated XML success.` });
        // } else {
        // res.status(200).json({ message: `The ${documentName}.xml has not yet been created in the log. ` });
        // }
      }
    }
  } catch (err) {
    next(err);
  }
};
