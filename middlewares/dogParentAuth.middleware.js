import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { DogParent } from "../models/dogParent.model.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
  
    if (!token) {
      throw new ApiError(401, "Unauthorized Request!!!");
    }
  
    const decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  
    const dogParent = await DogParent.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );
  
    if (!dogParent) {
      throw new ApiError(401, "Invalid Access Token \nParent not Found!!!");
    }
  
    req.dogParent = dogParent;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "While Access Token")
  }
});
