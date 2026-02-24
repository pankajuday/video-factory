import path from "path";
import fs from "fs";
import express from "express";
import { Router } from "express";
import { MEDIA_ROOT } from "../config/constent";
import { hlsVideoServe } from "../controllers/hls.controller";

const router = Router();

router.route("/:videoId").get(hlsVideoServe)

export default router;