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

exports.getLogSearch = async (req, res, next) => {
  try {
    let logSearch = await LogSearch.findAll();
    res.status(200).json(logSearch);
  } catch (err) {
    next(err);
  }
};
