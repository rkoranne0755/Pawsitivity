import { Router } from "express";
import {
  registerDogTrainer,
  loginTrainer,
  logoutTrainer,
} from "../controllers/trainer.controller.js";
import uploads from "../middlewares/multer.middleware.js";
import { isAuth } from "../middlewares/isAuth.middleware.js";

const router = Router();

router
  .route("/register")
  .get((req, res) => {
    res.render("registerTrainer");
  })
  .post(uploads.single("displayPicture"), registerDogTrainer);

router
  .route("/login")
  .get((req, res) => {
    res.render("dogTrainerlogin");
  })
  .post(loginTrainer);

router.route("/dogTrainerProfile").get(isAuth, (req, res) => {
  res.render("dogTrainerProfile", { user: req.session.user });
});

router.route("/logout").get(logoutTrainer);

export default router;
