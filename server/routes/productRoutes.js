const express = require("express");
const Product = require("../models/Product");
const { protectRoute, admin } = require("../middleware/authMiddleware");
const asyncHandler = require("express-async-handler");

const productRoutes = express.Router();

//get all products
const getProducts = async (req, res) => {
  const page = parseInt(req.params.page); // 1, 2 or 3
  const perPage = parseInt(req.params.perPage); // 10

  const products = await Product.find({}).sort({ updatedAt: -1 });

  if (page && perPage) {
    const totalPages = Math.ceil(products.length / perPage);
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedProducts = products.slice(startIndex, endIndex);
    res.json({
      products: paginatedProducts,
      pagination: { currentPage: page, totalPages },
    });
  } else {
    res.json({ products, pagination: {} });
  }
};

//get new products
const getNewProducts = async (req, res) => {
  try {
    const newProducts = await Product.find({ productIsNew: true }).sort({
      createdAt: -1,
    });
    if (newProducts) {
      res.json(newProducts);
    } else {
      res.status(404).send("No new products found.");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//get a single product by id
const getProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    res.json(product);
  } else {
    res.status(404).send("Product not found.");
    throw new Error("Product not found");
  }
};

//get products by name
const getProductsByName = async (req, res) => {
  const name = req.params.name;

  try {
    const products = await Product.find({ name: name }).sort({
      updatedAt: -1,
    });
    if (products) {
      res.json(products);
    } else {
      res.status(404).send("No products found.");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
//get products by brand
const getProductsByBrand = async (req, res) => {
  const brand = req.params.brand;

  try {
    const products = await Product.find({ brand: brand }).sort({
      updatedAt: -1,
    });
    if (products) {
      res.json(products);
    } else {
      res.status(404).send("No products found.");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
//get products by category
const getProductsByCategory = async (req, res) => {
  try {
    const category = req.params.category;
    const products = await Product.find({ category: category }).sort({
      updatedAt: -1,
    });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Search for product
const searchProduct = async (req, res) => {
  try {
    const result = await Product.aggregate([
      {
        $search: {
          index: "gncyclemart",
          text: {
            query: req.params.key,
            path: {
              wildcard: "*",
            },
          },
        },
      },
    ]);
    res.status(200).json(result);
    console.log(result.length);
  } catch (error) {
    res.status(404).json("Couldn't find the product");
  }
};

const getOutOfStock = async (req, res) => {
  const stock = req.params.stock;

  try {
    const zeroStockProducts = await Product.find({ stock: stock });
    res.json(zeroStockProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//create new product
const createNewProduct = asyncHandler(async (req, res) => {
  const {
    name,
    images,
    brand,
    category,
    description,
    buyingPrice,
    sellingPrice,
    stock,
    productIsNew,
  } = req.body;

  const newProduct = await Product.create({
    name,
    images,
    brand,
    category,
    description,
    buyingPrice,
    sellingPrice,
    stock,
    productIsNew,
  });

  await newProduct.save();

  const products = await Product.find({});

  if (newProduct) {
    res.json(products);
  } else {
    res.status(404).send("Product could not be uploaded.");
    throw new Error("Product could not be uploaded.");
  }
});

//update a product
const updateProduct = asyncHandler(async (req, res) => {
  const {
    name,
    imageOne,
    imageTwo,
    brand,
    category,
    description,
    buyingPrice,
    sellingPrice,
    stock,
    productIsNew,
    id,
  } = req.body;

  const product = await Product.findById(id);

  if (product) {
    product.name = name;
    product.images = [imageOne, imageTwo];
    product.brand = brand;
    product.category = category;
    product.description = description;
    product.buyingPrice = buyingPrice;
    product.sellingPrice = sellingPrice;
    product.stock = stock;
    product.productIsNew = productIsNew;

    await product.save();

    const products = await Product.find({});

    res.json(products);
  } else {
    res.status(404).send("Product not found.");
    throw new Error("Product not found.");
  }
});

//delete a product
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (product) {
    res.json(product);
  } else {
    res.status(404).send("Product not found.");
    throw new Error("Product not found.");
  }
});

productRoutes.route("/out/:stock").get(protectRoute, admin, getOutOfStock);
//get products by name
productRoutes.route("/name/:name").get(getProductsByName);
//get products by brand
productRoutes.route("/brand/:brand").get(getProductsByBrand);

//get products by category
productRoutes.route("/category/:category").get(getProductsByCategory);

//get all products
productRoutes.route("/").get(getProducts);
productRoutes.route("/new-products").get(getNewProducts);

//search for a product
productRoutes.route("/search/:key").get(searchProduct);

//get products with pagination
productRoutes.route("/:page/:perPage").get(getProducts);

//get single product
productRoutes.route("/:id").get(getProduct);
productRoutes.route("/:id").delete(protectRoute, admin, deleteProduct);
productRoutes.route("/").put(protectRoute, admin, updateProduct);
productRoutes.route("/").post(protectRoute, admin, createNewProduct);

module.exports = productRoutes;
