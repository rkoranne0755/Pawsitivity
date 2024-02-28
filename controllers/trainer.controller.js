import { Trainer } from "../models/trainer.model.js";
import { DogParent } from "../models/dogParent.model.js";
import { Appointment } from "../models/appointment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { DogVeterinary } from "../models/dogVeterinary.model.js";
import { PetStore } from "../models/petStore.model.js";

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
  let user = await Trainer.find({ _id: req.session.user._id }).select(
    "-password"
  );
  console.log("Trainer Profile ");
  // console.log(user);

  user = user[0];

  const nearByParents = await DogParent.find({
    $or: [{ street: user.street }, { colony: user.colony }],
  });

  const nearByDoctors = await DogVeterinary.find({
    $or: [{ street: user.street }, { colony: user.colony }],
  });

  const nearByStores = await PetStore.find({
    $or: [{ street: user.street }, { colony: user.colony }],
  });

  const nearByTrainers = await Trainer.find({
    $and: [
      {
        $or: [{ street: user.street }, { colony: user.colony }],
      },
      {
        _id: { $ne: user._id },
      },
    ],
  });
  // console.log(nearByParents);

  return res.render("profile", {
    user,
    userType: "dogTrainer",
    profileType: "Trainer",
    nearByDoctors,
    nearByParents,
    nearByStores,
    nearByTrainers,
    visitor: false,
  });
});

const visitedProfileController = asyncHandler(async (req, res) => {
  const _id = req.params.id;
  const profileType = req.params.profileType;

  const nearByParents = await DogParent.find({
    $or: [
      { street: req.session.user.street },
      { colony: req.session.user.colony },
    ],
  });

  const nearByDoctors = await DogVeterinary.find({
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

  const nearByTrainers = await Trainer.find({
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
  // console.log(nearByParents);
  console.log("VisitedPRofile");
  switch (profileType) {
    case "Parent":
      let parent = await DogParent.findById({ _id })
        .populate("dogs")
        .select("-password");

      // parent = parent[0];
      // console.log("Visitor Profile Parent: ",parent);

      let filteredNearByParents = nearByParents.filter(
        (item) => item._id.toString() !== parent._id.toString()
      );

      return res.render("profile", {
        user: parent,
        userType: "dogTrainer",
        profileType,
        nearByDoctors,
        nearByParents: filteredNearByParents,
        nearByStores,
        nearByTrainers,
        visitor: true,
      });

      break;

    case "Store":
      let store = await PetStore.findById({ _id })
        .populate("productListed")
        .select("-password");

      const filteredNearByStores = nearByStores.filter(
        (item) => item._id.toString() !== store._id.toString()
      );

      return res.render("profile", {
        user: store,
        userType: "dogTrainer",
        profileType,
        nearByDoctors,
        nearByParents,
        nearByStores: filteredNearByStores,
        nearByTrainers,
        visitor: true,
      });

    case "Trainer":
      let trainer = await Trainer.findById({ _id }).select("-password");

      const filteredNearByTrainers = nearByTrainers.filter(
        (item) => item._id.toString() !== trainer._id.toString()
      );

      return res.render("profile", {
        user: trainer,
        userType: "dogTrainer",
        profileType,
        nearByDoctors,
        nearByParents,
        nearByStores,
        nearByTrainers: filteredNearByTrainers,
        visitor: true,
      });

    case "Veterinary":
      let vet = await DogVeterinary.findById({ _id }).select("-password");

      const filteredNearByDoctors = nearByDoctors.filter(
        (item) => item._id.toString !== vet._id.toString()
      );

      return res.render("profile", {
        user: vet,
        userType: "dogTrainer",
        profileType,
        nearByDoctors: filteredNearByDoctors,
        nearByParents,
        nearByStores,
        nearByTrainers,
        drId: _id,
        visitor: true,
      });
    default:
      break;
  }
  return res.send("Error");
});

const addAppointment = asyncHandler(async (req, res) => {
  console.log("Trainer add appointment called");

  const user = await Trainer.findById({ _id: req.session.user._id }).select(
    "-password"
  );
  console.log(user);

  const { dogParentName, dogName, dogBreed, appointmentDate, reason, drId } =
    req.body;

  const appointment = await Appointment.create({
    dogParentName,
    dogName,
    dogBreed,
    profileType: "Trainer",
    appointmentDate,
    reason,
  });

  if (!appointment) {
    throw new ApiError(500, "Error while creating Appointment");
  }

  const vet = await DogVeterinary.findById({ _id: drId });
  vet.appointments.push(appointment._id);
  await vet.save();

  const nearByDoctors = await DogVeterinary.find({
    $or: [
      { street: req.session.user.street },
      { colony: req.session.user.colony },
    ],
  });

  const nearByParents = await DogParent.find({
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

  const nearByTrainers = await Trainer.find({
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

  console.log(user[0]);

  return res.render("profile", {
    user,
    userType: "dogTrainer",
    profileType: "Trainer",
    nearByDoctors,
    nearByParents,
    nearByStores,
    nearByTrainers,
    visitor: false,
  });
});

export {
  registerDogTrainer,
  loginTrainer,
  logoutTrainer,
  profileController,
  visitedProfileController,
  addAppointment,
};
