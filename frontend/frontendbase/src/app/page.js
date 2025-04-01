"use client";
import {useState} from "react";
import ParticlesBackground from "./components/particles";
import Link from "next/link";


export default function Home() {
  // State to store the selected file
  const [file, setFile] = useState(null);

  // State to keep track of toggles for different audio elements
  const [toggles, setToggles] = useState({
    bass: false,
    vocals: false,
    instrumentals: false,
    percussion: false,
  });

  // Handler for file input change event
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  // Handler for toggling audio components
  const toggleCategory = (category) => {
    setToggles((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  return (
    <div className="">
      <ParticlesBackground className="absolute inset-0 z-0" />
      <div className="flex flex-col justify-center items-center space-y-24 text-white min-h-screen">
        <h1 className="text-6xl flex justify-center font-bold">PULSIFY</h1>
        <p className="text-2xl leading-tight tracking-tight text-white w-[504px] h-[124px] text-center">
          A simplified audio remix Webapp.
          <br /> Listen to isolated stems of a song.
          <br />
          Karaoke? Want to listen to beats?
          <br />
          Upload a song and take a listen.
        </p>
        <div className="flex justify-center items-center button">
          <Link href="/separate">
            <button className="text-4xl font-bold rounded-full w-40 h-40 bg-[#595959] text-[#949494] hover:text-white hover:w-48 hover:h-48 transition-all duration-500 ease-in-out">
              <span>Peep</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}