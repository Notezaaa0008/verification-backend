const { LogVerification, sequelize, User } = require("../models");
const fs = require("fs");
const xml2js = require("xml2js");
const { Op } = require("sequelize");
const cron = require("node-cron");

const parser = new xml2js.Parser();

cron.schedule("0 0 * * *", async function cancelTimeOut(req, res, next) {
  try {
    let data = await LogVerification.findAll({
      where: {
        documentStatus: { [Op.or]: ["verifying", "draft"] }
      }
    });
    if (data.length > 0) {
      let day = 7;
      data.forEach(async item => {
        let oldDate = new Date(item.startVerification);
        let getTimeOldDate = new Date(oldDate.getFullYear(), oldDate.getMonth(), oldDate.getDate()).getTime();
        let cancelDate = new Date(getTimeOldDate + 3600 * 1000 * 24 * day);
        let currentDate = new Date();
        if (
          `${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}` ===
          `${cancelDate.getDate()}/${cancelDate.getMonth() + 1}/${cancelDate.getFullYear()}`
        ) {
          await LogVerification.update(
            { documentStatus: "cancel", cancelVerification: currentDate },
            { where: { id: item.id } }
          );
          console.log(`cancel verifying due to time out.`);
        }
      });
    }
  } catch (err) {
    next(err);
  }
});

exports.createLogVerify = async (req, res, next) => {
  try {
    const { projectName, documentName, userId, systemName } = req.body;
    if (systemName.toLowerCase() === "abbyy") {
      let xmlFiles = fs.readdirSync(`./public/dataFile/xmlFile`);
      if (!xmlFiles.includes(projectName)) {
        res.status(400).json({ message: `The ${projectName} does NOT exist` });
      } else {
        let project = fs.readdirSync(`./public/dataFile/xmlFile/${projectName}`);
        if (!project.includes(`${documentName}.xml`)) {
          res.status(400).json({ message: `The ${documentName}.xml does NOT exist` });
        } else {
          let dataLog = await LogVerification.findAll({
            where: {
              [Op.and]: [
                { projectName },
                { documentName },
                { documentStatus: { [Op.or]: ["verifying", "verified", "draft"] } }
              ]
            },
            order: [["startVerification", "DESC"]]
          });
          if (dataLog.length > 0) {
            res.status(400).json({ message: `Someone has reviewed this ${documentName}.` });
          } else {
            let date = new Date();
            let createLogVerify = await LogVerification.create({
              systemName: "abbyy",
              userId,
              projectName,
              documentName,
              documentStatus: "verifying",
              startVerification: date
            });
            res.status(201).json({ message: "create log verification success", createLogVerify });
          }
        }
      }
    } else if (systemName.toLowerCase() === "ocr") {
      let dataLog = await LogVerification.findAll({
        where: {
          [Op.and]: [{ projectName }, { documentName }, { documentStatus: { [Op.or]: ["verifying", "verified"] } }]
        },
        order: [["startVerification", "DESC"]]
      });
      if (dataLog.length > 0) {
        res.status(400).json({ message: `Someone has reviewed this ${documentName}.` });
      } else {
        let date = new Date();
        let createLogVerify = await LogVerification.create({
          systemName: "ocr",
          userId,
          projectName,
          documentName,
          documentStatus: "verifying",
          startVerification: date
        });
        res.status(201).json({ message: "create log verification success", createLogVerify });
      }
    }
  } catch (err) {
    next(err);
  }
};

exports.editVerify = async (req, res, next) => {
  try {
    const { logVerifyId } = req.body;
    let editLog = await LogVerification.update({ documentStatus: "edit", editorId: 1 }, { where: { id: logVerifyId } });
    res.status(200).json({ editLog });
  } catch (err) {
    next(err);
  }
};

exports.cancelVerify = async (req, res, next) => {
  try {
    const { logVerifyId } = req.body;
    let date = new Date();
    let cancelLog = await LogVerification.update(
      { documentStatus: "cancel", cancelVerification: date },
      { where: { id: logVerifyId } }
    );
    res.status(200).json({ message: "cancel success", cancelLog });
  } catch (err) {
    next(err);
  }
};

