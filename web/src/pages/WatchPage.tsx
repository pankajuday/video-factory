import VideoList from "../components/VideoList";
import VideoPlayer from "../components/VideoPlayer";
import "../index.css";
function WatchPage(){
    return(
        <div className="watch-main">
      <div className="watch-player">
        <VideoPlayer  />
      </div>

      <div className="watch-side-bar">
        <VideoList />
      </div>
    </div>
    )
}

export default WatchPage