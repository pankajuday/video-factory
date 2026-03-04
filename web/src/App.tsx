import { Route, Routes } from "react-router-dom";
import "./App.css";
import Login from "./components/Login";
import Register from "./components/Register";
import WatchPage from "./pages/WatchPage";
import UploadPage from "./pages/UploadPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<WatchPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/upload" element={<UploadPage />} />
    </Routes>
  );
}
export default App;
