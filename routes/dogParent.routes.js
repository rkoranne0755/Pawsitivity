import { Router } from "express";
import {
  addDog,
  loginDogParent,
  logoutDogParent,
  refreshAccessToken,
  registerDogParent,
  profileController,
  visitedProfileController,
  addAppointment,
} from "../controllers/dogParent.controller.js";
import uploads from "../middlewares/multer.middleware.js";
import { isAuth } from "../middlewares/isAuth.middleware.js";
import { DogParent } from "../models/dogParent.model.js";

function calculateAge(dateOfBirth) {
  const dob = new Date(dateOfBirth);
  const today = new Date();

  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  return age;
}

const router = Router();

router
  .route("/register")
  .get((req, res) => {
    req.session.userType = "DogParent";
    res.render("register", { userType: req.session.userType });
  })
  .post(uploads.single("displayPicture"), registerDogParent);

router
  .route("/login")
  .get((req, res) => {
    req.session.userType = "DogParent";
    res.render("login", { userType: "DogParent" });
  })
  .post(loginDogParent);

// secured routes

router.route("/logout").get(
  isAuth,
  (req, res, next) => {
    console.log("Dog Parent Logout Called!!!");
    next();
  },
  logoutDogParent
);

router.route("/refresh-token").post(refreshAccessToken);

router.route("/profile").get(isAuth, profileController);

router.route("/profile/:profileType/:id").get(isAuth, visitedProfileController);

router
  .route("/addDog")
  .get(isAuth, (req, res) => {
    res.render("register", { userType: "AddDog" });
  })
  .post(isAuth, uploads.single("displayPicture"), addDog);

router.route("/addAppointment").post(isAuth, addAppointment);

export default router;
