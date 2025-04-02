import React, { forwardRef } from "react";
import Image from "next/image";

// VocalStem component – clicking toggles mute; audio preloads and is hidden off-screen.
const VocalStem = forwardRef(({ url, muted, onToggle }, ref) => {
  return (
    <div
      id="circle1"
      className="relative flex flex-col justify-center items-center w-36 h-36 rounded-full source-sound cursor-pointer"
      onClick={onToggle}
    >
      <div className="absolute inset-0 bg-[#E3E3E3] blur-lg rounded-full"></div>
      {url ? (
        <>
          {/* Audio element hidden off-screen */}
          <audio
            ref={ref}
            src={url}
            muted={muted}
            preload="auto"
            style={{ position: 'absolute', left: '-10000px' }}
          />
          <Image
            src="/images/mic.svg"
            alt="Mic"
            width={54}
            height={63}
            className={`relative z-10 ${muted ? "opacity-50" : ""}`}
          />
        </>
      ) : (
        <Image
          src="/images/mic.svg"
          alt="Mic"
          width={54}
          height={63}
          className="opacity-50 relative z-10"
        />
      )}
    </div>
  );
});

export default VocalStem;
