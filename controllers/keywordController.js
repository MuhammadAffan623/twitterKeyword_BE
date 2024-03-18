const KeywordModel = require("../models/keywordModel");

const addNewKeyword = async (req, res) => {
  console.log("req.user :", req.user);
  if (req?.user?.role !== "ADMIN") {
    res.status(401);
    throw new Error("Only admin can create keyword");
  }
  try {
    const { keyword } = req.body;
    // Create a new keyword document
    const newKeyword = await KeywordModel.create({
      keyword,
    });
    return res.status(201).json(newKeyword);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
const updateKeyword = async (req, res) => {
  if (req?.user?.role !== "ADMIN") {
    res.status(401);
    throw new Error("Only admin can");
  }
  try {
    const keywordId = req.params.keywordId;
    const { keyword } = req.body;
    // Find and update the keyword document
    const updatedKeyword = await KeywordModel.findByIdAndUpdate(
      keywordId,
      {
        keyword,
      },
      { new: true }
    ); // Return the updated document
    return res.json(updatedKeyword);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteKeyword = async (req, res) => {
  if (req?.user?.role !== "ADMIN") {
    res.status(401);
    throw new Error("Only admin can");
  }
  try {
    const keywordId = req.params.keywordId;
    // Find and delete the keyword document
    await KeywordModel.findByIdAndDelete(keywordId);
    res.json({ message: "Keyword deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getKeyword = async (req, res) => {
  try {
    const keyword = await KeywordModel.findOne({}).sort({ createdAt: -1 });
    res.status(200).json(keyword);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  addNewKeyword,
  updateKeyword,
  deleteKeyword,
  getKeyword,
};
