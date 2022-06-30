const { LogKmp, User } = require("../models");
const { Op } = require("sequelize");

exports.createLog = async (req, res, next) => {
  try {
    let { statusKmp, userId, projectName, documentName } = req.body;
    let create = await LogKmp.create({ statusKmp, userId, projectName, documentName });
    res.status(201).json(create);
  } catch (err) {
    next(err);
  }
};

exports.getLog = async (req, res, next) => {
  try {
    let { params } = req.params;
    let data = await LogKmp.findAll({
      include: [{ model: User, attributes: ["firstName", "lastName", "department"] }]
    });
    if (data.length > 0) {
      let userRank = [];
      let departmentRank = [];
      let statusKmp = [];
      let sendToKmp = [];

      let compare = (a, b) => {
        if (a.upload > b.upload) return -1;
        if (a.upload == b.upload) return 0;
        if (a.upload < b.upload) return 1;
      };

      data.forEach(item => {
        if (sendToKmp.length === 0) {
          sendToKmp = [
            ...sendToKmp,
            {
              date: `${item.updatedAt.getFullYear()}${
                item.updatedAt.getMonth() < 9 ? "0" + (item.updatedAt.getMonth() + 1) : item.updatedAt.getMonth() + 1
              }${item.updatedAt.getDate()}`,
              numOfSend: 1
            }
          ];
        } else {
          let exist = sendToKmp.filter(
            ele =>
              ele.date.slice(0, 4) === `${item.updatedAt.getFullYear()}` &&
              ele.date.slice(4, 6) ===
                `${
                  item.updatedAt.getMonth() < 9 ? "0" + (item.updatedAt.getMonth() + 1) : item.updatedAt.getMonth() + 1
                }`
          );
          if (exist.length > 0) {
            exist[0].numOfSend = +exist[0].numOfSend + 1;
          } else {
            sendToKmp = [
              ...sendToKmp,
              {
                date: `${item.updatedAt.getFullYear()}${
                  item.updatedAt.getMonth() < 9 ? "0" + (item.updatedAt.getMonth() + 1) : item.updatedAt.getMonth() + 1
                }${item.updatedAt.getDate()}`,
                numOfSend: 1
              }
            ];
          }
        }

        if (statusKmp.length === 0) {
          statusKmp = [
            ...statusKmp,
            {
              date: `${item.updatedAt.getFullYear()}${
                item.updatedAt.getMonth() < 9 ? "0" + (item.updatedAt.getMonth() + 1) : item.updatedAt.getMonth() + 1
              }${item.updatedAt.getDate()}`,
              success: item.statusKmp.toLowerCase() === "success" ? 1 : 0,
              fail: item.statusKmp.toLowerCase() === "fail" ? 1 : 0,
              inprogress: item.statusKmp.toLowerCase() === "inprogress" ? 1 : 0
            }
          ];
        } else {
          let exist = statusKmp.filter(
            ele =>
              ele.date.slice(0, 4) === `${item.updatedAt.getFullYear()}` &&
              ele.date.slice(4, 6) ===
                `${
                  item.updatedAt.getMonth() < 9 ? "0" + (item.updatedAt.getMonth() + 1) : item.updatedAt.getMonth() + 1
                }`
          );
          if (exist.length > 0) {
            exist[0][item.statusKmp.toLowerCase()] = +exist[0][item.statusKmp.toLowerCase()] + 1;
          } else {
            statusKmp = [
              ...statusKmp,
              {
                date: `${item.updatedAt.getFullYear()}${
                  item.updatedAt.getMonth() < 9 ? "0" + (item.updatedAt.getMonth() + 1) : item.updatedAt.getMonth() + 1
                }${item.updatedAt.getDate()}`,
                success: item.statusKmp.toLowerCase() === "success" ? 1 : 0,
                fail: item.statusKmp.toLowerCase() === "fail" ? 1 : 0,
                inprogress: item.statusKmp.toLowerCase() === "inprogress" ? 1 : 0
              }
            ];
          }
        }

        if (userRank.length === 0) {
          userRank = [
            ...userRank,
            {
              date: `${item.updatedAt.getFullYear()}${
                item.updatedAt.getMonth() < 9 ? "0" + (item.updatedAt.getMonth() + 1) : item.updatedAt.getMonth() + 1
              }${item.updatedAt.getDate()}`,
              user: [{ name: `${item.User.firstName} ${item.User.lastName}`, upload: 1 }]
            }
          ];
        } else {
          let exist = userRank.filter(
            ele =>
              ele.date.slice(0, 4) === `${item.updatedAt.getFullYear()}` &&
              ele.date.slice(4, 6) ===
                `${
                  item.updatedAt.getMonth() < 9 ? "0" + (item.updatedAt.getMonth() + 1) : item.updatedAt.getMonth() + 1
                }`
          );
          if (exist.length > 0) {
            let user = exist[0].user.filter(val => val.name === `${item.User.firstName} ${item.User.lastName}`);
            if (user.length > 0) {
              user[0].upload = +user[0].upload + 1;
            } else {
              exist[0].user = [...exist[0].user, { name: `${item.User.firstName} ${item.User.lastName}`, upload: 1 }];
            }
          } else {
            userRank = [
              ...userRank,
              {
                date: `${item.updatedAt.getFullYear()}${
                  item.updatedAt.getMonth() < 9 ? "0" + (item.updatedAt.getMonth() + 1) : item.updatedAt.getMonth() + 1
                }${item.updatedAt.getDate()}`,
                user: [{ name: `${item.User.firstName} ${item.User.lastName}`, upload: 1 }]
              }
            ];
          }
        }

        if (departmentRank.length === 0) {
          departmentRank = [
            ...departmentRank,
            {
              date: `${item.updatedAt.getFullYear()}${
                item.updatedAt.getMonth() < 9 ? "0" + (item.updatedAt.getMonth() + 1) : item.updatedAt.getMonth() + 1
              }${item.updatedAt.getDate()}`,
              department: [{ departmentName: `${item.User.department}`, upload: 1 }]
            }
          ];
        } else {
          let exist = departmentRank.filter(
            ele =>
              ele.date.slice(0, 4) === `${item.updatedAt.getFullYear()}` &&
              ele.date.slice(4, 6) ===
                `${
                  item.updatedAt.getMonth() < 9 ? "0" + (item.updatedAt.getMonth() + 1) : item.updatedAt.getMonth() + 1
                }`
          );
          if (exist.length > 0) {
            let department = exist[0].department.filter(val => val.departmentName === `${item.User.department}`);
            if (department.length > 0) {
              department[0].upload = +department[0].upload + 1;
            } else {
              exist[0].department = [...exist[0].department, { departmentName: `${item.User.department}`, upload: 1 }];
            }
          } else {
            departmentRank = [
              ...departmentRank,
              {
                date: `${item.updatedAt.getFullYear()}${
                  item.updatedAt.getMonth() < 9 ? "0" + (item.updatedAt.getMonth() + 1) : item.updatedAt.getMonth() + 1
                }${item.updatedAt.getDate()}`,
                department: [{ departmentName: `${item.User.department}`, upload: 1 }]
              }
            ];
          }
        }
      });

      let uploadRankByUser = userRank.sort(compare);
      if (uploadRankByUser.length > 10) {
        uploadRankByUser = uploadRankByUser.slice(0, 10);
      }
      let uploadRankByDepartment = departmentRank.sort(compare);
      if (uploadRankByDepartment.length > 10) {
        uploadRankByDepartment = uploadRankByDepartment.slice(0, 10);
      }
      if (params === "sendToKmp") {
        res.status(200).json({ sendToKmp });
      } else if (params === "summaryStatus") {
        res.status(200).json({ statusKmp });
      } else if (params === "userRank") {
        res.status(200).json({ uploadRankByUser });
      } else if (params === "departmentRank") {
        res.status(200).json({ uploadRankByDepartment });
      }
    } else {
      res.status(400).json({ message: "Not found data in log kmp" });
    }
  } catch (err) {
    next(err);
  }
};
