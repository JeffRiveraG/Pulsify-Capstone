"use client";
import { useState, useRef } from "react";
import Image from "next/image";
import SongScrubber from "../components/songscrubber";
import VocalStem from "../components/vocalstem";
import DrumStem from "../components/drumstem";
import BassStem from "../components/bassstem";
import InstrumentStem from "../components/instrumentstem";
import Link from "next/link";

export default function Separate() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [separatedResult, setSeparatedResult] = useState(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [muteStates, setMuteStates] = useState({
    vocals: false,
    drums: false,
    bass: false,
    instrument: false,
  });
  
  // Create refs for each stem audio element
  const vocalRef = useRef(null);
  const drumRef = useRef(null);
  const bassRef = useRef(null);
  const instrumentRef = useRef(null);
  const audioRefs = [vocalRef, drumRef, bassRef, instrumentRef];

  // Automatically process the file upon selection
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setSeparatedResult(null);
      setError("");

      const formData = new FormData();
      formData.append("file", file);
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
        setSeparatedResult(data);
      } catch (err) {
        setError("Error processing audio: " + err.message);
      } finally {
        setUploading(false);
      }
    }
  };

  // Toggle mute state for a given stem
  const toggleMute = (stem) => {
    setMuteStates((prev) => ({
      ...prev,
      [stem]: !prev[stem],
    }));
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
      
      <div className="flex flex-col items-center mt-24 space-y-6">
        <h1 className="font-bold text-4xl text-center">
          Pulsify - Stem Separator
        </h1>
        <p className="text-xl text-center">
          Upload an MP3 file to separate it into 4 stems.
        </p>
        
        {/* File upload section, with icon and text on one line */}
        <label className="flex items-center cursor-pointer space-x-2 p-3">
          {/* Show the folder icon only if no file has been selected */}
          {!selectedFile && (
            <Image
              src="/images/folder.svg"
              alt="folder"
              width={20}
              height={17}
              style={{ filter: "brightness(0) invert(1)" }}
            />
          )}
          <span className="text-xl text-[#949494]">
            {selectedFile ? selectedFile.name : "Upload File"}
          </span>
          <input
            type="file"
            onChange={handleFileChange}
            accept="audio/mp3"
            className="hidden"
          />
        </label>

        {uploading && <p className="text-white">Processing...</p>}
        {error && <p className="text-red-500">{error}</p>}
      </div>

      {separatedResult && (
        <div className="flex flex-col items-center mt-10 space-y-6">
          {/* SongScrubber controls all stem audio elements in sync */}
          <SongScrubber audioRefs={audioRefs} />
          <div className="flex space-x-4">
            <VocalStem
              url={separatedResult.vocals}
              audioRef={vocalRef}
              muted={muteStates.vocals}
              onToggle={() => toggleMute("vocals")}
            />
            <DrumStem
              url={separatedResult.drums}
              audioRef={drumRef}
              muted={muteStates.drums}
              onToggle={() => toggleMute("drums")}
            />
            <InstrumentStem
              url={separatedResult.instrument}
              audioRef={instrumentRef}
              muted={muteStates.instrument}
              onToggle={() => toggleMute("instrument")}
            />
            <BassStem
              url={separatedResult.bass}
              audioRef={bassRef}
              muted={muteStates.bass}
              onToggle={() => toggleMute("bass")}
            />
          </div>
        </div>
      )}
    </div>
  );
}
