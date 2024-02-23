import { asyncHandler } from "../utils/asyncHandler.js";

import { DogParent } from "../models/dogParent.model.js";
import { Trainer } from "../models/trainer.model.js";
import { PetStore } from "../models/petStore.model.js";
import { DogVeterinary } from "../models/dogVeterinary.model.js";
import { Dogs } from "../models/dog.model.js";

import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (parentId) => {
  try {
    const parent = await DogParent.findById(parentId);

    const accessToken = parent.generateAccessToken();
    const refreshToken = parent.generateRefreshToken();

    parent.refreshToken = refreshToken;
    await parent.save({
      validateBeforeSave: false,
    });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating Tokens");
  }
};

const registerDogParent = asyncHandler(async (req, res) => {
  console.log("\nParent Registration Called: \n");
  // get userDetails from req.body
  // vaidation
  // check is user exists
  // check for image
  // send user obj excluding password ans refresh token
  // create user Object
  // get userDetails from req.body

  // console.log(req.files);
  // console.log(req);
  const {
    username,
    email,
    password,
    fullName,
    dateOfBirth,
    gender,
    houseNo,
    street,
    colony,
    city,
    state,
    displayPicture,
    contactNo,
  } = req.body;
  console.log("req.body clear");

  // vaidation
  [
    username,
    email,
    password,
    fullName,
    dateOfBirth,
    gender,
    colony,
    city,
    contactNo,
    houseNo,
    street,
  ].forEach((field) => {
    if (field === "" || undefined) {
      console.log(`${field}`);
      throw new ApiError(400, `${field} fields is required.`);
    }
  });
  console.log("done validation");

  // check is user exists
  const existedUser = await DogParent.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username exists!");
  }
  console.log("checked if user exist or not");

  // create user Object
  const dogParent = await DogParent.create({
    username: username.toLowerCase(),
    email,
    password,
    fullName,
    dateOfBirth,
    gender,
    houseNo,
    street,
    colony,
    city,
    state,
    displayPicture,
    contactNo,
  });

  // send user obj excluding password ans refresh token
  const registeredDogParent = DogParent.findById(dogParent._id).select(
    "-password -refreshToken"
  );

  if (!registeredDogParent) {
    throw new ApiError(500, "Error while registering Dog Parent!");
  }

  console.log("Registered Parent recieved succesfully\n");

  const user = await DogParent.findById(dogParent._id);

  // console.log(user);

  req.session.user = user;

  return res.redirect("/dogParent/profile");
});

const loginDogParent = asyncHandler(async (req, res) => {
  /*
    req.body se username/email password lo
    email exists or not
    find user
    password check
    access and refresh token generate 
    send cookies
    res succesfull login
    */

  // console.log(req.body);
  const { email, username, password } = req.body;
  // console.log(email);
  // console.log(req.body.email);
  // console.log(username);

  console.log("\n Parent Login Called\n");

  if (!(email || username)) {
    throw new ApiError(400, "Username or Email Required!!!");
  }

  const dogParent = await DogParent.findOne({
    $or: [{ email }, { username }],
  });

  if (!dogParent) {
    throw new ApiError(404, "Parent does not exists!!!");
  }

  const isPasswordCorrect = await dogParent.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Password incorect!!!");
  }

  // const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
  //   dogParent._id
  // );

  // dogParent.refreshToken = refreshToken;

  // console.log(dogParent);

  // const option = {
  //   httpOnly: true,
  //   secure: true,
  // };

  req.session.user = dogParent;
  // console.log(req.session.user);

  return res.redirect("/dogParent/profile");
  // .redirect("/register");
});

const logoutDogParent = asyncHandler(async (req, res) => {
  // await DogParent.findByIdAndUpdate(
  //   req.dogParent._id,
  //   {
  //     $set: {
  //       refreshToken: undefined,
  //     },
  //   },
  //   {
  //     new: true,
  //   }
  // );

  // const option = {
  //   httpOnly: true,
  //   secure: true,
  // };

  console.log("\n Parent Logout Called\n");

  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    }
  });

  return res.redirect("/");
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const comingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!comingRefreshToken) {
    throw new ApiError(401, "Unauthorized Request!!!");
  }

  try {
    const decodedToken = jwt.verify(
      comingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const dogParent = await DogParent.findById(decodedToken?._id);

    if (!dogParent) {
      throw new ApiError(401, "Invalid Token, User not found!!!");
    }

    if (comingRefreshToken !== DogParent?.refreshToken) {
      throw new ApiError(401, "RefreshToken Expired!!!");
    }

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(dogParent._id);

    const option = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, option)
      .cookie("refreshToken", newRefreshToken, option)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Tokens Refreshed."
        )
      );
  } catch (error) {
    throw new ApiError(500, error?.message || "Invalid Refresh Token Try...");
  }
});

