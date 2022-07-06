const { LogEasyOcr, User } = require("../models");
const { Op } = require("sequelize");
const cron = require("node-cron");

exports.createLog = async (req, res, next) => {
  try {
    let { statusOcr, documentType, userId, projectName, documentName } = req.body;
    let create = await LogEasyOcr.create({ statusOcr, documentType, userId, projectName, documentName });
    res.status(201).json(create);
  } catch (err) {
    next(err);
  }
};

exports.getLog = async (req, res, next) => {
  try {
    let { params } = req.params;
    let data = await LogEasyOcr.findAll({
      include: [{ model: User, attributes: ["firstName", "lastName", "department"] }]
    });

    if (data.length > 0) {
      let compare = (a, b) => {
        if (a.upload > b.upload) return -1;
        if (a.upload == b.upload) return 0;
        if (a.upload < b.upload) return 1;
      };

      if (params === "userRank") {
        let userRank = [];
        data.forEach(item => {
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
                    item.updatedAt.getMonth() < 9
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
                    item.updatedAt.getMonth() < 9
                      ? "0" + (item.updatedAt.getMonth() + 1)
                      : item.updatedAt.getMonth() + 1
                  }${item.updatedAt.getDate()}`,
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
                    item.updatedAt.getMonth() < 9
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
                    item.updatedAt.getMonth() < 9
                      ? "0" + (item.updatedAt.getMonth() + 1)
                      : item.updatedAt.getMonth() + 1
                  }${item.updatedAt.getDate()}`,
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
      } else if (params === "documentTypeRanks") {
        let documentTypeRank = [];
        data.forEach(item => {
          if (documentTypeRank.length === 0) {
            documentTypeRank = [
              ...documentTypeRank,
              {
                date: `${item.updatedAt.getFullYear()}${
                  item.updatedAt.getMonth() < 9 ? "0" + (item.updatedAt.getMonth() + 1) : item.updatedAt.getMonth() + 1
                }${item.updatedAt.getDate()}`,
                documentType: [{ typeName: `${item.documentType}`, upload: 1 }]
              }
            ];
          } else {
            let exist = documentTypeRank.filter(
              ele =>
                ele.date.slice(0, 4) === `${item.updatedAt.getFullYear()}` &&
                ele.date.slice(4, 6) ===
                  `${
                    item.updatedAt.getMonth() < 9
                      ? "0" + (item.updatedAt.getMonth() + 1)
                      : item.updatedAt.getMonth() + 1
                  }`
            );
            if (exist.length > 0) {
              let documentType = exist[0].documentType.filter(val => val.typeName === `${item.documentType}`);
              if (documentType.length > 0) {
                documentType[0].upload = +documentType[0].upload + 1;
              } else {
                exist[0].documentType = [...exist[0].documentType, { typeName: `${item.documentType}`, upload: 1 }];
              }
            } else {
              documentTypeRank = [
                ...documentTypeRank,
                {
                  date: `${item.updatedAt.getFullYear()}${
                    item.updatedAt.getMonth() < 9
                      ? "0" + (item.updatedAt.getMonth() + 1)
                      : item.updatedAt.getMonth() + 1
                  }${item.updatedAt.getDate()}`,
                  documentType: [{ typeName: `${item.documentType}`, upload: 1 }]
                }
              ];
            }
          }
        });
        let documentTypeRanks = documentTypeRank.sort(compare);
        documentTypeRanks.forEach(item => {
          if (item.documentType.length > 10) {
            item.documentType = item.documentType.slice(0, 10);
          }
        });
        res.status(200).json({ documentTypeRanks });
      } else if (params === "summaryStatus") {
        let status = [];
        data.forEach(item => {
          if (status.length === 0) {
            status = [
              ...status,
              {
                date: `${item.updatedAt.getFullYear()}${
                  item.updatedAt.getMonth() < 9 ? "0" + (item.updatedAt.getMonth() + 1) : item.updatedAt.getMonth() + 1
                }${item.updatedAt.getDate()}`,
                success: item.statusOcr.toLowerCase() === "success" ? 1 : 0,
                fail: item.statusOcr.toLowerCase() === "fail" ? 1 : 0,
                inprogress: item.statusOcr.toLowerCase() === "inprogress" ? 1 : 0
              }
            ];
          } else {
            let exist = status.filter(
              ele =>
                ele.date.slice(0, 4) === `${item.updatedAt.getFullYear()}` &&
                ele.date.slice(4, 6) ===
                  `${
                    item.updatedAt.getMonth() < 9
                      ? "0" + (item.updatedAt.getMonth() + 1)
                      : item.updatedAt.getMonth() + 1
                  }`
            );
            if (exist.length > 0) {
              exist[0][item.statusOcr.toLowerCase()] = +exist[0][item.statusOcr.toLowerCase()] + 1;
            } else {
              status = [
                ...status,
                {
                  date: `${item.updatedAt.getFullYear()}${
                    item.updatedAt.getMonth() < 9
                      ? "0" + (item.updatedAt.getMonth() + 1)
                      : item.updatedAt.getMonth() + 1
                  }${item.updatedAt.getDate()}`,
                  success: item.statusOcr.toLowerCase() === "success" ? 1 : 0,
                  fail: item.statusOcr.toLowerCase() === "fail" ? 1 : 0,
                  inprogress: item.statusOcr.toLowerCase() === "inprogress" ? 1 : 0
                }
              ];
            }
          }
        });
        res.status(200).json({ status });
      }
    } else {
      res.status(400).json({ message: "Not found data in log easy OCR" });
    }
  } catch (err) {
    next(err);
  }
};
