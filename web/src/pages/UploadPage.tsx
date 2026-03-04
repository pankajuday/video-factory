import type React from "react";
import { useState } from "react";
import type { IVideoUpload } from "../Types";
import { upload } from "../lib/api.post";

const UploadPage: React.FC = () => {
  const [formData, setFormData] = useState<IVideoUpload>({
    title: "",
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setVideoFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!videoFile) {
      setError("Video file is required");
      return;
    }

    setLoading(true);
    try {
      const dataToSend: IVideoUpload = {
        title: formData.title,
        video: videoFile,
      };

      const response = await upload(dataToSend);
      if (!response) {
        throw new Error("Video Upload failed");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while uploading video"
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData?.title}
            required
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="video">Video File</label>
          <input
            type="file"
            id="video"
            name="video"
            accept="video/mp4"
            onChange={handleFileChange}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Uploading..." : "Upload"}
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </div>
  );
};

export default UploadPage;