const addDog = asyncHandler(async (req, res) => {
  console.log("\nParent addDog Called\n");
  const {
    dogName,
    dogBreed,
    dateOfBirth,
    disease,
    allergies,
    gender,
    displayPicture,
  } = req.body;

  [
    dogName,
    dogBreed,
    dateOfBirth,
    disease,
    allergies,
    gender,
    displayPicture,
  ].forEach((ele) => {
    if (ele === "" || ele === undefined) {
      throw new ApiError(400, "All fields are required!");
    }
  });

  const userDog = await Dogs.create({
    dogName,
    dogBreed,
    dateOfBirth,
    disease,
    allergies,
    gender,
    displayPicture,
    parent: req.session.user._id,
  });

  const parent = await DogParent.findById({ _id: req.session.user._id });

  parent.dogs.push(userDog._id);
  await parent.save();

  console.log("Dog Added SuccesFully!!!");

  return res.redirect("/dogparent/profile");
});

const profileController = asyncHandler(async (req, res) => {
  const parent = await DogParent.findById({ _id: req.session.user._id })
    .populate("dogs")
    .select("-password");
  console.log("\n Parent Profile Visited\n");

  const nearByParents = await DogParent.find({
    $and: [
      {
        $or: [{ street: parent.street }, { colony: parent.colony }],
      },
      {
        _id: { $ne: parent._id },
      },
    ],
  }).select("_id username");

  const nearByTrainers = await Trainer.find({
    $and: [
      {
        $or: [{ street: parent.street }, { colony: parent.colony }],
      },
    ],
  }).select("_id trainingCenterName");

  const nearByDoctors = await DogVeterinary.find({
    $and: [
      {
        $or: [{ street: parent.street }, { colony: parent.colony }],
      },
    ],
  }).select("_id clinicName");

  const nearByStores = await PetStore.find({
    $and: [
      {
        $or: [{ street: parent.street }, { colony: parent.colony }],
      },
    ],
  }).select("_id storeName");

  // console.log(nearByParents);
  // console.log(nearByTrainers);
  // console.log(nearByDoctors);
  // console.log(nearByStores);

  return res.render("profile", {
    user: parent,
    userType: "DogParent",
    nearByParents,
    nearByTrainers,
    nearByDoctors,
    nearByStores,
    visitor: false,
  });
});

const visitedProfileController = asyncHandler(async (req, res) => {
  const _id = req.params.id;
  const userType = req.params.userType;

  const nearByDoctors = await DogVeterinary.find({
    $and: [
      {
        $or: [
          { street: req.session.user.street },
          { colony: req.session.user.colony },
        ],
      },
    ],
  }).select("_id clinicName");

  const nearByParents = await DogParent.find({
    $and: [
      {
        $or: [
          { street: req.session.user.street },
          { colony: req.session.user.colony },
        ],
      },
      {
        _id: {
          $nin: [req.session.user._id],
        },
      },
    ],
  }).select("_id username");

  const nearByStores = await PetStore.find({
    $and: [
      {
        $or: [
          { street: req.session.user.street },
          { colony: req.session.user.colony },
        ],
      },
    ],
  }).select("_id storeName");

  const nearByTrainers = await Trainer.find({
    $and: [
      {
        $or: [
          { street: req.session.user.street },
          { colony: req.session.user.colony },
        ],
      },
    ],
  }).select("_id trainingCenterName");

  switch (userType) {
    case "DogParent":
      const parent = await DogParent.find({ _id })
        .populate("dogs")
        .select("-password -contactNo");

      // console.log("pidop");
      // console.log(parent);
      // console.log(parent[0]._id);

      const filteredNearByParent = nearByParents.filter(
        (item) => item._id.toString() !== parent[0]._id.toString()
      );

      return res.render("profile", {
        user: parent[0],
        userType,
        nearByDoctors,
        nearByParents: filteredNearByParent,
        nearByStores,
        nearByTrainers,
        visitor: true,
      });
      break;

    case "PetStore":
      const store = await PetStore.find({
        _id,
      })
      .populate("productListed")
      .select("-password");

      const filteredNearByStore = nearByStores.filter(
        (item) => item._id.toString() !== store[0]._id.toString()
      );

      return res.render("profile", {
        user: store[0],
        userType,
        nearByDoctors,
        nearByParents,
        nearByTrainers,
        nearByStores: filteredNearByStore,
        visitor: true,
      });

      break;

    default:
      break;
  }
});

export {
  registerDogParent,
  loginDogParent,
  logoutDogParent,
  refreshAccessToken,
  addDog,
  profileController,
  visitedProfileController,
};
