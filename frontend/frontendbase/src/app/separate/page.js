"use client";
import { useState } from "react";
import Link from "next/link";
import SongScrubber from "../components/songscrubber";
import VocalStem from "../components/vocalstem";
import DrumStem from "../components/drumstem";
import BassStem from "../components/bassstem";
import InstrumentStem from "../components/instrumentstem";
import Image from "next/image";

export default function Separate() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [status, setStatus] = useState("idle");
    const [error, setError] = useState("");
    const [audioContext, setAudioContext] = useState(null);
    const [stems, setStems] = useState([]);
    const [duration, setDuration] = useState(0);
    const [muteStates, setMuteStates] = useState([false, false, false, false]); // [vocals, drums, bass, instrument]

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setSelectedFile(file);
        setStatus("processing");
        setError("");

        const formData = new FormData();
        formData.append("audio", file);

        try {
            const res = await fetch("http://127.0.0.1:8000/upload-audio/", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            if (data.vocals) {
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                setAudioContext(ctx);

                const loadStem = async (url) => {
                    const response = await fetch(url);
                    const arrayBuffer = await response.arrayBuffer();
                    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

                    const source = ctx.createBufferSource();
                    const gainNode = ctx.createGain();

                    source.buffer = audioBuffer;
                    source.connect(gainNode).connect(ctx.destination);

                    return { source, gainNode };
                };

                const loaded = await Promise.all([
                    loadStem(data.vocals),
                    loadStem(data.drums),
                    loadStem(data.bass),
                    loadStem(data.instrument),
                ]);

                setStems(loaded);
                setDuration(loaded[0].source.buffer.duration);
                setStatus("done");
            } else {
                throw new Error("No stems returned");
            }
        } catch (err) {
            setError("Upload failed: " + err.message);
            setStatus("error");
        }
    };

    const toggleMute = (index) => {
        const newMutes = [...muteStates];
        newMutes[index] = !newMutes[index];
        setMuteStates(newMutes);

        const gain = stems[index]?.gainNode.gain;
        if (gain) {
            gain.setValueAtTime(newMutes[index] ? 0 : 1, audioContext.currentTime);
        }
    };

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

            <div className="flex flex-col justify-center items-center mt-24 space-y-6">
                <h1 className="font-bold text-4xl text-center">Pulsify - Stem Separator</h1>
                <p className="text-xl text-center">
                    A free and user-friendly way to remix and <br />
                    isolate your favorite songs
                </p>

                <label className="flex items-center cursor-pointer space-x-[10px] p-3">
                    <Image
                        src="/images/folder.svg"
                        alt="Folder"
                        width={24}
                        height={24}
                        className="text-[#949494]"
                    />
                    <span className="text-xl text-[#949494]">
                        {selectedFile ? selectedFile.name : "Upload File (.mp3)"}
                    </span>
                    <input
                        type="file"
                        onChange={handleFileChange}
                        accept="audio/mp3"
                        className="hidden"
                    />
                </label>

                {status === "processing" && <p className="text-white">Processing...</p>}
                {error && <p className="text-red-500">{error}</p>}
            </div>

            {status === "done" && stems.length > 0 && (
                <div className="flex flex-col items-center mt-10 space-y-6">
                    <SongScrubber
                        audioContext={audioContext}
                        stems={stems.map(({ source, gainNode }) => ({
                            audioBuffer: source.buffer,
                            gainNode: gainNode,
                        }))}
                        duration={duration}
                    />

                    <div className="flex space-x-20">
                        <VocalStem muted={muteStates[0]} onToggle={() => toggleMute(0)} />
                        <DrumStem muted={muteStates[1]} onToggle={() => toggleMute(1)} />
                        <InstrumentStem muted={muteStates[3]} onToggle={() => toggleMute(3)} />
                        <BassStem muted={muteStates[2]} onToggle={() => toggleMute(2)} />
                    </div>
                </div>
            )}
        </div>
    );
}
