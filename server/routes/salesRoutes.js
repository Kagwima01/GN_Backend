const express = require("express");
const asyncHandler = require("express-async-handler");
const Sale = require("../models/Sale");
const Product = require("../models/Product");
const { admin, protectRoute } = require("../middleware/authMiddleware");

const salesRoutes = express.Router();

const getSales = async (req, res) => {
  const sales = await Sale.find({}).sort({ createdAt: -1 });
  res.json(sales);
};

const deleteSale = asyncHandler(async (req, res) => {
  const sale = await Sale.findByIdAndDelete(req.params.id);

  if (sale) {
    res.json(sale);
  } else {
    res.status(404).send("Sales not found.");
    throw new Error("Sales not found.");
  }
});

const confirmSales = async (req, res) => {
  const data = req.body;
  let lineItems = [];
  data.salesItems.forEach((item) => {
    lineItems.push({
      quantity: item.qty,
    });
  });
  const sale = new Sale({
    salesItems: data.salesItems,
    user: data.userInfo._id,
    username: data.userInfo.name,
    email: data.userInfo.email,
    subtotal: data.subtotal,
    totalPrice: Number(data.subtotal),
  });
  const newSale = await sale.save();
  data.salesItems.forEach(async (saleItem) => {
    let product = await Product.findById(saleItem.id);
    product.stock = product.stock - saleItem.qty;
    product.save();
  });
  res.send(
    JSON.stringify({
      saleId: newSale._id.toString(),
    })
  );
};

const setConfirmed = asyncHandler(async (req, res) => {
  const sale = await Sale.findById(req.params.id);
  if (sale) {
    sale.isConfirmed = true;
    const updateSale = await sale.save();
    res.json(updateSale);
  } else {
    res.status(404).send("Sale could not be uploaded.");
    throw new Error("Sale could not be updated.");
  }
});

salesRoutes.route("/").get(protectRoute, admin, getSales);
salesRoutes.route("/:id").delete(protectRoute, admin, deleteSale);
salesRoutes.route("/confirm-sale/:id").put(protectRoute, admin, setConfirmed);
salesRoutes.route("/confirm-sales").post(protectRoute, confirmSales);

module.exports = salesRoutes;
