const { LogKmp, User } = require("../models");

exports.getLog = async (req, res, next) => {
  try {
    let data = await LogKmp.findAll({
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
      let uploadRankByDepartment = departmentRank.sort(compare);
      res.status(200).json({ sendToKmp: data.length, success, fail, uploadRankByUser, uploadRankByDepartment });
    } else {
      res.status(400).json({ message: "Not found data in log kmp" });
    }
  } catch (err) {
    next(err);
  }
};
