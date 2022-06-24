const { Suggest } = require("../models");

exports.create = async (req, res, next) => {
  try {
    let { inCorrectWord, correctWord } = req.body;
    let create = await Suggest.create({ inCorrectWord, correctWord });
    res.status(201).json(create);
  } catch (err) {
    next(err);
  }
};

exports.getSuggest = async (req, res, next) => {
  try {
    let { inCorrectWord } = req.body;
    let word = await Suggest.findAll({ where: { inCorrectWord } });
    if (word.length > 0) {
      let correctWord = [];
      word.forEach(element => {
        correctWord.push(element.correctWord);
      });
      res.status(200).json(correctWord);
    } else {
      res.status(400).json(null);
    }
  } catch (err) {
    next(err);
  }
};
