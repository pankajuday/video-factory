import { Router } from "express";
import { hlsVideoServe } from "../controllers/hls.controller";
import { verifyJWT } from "../middleware/auth.middleware";

const router = Router();

router.route("/:videoId").get(verifyJWT, hlsVideoServe);
router.route("/:videoId/*objectPath").get(verifyJWT, hlsVideoServe);

export default router;
