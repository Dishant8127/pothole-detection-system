import { useState } from "react";
import axios from "axios";

function Upload() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [totalPotholes, setTotalPotholes] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(URL.createObjectURL(file));
    setIsUploading(true);
    setResult(null);
    setTotalPotholes(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        "http://localhost:8000/detect",
        formData
      );

      setResult(`http://localhost:8000/outputs/${res.data.output_image}`);
      setTotalPotholes(res.data.total_potholes || 0);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error detecting potholes. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px", width: "100%" }}>
      <div style={{ textAlign: "center" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "8px" }}>Pothole Detection</h2>
        <p style={{ color: "var(--text-dim)" }}>Upload an image of a road to detect potholes using AI.</p>
      </div>

      {/* Styled Upload Area */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <label className="btn-primary" style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          minWidth: "130px",
          cursor: isUploading ? "not-allowed" : "pointer",
          fontSize: "1.1rem",
          fontWeight: 700
        }}>
          <input
            type="file"
            onChange={handleUpload}
            disabled={isUploading}
            style={{ display: "none" }}
            accept="image/*"
          />
          {isUploading ? "🔍 Detecting..." : "📸 Upload Image"}
        </label>
      </div>

      {/* Results Display */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: image && result ? "repeat(auto-fit, minmax(300px, 1fr))" : "1fr",
        gap: "24px",
        marginTop: "16px"
      }}>
        {/* Input Preview */}
        {image && (
          <div className="card" style={{ padding: "16px" }}>
            <h3 style={{ fontSize: "1rem", marginBottom: "12px", color: "var(--text-dim)" }}>Original Image</h3>
            <div style={{ 
              borderRadius: "var(--radius-sm)", 
              overflow: "hidden", 
              backgroundColor: "black",
              aspectRatio: "16/9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <img src={image} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} alt="input" />
            </div>
          </div>
        )}

        {/* Detection Result */}
        {result && (
          <div className="card" style={{ padding: "16px", borderColor: "var(--primary)", borderTop: "4px solid var(--primary)" }}>
            <h3 style={{ fontSize: "1rem", marginBottom: "12px", color: "var(--primary)", textTransform: "uppercase", letterSpacing: "1px" }}>AI Detection Result</h3>
            <div style={{ 
              borderRadius: "var(--radius-sm)", 
              overflow: "hidden", 
              backgroundColor: "#000",
              aspectRatio: "16/9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              border: "1px solid var(--bg-accent)"
            }}>
              <img src={result} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} alt="result" />
            </div>

            {/* Stats Card */}
            {totalPotholes !== null && (
              <div style={{
                marginTop: "16px",
                padding: "24px 16px",
                backgroundColor: "rgba(245, 158, 11, 0.05)",
                borderRadius: "var(--radius-sm)",
                textAlign: "center",
                border: "1px solid var(--border-strong)",
                position: "relative",
                overflow: "hidden"
              }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "2px", fontWeight: "700", marginBottom: "8px" }}>
                  Hazards Identified
                </div>
                <div style={{ 
                  fontSize: "3.5rem", 
                  fontWeight: "900", 
                  color: "var(--primary)",
                  lineHeight: "1"
                }}>
                  {totalPotholes}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Upload;