import "./App.css";
import VideoPlayer from "./components/VideoPlayer";
import VideoList from "./components/VideoList";
import "./index.css";

function App() {

  return (
    <div className="app-main">
      <div className="app-player">
        <VideoPlayer  />
      </div>

      <div className="app-side-bar">
        <VideoList />
      </div>
    </div>
  );
}
export default App;
