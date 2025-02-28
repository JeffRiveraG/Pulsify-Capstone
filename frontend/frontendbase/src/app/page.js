// src/app/page.js
"use client"; 

import { useState } from "react";
import Link from "next/link";

export default function HomePage() {
  const [file, setFile] = useState(null);
  const [volume, setVolume] = useState(100);
  const [resultUrl, setResultUrl] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleVolumeChange = (e) => {
    setVolume(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select an audio file.");
      return;
    }
    setUploading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("volume", volume);

    try {
      const res = await fetch("http://localhost:8000/adjust_volume/", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setResultUrl(data.file_url);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Upload error: " + err.message);
    }
    setUploading(false);
  };

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Audio Upload & Volume Control</h1>
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="mb-2">
          <label className="block mb-1">Select Audio File (MP3):</label>
          <input type="file" accept="audio/mp3,audio/*" onChange={handleFileChange} />
        </div>
        <div className="mb-2">
          <label className="block mb-1">
            Volume ({volume}%):
          </label>
          <input
            type="range"
            min="0"
            max="200"
            value={volume}
            onChange={handleVolumeChange}
          />
        </div>
        <button
          type="submit"
          disabled={uploading}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          {uploading ? "Processing..." : "Upload & Adjust"}
        </button>
      </form>
      {error && <p className="text-red-500">{error}</p>}
      {resultUrl && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Processed Audio</h2>
          <audio controls src={resultUrl} className="w-full" />
        </div>
      )}
      {/* Optional navigation link */}
      <div className="mt-4">
        <Link href="/anotherpage" className="text-blue-500 underline">
          Go to Another Page
        </Link>
      </div>
    </main>
  );
}
