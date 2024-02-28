import { Router } from "express";
import {
  registerDogVeterinary,
  loginDogVeterinary,
  logoutDogVeterinary,
  profileController,
  visitorProfileController
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

router.route("/profile").get(isAuth, profileController);


router.route("/profile/:profileType/:id").get(isAuth, visitorProfileController);

export default router;
