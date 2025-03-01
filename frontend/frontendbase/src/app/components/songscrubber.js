export default function SongScrubber() {
  return (
    <div className="text-[#949494] flex justify-center items-center space-x-7 mt-[4.375rem] mb-[4.375rem] playback-info">
      <p>-:-</p>
      <div className="w-[37.5rem] h-[0.625rem] bg-[#595959] rounded-[0.625rem] progress-bar"></div>
      <p>-:-</p>
    </div>
  );
}
