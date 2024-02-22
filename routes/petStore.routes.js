import { Router } from "express";
import {
  registerPetStore,
  loginPetStore,
  logoutPetStore,
  addProduct,
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

router.route("/profile").get(isAuth, async (req, res) => {
  let petStore = await PetStore.findById({_id:req.session.user._id}).populate("productListed")
  res.render("profile", { user: petStore, userType:"PetStore" });
});

router.route("/addItem").get(
  isAuth,
  (req, res)=>{
    console.log(req.session.user);
    res.render("register",{userType:"AddItem"})
  }
)
.post(isAuth,
  uploads.single("productImage"),
  addProduct)

router.route("/logout").get(isAuth,logoutPetStore);

export default router;
