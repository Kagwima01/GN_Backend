const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    username: {
      type: String,
      required: true,
      ref: "User",
    },
    email: {
      type: String,
      required: true,
      ref: "User",
    },
    salesItems: [
      {
        name: { type: String, required: true },
        category: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        id: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
      },
    ],
    totalPrice: { type: Number, default: 0.0 },
    isConfirmed: { type: Boolean, required: true, default: false },
    confirmedAt: {
      type: Date,
    },
    subtotal: { type: Number, default: 0.0 },
  },
  { timestamps: true }
);

const Sale = mongoose.model("Sale", saleSchema);
module.exports = Sale;
