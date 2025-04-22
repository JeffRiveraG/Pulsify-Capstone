"use client";
import { useState, useEffect, useRef } from "react";

function formatTime(seconds) {
    if (isNaN(seconds) || seconds === Infinity) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
}

export default function SongScrubber({ audioContext, stems, duration }) {
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(100);
    const animationFrameRef = useRef(null);
    const startTimeRef = useRef(0);
    const offsetRef = useRef(0);
    const sourceRefs = useRef([]);

    // Start playback from a given time
    const playFrom = (offset) => {
        stopAll(); // kill old sources
        sourceRefs.current = [];

        startTimeRef.current = audioContext.currentTime - offset;
        offsetRef.current = offset;

        stems.forEach(({ audioBuffer, gainNode }, index) => {
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(gainNode).connect(audioContext.destination);
            source.start(0, offset);
            sourceRefs.current[index] = source;
        });

        setIsPlaying(true);
        animationFrameRef.current = requestAnimationFrame(updateTime);
    };

    const stopAll = () => {
        sourceRefs.current.forEach((source) => {
            try {
                source.stop();
            } catch (e) { }
        });
        sourceRefs.current = [];
        cancelAnimationFrame(animationFrameRef.current);
    };

    const updateTime = () => {
        const time = audioContext.currentTime - startTimeRef.current;
        setCurrentTime(time);

        if (time < duration) {
            animationFrameRef.current = requestAnimationFrame(updateTime);
        } else {
            setIsPlaying(false);
        }
    };

    const handleScrub = (e) => {
        const container = e.currentTarget;
        const clickX = e.nativeEvent.offsetX;
        const width = container.offsetWidth;
        const scrubTime = (clickX / width) * duration;

        playFrom(scrubTime);
    };

    const togglePlayPause = () => {
        if (isPlaying) {
            stopAll();
            setIsPlaying(false);
            offsetRef.current = audioContext.currentTime - startTimeRef.current;
        } else {
            playFrom(offsetRef.current);
        }
    };

    const handleVolumeChange = (e) => {
        const vol = Number(e.target.value);
        setVolume(vol);
        stems.forEach(({ gainNode }) => {
            gainNode.gain.setValueAtTime(vol / 100, audioContext.currentTime);
        });
    };

    const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

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
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-24"
                />
                <span className="text-[#949494] text-sm">{volume}%</span>
            </div>
        </div>
    );
}
