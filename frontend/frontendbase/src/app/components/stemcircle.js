import { useState } from "react";
import Image from "next/image";

export default function StemCircle({ src, alt }) {
  const [bgColor, setBgColor] = useState("#E3E3E3");

  const handleClick = () => {
    setBgColor((prevColor) =>
      prevColor === "#E3E3E3" ? "#707070" : "#E3E3E3"
    );
  };

  return (
    <div
      id="circle1"
      className="relative flex justify-center items-center w-36 h-36 rounded-full source-sound"
      onClick={handleClick}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: bgColor,
          filter: "blur(10px)",
          borderRadius: "50%",
        }}
      ></div>
      <Image
        src={src}
        alt={alt}
        width={54}
        height={63}
        className="opacity-50 relative z-10"
      />
    </div>
  );
}
