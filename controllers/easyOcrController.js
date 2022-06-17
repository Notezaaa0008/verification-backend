const { LogEasyOcr, User } = require("../models");

exports.getLog = async (req, res, next) => {
  try {
    let data = await LogEasyOcr.findAll({
      include: [{ model: User, attributes: ["firstName", "lastName", "department"] }]
    });

    if (data.length > 0) {
      let success = data.filter(item => item.statusOcr.toLowerCase() === "success").length;
      let fail = data.filter(item => item.statusOcr.toLowerCase() === "fail").length;
      let userRank = [];
      let departmentRank = [];
      let documentTypeRank = [];

      let compare = (a, b) => {
        if (a.upload > b.upload) return -1;
        if (a.upload == b.upload) return 0;
        if (a.upload < b.upload) return 1;
      };

      data.array.forEach(item => {
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

        if (documentTypeRank.length === 0) {
          documentTypeRank = [...documentTypeRank, { documentType: `${item.documentType}`, upload: 1 }];
        } else {
          let exist = documentTypeRank.filter(ele => ele.documentType === `${item.documentType}`);
          if (exist.length > 0) {
            exist[0].upload = +exist[0].upload + 1;
          } else {
            documentTypeRank.push({ documentType: `${item.documentType}`, upload: 1 });
          }
        }
      });

      let uploadRankByUser = userRank.sort(compare);
      let uploadRankByDepartment = departmentRank.sort(compare);
      let documentTypeRanks = documentTypeRank.sort(compare);
      res.status(200).json({ success, fail, userRank, uploadRankByUser, uploadRankByDepartment, documentTypeRanks });
    } else {
      res.status(400).json({ message: "Not found data in log easy OCR" });
    }
  } catch (err) {
    next(err);
  }
};
