"use client";
import Image from "next/image";
import SongScrubber from "../components/songscrubber";
import StemCircle from "../components/stemcircle";
import Link from "next/link";

export default function Separate() {
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
          <Image src="/images/folder.svg" alt="folder" width={20} height={17} />
          <p className="text-xl text-[#949494]">import file</p>
        </div>
      </div>
      <SongScrubber />
      <div className="flex justify-center items-center mt-[4.375rem] mb-32 space-x-28">
        <StemCircle src="/images/mic.svg" alt="Mic" />
        <StemCircle src="/images/drums.svg" alt="Drum" />
        <StemCircle src="/images/instrument.svg" alt="Instrument" />
        <StemCircle src="/images/bass.svg" alt="Bass" />
      </div>
    </div>
  );
}
