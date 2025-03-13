"use client";
import { useState, useRef } from "react";
import Image from "next/image";
import SongScrubber from "../components/songscrubber";
import StemCircle from "../components/stemcircle";
import Link from "next/link";

export default function Separate() {
  const [file, setFile] = useState(null);
  const [resultUrl, setResultUrl] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  // Audio element ref for the scrubber
  const audioRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      handleUpload(selectedFile);
    }
  };

  const handleUpload = async (selectedFile) => {
    setUploading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch("http://localhost:8000/adjust_volume/", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setResultUrl(data.file_url);
      } else {adjust_volumeadjust_volumeadjust_volumeadjust_volumeadjust_volumeadjust_volumeadjust_volumeadjust_volumeadjust_volume
        setError(data.error);
      }
    } catch (err) {
      setError("Upload error: " + err.message);
    }
    setUploading(false);
  };

  return (
    <div>
      <nav className="ml-24 mt-10 text-white">
        <ul className="flex justify-between">
          <li className="italic font-bold text-3xl">PULSIFY</li>
          <div className="mr-24 flex space-x-10">
            <li>
              <Link href="/about">
                <span className="text-xl">about</span>
              </Link>
            </li>
            <li className="text-xl">options</li>
          </div>
        </ul>
      </nav>

      <div className="flex flex-col justify-center items-center space-y-5 mt-24">
        <h1 className="font-bold text-4xl text-center">
          Pulsify - A simplified
          <br />
          stem separator
        </h1>
        <p className="text-xl text-center">
          A free and user-friendly way to remix and <br />
          isolate your favorite songs
        </p>
        <div className="flex space-x-3 p-3">
          <label className="flex items-center space-x-3 cursor-pointer">
            {/* Only display the folder icon if no file has been imported */}
            {!file && (
              <Image
                src="/images/folder.svg"
                alt="folder"
                width={20}
                height={17}
                style={{ filter: "brightness(0) invert(1)" }}
              />
            )}
            <span className="text-xl text-white">
              {file ? file.name : "import file"}
            </span>
            <input
              type="file"
              accept="audio/mp3,audio/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
        {uploading && <p className="text-white">Processing...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {/* Hidden audio element; all controls provided via SongScrubber */}
        {resultUrl && (
          <audio ref={audioRef} src={resultUrl} style={{ display: "none" }} />
        )}
      </div>

      {/* Custom SongScrubber component providing play/pause, scrubbing, and volume control */}
      {resultUrl && <SongScrubber audioRef={audioRef} />}

      <div className="flex justify-center items-center mt-[4.375rem] mb-32 space-x-28">
        <StemCircle src="/images/mic.svg" alt="Mic" />
        <StemCircle src="/images/drums.svg" alt="Drum" />
        <StemCircle src="/images/instrument.svg" alt="Instrument" />
        <StemCircle src="/images/bass.svg" alt="Bass" />
      </div>
    </div>
  );
}
