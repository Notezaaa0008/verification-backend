exports.createLogSearch = async (req, res, next) => {
  try {
    const { searchText } = req.body;
    await LogSearch.create({
      userId: req.userId,
      searchText
    });
    res.status(201).json({ message: "create log search success" });
  } catch (err) {
    next(err);
  }
};

exports.updateLogSearch = async (req, res, next) => {
  try {
  } catch (err) {
    next(err);
  }
};

exports.getLogSearch = async (req, res, next) => {
  try {
  } catch (err) {
    next(err);
  }
};
