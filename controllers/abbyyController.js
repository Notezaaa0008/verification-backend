const { StatusDocAbbyy } = require("../models");

exports.create = async (req, res, next) => {
  try {
    let { data } = req.body;

    data = data.map(element => {
      element.notificationStatus = false;
      element.status = element.status.toLowerCase();
      if (element.priority.toLowerCase() === "highnest") {
        element.priority = 5;
        return element;
      } else if (element.priority.toLowerCase() === "high") {
        element.priority = 4;
        return element;
      } else if (element.priority.toLowerCase() === "normal") {
        element.priority = 3;
        return element;
      } else if (element.priority.toLowerCase() === "low") {
        element.priority = 2;
        return element;
      } else if (element.priority.toLowerCase() === "lowest") {
        element.priority = 1;
        return element;
      }
    });
    let createStatus = await StatusDocAbbyy.bulkCreate(data);
    res.status(201).json({ message: "create success", createStatus });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    let { id, projectName, status } = req.body;
    let check = await StatusDocAbbyy.findAll({
      where: { id, projectName }
    });

    if (check.length < 1) {
      res.status(400).json({ message: `Not found ID: ${id} and project name: ${projectName}` });
    }
    await StatusDocAbbyy.update(
      {
        status,
        notificationStatus: false
      },
      { where: { id, projectName } }
    );
    res.status(200).json({ message: "update success" });
  } catch (err) {
    next(err);
  }
};
