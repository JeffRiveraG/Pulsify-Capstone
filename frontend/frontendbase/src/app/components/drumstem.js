import Image from "next/image";

export default function DrumStem() {
  return (
    <div
      id="circle2"
      className="relative flex justify-center items-center w-36 h-36 rounded-full source-sound"
    >
      <div className="absolute inset-0 bg-[#E3E3E3] blur-lg rounded-full"></div>
      <Image
        src="/images/drums.svg"
        alt="Drums"
        width={54}
        height={63}
        className="opacity-50 relative z-10"
      />
    </div>
  );
}
