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
      let compare = (a, b) => {
        if (a.upload > b.upload) return -1;
        if (a.upload == b.upload) return 0;
        if (a.upload < b.upload) return 1;
      };

      if (params === "sendToKmp") {
        let sendToKmp = [];
        data.forEach(item => {
          if (sendToKmp.length === 0) {
            sendToKmp = [
              ...sendToKmp,
              {
                date: `${item.updatedAt.getFullYear()}${
                  item.updatedAt.getMonth() < 10 ? "0" + (item.updatedAt.getMonth() + 1) : item.updatedAt.getMonth() + 1
                }${item.updatedAt.getDate() < 10 ? "0" + item.updatedAt.getDate() : item.updatedAt.getDate()}`,
                numOfSend: 1
              }
            ];
          } else {
            let exist = sendToKmp.filter(
              ele =>
                ele.date.slice(0, 4) === `${item.updatedAt.getFullYear()}` &&
                ele.date.slice(4, 6) ===
                  `${
                    item.updatedAt.getMonth() < 10
                      ? "0" + (item.updatedAt.getMonth() + 1)
                      : item.updatedAt.getMonth() + 1
                  }`
            );
            if (exist.length > 0) {
              exist[0].numOfSend = +exist[0].numOfSend + 1;
            } else {
              sendToKmp = [
                ...sendToKmp,
                {
                  date: `${item.updatedAt.getFullYear()}${
                    item.updatedAt.getMonth() < 10
                      ? "0" + (item.updatedAt.getMonth() + 1)
                      : item.updatedAt.getMonth() + 1
                  }${item.updatedAt.getDate() < 10 ? "0" + item.updatedAt.getDate() : item.updatedAt.getDate()}`,
                  numOfSend: 1
                }
              ];
            }
          }
        });
        res.status(200).json({ sendToKmp });
      } else if (params === "summaryStatus") {
        let statusKmp = [];
        data.forEach(item => {
          if (statusKmp.length === 0) {
            statusKmp = [
              ...statusKmp,
              {
                date: `${item.updatedAt.getFullYear()}${
                  item.updatedAt.getMonth() < 10 ? "0" + (item.updatedAt.getMonth() + 1) : item.updatedAt.getMonth() + 1
                }${item.updatedAt.getDate() < 10 ? "0" + item.updatedAt.getDate() : item.updatedAt.getDate()}`,
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
                    item.updatedAt.getMonth() < 10
                      ? "0" + (item.updatedAt.getMonth() + 1)
                      : item.updatedAt.getMonth() + 1
                  }`
            );
            if (exist.length > 0) {
              exist[0][item.statusKmp.toLowerCase()] = +exist[0][item.statusKmp.toLowerCase()] + 1;
            } else {
              statusKmp = [
                ...statusKmp,
                {
                  date: `${item.updatedAt.getFullYear()}${
                    item.updatedAt.getMonth() < 10
                      ? "0" + (item.updatedAt.getMonth() + 1)
                      : item.updatedAt.getMonth() + 1
                  }${item.updatedAt.getDate() < 10 ? "0" + item.updatedAt.getDate() : item.updatedAt.getDate()}`,
                  success: item.statusKmp.toLowerCase() === "success" ? 1 : 0,
                  fail: item.statusKmp.toLowerCase() === "fail" ? 1 : 0,
                  inprogress: item.statusKmp.toLowerCase() === "inprogress" ? 1 : 0
                }
              ];
            }
          }
        });
        res.status(200).json({ statusKmp });
      } else if (params === "userRank") {
        let userRank = [];
        data.forEach(item => {
          if (userRank.length === 0) {
            userRank = [
              ...userRank,
              {
                date: `${item.updatedAt.getFullYear()}${
                  item.updatedAt.getMonth() < 10 ? "0" + (item.updatedAt.getMonth() + 1) : item.updatedAt.getMonth() + 1
                }${item.updatedAt.getDate() < 10 ? "0" + item.updatedAt.getDate() : item.updatedAt.getDate()}`,
                user: [{ name: `${item.User.firstName} ${item.User.lastName}`, upload: 1 }]
              }
            ];
          } else {
            let exist = userRank.filter(
              ele =>
                ele.date.slice(0, 4) === `${item.updatedAt.getFullYear()}` &&
                ele.date.slice(4, 6) ===
                  `${
                    item.updatedAt.getMonth() < 10
                      ? "0" + (item.updatedAt.getMonth() + 1)
                      : item.updatedAt.getMonth() + 1
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
                    item.updatedAt.getMonth() < 10
                      ? "0" + (item.updatedAt.getMonth() + 1)
                      : item.updatedAt.getMonth() + 1
                  }${item.updatedAt.getDate() < 10 ? "0" + item.updatedAt.getDate() : item.updatedAt.getDate()}`,
                  user: [{ name: `${item.User.firstName} ${item.User.lastName}`, upload: 1 }]
                }
              ];
            }
          }
        });
        let uploadRankByUser = userRank.sort(compare);
        uploadRankByUser.forEach(item => {
          if (item.user.length > 10) {
            item.user = item.user.slice(0, 10);
          }
        });
        res.status(200).json({ uploadRankByUser });
      } else if (params === "departmentRank") {
        let departmentRank = [];
        data.forEach(item => {
          if (departmentRank.length === 0) {
            departmentRank = [
              ...departmentRank,
              {
                date: `${item.updatedAt.getFullYear()}${
                  item.updatedAt.getMonth() < 10 ? "0" + (item.updatedAt.getMonth() + 1) : item.updatedAt.getMonth() + 1
                }${item.updatedAt.getDate() < 10 ? "0" + item.updatedAt.getDate() : item.updatedAt.getDate()}`,
                department: [{ departmentName: `${item.User.department}`, upload: 1 }]
              }
            ];
          } else {
            let exist = departmentRank.filter(
              ele =>
                ele.date.slice(0, 4) === `${item.updatedAt.getFullYear()}` &&
                ele.date.slice(4, 6) ===
                  `${
                    item.updatedAt.getMonth() < 10
                      ? "0" + (item.updatedAt.getMonth() + 1)
                      : item.updatedAt.getMonth() + 1
                  }`
            );
            if (exist.length > 0) {
              let department = exist[0].department.filter(val => val.departmentName === `${item.User.department}`);
              if (department.length > 0) {
                department[0].upload = +department[0].upload + 1;
              } else {
                exist[0].department = [
                  ...exist[0].department,
                  { departmentName: `${item.User.department}`, upload: 1 }
                ];
              }
            } else {
              departmentRank = [
                ...departmentRank,
                {
                  date: `${item.updatedAt.getFullYear()}${
                    item.updatedAt.getMonth() < 10
                      ? "0" + (item.updatedAt.getMonth() + 1)
                      : item.updatedAt.getMonth() + 1
                  }${item.updatedAt.getDate() < 10 ? "0" + item.updatedAt.getDate() : item.updatedAt.getDate()}`,
                  department: [{ departmentName: `${item.User.department}`, upload: 1 }]
                }
              ];
            }
          }
        });
        let uploadRankByDepartment = departmentRank.sort(compare);
        uploadRankByDepartment.forEach(item => {
          if (item.department.length > 10) {
            item.department = item.department.slice(0, 10);
          }
        });
        res.status(200).json({ uploadRankByDepartment });
      }
    } else {
      res.status(400).json({ message: "Not found data in log kmp" });
    }
  } catch (err) {
    next(err);
  }
};
