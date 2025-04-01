"use client";
import { useState, useRef } from "react";
import { useState, useRef } from "react";
import Image from "next/image";
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

  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState({});
  const [error, setError] = useState("");

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setResult({});
      setError("");
    }
  };

  const handleSubmitMP3 = async () => {
    if (!selectedFile) {
      setError("Please select an audio file.");
      return;
    }
    const formData = new FormData();
    formData.append("file", selectedFile);
    
    setUploading(true);
    try {
      const res = await fetch("http://localhost:8000/audio-separation/", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText);
      }
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError("Error uploading MP3: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleFilterAudio = async (stem) => {
    if (!selectedFile) {
      setError("Please select an audio file.");
      return;
    }
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("stem", stem);
    
    setUploading(true);
    try {
      const res = await fetch("http://localhost:8000/audio-separation/", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText);
      }
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError("Error filtering audio: " + err.message);
    } finally {
      setUploading(false);
    }
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
      <div className="flex flex-col items-center mt-24 space-y-6">
        <h1 className="font-bold text-4xl text-center">Pulsify - Audio Filtering</h1>
        <p className="text-xl text-center">
          Upload an MP3 file and filter out specific audio components.
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
        <div onClick={handleUploadClick} className="flex items-center cursor-pointer space-x-3 p-3">
          <Image src="/images/folder.svg" alt="folder" width={20} height={17} />
          <p className="text-xl text-[#949494]">Upload File</p>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
          accept="audio/mp3"
        />
        {selectedFile && <p className="text-white">Selected file: {selectedFile.name}</p>}
        
        <button onClick={handleSubmitMP3} className="px-4 py-2 bg-blue-600 text-white rounded">
          Submit MP3
        </button>
        
        <div className="flex space-x-4 mt-6">
          <StemCircle onClick={() => handleFilterAudio("vocals")} src="/images/mic.svg" alt="Vocals" />
          <StemCircle onClick={() => handleFilterAudio("drums")} src="/images/drums.svg" alt="Drums" />
          <StemCircle onClick={() => handleFilterAudio("instrument")} src="/images/instrument.svg" alt="Instrumentals" />
          <StemCircle onClick={() => handleFilterAudio("bass")} src="/images/bass.svg" alt="Bass" />
          <StemCircle onClick={() => handleFilterAudio("other")} src="/images/other.svg" alt="Other" />
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
        
        {uploading && <p className="mt-4 text-white">Processing, please wait...</p>}
        {error && <p className="mt-4 text-red-500">{error}</p>}
        {result.output_file && (
          <div className="mt-4 text-white">
            <h2>Filtered Audio Output:</h2>
            <p>{result.output_file}</p>
          </div>
        )}
      </div>
    </div>
  );
}
