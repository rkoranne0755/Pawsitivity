import { Router } from "express";
import {
  registerDogVeterinary,
  loginDogVeterinary,
  logoutDogVeterinary,
} from "../controllers/dogVeterinary.controllers.js";
import uploads from "../middlewares/multer.middleware.js";
import { isAuth } from "../middlewares/isAuth.middleware.js";
import { DogVeterinary } from "../models/dogVeterinary.model.js";

const router = Router();

router
  .route("/login")
  .get((req, res) => {
    req.session.userType = "DogVeterinary";
    res.render("login", { userType: "DogVaterinary" });
  })
  .post(loginDogVeterinary);

router
  .route("/register")
  .get((req, res) => {
    req.session.userType = "DogVeterinary";
    res.render("register", { userType: req.session.userType });
  })
  .post(
    uploads.single("displayPicture"),
    (req, res, next) => {
      console.log(req.files);
      next();
    },
    registerDogVeterinary
  );

router.route("/logout").get(logoutDogVeterinary);

router.route("/profile").get(isAuth, async (req, res) => {
  console.log("Doctor profile visited");
  const user = await DogVeterinary.findById({ _id: req.session.user._id })
    .populate("appointments")
    .select("-password");

  const nearByDoctors = [];
  const nearByParents = [];
  const nearByTrainers = [];
  const nearByStores = [];
  // console.log(user);
  res.render("profile", {
    user,
    userType: "DogVeterinary",
    nearByDoctors,
    nearByParents,
    nearByStores,
    nearByTrainers,
  });
});

export default router;
