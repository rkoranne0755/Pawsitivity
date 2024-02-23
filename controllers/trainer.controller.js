import { Trainer } from "../models/trainer.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const registerDogTrainer = asyncHandler(async (req, res) => {
  console.log("Register Trainer Called\n");
  const {
    fullName,
    trainingCenterName,
    email,
    password,
    dateOfBirth,
    gender,
    houseNo,
    street,
    colony,
    city,
    state,
    contactNo,
    displayPicture,
  } = req.body;

  console.log("Trainer req.body Clear!!!", req.body);

  [
    fullName,
    trainingCenterName,
    email,
    password,
    dateOfBirth,
    gender,
    houseNo,
    street,
    colony,
    city,
    state,
    contactNo,
    displayPicture,
  ].forEach((ele) => {
    console.log(ele);
    if (ele === "" || ele === undefined) {
      throw new ApiError(400, "All fields are required!!!");
    }
  });

  console.log("Validation Check!!!");

  const existedUser = await Trainer.findOne({
    $or: [{ email }],
  });

  if (existedUser) {
    throw new ApiError(409, "Trainer with email exists!!!");
  }

  const trainer = await Trainer.create({
    fullName,
    trainingCenterName,
    email,
    password,
    dateOfBirth,
    gender,
    houseNo,
    street,
    colony,
    city,
    state,
    contactNo,
    displayPicture,
  });

  if (!trainer) {
    throw new ApiError(500, "Error while creating trainer!!!");
  }

  console.log("Trainer Created Succesfully!!!");

  req.session.user = trainer;

  return res.redirect("/dogTrainer/profile");
});

const loginTrainer = asyncHandler(async (req, res) => {
  console.log("Trainer Login Called\n");
  const { email, password } = req.body;

  if (!(email && password)) {
    throw new ApiError(400, "User Credential Required!!!");
  }

  const dogTrainer = await Trainer.findOne({
    $or: [{ email }],
  });

  if (!dogTrainer) {
    throw new ApiError(
      404,
      "Trainer with username or email does not exists!!!"
    );
  }

  const isPasswordValid = await dogTrainer.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Password Incorrect!!!");
  }

  req.session.user = dogTrainer;

  return res.redirect("/dogTrainer/profile");
});

const logoutTrainer = asyncHandler(async (req, res) => {
  console.log("Trainer logout Called!!\n");
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    }
  });

  return res.redirect("/");
});

const profileController = asyncHandler(async (req, res) => {
  const user = await Trainer.find({ _id: req.session.user._id }).select("-password");

  return res.render("profile", {
    user,
  });
});

export { registerDogTrainer, loginTrainer, logoutTrainer, profileController };
