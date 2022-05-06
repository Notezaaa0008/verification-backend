exports.getData = async (req, res, next) => {
  try {
    res.status(200).send("hello world");
  } catch (err) {}
};
