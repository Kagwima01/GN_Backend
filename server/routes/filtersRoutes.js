const express = require("express");
const Product = require("../models/Product");

const filtersRoutes = express.Router();

//get product category names
const getProductsCategories = async (req, res) => {
  try {
    const categories = await Product.distinct("category");
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//get product brand names
const getProductsBrands = async (req, res) => {
  try {
    const brands = await Product.distinct("brand");
    res.json(brands);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

filtersRoutes.route("/categories").get(getProductsCategories);
filtersRoutes.route("/brands").get(getProductsBrands);

module.exports = filtersRoutes;
