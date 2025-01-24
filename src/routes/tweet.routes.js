import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createTweet,
  getUserTweets,
  updateTweet,
  deleteTweet,
} from "../controllers/tweet.controllers.js";

const router = Router();

//define routes
router.route("/tweets").post(verifyJWT,createTweet); // Create a tweet (authenticated users only)
router.route("/tweets/:userId").get(getUserTweets); // Get all tweets by a user (public)
router.route("/tweets/:id").put(verifyJWT,updateTweet); // Update a tweet (authenticated users only)
router.route("/tweets/:id").delete(verifyJWT,deleteTweet); // Delete a tweet (authenticated users only)




export default router;