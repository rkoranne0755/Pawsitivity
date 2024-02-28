import { asyncHandler } from "../utils/asyncHandler.js";
import { PetStore } from "../models/petStore.model.js";
import { Products } from "../models/products.model.js";
import { DogParent } from "../models/dogParent.model.js";
import { Trainer } from "../models/trainer.model.js";
import { DogVeterinary } from "../models/dogVeterinary.model.js";
import { Appointment } from "../models/appointment.model.js";
import { ApiError } from "../utils/ApiError.js";
// import { ApiResponse } from "../utils/ApiResponse.js";

const registerPetStore = asyncHandler(async (req, res) => {
  console.log("register Pet Store Caaled");
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

  // console.log("req.body clear");

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

  // console.log("validation Check!!!!");

  const existedUser = await PetStore.findOne({
    email,
  });

  if (existedUser) {
    throw new ApiError(409, "User with Email Exists!!!");
  }

  // console.log("Checked if User Exists!!!");

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

  // console.log("Pet Store: ", email, " ", password);

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
  // console.log("hjhjh");
  // console.log(req.body);
  // console.log(req.files);
  // console.log(req.file);
  console.log("Add Product called");
  const { productName, manufacturingDate, expiryDate, cost, stock } = req.body;

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

  // console.log("Verificated");

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

  if (!petStore) {
    console.log("Store not found");
  }

  // console.log(petStore);

  petStore.productListed.push(newProduct._id);
  await petStore.save();

  return res.redirect("/petStore/profile");
});

const profileController = asyncHandler(async (req, res) => {
  let user = await PetStore.find({ _id: req.session.user._id })
    .populate("productListed")
    .select("-password");

  user = user[0];

  const nearByParents = await DogParent.find({
    $and: [
      {
        $or: [{ street: user.street }, { colony: user.colony }],
      },
    ],
  });

  const nearByStores = await PetStore.find({
    $and: [
      {
        $or: [{ street: user.street }, { colony: user.colony }],
      },
      {
        _id: { $ne: user._id },
      },
    ],
  });

  const nearByTrainers = await Trainer.find({
    $or: [{ street: user.street }, { colony: user.colony }],
  });

  const nearByDoctors = await DogVeterinary.find({
    $or: [{ street: user.street }, { colony: user.colony }],
  });

  return res.render("profile", {
    user,
    userType: "petStore",
    profileType: "Store",
    nearByDoctors,
    nearByParents,
    nearByStores,
    nearByTrainers,
    visitor: false,
  });
});

const visitorProfileController = asyncHandler(async (req, res) => {
  const _id = req.params.id;
  const profileType = req.params.profileType;

  const nearByParents = await DogParent.find({
    $and: [
      {
        $or: [
          { street: req.session.user.street },
          { colony: req.session.user.colony },
        ],
      },
    ],
  });

  const nearByStores = await PetStore.find({
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

  const nearByTrainers = await Trainer.find({
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

  switch (profileType) {
    case "Parent":
      let parent = await DogParent.find({
        _id,
      })
        .populate("dogs")
        .select("-password");

      parent = parent[0];

      const filteredNearByParents = nearByParents.filter(
        (item) => item._id.toString() !== parent._id.toString()
      );

      return res.render("profile", {
        user: parent,
        userType: "petStore",
        profileType,
        nearByDoctors,
        nearByParents: filteredNearByParents,
        nearByStores,
        nearByTrainers,
        visitor: true,
      });

      break;

    case "Trainer":
      let trainer = await Trainer.find({ _id });
      trainer = trainer[0];

      const filteredNearByTrainer = nearByTrainers.filter(
        (item) => item._id.toString() !== trainer._id.toString()
      );

      return res.render("profile", {
        user: trainer,
        userType: "petStore",
        profileType,
        nearByDoctors,
        nearByParents,
        nearByStores,
        nearByTrainers: filteredNearByTrainer,
        visitor: true,
      });

    case "Store":
      let store = await PetStore.find({ _id });
      store = store[0];

      const filteredNearByStores = nearByStores.filter(
        (item) => item._id.toString !== store._id.toString()
      );

      return res.render("profile", {
        user: store,
        userType: "petStore",
        profileType,
        nearByDoctors,
        nearByParents,
        nearByStores: filteredNearByStores,
        nearByTrainers,
        visitor: true,
      });

    case "Veterinary":
      let vet = await DogVeterinary.find({ _id });
      vet = vet[0];

      const filteredNearByVeterinary = nearByDoctors.filter(
        (item) => item._id.toString() !== vet._id.toString()
      );

      return res.render("profile", {
        user: vet,
        userType: "petStore",
        profileType,
        nearByDoctors: filteredNearByVeterinary,
        nearByParents,
        nearByStores,
        drId:_id,
        _id: req.session.user._id,
        nearByTrainers,
        visitor: true,
      });
    default:
      break;
  }
});

const makeAppointment = asyncHandler(async (req, res) => {
  console.log("Add appointment called Vet called", req.body);
  const { dogParentName, dogName, dogBreed, appointmentDate, reason, drId } =
    req.body;

    console.log("DRID BC",drId);

  const user = await PetStore.find({ _id: req.session.user._id })
    .populate("productListed")
    .select("-password");

  const appointment = await Appointment.create({
    dogParentName,
    dogName,
    dogBreed,
    profileType: "Store",
    appointmentDate,
    reason,
  });

  if (!appointment) {
    throw new ApiError(500, "Error while creating Appointment");
  }

  const vet = await DogVeterinary.findById({ _id: drId });
  console.log("Doctor MILA BC,",vet);
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

  const nearByTrainers = await Trainer.find({
    $or: [
      { street: req.session.user.street },
      { colony: req.session.user.colony },
    ],
  });

  console.log(user[0]);

  return res.render("profile", {
    user:user[0],
    userType: "petStore",
    profileType: "Store",
    nearByDoctors,
    nearByParents,
    nearByStores,
    nearByTrainers,
    visitor: false,
  });
});

export {
  registerPetStore,
  loginPetStore,
  logoutPetStore,
  addProduct,
  profileController,
  visitorProfileController,
  makeAppointment,
};
