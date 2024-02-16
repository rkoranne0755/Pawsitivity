import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
  },
  manufacturingDate: {
    type: Date,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  description: String,
  productImage: {
    type: String,
    required: true,
  },
  cost: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    default: 10,
  },
});

export const Products = mongoose.model("Products", productSchema);
