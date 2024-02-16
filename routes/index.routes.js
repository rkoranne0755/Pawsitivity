import { Router } from "express";
import { isAuth } from "../middlewares/isAuth.middleware.js";

const router = Router();

router.route("/").get( (req, res) => {
    res.redirect("/loginProfilePage")
})

router.route("/loginProfilePage").get((req, res)=>{
    res.render("loginProfilePage")
})

router.route("/register").get((re1, res) =>{
    res.render("registrationProfilePage")
})

export default router