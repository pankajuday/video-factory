import { Router } from "express";
import { getVideoById, getVideos, videoUpload } from "../controllers/video.controller";
import { verifyJWT } from "../middleware/auth.middleware";
import { upload } from "../middleware/multer.middleware";

const router = Router();

router.route("/upload").post(verifyJWT, upload.single("video"), videoUpload);
router.route("/all").get(verifyJWT,getVideos);
router.route("/:videoId").get(verifyJWT,getVideoById)

export default router;