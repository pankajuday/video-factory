import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import "../index.css";
import { useVideoContext } from "../context/VideoProvider";

const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

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

  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, []);

  // const isNativeHls = useMemo(() => {
  //   const video = document.createElement("video");
  //   return video.canPlayType("application/vnd.apple.mpegurl") !== "";
  // }, []);

  const attachAndPlay = () => {
    setError(null);
    const video = videoRef.current;

    if (!video) return;

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
      });

      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        const nextLevels = hls.levels.map((lvl, index) => ({
          index,
          height: lvl.height,
          bitrate: lvl.bitrate,
          label: lvl.height ? `${lvl.height}p` : `Level ${index + 1}`,
        }));

        setLevels(nextLevels);
        setCurrentLevel(hls.currentLevel ?? -1);
      });

      hls.on(Hls.Events.ERROR, (_evt, data) => {
        if (data.fatal) {
          setError(
            data.details
              ? `HLS fatal ERROR : ${data.details}`
              : "HLS fatal ERROR "
          );
        }
        hls.destroy();
        hlsRef.current = null;
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    } else {
      setError("HLS is not supported in this browser.");
      return;
    }

    video
      .play()
      .catch((err) => setError(err?.message || "Failed to play video"));
  };

  return (
    <div className="player-main">

      <div className="player-title">{state.videos[0]?.title}</div>
      <div>
        <span>{error}</span>
        <video autoPlay ref={videoRef} controls className="player-video" />
      </div>
      <div className="player-bottom-bar">

        <button className="player-play" onClick={attachAndPlay}>
          Play
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
