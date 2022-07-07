const { User, Role } = require("../models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

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

exports.loginAndRegister = async (req, res, next) => {
  try {
    const { firstName, lastName, email, employeeId, department, roleId } = req.body;
    let checkUser = await User.findOne({
      where: { employeeId },
      include: [{ model: Role, attributes: ["roleName", "roleDescription", "permission"] }]
    });
    if (checkUser) {
      const payload = {
        id: checkUser.id,
        email: checkUser.email,
        firstName: checkUser.firstName,
        lastName: checkUser.lastName,
        department: checkUser.department,
        roleId: checkUser.roleId,
        role: checkUser.Role.roleName,
        roleDescription: checkUser.Role.roleDescription,
        rolePermission: checkUser.Role.rolePermission
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: process.env.JWT_EXPIRES_IN });
      res.status(200).json({ token, message: "login successfully" });
    } else {
      let register = await User.create({
        firstName,
        lastName,
        email,
        employeeId,
        department,
        roleId
      });
      let role = await Role.findOne({
        where: { id: register.roleId }
      });
      const payload = {
        id: register.id,
        email: register.email,
        firstName: register.firstName,
        lastName: register.lastName,
        department: register.department,
        roleId: register.roleId,
        role: role.roleName,
        roleDescription: role.roleDescription,
        rolePermission: role.rolePermission
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: process.env.JWT_EXPIRES_IN });
      res.status(200).json({ token, message: "login successfully" });
    }
  } catch (err) {
    next(err);
  }
};
