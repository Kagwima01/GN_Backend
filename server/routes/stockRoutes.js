const express = require("express");
const Product = require("../models/Product");
const { protectRoute, admin } = require("../middleware/authMiddleware");

const stockRoutes = express.Router();

const updateStock = async (req, res) => {
  const productId = req.params.id;
  const { stock } = req.body;

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $set: { stock } },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
    console.log(stock);
  }
};

stockRoutes.route("/update/:id").put(protectRoute, admin, updateStock);

module.exports = stockRoutes;
