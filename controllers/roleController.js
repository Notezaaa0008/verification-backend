const { Role } = require("../models");

exports.create = async (req, res, next) => {
  try {
    let { role } = req.body;
    let createRoleSuccess = await Role.bulkCreate(role);
    res.status(201).json({ message: "create role success", createRoleSuccess });
  } catch (err) {
    next(err);
  }
};
