import { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "../index.css";
import { useVideoContext } from "../context/VideoProvider";
import { getHlsManifest } from "../lib/api";

const API_URL = import.meta.env.VITE_API_URL;

type QualityOption = {
  label: string;
  src: string;
  height: number;
};

const VideoPlayer = () => {
  const { state } = useVideoContext();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(null);
  const [qualityOptions, setQualityOptions] = useState<QualityOption[]>([]);
  const [selectedQuality, setSelectedQuality] = useState<string>("Auto");

  const selectedVideo = state.videos[0];
  const videoSource = selectedVideo ? `${API_URL}/hls/${selectedVideo._id}` : "";

  useEffect(() => {
    if (!selectedVideo || !containerRef.current) {
      return;
    }

    if (playerRef.current) {
      const currentPlayer = playerRef.current;
      if (!currentPlayer.isDisposed?.()) {
        currentPlayer.src([{ src: videoSource, type: "application/x-mpegURL" }]);
      }
      return;
    }

    const token = localStorage.getItem("accessToken");
    const videoElement = document.createElement("video");
    videoElement.className = "video-js vjs-big-play-centered";
    videoElement.setAttribute("playsinline", "true");
    videoElement.setAttribute("controls", "true");
    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(videoElement);

    const player: any = videojs(videoElement, {
      controls: true,
      preload: "auto",
      fluid: true,
      responsive: true,
      autoplay: false,
      muted: false,
      playbackRates: [0.5, 1, 1.25, 1.5, 2],
      sources: [{ src: videoSource, type: "application/x-mpegURL" }],
      html5: {
        vhs: {
          enableLowInitialPlaylist: true,
          withCredentials: true,
          xhrSetup: (xhr: XMLHttpRequest) => {
            xhr.withCredentials = true;
            if (token) {
              xhr.setRequestHeader("Authorization", `Bearer ${token}`);
            }
          },
        },
      },
    });

    player.ready(async () => {
      try {
        const manifest = await getHlsManifest(selectedVideo._id, token);
        const options: QualityOption[] = [];
        let currentHeight: number | null = null;
        const manifestBaseUrl = `${API_URL}/hls/${selectedVideo._id}/`;

        for (const line of manifest.split(/\r?\n/)) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          if (trimmed.startsWith("#EXT-X-STREAM-INF")) {
            const resMatch = trimmed.match(/RESOLUTION=(\d+)x(\d+)/i);
            currentHeight = resMatch ? Number(resMatch[2]) : null;
            continue;
          }

          if (trimmed.startsWith("#") || !currentHeight) {
            continue;
          }

          const resolvedSrc = trimmed.startsWith("http")
            ? trimmed
            : new URL(trimmed, manifestBaseUrl).toString();

          options.push({
            label: `${currentHeight}p`,
            src: resolvedSrc,
            height: currentHeight,
          });

          currentHeight = null;
        }

        const sorted = [...options].sort((a, b) => a.height - b.height);
        setQualityOptions(sorted);
      } catch (error) {
        console.error("Unable to parse HLS quality levels:", error);
      }
    });

    playerRef.current = player;

    return () => {
      if (playerRef.current && !playerRef.current.isDisposed?.()) {
        playerRef.current.dispose();
      }
      playerRef.current = null;
    };
  }, [selectedVideo, videoSource]);

  const changeQuality = (quality: QualityOption) => {
    if (!playerRef.current) return;

    setSelectedQuality(quality.label);
    playerRef.current.src([{ src: quality.src, type: "application/x-mpegURL" }]);
    playerRef.current.load();
    playerRef.current.play().catch(() => undefined);
  };

  const goAuto = () => {
    if (!playerRef.current) return;

    setSelectedQuality("Auto");
    playerRef.current.src([{ src: videoSource, type: "application/x-mpegURL" }]);
    playerRef.current.load();
    playerRef.current.play().catch(() => undefined);
  };

  return (
    <div className="player-main">
      <div className="player-title">{selectedVideo?.title}</div>
      <div className="player-video-container" style={{ position: "relative" }}>
        <div
          ref={containerRef}
          className="video-container"
          style={{ width: "100%", maxWidth: "100%", minHeight: "280px" }}
        />
      </div>

      {selectedVideo && (
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginTop: 12,
            padding: "0 4px",
          }}
        >
          <button
            type="button"
            onClick={goAuto}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "none",
              background: selectedQuality === "Auto" ? "#3b82f6" : "#1f2937",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Auto
          </button>

          {qualityOptions.length > 0 ? (
            qualityOptions.map((quality) => (
              <button
                key={quality.label}
                type="button"
                onClick={() => changeQuality(quality)}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "none",
                  background: selectedQuality === quality.label ? "#22c55e" : "#1f2937",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                {quality.label}
              </button>
            ))
          ) : (
            <button
              type="button"
              disabled
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: "none",
                background: "#374151",
                color: "#d1d5db",
                cursor: "not-allowed",
                fontWeight: 600,
              }}
            >
              Loading…
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
