import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middlewares.js";

import {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
} from "../controllers/video.controllers.js";

const router = Router();

// Route to get all videos (with optional filters, pagination, sorting)
router.route("/allvideos").get(getAllVideos);

// Route to publish a video (with file uploads)
router
  .route("/publish")
  .post(
    verifyJWT,
    upload.fields([{ name: "video" }, { name: "thumbnail" }]),
    publishAVideo
  );

  
  router.route("/:videoId").get(getVideoById);

// Route to update a video
router.route("/update/:videoId").put(verifyJWT, updateVideo);

// Route to delete a video
router.route("/delete/:videoId").delete(verifyJWT, deleteVideo);



export default router;
