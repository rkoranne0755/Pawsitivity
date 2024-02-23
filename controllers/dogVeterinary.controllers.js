import { asyncHandler } from "../utils/asyncHandler.js";
import { DogVeterinary } from "../models/dogVeterinary.model.js";
// import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
// import { ApiResponse } from "../utils/ApiResponse.js";

const registerDogVeterinary = asyncHandler(async (req, res) => {
  const {
    fullName,
    clinicName,
    email,
    password,
    houseNo,
    street,
    colony,
    city,
    qualification,
    state,
    contactNo,
    displayPicture,
  } = req.body;

  console.log("Request Clear", req.body);

  [
    fullName,
    clinicName,
    email,
    password,
    houseNo,
    street,
    colony,
    city,
    state,
    contactNo,
    displayPicture,
    qualification
  ].forEach((ele) => {
    if (ele === "" || ele === undefined) {
      throw new ApiError(400, "All Fields are required!");
    } else {
      console.log(ele);
    }
  });

  console.log("validation Done!!!");

  const existedUser = await DogVeterinary.findOne({
    $or: [{ email }],
  });

  if (existedUser) {
    throw new ApiError(409, "Doctor with same email Exists!!!");
  }

  const dpLocalPath = req.files?.displayPicture?.path;
  if (dpLocalPath) {
    console.log("DP recieved!!!");
  }

  const dogVeterinary = await DogVeterinary.create({
    fullName,
    clinicName,
    email,
    password,
    houseNo,
    street,
    colony,
    city,
    state,
    contactNo,
    displayPicture,
    qualification
  });

  if (dogVeterinary) {
    console.log("Doctor Registered Succesfully!!!");
  }

  req.session.user = dogVeterinary;

  return res.redirect("/dogVeterinary/profile");
});

const loginDogVeterinary = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!(email && password)) {
    throw new ApiError(400, "Email & Password Required!!!");
  }

  // console.log(email);
  // console.log(password);
  const dogVeterinary = await DogVeterinary.findOne({ email });

  if (!dogVeterinary) {
    throw new ApiError(404, "Doctor not exists with this email!!!");
  }

  // console.log(dogVeterinary);

  const isPasswordValid = await dogVeterinary.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Incorrect Password!!!");
  }

  req.session.user = dogVeterinary;

  return res.redirect("/dogVeterinary/profile");
});

const logoutDogVeterinary = asyncHandler(async (req, res) => {
  console.log("logout  Called");
  // console.log(req.session.user);
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    }
  });

  // console.log(req.session.user);
  return res.redirect("/");
});

export { registerDogVeterinary, loginDogVeterinary, logoutDogVeterinary };
