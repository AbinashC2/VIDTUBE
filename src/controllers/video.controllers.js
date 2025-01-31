import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// const getAllVideos = asyncHandler(async (req, res) => {
//   //   Extract query parameters (e.g., page, limit, search query, sort options, and userId).
//   // Construct a search filter based on provided query parameters.
//   // Apply pagination and sorting.
//   // Return the results.

//   const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
//   //get all videos based on query, sort, pagination

//   let filter = {};
//   if (query) {
//     filter.title = { $regex: query, $options: "i" }; // // Case-insensitive search on title
//   }

//   if (userId && isValidObjectId(userId)) {
//     filter.owner = userId;
//   }
//   const sortField = sortBy || "createdAt"; // Default sort field
//   const options = {
//     page: parseInt(page),
//     limit: parseInt(limit),
//     sort: { [sortField]: sortType === "desc" ? -1 : 1 },
//   };

//   try {
//     const videos = await Video.aggregatePaginate(filter, options);
//     res
//       .status(200)
//       .json(new ApiResponse(200, videos, "Videos retrieved successfully"));
//   }catch (error) {
//         console.error("Error retrieving videos:", error); // Log the full error
//         res.status(500).json({ message: "Internal Server Error", error: error.message });
//       }
// });

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  let filter = {};
  if (query) {
    filter.title = { $regex: query, $options: "i" }; // Case-insensitive search on title
  }

  if (userId && isValidObjectId(userId)) {
    filter.owner = new mongoose.Types.ObjectId(userId);
  }

  const aggregationPipeline = [
    { $match: filter },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    { $unwind: "$owner" },
    { $sort: { [sortBy || "createdAt"]: sortType === "desc" ? -1 : 1 } },
  ];

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
  };

  try {
    const videos = await Video.aggregatePaginate(
      Video.aggregate(aggregationPipeline),
      options
    );
    res
      .status(200)
      .json(new ApiResponse(200, videos, "Videos retrieved successfully"));
  } catch (error) {
    console.error("Error retrieving videos:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

const publishAVideo = asyncHandler(async (req, res) => {
  //   Extract title, description, and video file from request.
  // Upload video and thumbnail to Cloudinary.
  // Create a new video document in MongoDB.
  // Return success response.

  const { title, description } = req.body;
  const { video, thumbnail } = req.files;

  if (!video || !thumbnail) {
    throw new ApiError(400, "Video and thumbnail are required");
  }

  // console.log("Uploaded files:", req.files);
  console.log(video);

  const videoUploadResult = await uploadOnCloudinary(video?.[0]?.path);
  // console.log("Local file path for upload:", video.path);

  const thumbnailUploadResult = await uploadOnCloudinary(thumbnail?.[0]?.path);

  if (!videoUploadResult || !videoUploadResult.secure_url) {
    throw new ApiError(500, "Video upload failed");
  }

  if (!thumbnailUploadResult || !thumbnailUploadResult.secure_url) {
    throw new ApiError(500, "Thumbnail upload failed");
  }

  console.log("Video Upload Result:", videoUploadResult);
  console.log("Thumbnail Upload Result:", thumbnailUploadResult);

  const newVideo = await Video.create({
    videoFile: videoUploadResult.secure_url,
    thumbnail: thumbnailUploadResult.secure_url,
    title,
    description,
    views: 0,
    owner: req.user._id,
  });

  res
    .status(201)
    .json(new ApiResponse(201, newVideo, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  //   Validate the provided videoId.
  // Find the video in the database.
  // Handle cases where the video is not found.
  // Return video data.

  const { videoId } = req.params;
  // console.log(videoId);
  
  // get video by id

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId).populate("owner", "name email");

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, video, "Video retrieved successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  //   Validate videoId and extract update fields.
  // Update the video document in MongoDB.
  // Handle video not found.
  // Return the updated video.

  const { videoId } = req.params;
  const { title, description, thumbnail } = req.body;
  //TODO: update video details like title, description, thumbnail

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const updateVideo = await Video.findByIdAndUpdate(
    videoId,
    { title, description, thumbnail },
    { new: true, runValidators: true }
  );

  if (!updateVideo) {
    throw new ApiError(404, "Video not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, updateVideo, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  //   Validate the video ID.
  // Remove the video from MongoDB.
  // Handle cases when the video doesn't exist.
  // Respond with a success message.

  const { videoId } = req.params;
  //delete video

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const deleteVideo = await Video.findByIdAndDelete(videoId);

  if (!deleteVideo) {
    throw new ApiError(404, "Video not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, null, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  //   Validate videoId.
  // Find the video and toggle isPublished status.
  // Save and return updated video.

  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  video.isPublished = !video.isPublished;
  await video.save();

  res
    .status(200)
    .json(
      new ApiResponse(200, video, "Video publish status updated successfully")
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
