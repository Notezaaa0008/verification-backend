const { User } = require("../models");

exports.register = async (req, res, next) => {
  try {
    let { firstName, lastName, email, employeeId, department, roleId } = req.body;
    let register = await User.create({
      firstName,
      lastName,
      email,
      employeeId,
      department,
      roleId
    });
    res.status(201).json({ message: "register success", register });
  } catch (err) {
    next(err);
  }
};
