import ParticlesBackground from "./components/particles";
import Link from "next/link";

export default function Home() {
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
              <span>Tap In</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}