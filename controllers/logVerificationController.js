const { LogVerification, sequelize, User } = require("../models");
const fs = require("fs");
const xml2js = require("xml2js");
const { Op } = require("sequelize");
const cron = require("node-cron");

const parser = new xml2js.Parser();

cron.schedule("0 0 * * *", async function cancelOnTime(req, res, next) {
  try {
    let data = await LogVerification.findAll({
      where: {
        documentStatus: "verifying"
      }
    });
    if (data.length > 0) {
      let day = 7;
      date.forEach(async item => {
        let oldDate = new Date(item.startVerification);
        let getTimeOldDate = new Date(
          `${oldDate.getFullYear()}, ${oldDate.getMonth()}, ${oldDate.getDate()}`
        ).getTime();
        let cancelDate = new Date(getTimeOldDate + 3600 * 1000 * 24 * day);
        let currentDate = new Date();
        if (
          `${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}` ===
          `${cancelDate.getDate()}/${cancelDate.getMonth() + 1}/${cancelDate.getFullYear()}`
        ) {
          await LogVerification.update(
            { documentStatus: "cancel", cancelVerification: date },
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
              [Op.and]: [{ projectName }, { documentName }, { documentStatus: { [Op.or]: ["verifying", "verified"] } }]
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
let checkObject = (oldFile, newFile) => {
  let old = {};
  let current = {};
  if (Object.keys(newFile).length === Object.keys(oldFile).length) {
    //กรณีที่ key ภายในของ object มีขนาดเท่ากัน
    let oldValueChange = Object.keys(oldFile);
    for (let j = 0; j < Object.keys(newFile).length; j++) {
      if (Object.keys(oldFile).includes(Object.keys(newFile)[j])) {
        oldValueChange.splice(oldValueChange.indexOf(Object.keys(newFile)[j]), 1);
        // กรณีที่ key ภายในของ object มีค่าเหมือนกัน
        if (newFile[Object.keys(newFile)[j]] !== oldFile[Object.keys(newFile)[j]]) {
          //กรณีที่ value ของ key ภายในของ object มีค่าไม่เหมือนกัน
          current = {
            ...current,
            [Object.keys(newFile)[j]]: newFile[Object.keys(newFile)[j]]
          };
          old = { ...old, [Object.keys(newFile)[j]]: oldFile[Object.keys(newFile)[j]] };
        }
      } else {
        // กรณีที่ key ภายในของ object มีค่าไม่เหมือนกัน
        current = {
          ...current,
          [Object.keys(newFile)[j]]: newFile[Object.keys(newFile)[j]]
        };
      }
    }
    if (oldValueChange.length > 0) {
      oldValueChange.forEach(item => {
        old = { ...old, [item]: oldFile[item] };
      });
    }
  } else {
    //กรณีที่ key ภายในของ object มีขนาดไม่เท่ากัน
    if (Object.keys(newFile).length > Object.keys(oldFile).length) {
      //กรณีเพิ่ม key
      let oldValueChange = Object.keys(oldFile);
      for (let j = 0; j < Object.keys(newFile).length; j++) {
        if (Object.keys(oldFile).includes(Object.keys(newFile)[j])) {
          oldValueChange.splice(oldValueChange.indexOf(Object.keys(newFile)[j]), 1);
          // กรณีที่ key ภายในของ object มีค่าเหมือนกัน
          if (newFile[Object.keys(newFile)[j]] !== oldFile[Object.keys(newFile)[j]]) {
            //กรณีที่ value ของ key ภายในของ object มีค่าไม่เหมือนกัน
            current = {
              ...current,
              [Object.keys(newFile)[j]]: newFile[Object.keys(newFile)[j]]
            };
            old = {
              ...old,
              [Object.keys(newFile)[j]]: oldFile[Object.keys(newFile)[j]]
            };
          }
        } else {
          // กรณีที่ key ภายในของ object มีค่าไม่เหมือนกัน
          current = {
            ...current,
            [Object.keys(newFile)[j]]: newFile[Object.keys(newFile)[j]]
          };
        }
      }
      if (oldValueChange.length > 0) {
        oldValueChange.forEach(item => {
          old = { ...old, [item]: oldFile[item] };
        });
      }
    } else if (Object.keys(newFile).length < Object.keys(oldFile).length) {
      //กรณีลด key
      let newValueChange = Object.keys(newFile);
      for (let j = 0; j < Object.keys(oldFile).length; j++) {
        if (Object.keys(newFile).includes(Object.keys(oldFile)[j])) {
          newValueChange.splice(newValueChange.indexOf(Object.keys(oldFile)[j]), 1);
          // กรณีที่ key ภายในของ object มีค่าเหมือนกัน
          if (newFile[Object.keys(oldFile)[j]] !== oldFile[Object.keys(oldFile)[j]]) {
            //กรณีที่ value ของ key ภายในของ object มีค่าไม่เหมือนกัน
            current = {
              ...current,
              [Object.keys(oldFile)[j]]: newFile[Object.keys(oldFile)[j]]
            };
            old = {
              ...old,
              [Object.keys(oldFile)[j]]: oldFile[Object.keys(oldFile)[j]]
            };
          }
        } else {
          // กรณีที่ key ภายในของ object มีค่าไม่เหมือนกัน
          old = {
            ...old,
            [Object.keys(oldFile)[j]]: oldFile[Object.keys(oldFile)[j]]
          };
        }
      }
      if (newValueChange.length > 0) {
        newValueChange.forEach(item => {
          current = { ...current, [item]: newFile[item] };
        });
      }
    }
  }
  return { old_value: old, current_value: current };
};

let checkTable = (oldFile, newFile) => {
  let oldChange = [];
  let newChange = [];
  for (let i = 0; i < newFile.length; i++) {
    //ชั้น1
    if (oldFile[i]) {
      let oldChange1 = {};
      let newChange1 = {};
      for (let keyItem in newFile[i]) {
        //ชั้น2
        if (typeof oldFile[i][keyItem] === "object" && typeof newFile[i][keyItem] === "object") {
          if (Array.isArray(oldFile[i][keyItem]) && Array.isArray(newFile[i][keyItem])) {
            for (let j = 0; j < newFile[i][keyItem].length; j++) {
              if (typeof oldFile[i][keyItem][j] === "object" && typeof newFile[i][keyItem][j] === "object") {
                let oldChange2 = {};
                let newChange2 = {};
                //ชั้น 3
                for (let keyValue in newFile[i][keyItem][j]) {
                  if (
                    typeof oldFile[i][keyItem][j][keyValue] === "object" &&
                    typeof newFile[i][keyItem][j][keyValue] === "object"
                  ) {
                    let dataAttribute = checkObject(oldFile[i][keyItem][j][keyValue], newFile[i][keyItem][j][keyValue]);
                    if (
                      Object.keys(dataAttribute.old_value).length > 0 ||
                      Object.keys(dataAttribute.current_value).length > 0
                    ) {
                      oldChange2 = { ...oldChange2, [keyValue]: dataAttribute.old_value };
                      newChange2 = { ...newChange2, [keyValue]: dataAttribute.current_value };
                    }
                  } else if (
                    (typeof newFile[i][keyItem][j][keyValue] === "string" &&
                      typeof oldFile[i][keyItem][j][keyValue] === "object") ||
                    (typeof newFile[i][keyItem][j][keyValue] === "object" &&
                      typeof oldFile[i][keyItem][j][keyValue] === "string")
                  ) {
                    if (typeof newFile[i][keyItem][j][keyValue] === "string") {
                      oldChange2 = { ...oldChange2, [keyValue]: oldFile[i][keyItem][j][keyValue] };
                      newChange2 = { ...newChange2, [keyValue]: [newFile[i][keyItem][j][keyValue]] };
                    } else if (typeof oldFile[i][keyItem][j][keyValue] === "string") {
                      oldChange2 = { ...oldChange2, [keyValue]: [oldFile[i][keyItem][j][keyValue]] };
                      newChange2 = { ...newChange2, [keyValue]: newFile[i][keyItem][j][keyValue] };
                    }
                  } else if (
                    typeof oldFile[i][keyItem][j][keyValue] === "string" &&
                    typeof newFile[i][keyItem][j][keyValue] === "string"
                  ) {
                    if (oldFile[i][keyItem][j][keyValue] !== newFile[i][keyItem][j][keyValue]) {
                      oldChange2 = { ...oldChange2, [keyValue]: oldFile[i][keyItem][j][keyValue] };
                      newChange2 = { ...newChange2, [keyValue]: newFile[i][keyItem][j][keyValue] };
                    }
                  }
                }
                //เก็บค่าชั้น 3
                if (Object.keys(oldChange2).length > 0 || Object.keys(newChange2).length > 0) {
                  oldChange1 = { ...oldChange1, [keyItem]: [oldChange2] };
                  newChange1 = { ...newChange1, [keyItem]: [newChange2] };
                }
              } else if (
                (typeof newFile[i][keyItem][j] === "string" && typeof oldFile[i][keyItem][j] === "object") ||
                (typeof newFile[i][keyItem][j] === "object" && typeof oldFile[i][keyItem][j] === "string")
              ) {
                if (typeof newFile[i][keyItem][j] === "string") {
                  oldChange1 = { ...oldChange1, [keyItem]: oldFile[i][keyItem][j] };
                  newChange1 = { ...newChange1, [keyItem]: [newFile[i][keyItem][j]] };
                } else if (typeof oldFile[i][keyItem][j] === "string") {
                  oldChange1 = { ...oldChange1, [keyItem]: [oldFile[i][keyItem][j]] };
                  newChange1 = { ...newChange1, [keyItem]: newFile[i][keyItem][j] };
                }
              } else if (typeof oldFile[i][keyItem][j] === "string" && typeof newFile[i][keyItem][j] === "string") {
                if (oldFile[i][keyItem][j] !== newFile[i][keyItem][j]) {
                  oldChange1 = { ...oldChange1, [keyItem]: [oldFile[i][keyItem][j]] };
                  newChange1 = { ...newChange1, [keyItem]: [newFile[i][keyItem][j]] };
                }
              }
            }
          } else if (Array.isArray(oldFile[i][keyItem]) || Array.isArray(newFile[i][keyItem])) {
            oldChange1 = { ...oldChange1, [keyItem]: oldFile[i][keyItem] };
            newChange1 = { ...newChange1, [keyItem]: newFile[i][keyItem] };
          } else {
            let dataAttribute = checkObject(oldFile[i][keyItem], newFile[i][keyItem]);
            if (
              Object.keys(dataAttribute.old_value).length > 0 ||
              Object.keys(dataAttribute.current_value).length > 0
            ) {
              oldChange1 = { ...oldChange1, [keyItem]: dataAttribute.old_value };
              newChange1 = { ...newChange1, [keyItem]: dataAttribute.current_value };
            }
          }
        } else if (
          (typeof newFile[i][keyItem] === "string" && typeof oldFile[i][keyItem] === "object") ||
          (typeof newFile[i][keyItem] === "object" && typeof oldFile[i][keyItem] === "string")
        ) {
          if (typeof newFile[i][keyItem] === "string") {
            oldChange1 = { ...oldChange1, [keyItem]: oldFile[i][keyItem] };
            newChange1 = { ...newChange1, [keyItem]: [newFile[i][keyItem]] };
          } else if (typeof oldFile[i][keyItem] === "string") {
            oldChange1 = { ...oldChange1, [keyItem]: [oldFile[i][keyItem]] };
            newChange1 = { ...newChange1, [keyItem]: newFile[i][keyItem] };
          }
        } else if (typeof oldFile[i][keyItem] === "string" && typeof newFile[i][keyItem] === "string") {
          if (oldFile[i][keyItem] !== newFile[i][keyItem]) {
            oldChange1 = { ...oldChange1, [keyItem]: [oldFile[i][keyItem]] };
            newChange1 = { ...newChange1, [keyItem]: [newFile[i][keyItem]] };
          }
        }
      }
      //เก็บค่าชั้น2
      if (Object.keys(oldChange1).length > 0 || Object.keys(newChange1).length > 0) {
        oldChange = [...oldChange, oldChange1];
        newChange = [...newChange, newChange1];
      }
    } else {
      newChange = [...newChange, newFile[i]];
    }
  }
  return { oldChange, newChange };
};

exports.CheckChange = async (req, res, next) => {
  try {
    const { projectName, documentName } = req.params;
    const { data } = req.body;

    let oData;
    let oldFile;
    let invoiceOld = {};
    let invoiceNew = {};
    let newFile = data[Object.keys(data)[0]][Object.keys(data[Object.keys(data)[0]])[1]];
    let docFile = fs.readFileSync(`./public/dataFile/xmlFile/${projectName}/${documentName}.xml`, "utf8");
    parser.parseString(docFile, function (error, result) {
      if (error === null) {
        oData = result[Object.keys(result)[0]];
        oldFile = result[Object.keys(result)[0]][Object.keys(result[Object.keys(result)[0]])[1]];
      } else {
        console.log(error);
      }
    });

    for (let key in newFile[0]) {
      //Item ภายใน <_Invoice> (ชั้น 1)
      if (key === "$") {
        let dataAttribute = checkObject(oldFile[0][key], newFile[0][key]);
        if (Object.keys(dataAttribute.old_value).length > 0 || Object.keys(dataAttribute.current_value).length > 0) {
          invoiceOld = { ...invoiceOld, [key]: dataAttribute.old_value };
          invoiceNew = { ...invoiceNew, [key]: dataAttribute.current_value };
        }
      } else if (key !== "addData:AdditionalInfo") {
        //item ภายใน Item ของ <_Invoice> และ ตรวจสอบว่าขนาด array เท่ากันไหม
        if (
          (newFile[0][key].length > 1 && oldFile[0][key].length > 1) ||
          (newFile[0][key].length === 1 && oldFile[0][key].length > 1) ||
          (newFile[0][key].length > 1 && oldFile[0][key].length === 1)
        ) {
          if (newFile[0][key].length === oldFile[0][key].length) {
            let dataTable = checkTable(oldFile[0][key], newFile[0][key]);
            if (dataTable.oldChange.length > 0 || dataTable.newChange.length > 0) {
              invoiceOld = { ...invoiceOld, [key]: dataTable.oldChange };
              invoiceNew = { ...invoiceNew, [key]: dataTable.newChange };
            }
          } else {
            if (newFile[0][key].length > oldFile[0][key].length) {
              let dataTable = checkTable(oldFile[0][key], newFile[0][key]);
              if (dataTable.oldChange.length > 0 || dataTable.newChange.length > 0) {
                invoiceOld = { ...invoiceOld, [key]: dataTable.oldChange };
                invoiceNew = { ...invoiceNew, [key]: dataTable.newChange };
              }
            } else if (newFile[0][key].length < oldFile[0][key].length) {
              let dataTable = checkTable(newFile[0][key], oldFile[0][key]);
              if (dataTable.oldChange.length > 0 || dataTable.newChange.length > 0) {
                invoiceOld = { ...invoiceOld, [key]: dataTable.newChange };
                invoiceNew = { ...invoiceNew, [key]: dataTable.oldChange };
              }
            }
          }
        } else {
          let oldChange = {};
          let newChange = {};
          // let oldChange1 = {};
          // let newChange1 = {};
          for (let i = 0; i < newFile[0][key].length; i++) {
            //ตรวจสอบ ค่าภายใน item ว่าเป็น obj หรือ สตริง หรือ อื่น ๆ
            if (typeof newFile[0][key][i] === "object" && typeof oldFile[0][key][i] === "object") {
              //นำ key ภายใน item ออกมาเพื่อตรวจสอบ (ชั้น 2)
              for (let keyArr in newFile[0][key][i]) {
                //ตรวจสอบ ค่าที่มี key ตามที่นำออกมาว่าเป็น obj หรือ สตริง หรือ อื่น ๆ
                if (typeof newFile[0][key][i][keyArr] === "object" && typeof oldFile[0][key][i][keyArr] === "object") {
                  //ตรวจสอบว่าเป็น Array หรือไม่
                  if (Array.isArray(newFile[0][key][i][keyArr]) && Array.isArray(oldFile[0][key][i][keyArr])) {
                    //ตรวจสอบว่าขนาด array เท่ากันไหม
                    if (
                      (newFile[0][key][i][keyArr].length > 1 && oldFile[0][key][i][keyArr].length > 1) ||
                      (newFile[0][key][i][keyArr].length === 1 && oldFile[0][key][i][keyArr].length > 1) ||
                      (newFile[0][key][i][keyArr].length > 1 && oldFile[0][key][i][keyArr].length === 1)
                    ) {
                      if (newFile[0][key][i][keyArr].length === oldFile[0][key][i][keyArr].length) {
                        let dataTable = checkTable(oldFile[0][key][i][keyArr], newFile[0][key][i][keyArr]);
                        if (dataTable.oldChange.length > 0 || dataTable.newChange.length > 0) {
                          oldChange = { ...oldChange, [keyArr]: dataTable.oldChange };
                          newChange = { ...newChange, [keyArr]: dataTable.newChange };
                        }
                      } else {
                        if (newFile[0][key][i][keyArr].length > oldFile[0][key][i][keyArr].length) {
                          let dataTable = checkTable(oldFile[0][key][i][keyArr], newFile[0][key][i][keyArr]);
                          if (dataTable.oldChange.length > 0 || dataTable.newChange.length > 0) {
                            oldChange = { ...oldChange, [keyArr]: dataTable.oldChange };
                            newChange = { ...newChange, [keyArr]: dataTable.newChange };
                          }
                        } else if (newFile[0][key][i][keyArr].length < oldFile[0][key][i][keyArr].length) {
                          let dataTable = checkTable(newFile[0][key][i][keyArr], oldFile[0][key][i][keyArr]);
                          if (dataTable.oldChange.length > 0 || dataTable.newChange.length > 0) {
                            oldChange = { ...oldChange, [keyArr]: dataTable.newChange };
                            newChange = { ...newChange, [keyArr]: dataTable.oldChange };
                          }
                        }
                      }
                    } else {
                      for (let j = 0; j < newFile[0][key][i][keyArr].length; j++) {
                        //ตรวจสอบ ค่าภายใน item (ชั้นที่ 2) ว่าเป็น obj หรือ สตริง หรือ อื่น ๆ
                        if (
                          typeof newFile[0][key][i][keyArr][j] === "object" &&
                          typeof oldFile[0][key][i][keyArr][j] === "object"
                        ) {
                          let oldChange1 = {};
                          let newChange1 = {};
                          //นำ key ภายใน item ออกมาเพื่อตรวจสอบ (ชั้น 3)
                          for (let keyValue in newFile[0][key][i][keyArr][j]) {
                            //ตรวจสอบ ค่าที่มี key ตามที่นำออกมาว่าเป็น obj หรือ สตริง หรือ อื่น ๆ
                            if (
                              typeof newFile[0][key][i][keyArr][j][keyValue] === "object" &&
                              typeof oldFile[0][key][i][keyArr][j][keyValue] === "object"
                            ) {
                              let dataAttribute = checkObject(
                                oldFile[0][key][i][keyArr][j][keyValue],
                                newFile[0][key][i][keyArr][j][keyValue]
                              );
                              if (
                                Object.keys(dataAttribute.old_value).length > 0 ||
                                Object.keys(dataAttribute.current_value).length > 0
                              ) {
                                oldChange1 = { ...oldChange1, [keyValue]: dataAttribute.old_value };
                                newChange1 = { ...newChange1, [keyValue]: dataAttribute.current_value };
                              }
                            } else if (
                              (typeof newFile[0][key][i][keyArr][j][keyValue] === "string" &&
                                typeof oldFile[0][key][i][keyArr][j][keyValue] === "object") ||
                              (typeof newFile[0][key][i][keyArr][j][keyValue] === "object" &&
                                typeof oldFile[0][key][i][keyArr][j][keyValue] === "string")
                            ) {
                              if (typeof newFile[0][key][i][keyArr][j][keyValue] === "string") {
                                oldChange1 = { ...oldChange1, [keyValue]: oldFile[0][key][i][keyArr][j][keyValue] };
                                newChange1 = { ...newChange1, [keyValue]: [newFile[0][key][i][keyArr][j][keyValue]] };
                              } else if (typeof oldFile[0][key][i][keyArr][j][keyValue] === "string") {
                                oldChange1 = { ...oldChange1, [keyValue]: [oldFile[0][key][i][keyArr][j][keyValue]] };
                                newChange1 = { ...newChange1, [keyValue]: newFile[0][key][i][keyArr][j][keyValue] };
                              }
                            } else if (
                              typeof newFile[0][key][i][keyArr][j][keyValue] === "string" &&
                              typeof oldFile[0][key][i][keyArr][j][keyValue] === "string"
                            ) {
                              if (newFile[0][key][i][keyArr][j][keyValue] !== oldFile[0][key][i][keyArr][j][keyValue]) {
                                oldChange1 = { ...oldChange1, [keyValue]: [oldFile[0][key][i][keyArr][j][keyValue]] };
                                newChange1 = { ...newChange1, [keyValue]: [newFile[0][key][i][keyArr][j][keyValue]] };
                              }
                            }
                          }
                          //เก็บค่าชั้น 3
                          if (Object.keys(oldChange1).length > 0 || Object.keys(newChange1).length > 0) {
                            oldChange = { ...oldChange, [keyArr]: oldChange1 };
                            newChange = { ...newChange, [keyArr]: newChange1 };
                          }
                        } else if (
                          (typeof newFile[0][key][i][keyArr][j] === "string" &&
                            typeof oldFile[0][key][i][keyArr][j] === "object") ||
                          (typeof newFile[0][key][i][keyArr][j] === "object" &&
                            typeof oldFile[0][key][i][keyArr][j] === "string")
                        ) {
                          if (typeof newFile[0][key][i][keyArr][j] === "string") {
                            oldChange = { ...oldChange, [keyArr]: oldFile[0][key][i][keyArr][j] };
                            newChange = { ...newChange, [keyArr]: [newFile[0][key][i][keyArr][j]] };
                          } else if (typeof oldFile[0][key][i][keyArr][j] === "string") {
                            oldChange = { ...oldChange, [keyArr]: [oldFile[0][key][i][keyArr][j]] };
                            newChange = { ...newChange, [keyArr]: newFile[0][key][i][keyArr][j] };
                          }
                        } else if (
                          typeof newFile[0][key][i][keyArr][j] === "string" &&
                          typeof oldFile[0][key][i][keyArr][j] === "string"
                        ) {
                          if (newFile[0][key][i][keyArr][j] !== oldFile[0][key][i][keyArr][j]) {
                            oldChange = { ...oldChange, [keyArr]: [oldFile[0][key][i][keyArr][j]] };
                            newChange = { ...newChange, [keyArr]: [newFile[0][key][i][keyArr][j]] };
                          }
                        }
                      }
                    }
                  } else if (Array.isArray(newFile[0][key][i][keyArr]) || Array.isArray(oldFile[0][key][i][keyArr])) {
                    oldChange = { ...oldChange, [keyArr]: oldFile[0][key][i][keyArr] };
                    newChange = { ...newChange, [keyArr]: newFile[0][key][i][keyArr] };
                  } else {
                    let dataAttribute = checkObject(oldFile[0][key][i][keyArr], newFile[0][key][i][keyArr]);
                    if (
                      Object.keys(dataAttribute.old_value).length > 0 ||
                      Object.keys(dataAttribute.current_value).length > 0
                    ) {
                      oldChange = { ...oldChange, [keyArr]: dataAttribute.old_value };
                      newChange = { ...newChange, [keyArr]: dataAttribute.current_value };
                    }
                  }
                } else if (
                  (typeof newFile[0][key][i][keyArr] === "string" && typeof oldFile[0][key][i][keyArr] === "object") ||
                  (typeof newFile[0][key][i][keyArr] === "object" && typeof oldFile[0][key][i][keyArr] === "string")
                ) {
                  if (typeof newFile[0][key][i][keyArr] === "string") {
                    oldChange = { ...oldChange, [keyArr]: oldFile[0][key][i][keyArr] };
                    newChange = { ...newChange, [keyArr]: [newFile[0][key][i][keyArr]] };
                  } else if (typeof oldFile[0][key][i][keyArr] === "string") {
                    oldChange = { ...oldChange, [keyArr]: [oldFile[0][key][i][keyArr]] };
                    newChange = { ...newChange, [keyArr]: newFile[0][key][i][keyArr] };
                  }
                } else if (
                  typeof newFile[0][key][i][keyArr] === "string" &&
                  typeof newFile[0][key][i][keyArr] === "string"
                ) {
                  if (newFile[0][key][i][keyArr] !== oldFile[0][key][i][keyArr]) {
                    oldChange = { ...oldChange, [keyArr]: [oldFile[0][key][i][keyArr]] };
                    newChange = { ...newChange, [keyArr]: [newFile[0][key][i][keyArr]] };
                  }
                }
              }
            } else if (
              (typeof newFile[0][key][i] === "string" && typeof oldFile[0][key][i] === "object") ||
              (typeof newFile[0][key][i] === "object" && typeof oldFile[0][key][i] === "string")
            ) {
              if (typeof newFile[0][key][i] === "string") {
                oldChange = { ...oldChange, [key]: oldFile[0][key][i] };
                newChange = { ...newChange, [key]: [newFile[0][key][i]] };
              } else if (typeof oldFile[0][key][i] === "string") {
                oldChange = { ...oldChange, [key]: [oldFile[0][key][i]] };
                newChange = { ...newChange, [key]: newFile[0][key][i] };
              }
            } else if (typeof newFile[0][key][i] === "string" && typeof oldFile[0][key][i] === "string") {
              if (newFile[0][key][i] !== oldFile[0][key][i]) {
                oldChange = { ...oldChange, [key]: [oldFile[0][key][i]] };
                newChange = { ...newChange, [key]: [newFile[0][key][i]] };
              }
            }
          }
          if (Object.keys(oldChange).length > 0 || Object.keys(newChange).length > 0) {
            invoiceOld = { ...invoiceOld, [key]: oldChange };
            invoiceNew = { ...invoiceNew, [key]: newChange };
          }
        }
      }
    }
    // console.log("old");
    // console.log(invoiceOld);
    // console.log("new");
    // console.log(invoiceNew);

    let dataOldChanged = { [Object.keys(oData)[1]]: invoiceOld };
    let dataNewChanged = { [Object.keys(data[Object.keys(data)[0]])[1]]: invoiceNew };
    // console.log("old");
    // console.log(JSON.stringify(dataOldChanged));
    // console.log("new");
    // console.log(JSON.stringify(dataNewChanged));
    await LogVerification.update(
      { oldValue: JSON.stringify(dataOldChanged), currentValue: JSON.stringify(dataNewChanged) },
      { where: { id: req.body.logVerifyId } }
    );

    res.status(200).json({ message: "Updated XML success." });
  } catch (err) {
    next(err);
  }
};
