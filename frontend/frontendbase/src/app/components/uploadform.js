"use client";
import { useState, useEffect } from "react";

export default function UploadForm() {
    const [status, setStatus] = useState("idle");               // Track upload status
    const [audioRefs, setAudioRefs] = useState([]);             // Store info for each stem
    const [isPlaying, setIsPlaying] = useState(false);          //Prevents playing the same audio more than once
    const [audioContext, setAudioContext] = useState(null);

    const handleUpload = async (e) => {                         // When the user uploads a file...
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();                        // Create a new FormData object to send the file   
        formData.append("audio", file);                         // Append the file to the FormData object

        setStatus("processing");

        const res = await fetch("http://127.0.0.1:8000/upload-audio/", {                // Send the file to the backend
            method: "POST",
            body: formData,
        });

        const data = await res.json();                           // Parse the JSON response from the backend

        if (data.stems) {
            // Load stems with Web Audio API
            const ctx = new (window.AudioContext || window.webkitAudioContext)();   // Create a new audio processing environment
            setAudioContext(ctx);

            const loadStem = async (url) => {
                const response = await fetch(url);               // Download the audio file from the URL
                const arrayBuffer = await response.arrayBuffer(); // Turns the file into raw binary data
                const audioBuffer = await ctx.decodeAudioData(arrayBuffer);         // Decode raw data into playable audio

                const source = ctx.createBufferSource();        // Create a new audio source from the audio buffer - This is the audio that will be played
                const gainNode = ctx.createGain();
                source.buffer = audioBuffer;
                source.connect(gainNode).connect(ctx.destination); // Connect the source to the gain node and then to the audio context's destination (the speakers)

                return { source, gainNode };
            };

            const loadedStems = await Promise.all(data.stems.map(loadStem));    // Load all stems in parallel
            setAudioRefs(loadedStems);                                          // Store the loaded stems in state
            setStatus("done");
        } else {
            setStatus("error");
        }
    };

    const playStems = () => {
        if (!audioRefs.length || isPlaying) return;

        const startTime = audioContext.currentTime + 0.1;
        audioRefs.forEach(({ source }) => {
            source.start(startTime);
        });

        setIsPlaying(true);
    };

    const muteStem = (index) => {                   // Mute or unmute a stem
        const newRefs = [...audioRefs];
        const gain = newRefs[index].gainNode.gain;
        gain.setValueAtTime(gain.value === 0 ? 1 : 0, audioContext.currentTime);
        setAudioRefs(newRefs); // update state to trigger re-render if needed
    };

    return (
        <div>
            <input type="file" accept="audio/*" onChange={handleUpload} />
            {status === "processing" && <p>Processing audio...</p>}
            {status === "done" && (
                <>
                    <p>Stems ready!</p>
                    <button onClick={playStems}>Play All</button>
                    <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                        {audioRefs.map((_, index) => (
                            <button key={index} onClick={() => muteStem(index)}>
                                Toggle Stem {index + 1}
                            </button>
                        ))}
                    </div>
                </>
            )}
            {status === "error" && <p>Error processing audio.</p>}
        </div>
    );
}
