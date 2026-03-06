import { Router } from "express";
import { hlsVideoServe } from "../controllers/hls.controller";
import { verifyJWT } from "../middleware/auth.middleware";

const router = Router();

router.route("/:videoId").get(hlsVideoServe)

export default router;