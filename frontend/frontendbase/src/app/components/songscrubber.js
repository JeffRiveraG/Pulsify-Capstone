import { useState, useEffect } from "react";

function formatTime(seconds) {
  if (isNaN(seconds) || seconds === Infinity) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
}

export default function SongScrubber({ audioRefs }) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volumeLevel, setVolumeLevel] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);

  // Use the first audio element for time tracking
  const primaryAudio = audioRefs[0]?.current;

  useEffect(() => {
    if (!primaryAudio) return;
    
    const updateTime = () => {
      setCurrentTime(primaryAudio.currentTime);
      setDuration(primaryAudio.duration);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    primaryAudio.addEventListener("timeupdate", updateTime);
    primaryAudio.addEventListener("loadedmetadata", updateTime);
    primaryAudio.addEventListener("play", handlePlay);
    primaryAudio.addEventListener("pause", handlePause);

    return () => {
      primaryAudio.removeEventListener("timeupdate", updateTime);
      primaryAudio.removeEventListener("loadedmetadata", updateTime);
      primaryAudio.removeEventListener("play", handlePlay);
      primaryAudio.removeEventListener("pause", handlePause);
    };
  }, [primaryAudio, audioRefs]);

  const handleScrub = (e) => {
    if (!primaryAudio || !duration) return;
    const container = e.currentTarget;
    const clickX = e.nativeEvent.offsetX;
    const containerWidth = container.offsetWidth;
    const newTime = (clickX / containerWidth) * duration;
    audioRefs.forEach(ref => {
      if (ref.current) {
        ref.current.currentTime = newTime;
      }
    });
  };

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

  const handleVolumeChange = (e) => {
    const newVol = Number(e.target.value);
    setVolumeLevel(newVol);
    audioRefs.forEach(ref => {
      if (ref.current) {
        ref.current.volume = newVol / 100;
      }
    });
  };

  const togglePlayPause = async () => {
    if (!primaryAudio) return;
    if (primaryAudio.paused) {
      try {
        // Ensure each audio element is loaded
        await Promise.all(
          audioRefs.map(async (ref) => {
            if (ref.current) {
              ref.current.load();
              // Force unmute just in case
              ref.current.muted = false;
              return ref.current.play().catch(err => {
                console.error("Play error for element:", ref.current, err);
              });
            }
          })
        );
        setIsPlaying(true);
      } catch (error) {
        console.error("Error during play:", error);
      }
    } else {
      audioRefs.forEach(ref => {
        if (ref.current) ref.current.pause();
      });
      setIsPlaying(false);
    }
  };

  return (
    <div className="flex flex-col items-center mt-[4.375rem] mb-[4.375rem]">
      <div className="flex justify-center items-center space-x-5 w-full">
        <button
          onClick={togglePlayPause}
          className="p-2 bg-[#595959] text-white rounded hover:bg-[#767676]"
        >
          {isPlaying ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <rect x="4" y="3" width="4" height="14" />
              <rect x="12" y="3" width="4" height="14" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <polygon points="5,3 17,10 5,17" />
            </svg>
          )}
        </button>
        <p className="text-[#949494]">{formatTime(currentTime)}</p>
        <div
          onClick={handleScrub}
          className="w-[37.5rem] h-[0.625rem] bg-[#595959] rounded-[0.625rem] relative cursor-pointer"
        >
          <div
            className="absolute top-0 left-0 h-full bg-white rounded-[0.625rem] pointer-events-none"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <p className="text-[#949494]">{formatTime(duration)}</p>
      </div>
      <div className="flex items-center mt-2 space-x-2">
        <span className="text-[#949494] text-sm">Vol:</span>
        <input
          type="range"
          min="0"
          max="100"
          value={volumeLevel}
          onChange={handleVolumeChange}
          className="w-24"
        />
        <span className="text-[#949494] text-sm">{volumeLevel}%</span>
      </div>
    </div>
  );
}
