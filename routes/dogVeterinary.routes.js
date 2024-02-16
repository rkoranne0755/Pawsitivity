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
    res.render("dogVeterinarylogin");
  })
  .post(loginDogVeterinary);

router
  .route("/registerDogVeterinary")
  .get((req, res) => {
    res.render("registerDogVeterinary");
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

router.route("/dogVeterinaryProfile").get(isAuth, (req, res) => {
  console.log("Doctor profile visited");
  const user = DogVeterinary.findById({ _id: req.session.user._id }).select(
    "-password"
  );
  // console.log(user);
  res.render("dogVeterinaryProfile", { user: req.session.user });
});

export default router;