let calTakeTime = takeTime => {
  let hours = Math.floor(takeTime / 3600);
  let minutes = Math.floor((takeTime - hours * 3600) / 60);
  let seconds = takeTime - hours * 3600 - minutes * 60;

  if (hours > 0) {
    if (hours < 10) hours = "0" + hours;
    if (minutes < 10) minutes = "0" + minutes;
    if (seconds < 10) seconds = "0" + seconds;
    return `${hours}:${minutes}:${seconds}`;
  } else if (minutes > 0) {
    if (minutes < 10) minutes = "0" + minutes;
    if (seconds < 10) seconds = "0" + seconds;
    return `00:${minutes}:${seconds}`;
  } else if (seconds > 0) {
    if (seconds < 10) seconds = "0" + seconds;
    return `00:00:${seconds}`;
  }
};

exports.getLog = async (req, res, next) => {
  try {
    let { systemName, params } = req.params;
    let dataLog = await LogVerification.findAll({
      where: {
        documentStatus: "verified",
        systemName
      },
      include: [
        { model: User, as: "UserName", attributes: ["firstName", "lastName"] },
        { model: User, as: "EditorName", attributes: ["firstName", "lastName"] }
      ]
    });
    let timeVerified = [];
    let dataForAver = [];

    if (dataLog.length > 0) {
      dataLog.forEach(item => {
        let startDate = new Date(item.startVerification);
        let endDate = new Date(item.endVerification);
        let sec = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);

        if (dataForAver.length === 0) {
          dataForAver = [
            ...dataForAver,
            {
              date: `${item.endVerification.getFullYear()}${
                item.endVerification.getMonth() < 9
                  ? "0" + (item.endVerification.getMonth() + 1)
                  : item.endVerification.getMonth() + 1
              }${item.endVerification.getDate()}`,
              user: [
                {
                  name: `${item.UserName.dataValues.firstName} ${item.UserName.dataValues.lastName}`,
                  finishTime: sec,
                  round: 1,
                  average: calTakeTime(Math.round(sec / 1))
                }
              ]
            }
          ];
        } else {
          let existForAver = dataForAver.filter(
            ele =>
              ele.date.slice(0, 4) === `${item.endVerification.getFullYear()}` &&
              ele.date.slice(4, 6) ===
                `${
                  item.endVerification.getMonth() < 9
                    ? "0" + (item.endVerification.getMonth() + 1)
                    : item.endVerification.getMonth() + 1
                }`
          );
          if (existForAver.length > 0) {
            let user = existForAver[0].user.filter(
              val => val.name === `${item.UserName.dataValues.firstName} ${item.UserName.dataValues.lastName}`
            );
            if (user.length > 0) {
              user[0].finishTime = +sec + +user[0].finishTime;
              user[0].round = +user[0].round + 1;
              user[0].average = calTakeTime(Math.round(user[0].finishTime / user[0].round));
            } else {
              existForAver[0].user = [
                ...existForAver[0].user,
                {
                  name: `${item.UserName.dataValues.firstName} ${item.UserName.dataValues.lastName}`,
                  finishTime: sec,
                  round: 1,
                  average: calTakeTime(Math.round(sec / 1))
                }
              ];
            }
          } else {
            dataForAver = [
              ...dataForAver,
              {
                date: `${item.endVerification.getFullYear()}${
                  item.endVerification.getMonth() < 9
                    ? "0" + (item.endVerification.getMonth() + 1)
                    : item.endVerification.getMonth() + 1
                }${item.endVerification.getDate()}`,
                user: [
                  {
                    name: `${item.UserName.dataValues.firstName} ${item.UserName.dataValues.lastName}`,
                    finishTime: sec,
                    round: 1,
                    average: calTakeTime(Math.round(sec / 1))
                  }
                ]
              }
            ];
          }
        }

        if (timeVerified.length === 0) {
          timeVerified = [
            ...timeVerified,
            {
              user: `${item.UserName.dataValues.firstName} ${item.UserName.dataValues.lastName}`,
              task: [
                {
                  project: item.projectName,
                  document: item.documentName,
                  finishTime: calTakeTime(sec),
                  startDate: `${startDate.getFullYear()}${
                    startDate.getMonth() < 9 ? "0" + (startDate.getMonth() + 1) : startDate.getMonth() + 1
                  }${startDate.getDate()}`,
                  startTime: `${startDate.getHours()}:${startDate.getMinutes()}:${startDate.getSeconds()}`,
                  endDate: `${endDate.getFullYear()}${
                    endDate.getMonth() < 9 ? "0" + (endDate.getMonth() + 1) : endDate.getMonth() + 1
                  }${endDate.getDate()}`,
                  endTime: `${endDate.getHours()}:${endDate.getMinutes()}:${endDate.getSeconds()}`
                }
              ],

              performance: 1
            }
          ];
        } else {
          let exist = timeVerified.filter(
            ele => ele.user === `${item.UserName.dataValues.firstName} ${item.UserName.dataValues.lastName}`
          );
          if (exist.length > 0) {
            exist[0].task.push({
              project: item.projectName,
              document: item.documentName,
              finishTime: calTakeTime(sec),
              startDate: `${startDate.getFullYear()}${
                startDate.getMonth() < 9 ? "0" + (startDate.getMonth() + 1) : startDate.getMonth() + 1
              }${startDate.getDate()}`,
              startTime: `${startDate.getHours()}:${startDate.getMinutes()}:${startDate.getSeconds()}`,
              endDate: `${endDate.getFullYear()}${
                endDate.getMonth() < 9 ? "0" + (endDate.getMonth() + 1) : endDate.getMonth() + 1
              }${endDate.getDate()}`,
              endTime: `${endDate.getHours()}:${endDate.getMinutes()}:${endDate.getSeconds()}`
            });

            exist[0].performance = +exist[0].performance + 1;
          } else {
            timeVerified.push({
              user: `${item.UserName.dataValues.firstName} ${item.UserName.dataValues.lastName}`,
              task: [
                {
                  project: item.projectName,
                  document: item.documentName,
                  finishTime: calTakeTime(sec),
                  startDate: `${startDate.getFullYear()}${
                    startDate.getMonth() < 9 ? "0" + (startDate.getMonth() + 1) : startDate.getMonth() + 1
                  }${startDate.getDate()}`,
                  startTime: `${startDate.getHours()}:${startDate.getMinutes()}:${startDate.getSeconds()}`,
                  endDate: `${endDate.getFullYear()}${
                    endDate.getMonth() < 9 ? "0" + (endDate.getMonth() + 1) : endDate.getMonth() + 1
                  }${endDate.getDate()}`,
                  endTime: `${endDate.getHours()}:${endDate.getMinutes()}:${endDate.getSeconds()}`
                }
              ],

              performance: 1
            });
          }
        }
      });
      if (params === "verify") {
        res.status(200).json({ verified: timeVerified });
      } else if (params === "average") {
        res.status(200).json({ dataForAver });
      }
    } else {
      res.status(400).json({ message: "Not found data in the log verify." });
    }
  } catch (err) {
    next(err);
  }
};

exports.getCompareValue = async (req, res, next) => {
  try {
    let { projectName, documentName, logVerifyId } = req.body;
    console.log(projectName, documentName, logVerifyId);
    let data = await LogVerification.findOne({
      where: { projectName, documentName, id: logVerifyId }
    });
    let oldValue = JSON.parse(data.oldValue);
    let CurrentValue = JSON.parse(data.currentValue);
    if (data) {
      res.status(200).json({ oldValue, CurrentValue });
    } else {
      res.status(400).json({ message: "Not found data in the log verify." });
    }
  } catch (err) {
    next(err);
  }
};
