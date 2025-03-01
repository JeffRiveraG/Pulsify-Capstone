import { useState } from "react";

export default function Home() {
  // State to store the selected file
  const [file, setFile] = useState(null);

  // State to keep track of toggles for different audio elements
  const [toggles, setToggles] = useState({
    bass: false,
    vocals: false,
    instrumentals: false,
    percussion: false,
  });

  // Handler for file input change event
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  // Handler for toggling audio components
  const toggleCategory = (category) => {
    setToggles((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Capstone Project</h1>
      
      {/* MP3 file input */}
      <div>
        <input 
          type="file" 
          accept=".mp3" 
          onChange={handleFileChange}
        />
      </div>
      
      {file && (
        <div style={{ marginTop: "1rem" }}>
          <p>Selected file: {file.name}</p>
        </div>
      )}
      
      {/* Buttons to toggle audio components */}
      <div style={{ marginTop: "2rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <button onClick={() => toggleCategory("bass")}>
          {toggles.bass ? "Disable Bass" : "Enable Bass"}
        </button>
        <button onClick={() => toggleCategory("vocals")}>
          {toggles.vocals ? "Disable Vocals" : "Enable Vocals"}
        </button>
        <button onClick={() => toggleCategory("instrumentals")}>
          {toggles.instrumentals ? "Disable Instrumentals" : "Enable Instrumentals"}
        </button>
        <button onClick={() => toggleCategory("percussion")}>
          {toggles.percussion ? "Disable Percussion" : "Enable Percussion"}
        </button>
      </div>
    </div>
  );
}
