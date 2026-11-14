import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Hls from "hls.js";
import "../index.css";
import { useVideoContext } from "../context/VideoProvider";

const API_URL = import.meta.env.VITE_API_URL;

const VideoPlayer = () => {
  const { state } = useVideoContext();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const src = `${API_URL}/hls/${state.videos[0]?._id}`;

  const [error, setError] = useState<string | null>(null);
  const [levels, setLevels] = useState<
    Array<{ index: number; label: string; height?: number; bitrate?: number }>
  >([]);
  const hlsRef = useRef<Hls | null>(null);
  const [currentLevel, setCurrentLevel] = useState<number>(-1);
  const playRequestIdRef = useRef(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    playRequestIdRef.current += 1;
    setIsLoading(false);

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src]);

  const isNativeHls = useMemo(() => {
    const video = document.createElement("video");
    return video.canPlayType("application/vnd.apple.mpegurl") !== "";
  }, []);

  const safePlay = useCallback(
    async (video: HTMLVideoElement, requestId: number): Promise<void> => {
      try {
        await video.play();
      } catch (err: any) {
        const message = err?.message ?? "";
        const errorName = err?.name ?? "";
        const interruptedByReload =
          errorName === "AbortError" ||
          /interrupted by a new load request/i.test(message);

        if (interruptedByReload || requestId !== playRequestIdRef.current) {
          return;
        }

        setError(message || "Failed to play video");
      } finally {
        if (requestId === playRequestIdRef.current) {
          setIsLoading(false);
        }
      }
    },
    []
  );

  const attachAndPlay = useCallback(() => {
    setError(null);
    const video = videoRef.current;

    if (!video || !state.videos[0]?._id) {
      setError("No video selected.");
      return;
    }

    setIsLoading(true);
    const requestId = ++playRequestIdRef.current;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    setLevels([]);
    setCurrentLevel(-1);

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        xhrSetup: (xhr) => {
          // HLS playlists and segments are protected by cookie authentication.
          xhr.withCredentials = true;
        },
      });

      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (requestId !== playRequestIdRef.current || hlsRef.current !== hls) {
          return;
        }

        const nextLevels = hls.levels.map((lvl, index) => ({
          index,
          height: lvl.height,
          bitrate: lvl.bitrate,
          label: lvl.height ? `${lvl.height}p` : `Level ${index + 1}`,
        }));

        setLevels(nextLevels);
        setCurrentLevel(hls.currentLevel ?? -1);

        void safePlay(video, requestId);
      });

      hls.on(Hls.Events.ERROR, (_evt, data) => {
        if (requestId !== playRequestIdRef.current || hlsRef.current !== hls) {
          return;
        }

        if (data.fatal) {
          setError(
            data.details
              ? `HLS fatal ERROR : ${data.details}`
              : "HLS fatal ERROR "
          );
          setIsLoading(false);
          hls.destroy();
          hlsRef.current = null;
        }
      });
    } else if (isNativeHls) {
      video.src = src;
      void safePlay(video, requestId);
    } else {
      setError("HLS is not supported in this browser.");
      setIsLoading(false);
      return;
    }
  }, [src, isNativeHls, safePlay, state.videos]);

  return (
    <div className="player-main">

      <div className="player-title">{state.videos[0]?.title}</div>
      <div className="player-video-container">
        <span>{error}</span>
        <video ref={videoRef} controls className="player-video" />
      </div>
      <div className="player-bottom-bar">

        <button className="player-play" onClick={attachAndPlay} disabled={isLoading}>
          {isLoading ? "Loading..." : "Play"}
        </button>


        {state.videos.length > 0 &&
          levels.length > 0 &&
          levels?.map((lvl) => (
            <button
              onClick={() => {
                if (hlsRef.current) {
                  hlsRef.current.nextLevel = lvl.index;
                  setCurrentLevel(lvl.index);
                }
              }}
              key={lvl.index}
              className="resolution-label"
              style={{
                backgroundColor:
                  currentLevel === lvl.index ? "#05bd2dff" : "#000",
              }}
            >
              {lvl.label}
            </button>
          ))}


        <button
          onClick={() => {
            if (hlsRef.current) {
              hlsRef.current.nextLevel = -1;
              setCurrentLevel(-1);
            }
          }}
          style={{
            backgroundColor: currentLevel === -1 ? "#05bd2dff" : "#000",
          }}
        >
          Auto
        </button>
      </div>

    </div>
  );
};

export default VideoPlayer;
