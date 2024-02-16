import { Router } from "express";
import {
  addDog,
  loginDogParent,
  logoutDogParent,
  refreshAccessToken,
  registerDogParent,
} from "../controllers/dogParent.controller.js";
import uploads from "../middlewares/multer.middleware.js";
import { isAuth } from "../middlewares/isAuth.middleware.js";
import { DogParent } from "../models/dogParent.model.js";

function calculateAge(dateOfBirth){
  const dob = new Date(dateOfBirth);
  const today = new Date();

  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth()- dob.getMonth();

  if(monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())){
    age --;
  }

  return age;
}

const router = Router();

router
  .route("/registerDogParent")
  .get((req, res) => {
    res.render("registerDogParent");
  })
  .post(uploads.single("displayPicture"), registerDogParent);

router
  .route("/login")
  .get((req, res) => {
    res.render("dogParentlogin");
  })
  .post(loginDogParent);

// secured routes

router.route("/logout").get(logoutDogParent);

router.route("/refresh-token").post(refreshAccessToken);

router.route("/dogParentProfile").get(isAuth, async (req, res) => {
  
  const parent = await DogParent.findById({ _id: req.session.user._id })
    .populate("dogs")
    .select("-password");
  // console.log(parent);

  // age = calculateAge()

  res.render("dogParentprofile", { user: parent });
});

router
  .route("/addDog")
  .get(isAuth, (req, res) => {
    res.render("registerDog");
  })
  .post(isAuth, uploads.single("displayPicture"), addDog);

export default router;
