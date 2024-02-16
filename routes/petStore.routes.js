import { Router } from "express";
import {
  registerPetStore,
  loginPetStore,
  logoutPetStore,
} from "../controllers/petStore.controller.js";
import uploads from "../middlewares/multer.middleware.js";
import {isAuth} from "../middlewares/isAuth.middleware.js"

const router = Router();

router
  .route("/registerPetstore")
  .get((req, res) => {
    res.render("registerPetStore");
  })
  .post(uploads.single("displayPicture"), registerPetStore);

router
  .route("/login")
  .get((req, res) => {
    res.render("petStorelogin");
  })
  .post(loginPetStore);

router.route("/petStoreProfile").get( isAuth,
  (req, res)=>{
  res.render("petStoreProfile",{user:req.session.user})
})

router.route("/logout").get(logoutPetStore);

export default router;
