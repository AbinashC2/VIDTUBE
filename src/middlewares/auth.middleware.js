import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  // Get token from cookies or Authorization header
  const token = req.cookies.accessToken || req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized");
  }

  try {
    // Decode the token to get user information (usually _id)
    const decoded = jwt.decode(token); // Use jwt.decode() here
    if (!decoded?._id) {
      throw new ApiError(401, "Unauthorized");
    }

    // Find user by ID from the decoded token
    const user = await User.findById(decoded._id).select("-password -refreshToken");
    if (!user) {
      throw new ApiError(401, "Unauthorized");
    }

    // Attach user to the request object
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(400, error?.message || "Invalid access token");
  }
});
