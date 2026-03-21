import { useState } from "react";
import Upload from "../components/Upload";
import VideoUpload from "../components/VideoUpload";

function Home() {
  const [mode, setMode] = useState("image");

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "var(--bg)" }}>
      {/* Dynamic Hazard Stripe at the very top */}
      <div className="hazard-strip" />

      {/* Premium Industrial Header */}
      <header style={{ 
        padding: "80px 20px",
        textAlign: "center",
        background: "radial-gradient(circle at 50% 0%, rgba(245, 158, 11, 0.1) 0%, rgba(10, 10, 10, 0) 70%)",
        borderBottom: "1px solid var(--border)",
        position: "relative"
      }} className="animate-fade-in">
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ 
            display: "inline-block", 
            padding: "4px 12px", 
            backgroundColor: "rgba(245, 158, 11, 0.05)", 
            borderRadius: "4px",
            border: "1px solid var(--border-strong)",
            color: "var(--primary)",
            fontSize: "0.75rem",
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: "2px",
            marginBottom: "24px"
          }}>
            AI Road Infrastructure Monitor
          </div>
          <h1 style={{ 
            fontSize: "clamp(2.5rem, 8vw, 4.5rem)",
            fontWeight: "900",
            marginBottom: "16px",
            letterSpacing: "-0.05em",
            color: "var(--text-heading)",
            lineHeight: "1",
            textTransform: "uppercase"
          }}>
            Pothole <span style={{ color: "var(--primary)" }}>Detection</span>
          </h1>
          <p style={{ 
            color: "var(--text-dim)", 
            fontSize: "1.25rem", 
            fontWeight: "500",
            maxWidth: "600px",
            margin: "0 auto",
            lineHeight: "1.6"
          }}>
            Advanced computer vision for real-time road hazard identification. 
            Protecting vehicles and ensuring public safety.
          </p>
        </div>
      </header>

      <main style={{ flex: 1, padding: "40px 20px", maxWidth: "1400px", margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        {/* Modern Industrial Switcher */}
        <div style={{ 
          display: "inline-flex", 
          backgroundColor: "#000",
          padding: "4px",
          borderRadius: "8px",
          border: "1px solid var(--border-strong)",
          marginBottom: "48px",
          position: "relative",
          left: "50%",
          transform: "translateX(-50%)",
          boxShadow: "0 0 40px rgba(0,0,0,0.8)"
        }}>
          <button 
            onClick={() => setMode("image")}
            className={`btn-mode ${mode === "image" ? "active" : ""}`}
            style={{
              padding: "12px 32px",
              borderRadius: "4px",
              border: "none",
              backgroundColor: mode === "image" ? "var(--primary)" : "transparent",
              color: mode === "image" ? "#000" : "var(--text-dim)",
              fontWeight: "800",
              cursor: "pointer",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              textTransform: "uppercase",
              fontSize: "0.85rem",
              letterSpacing: "1px"
            }}
          >
            Image Analysis
          </button>
          <button 
            onClick={() => setMode("video")}
            className={`btn-mode ${mode === "video" ? "active" : ""}`}
            style={{
              padding: "12px 32px",
              borderRadius: "4px",
              border: "none",
              backgroundColor: mode === "video" ? "var(--primary)" : "transparent",
              color: mode === "video" ? "#000" : "var(--text-dim)",
              fontWeight: "800",
              cursor: "pointer",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              textTransform: "uppercase",
              fontSize: "0.85rem",
              letterSpacing: "1px"
            }}
          >
            Video Stream
          </button>
        </div>

        {/* The Card */}
        <div className="card animate-fade-in" style={{ 
          minHeight: "500px",
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--border-strong)",
          borderTop: "6px solid var(--primary)",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 30px 60px rgba(0,0,0,0.8)"
        }}>
          {mode === "image" ? <Upload /> : <VideoUpload />}
        </div>
      </main>

      <footer style={{ 
        textAlign: "center", 
        padding: "100px 40px", 
        color: "var(--text-dim)",
        fontSize: "0.9rem",
        borderTop: "1px solid var(--border-strong)",
        background: "var(--bg)"
      }}>
        <div style={{ marginBottom: "12px", color: "var(--text-heading)", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase" }}>
          Road Sentinel System v2.0
        </div>
        <div style={{ marginBottom: "8px" }}>
          © 2026 Pothole Detection System • Driven by Computer Vision
        </div>
        <div style={{ fontSize: "0.8rem", opacity: 0.6 }}>
          Operational Excellence in Infrastructure Safety.
        </div>
      </footer>

      <style>{`
        .btn-mode:hover:not(.active) {
          color: var(--primary) !important;
          background-color: rgba(245, 158, 11, 0.05);
        }
      `}</style>
    </div>
  );
}

export default Home;