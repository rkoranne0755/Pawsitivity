import { Router } from "express";
import {
  registerDogTrainer,
  loginTrainer,
  logoutTrainer,
  profileController,
  visitedProfileController,
  addAppointment
} from "../controllers/trainer.controller.js";
import uploads from "../middlewares/multer.middleware.js";
import { isAuth } from "../middlewares/isAuth.middleware.js";
import { DogVeterinary } from "../models/dogVeterinary.model.js";

const router = Router();

router
  .route("/register")
  .get((req, res) => {
    req.session.userType = "DogTrainer";
    res.render("register", { userType: req.session.userType });
  })
  .post(uploads.single("displayPicture"), registerDogTrainer);

router
  .route("/login")
  .get((req, res) => {
    req.session.userType = "DogTrainer";
    res.render("login", { userType: "DogTrainer" });
  })
  .post(loginTrainer);

router.route("/profile").get(isAuth, profileController );

router.route("/profile/:profileType/:id").
get(isAuth, visitedProfileController)

router.route("/logout").get(logoutTrainer);

router.route("/addAppointment").post(isAuth, addAppointment)

export default router;
