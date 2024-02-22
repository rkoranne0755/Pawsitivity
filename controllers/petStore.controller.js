import { asyncHandler } from "../utils/asyncHandler.js";
import { PetStore } from "../models/petStore.model.js";
import { Products } from "../models/products.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerPetStore = asyncHandler(async (req, res) => {
  const {
    storeName,
    ownerName,
    email,
    password,
    houseNo,
    street,
    colony,
    city,
    state,
    displayPicture,
    contactNo,
  } = req.body;

  console.log("req.body clear");

  [
    storeName,
    ownerName,
    email,
    password,
    houseNo,
    street,
    colony,
    city,
    state,
    contactNo,
    displayPicture,
  ].forEach((ele) => {
    if (ele === "" || ele === undefined) {
      throw new ApiError(400, "All fields are required!!!");
    }
  });

  console.log("validation Check!!!!");

  const existedUser = await PetStore.findOne({
    email,
  });

  if (existedUser) {
    throw new ApiError(409, "User with Email Exists!!!");
  }

  console.log("Checked if User Exists!!!");

  const petStore = await PetStore.create({
    storeName,
    ownerName,
    email,
    password,
    houseNo,
    street,
    colony,
    city,
    state,
    contactNo,
    displayPicture,
  });

  if (!petStore) {
    throw new ApiError(500, "Error while Creating petStore!!!");
  }

  console.log("Pet Store Registered Succesfully!!!");

  req.session.user = petStore;

  return res.redirect("/petStore/profile");
});

const loginPetStore = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!(email && password)) {
    throw new ApiError(400, "User Credentials Required!!!");
  }

  console.log("Pet Store: ", email, " ", password);

  const petStore = await PetStore.findOne({
    email,
  });
  // .populate("productListed")
  // .select("-password");

  if (!petStore) {
    throw new ApiError(404, "Store with email not found!!!");
  }

  const isPasswordValid = await petStore.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Password InCorrect!!!");
  }

  req.session.user = petStore;

  return res.redirect("/petStore/profile");
});

const logoutPetStore = asyncHandler(async (req, res) => {
  req.session.destroy((err) => {
    console.log("error: ", err);
  });

  console.log("logged out Succesfully");
  return res.redirect("/");
});

const addProduct = asyncHandler(async (req, res) => {
  console.log("hjhjh");
  console.log(req.body);
  console.log(req.files);
  console.log(req.file);
  const {
    productName,
    manufacturingDate,
    expiryDate,
    cost,
    stock,
  } = req.body;

  const productImage = req.body.displayPicture;

  [
    productName,
    manufacturingDate,
    expiryDate,
    productImage,
    cost,
    stock,
  ].forEach((ele) => {
    console.log(ele);
  });

  [
    productName,
    manufacturingDate,
    expiryDate,
    productImage,
    cost,
    stock,
  ].forEach((ele) => {
    if (ele === "" || ele === undefined) {
      throw new ApiError(400, "All fields are required");
    }
  });

  console.log("Verificated");

  const newProduct = await Products.create({
    productName,
    manufacturingDate,
    expiryDate,
    productImage,
    cost,
    stock,
  });

  if (!newProduct) {
    throw new ApiError(500, "Error While creating product");
  }

  const petStore = await PetStore.findById({ _id: req.session.user._id });

  if(!petStore){
    console.log("Store not found");
  }

  console.log(petStore);

  petStore.productListed.push(newProduct._id);
  await petStore.save();

  return res.redirect("/petStore/profile");
});

export { registerPetStore, loginPetStore, logoutPetStore, addProduct };
