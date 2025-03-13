import Image from "next/image";

export default function BassStem({ url }) {
  return (
    <div
      id="circle4"
      className="relative flex flex-col justify-center items-center w-36 h-36 rounded-full source-sound"
    >
      <div className="absolute inset-0 bg-[#E3E3E3] blur-lg rounded-full"></div>
      {url ? (
        <audio controls src={url} className="w-full" />
      ) : (
        <Image
          src="/images/bass.svg"
          alt="Bass"
          width={45}
          height={54}
          className="opacity-50 relative z-10"
        />
      )}
    </div>
  );
}
