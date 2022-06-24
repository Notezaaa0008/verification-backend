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
      where: { [Op.not]: [{ statusKmp: "inProgress" }] },
      include: [{ model: User, attributes: ["firstName", "lastName", "department"] }]
    });
    if (data.length > 0) {
      let success = data.filter(item => item.statusKmp.toLowerCase() === "success").length;
      let fail = data.filter(item => item.statusKmp.toLowerCase() === "fail").length;
      let userRank = [];
      let departmentRank = [];

      let compare = (a, b) => {
        if (a.upload > b.upload) return -1;
        if (a.upload == b.upload) return 0;
        if (a.upload < b.upload) return 1;
      };

      data.forEach(item => {
        if (userRank.length === 0) {
          userRank = [...userRank, { user: `${item.User.firstName} ${item.User.lastName}`, upload: 1 }];
        } else {
          let exist = userRank.filter(ele => ele.user === `${item.User.firstName} ${item.User.lastName}`);
          if (exist.length > 0) {
            exist[0].upload = +exist[0].upload + 1;
          } else {
            userRank.push({ user: `${item.User.firstName} ${item.User.lastName}`, upload: 1 });
          }
        }

        if (departmentRank.length === 0) {
          departmentRank = [...departmentRank, { department: `${item.User.department}`, upload: 1 }];
        } else {
          let exist = departmentRank.filter(ele => ele.department === `${item.User.department}`);
          if (exist.length > 0) {
            exist[0].upload = +exist[0].upload + 1;
          } else {
            departmentRank.push({ department: `${item.User.department}`, upload: 1 });
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
        res.status(200).json({ sendToKmp: "sendToKmp", num: data.length });
      } else if (params === "summaryStatus") {
        res.status(200).json({
          summaryStatus: [
            { status: "success", num: success },
            { status: "fail", num: fail }
          ]
        });
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
