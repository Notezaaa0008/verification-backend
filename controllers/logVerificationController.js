const { LogVerification } = require("../models");
const fs = require("fs");
const xml2js = require("xml2js");

const parser = new xml2js.Parser();

exports.createLogVerify = async (req, res, next) => {
  try {
    const { projectName, documentName, documentStatus } = req.body;
    if (!xmlFiles.includes(projectName)) {
      res.status(400).json({ message: `The ${projectName} does NOT exist` });
    } else {
      let project = fs.readdirSync(`./public/dataFile/xmlFile/${projectName}`);
      if (!project.includes(`${documentName}.xml`)) {
        res.status(400).json({ message: `The ${documentName}.xml does NOT exist` });
      } else {
        let dataLog = await LogVerification.findAll({
          where: { [Op.and]: [{ documentName }, { documentStatus: { [Op.or]: ["verifying", "verified"] } }] },
          order: [["startVerification", "DESC"]]
        });
        if (dataLog.length > 0) {
          res.status(400).json({ message: `Someone has reviewed this ${documentName}.` });
        } else {
          // let date = new Date();
          // await LogVerification.create({
          //   userId: req.userId,
          //   projectName,
          //   documentName,
          //   documentStatus,
          //   startVerification: date
          // });
          res.status(201).json({ message: "create log verification success" });
        }
      }
    }
  } catch (err) {
    next(err);
  }
};

exports.cancelVerify = async (req, res, next) => {
  try {
    const { documentStatus, logVerifyId } = req.body;
    if (documentStatus === "reject") {
      const date = new Date();
      await LogVerification.update({ documentStatus: "", cancelVerification: date }, { where: { id: logVerifyId } });
      res.status(200).json({ message: "cancel success" });
    }
  } catch (err) {
    next(err);
  }
};

exports.getLog = async (req, res, next) => {
  try {
  } catch (err) {
    next(err);
  }
};

exports.deleteLog = async (req, res, next) => {
  try {
  } catch (err) {
    next(err);
  }
};

exports.CheckChange = async (req, res, next) => {
  try {
    res.status(200).json({ message: "OKKKK" });
  } catch (err) {
    next(err);
  }
};
