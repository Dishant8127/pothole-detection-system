import { useState } from "react";
import Upload from "../components/Upload";
import VideoUpload from "../components/VideoUpload";

function Home() {
  const [mode, setMode] = useState("video"); // Default to video as per user request context

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", backgroundColor: "#0f172a", minHeight: "100vh", color: "#f8fafc" }}>

      <header style={{ 
        padding: "40px 20px",
        textAlign: "center",
        background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        minHeight: "10vh",
        color: "#f8fafc"
      }}>
        <h1 style={{ 
          fontSize: "3rem",
          fontWeight: "800",
          marginBottom: "10px",
          lineHeight: "1.2",
          background: "linear-gradient(to right, #38bdf8, #818cf8)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          display: "inline-block"
        }}>
          Pothole Detection System
        </h1>
        <p style={{ 
          color: "#94a3b8", 
          fontSize: "1.2rem", 
          marginTop: "0"
        }}>
          Advanced AI-powered road safety monitoring
        </p>
      </header>

      <main style={{ maxWidth: "100%", margin: "0 auto", padding: "40px 20px" }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "center", 
          gap: "10px", 
          marginBottom: "40px" 
        }}>
          <button 
            onClick={() => setMode("image")}
            style={{
              padding: "12px 24px",
              borderRadius: "12px",
              border: "none",
              backgroundColor: mode === "image" ? "#38bdf8" : "#1e293b",
              color: mode === "image" ? "#0f172a" : "#94a3b8",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: mode === "image" ? "0 0 20px rgba(56, 189, 248, 0.3)" : "none"
            }}
          >
            🖼️ Image Detection
          </button>
          <button 
            onClick={() => setMode("video")}
            style={{
              padding: "12px 24px",
              borderRadius: "12px",
              border: "none",
              backgroundColor: mode === "video" ? "#38bdf8" : "#1e293b",
              color: mode === "video" ? "#0f172a" : "#94a3b8",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: mode === "video" ? "0 0 20px rgba(56, 189, 248, 0.3)" : "none"
            }}
          >
            🎥 Video Detection
          </button>
        </div>

        <div style={{ 
          background: "#1e293b", 
          borderRadius: "24px", 
          padding: "20px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          minHeight: "400px"
        }}>
          {mode === "image" ? <Upload /> : <VideoUpload />}
        </div>
      </main>

      <footer style={{ textAlign: "center", padding: "40px", color: "#475569" }}>
        © 2026 Pothole Detection System • Driven by Computer Vision
      </footer>
    </div>
  );
}

export default Home;