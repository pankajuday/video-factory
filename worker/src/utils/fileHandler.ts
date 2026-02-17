import fs from "fs";
import path from "path";
import { MEDIA_ROOT } from "../config/constent";


const UPLOADS_DIR = path.join(MEDIA_ROOT, "uploads");

export async function deleteFile(input: string) {
  if (!input) throw new Error("Input file not found");
  const completedFile = path.join(UPLOADS_DIR, input);
  if (!fs.existsSync(completedFile))
    throw new Error("Processed File doesn't exist");

  try {
    fs.unlinkSync(completedFile);
  } catch (error) {
    throw new Error("Error Occured while deleting file after TRANSCODING");
  }
}
