import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import { asyncHandler } from "./asyncHandler.middleware.js"

export const verifyJWT = asyncHandler(async (req, _, next) => {

    const token = req.cookies.accessToken || req.header
    ("Authorization")?.replace("Bearer ", "")

    if(!token){
        throw new ApiError(401, "Unauthorized")
    }

    try {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

      const user =  await User.findById(decodeToken?._id)
        .select("-password - refreshToken")

        if(!user){
            throw new ApiError(401, "Unauthorized")
        }

        req.user = user
        next()

    } catch (error) {
        throw new ApiError(40, error?.message || "invalid access token")
    }
})