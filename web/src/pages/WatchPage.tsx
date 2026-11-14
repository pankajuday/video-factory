import VideoList from "../components/VideoList";
import VideoPlayer from "../components/VideoPlayer";
import "../index.css";

function WatchPage() {
  return (
    <div className="watch-page">
      <div className="watch-main">
        <div className="watch-player">
          <VideoPlayer />
        </div>

        <aside className="watch-side-bar">
          <div className="watch-side-header">Videos</div>
          <VideoList />
        </aside>
      </div>
    </div>
  );
}

export default WatchPage;