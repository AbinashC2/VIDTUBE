import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// @desc    Create a new tweet
// @route   POST /api/tweets
// @access  Private

const createTweet = asyncHandler(async (req, res, next) => {
try {
      const { content } = req.body;
    // console.log(content);
    
      // Check if the tweet content is provided
      if (!content) {
        return next(new ApiError(400, "Content is required"));
      }
    
      // Create a new tweet with the logged-in user's ID
    
      const tweet = await Tweet.create({
        content,
        user: req.user._id, // Assuming the authenticated user's ID is in req.user
      });
    
      res
        .status(201)
        .json(new ApiResponse(201, tweet, "Tweet created successfully"));
} catch (error) {
    throw new ApiError(500, error, "Error creating tweet")
    
}
});

// @desc    Get all tweets by a user
// @route   GET /api/tweets/:userId
// @access  Public

const getUserTweets = asyncHandler(async (req, res, next) => {
    const { userId } = req.params;
    console.log(userId);
    
    
    // Check if the provided user ID is valid
    if (!isValidObjectId(userId)) {
        return next(new ApiError(400, "Invalid user ID"));
    }
    
    //fetch all tweets by a specific user
    const tweets = await Tweet.find({ user: userId }).sort({createdAt: -1});

    res.
    status(200).
    json(new ApiResponse(200, tweets, "User tweets fetched successfully"));
});

// @desc    Update a tweet
// @route   PUT /api/tweets/:id
// @access  Private

const updateTweet = asyncHandler(async (req, res, next) => {
    const {id} = req.params;
    // console.log(id);
    
    const {content} = req.body;
    // console.log(content);
    

    //Find tweet by ID and check if it belongs to logged-in user
    let tweet = await Tweet.findById(id);

    if(!tweet){
        return next(new ApiError(404, "Tweet not found"));
    }

     // Ensure the logged-in user owns the tweet
     if (tweet.user && tweet.user.toString() !== req.user._id.toString()) {
        return next(new ApiError(403, "Not authorized to update this tweet"));
    }


    //update the tweet content
    tweet.content = content || tweet.content;
    await tweet.save();

    res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet updated successfully"));

});

// @desc    Delete a tweet
// @route   DELETE /api/tweets/:id
// @access  Private

const deleteTweet = asyncHandler(async (req, res, next) => {
    const {id} = req.params;

    //Find tweet by ID and check if it belongs to logged-in user
    let tweet = await Tweet.findById(id);

    if(!tweet){
        return next(new ApiError(404, "Tweet not found"));
    }

    //ensue the logged-in user owns the tweet
    if(tweet.user && tweet.user.toString() !== req.user._id.toString()){
        return next(new ApiError(403, "You are not authorized to delete this tweet"));
    }

    await tweet.deleteOne();

    res
    .status(200)
    .json(new ApiResponse(200, {}, "Tweet deleted successfully"));
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}