import { Router } from "express";
import {
  registerPetStore,
  loginPetStore,
  logoutPetStore,
  addProduct,
  profileController,
  visitorProfileController,
  makeAppointment,
} from "../controllers/petStore.controller.js";
import uploads from "../middlewares/multer.middleware.js";
import { isAuth } from "../middlewares/isAuth.middleware.js";
import { PetStore } from "../models/petStore.model.js";

const router = Router();

router
  .route("/register")
  .get((req, res) => {
    req.session.userType = "PetStore";
    res.render("register", { userType: req.session.userType });
  })
  .post(uploads.single("displayPicture"), registerPetStore);

router
  .route("/login")
  .get((req, res) => {
    req.session.userType = "PetStore";
    res.render("login", { userType: "PetStore" });
  })
  .post(loginPetStore);

router.route("/profile").get(isAuth, profileController);

router.route("/profile/:profileType/:id").get(isAuth, visitorProfileController);

router
  .route("/addItem")
  .get(isAuth, (req, res) => {
    console.log(req.session.user);
    res.render("register", { userType: "AddItem" });
  })
  .post(isAuth, uploads.single("productImage"), addProduct);

router.route("/logout").get(isAuth, logoutPetStore);

router.route("/addAppointment").post(isAuth, makeAppointment);

export default router;
