import { asyncHandler } from "../utils/asyncHandler.js";
import { DogVeterinary } from "../models/dogVeterinary.model.js";
// import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { DogParent } from "../models/dogParent.model.js";
import { Trainer } from "../models/trainer.model.js";
import { PetStore } from "../models/petStore.model.js";
// import { ApiResponse } from "../utils/ApiResponse.js";

const registerDogVeterinary = asyncHandler(async (req, res) => {
  console.log("Register Vet Called");

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

  // console.log("Request Clear", req.body);

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
    qualification,
  ].forEach((ele) => {
    if (ele === "" || ele === undefined) {
      throw new ApiError(400, "All Fields are required!");
    } else {
      console.log(ele);
    }
  });

  // console.log("validation Done!!!");

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
    qualification,
  });

  if (dogVeterinary) {
    console.log("Doctor Registered Succesfully!!!");
  }

  req.session.user = dogVeterinary;

  return res.redirect("/dogVeterinary/profile");
});

const loginDogVeterinary = asyncHandler(async (req, res) => {
  console.log("Login Vet Called");

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
  console.log("logout vet  Called");
  // console.log(req.session.user);
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    }
  });

  // console.log(req.session.user);
  return res.redirect("/");
});

const profileController = asyncHandler(async (req, res) => {
  console.log("Doctor profile visited");
  const user = await DogVeterinary.findById({ _id: req.session.user._id })
    .populate("appointments")
    .select("-password");

  const nearByDoctors = await DogVeterinary.find({
    $and: [
      {
        $or: [{ street: user.street }, { colony: user.colony }],
      },
      {
        _id: { $ne: user._id },
      },
    ],
  });

  const nearByParents = await DogParent.find({
    $or: [{ street: user.street }, { colony: user.colony }],
  });

  const nearByTrainers = await Trainer.find({
    $or: [{ street: user.street }, { colony: user.colony }],
  });

  const nearByStores = await PetStore.find({
    $or: [{ street: user.street }, { colony: user.colony }],
  });
  // console.log(user);
  res.render("profile", {
    user,
    userType: "dogVeterinary",
    profileType: "Vet",
    nearByDoctors,
    nearByParents,
    nearByStores,
    nearByTrainers,
    visitor: false,
  });
});

const visitorProfileController = asyncHandler(async (req, res) => {
  console.log("Visitor profile called through vet");

  const profileType = req.params.profileType;
  const _id = req.params.id;

  const nearByDoctors = await DogVeterinary.find({
    $and: [
      {
        $or: [
          { street: req.session.user.street },
          { colony: req.session.user.colony },
        ],
      },
      {
        _id: { $ne: req.session.user._id },
      },
    ],
  });

  const nearByParents = await DogParent.find({
    $or: [
      { street: req.session.user.street },
      { colony: req.session.user.colony },
    ],
  }).select("_id username");

  const nearByTrainers = await Trainer.find({
    $or: [
      { street: req.session.user.street },
      { colony: req.session.user.colony },
    ],
  });

  const nearByStores = await PetStore.find({
    $or: [
      { street: req.session.user.street },
      { colony: req.session.user.colony },
    ],
  });

  switch (profileType) {
    case "Parent":
      console.log("parent page visited");

      let parent = await DogParent.find({ _id })
        .populate("dogs")
        .select("-password");

      parent = parent[0];

      const filteredNearByParent = nearByParents.filter(
        (item) => item._id.toString() !== parent._id.toString()
      );

      return res.render("profile", {
        user: parent,
        userType: "dogVeterinary",
        profileType,
        nearByDoctors,
        nearByParents: filteredNearByParent,
        nearByStores,
        nearByTrainers,
        visitor: true,
      });

      break;

    case "Store":
      let store = await PetStore.find({
        _id,
      }).populate("productListed");

      store = store[0];

      const filteredNearByStores = nearByStores.filter(
        (item) => item._id.toString() !== store._id.toString()
      );

      return res.render("profile", {
        user: store,
        userType: "dogVeterinary",
        profileType,
        nearByDoctors,
        nearByParents,
        nearByStores: filteredNearByStores,
        nearByTrainers,
        visitor: true,
      });
      break;

    case "Trainer":
      let trainer = await Trainer.find({ _id });

      trainer = trainer[0];

      const filteredNearByTrainers = nearByTrainers.filter(
        (item) => item._id.toString() !== trainer._id.toString()
      );

      return res.render("profile", {
        user: trainer,
        userType: "dogVeterinary",
        profileType,
        nearByDoctors,
        nearByParents,
        nearByStores,
        nearByTrainers: filteredNearByTrainers,
        visitor: true,
      });
    default:
      break;
  }
});

export {
  registerDogVeterinary,
  loginDogVeterinary,
  logoutDogVeterinary,
  profileController,
  visitorProfileController,
};
