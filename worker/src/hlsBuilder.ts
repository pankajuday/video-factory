import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import type { MetadataWithVideoId, Quality } from "./Types";
import { Metadata } from "./models/metadata.model";
import { createTempSpace } from "./utils/tempFile";
import {
  downloadObject,
  hlsPrefix,
  masterPlaylistKey,
  uploadHlsDirectory,
} from "./utils/s3";

/**
 * Download one raw object into an isolated FFmpeg workspace, generate its HLS
 * files, then upload the complete output directory back to object storage.
 */
export async function generateHLS(
  inputObjectKey: string,
  uniqueName: string,
  videoId: string,
): Promise<void> {
  if (!inputObjectKey || !uniqueName) {
    throw new Error("Input object key and video name are required.");
  }

  const tempSpace = await createTempSpace();

  try {
    const inputFile = path.join(tempSpace.path, `${uniqueName}.mp4`);
    await downloadObject(inputObjectKey, inputFile);
    await generateHLSFromFile(inputFile, inputObjectKey, videoId);
  } finally {
    await tempSpace.cleanup();
  }
}

async function generateHLSFromFile(
  inputFile: string,
  inputObjectKey: string,
  videoId: string,
): Promise<void> {
  if (!fs.existsSync(inputFile)) {
    throw new Error(`File not found: ${inputFile}`);
  }

  const baseName = path.basename(inputFile, path.extname(inputFile));
  const rootDir = path.join(path.dirname(inputFile), "videos", baseName);

  fs.mkdirSync(rootDir, { recursive: true });

  console.log(`Processing: ${inputFile}`);
  console.log(`Output folder: ${rootDir}`);

  let srcWidth: number = 0,
    srcHeight: number = 0,
    duration: number | string = 0;
  try {
    const probeCmd = `ffprobe -v error -select_streams v:0 -show_entries stream=width,height,duration -of json "${inputFile}"`;
    const probeData = JSON.parse(execSync(probeCmd).toString());

    const v = probeData.streams[0];
    srcWidth = v.width;
    srcHeight = v.height;
    duration = parseFloat(v.duration || 0).toFixed(2);
    console.log(`Source: ${srcWidth}x${srcHeight}, Duration: ${duration}s`);
  } catch (error) {
    console.warn("Could not detect resolution. Using default qualities.");
  }

  // Detect if audio exists

  let hasAudio = true;
  try {
    execSync(
      `ffprobe -v error -select_streams a:0 -show_entries stream=codec_name -of csv=p=0 "${inputFile}"`
    ).toString();
  } catch (error) {
    hasAudio = false;
    throw new Error("No audio stream detected.");
  }

  // Quality definitions

  const allQualities: Quality[] = [
    {
      name: "1080p",
      folder: "1080",
      width: 1920,
      height: 1080,
      bitrate: 5000,
      audio: 128,
    },
    {
      name: "720p",
      folder: "720",
      width: 1280,
      height: 720,
      bitrate: 2500,
      audio: 128,
    },
    {
      name: "480p",
      folder: "480",
      width: 854,
      height: 480,
      bitrate: 1000,
      audio: 96,
    },
    {
      name: "360p",
      folder: "360",
      width: 640,
      height: 360,
      bitrate: 500,
      audio: 64,
    },
    {
      name: "240p",
      folder: "240",
      width: 426,
      height: 240,
      bitrate: 300,
      audio: 48,
    },
  ];

  const selectedQualities: Quality[] = allQualities.filter(
    (q) => q.height <= srcHeight
  );

  if (selectedQualities.length === 0) {
    throw new Error("No suitable quality levels for this video.");
  }

  console.log("Selected qualities:");
  selectedQualities.forEach((q) => console.log(` - ${q.name}`));

  const metadata: MetadataWithVideoId = {
    video_name: baseName,
    videoId:videoId,
    input_file: inputObjectKey,
    duration: `${duration}s`,
    source_resolution: `${srcWidth}x${srcHeight}`,
    output_root: hlsPrefix(baseName),
    master_playlist: masterPlaylistKey(baseName),
    qualities: [],
  };

  // Generate each quality

  for (const q of selectedQualities) {
    const qDir = path.join(rootDir, q.folder);
    fs.mkdirSync(qDir, { recursive: true });
    console.log(`Generating ${q.name} ...`);

    const outputPlaylist = `${qDir}/${baseName}_${q.name}.m3u8`;
    const segmentPattern = `${qDir}/${baseName}_${q.name}_%03d.ts`;

    const cmd = `
    ffmpeg -y -i "${inputFile}" -vf "scale=${q.width}:${q.height}" \
    -c:v libx264 -b:v ${q.bitrate}k -maxrate ${Math.round(q.bitrate * 1.07)}k \
    -bufsize ${Math.round(
      q.bitrate * 1.5
    )}k -preset medium -g 48 -sc_threshold 0 \
    ${hasAudio ? `-c:a aac -b:a ${q.audio}k -ac 2` : "-an"} \
    -f hls -hls_time 6 -hls_playlist_type vod \
    -hls_segment_filename "${segmentPattern}" "${outputPlaylist}"
  `;

    try {
      execSync(cmd, { stdio: "inherit" });
      metadata.qualities.push({
        name: q.name,
        resolution: `${q.width}x${q.height}`,
        bitrate: `${q.bitrate}k`,
        audio_bitrate: hasAudio ? `${q.audio}k` : "none",
        playlist: `${q.folder}/${baseName}_${q.name}.m3u8`,
      });
    } catch (err: any) {
      console.error(`FFmpeg failed for ${q.name}: ${err.message}`);
      continue;
    }
  }

  // Create master playlist
  const masterFile = `${rootDir}/${baseName}_multi_quality.m3u8`;
  let masterContent = `#EXTM3U\n#EXT-X-VERSION:6\n#EXT-X-INDEPENDENT-SEGMENTS\n\n`;

  for (const q of metadata.qualities) {
    const qInfo = selectedQualities.find((x) => x.name === q.name)!;
    const bw = qInfo?.bitrate * 1000;
    masterContent += `# ${q.name}\n`;
    masterContent += `#EXT-X-STREAM-INF:BANDWIDTH=${bw},RESOLUTION=${qInfo.width}x${qInfo.height},CODECS="avc1.64001f,mp4a.40.2",FRAME-RATE=30.000\n`;
    masterContent += `${q.playlist}\n\n`;
  }

  fs.writeFileSync(masterFile, masterContent);
  console.log(`Master playlist created: ${masterFile}`);

  await uploadHlsDirectory(rootDir, baseName);
  console.log(`HLS output uploaded to: ${hlsPrefix(baseName)}`);

  // const metadataFile = `${rootDir}/${baseName}.json`;
  // fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));
  // console.log(`Metadata saved: ${metadataFile}`);

  // Save metadata in MongoDB after writing JSON
  try {
    await Metadata.create(metadata);
  } catch (error) {
    throw new Error("Metadata failed to save in MongoDB", { cause: error });
  }

  // Update global master_videos.json under /videos and this is only for local test 
  // const globalIndexFile = `${VIDEOS_DIR}/master_videos.json`;

  // let globalIndex: any[] = [];

  // if (fs.existsSync(globalIndexFile)) {
  //   try {
  //     globalIndex = JSON.parse(fs.readFileSync(globalIndexFile, "utf-8"));
  //   } catch {
  //     globalIndex = [];
  //   }
  // }

  // globalIndex = globalIndex.filter((v) => v.video_name !== baseName);

  // globalIndex.push({ 
  //   video_name: baseName,
  //   duration: metadata.duration,
  //   source_resolution: metadata.source_resolution,
  //   available_qualities: metadata.qualities.map((q) => q.name),
  //   master_playlist: metadata.master_playlist,
  // });

  // fs.writeFileSync(globalIndexFile, JSON.stringify(globalIndex, null, 2));
  // console.log(`Global index updated: ${globalIndexFile}`);

  console.log("\nHLS generation completed successfully!");
  // console.log(`Output folder: ${rootDir}`);
}
