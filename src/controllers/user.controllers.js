import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;

  //validation
  if (
    [fullName, username, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All Fields are Required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User With email Or username already Exists");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  let coverImage = "";
  if (coverLocalPath) {
    coverImage = await uploadOnCloudinary(coverLocalPath);
  }

  try {
    const user = await User.create({
      fullName,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      email,
      password,
      username: username.toLowerCase(),
    });

    const createUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    if (!createUser) {
      throw new ApiError(500, "something went wrong while registering a User");
    }
    return res
      .status(201)
      .json(new ApiResponse(200, createUser, "User registered successfully"));
  } catch (error) {
    console.log("User Creation Failed");

    if (avatar) {
      await deleteFromCloudinary(avatar.public_id);
    }
    if (coverImage) {
      await deleteFromCloudinary(coverImage.public_id);
    }
    throw new ApiError(
      500,
      "Something went wrong while registering a user and images were deleted"
    );
  }
});

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = User.findById(userId);
    //validation
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Error while generating tokens");
  }
};

const loginUser = asyncHandler(async (req, res) => {
  //get data from body
  const { email, username, password } = req.body;

  //validation
  if (!email || !username) {
    throw new ApiError(400, "Email or username is required");
  }

  const user = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  //validate password
  const isPasswordVaild = await user.isPasswordCorrect(password);

  if (!isPasswordVaild) {
    throw new ApiError(401, "Invalid Credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password, -refreshToken"
  );

  if (!loggedInUser) {
    throw new ApiError(500, "Something went wrong while logging in");
  }

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options) //  Indicates if the cookie is accessible only through the HTTP protocol.
    .cookie("refreshToken", refreshToken, options) //Indicates if the cookie should be sent only over HTTPS.
    .json(new ApiResponse(200, loggedInUser, "User logged in successfully"));
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged out Succesfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshAccessToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "refresh token is Required");
  }
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?.id);
    if (!user) {
      throw new ApiError(404, "invaild refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "invaild refresh token");
    }

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };
    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options) //  Indicates if the cookie is accessible only through the HTTP protocol.
      .cookie("refreshToken", newRefreshToken, options) //Indicates if the cookie should be sent only over HTTPS.
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          " Access Token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, "Error while Accessing the refreshing token");
  }
});


const changeCurrentPassword = asyncHandler(async(req, res)=>{
})

const getCurrentUser = asyncHandler(async(req, res)=>{
})

const updateAccountDetails = asyncHandler(async(req, res)=>{
})

export { registerUser, loginUser, refreshAccessToken, logoutUser };
