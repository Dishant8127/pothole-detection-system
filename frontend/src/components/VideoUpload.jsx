import { useState } from "react";
import axios from "axios";

function VideoUpload() {
  const [video, setVideo] = useState(null);
  const [result, setResult] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [totalPotholes, setTotalPotholes] = useState(null);
  const [liveCount, setLiveCount] = useState(0);
  const [streamUrl, setStreamUrl] = useState(null);

  const pollJobStatus = async (id) => {
    try {
      const res = await axios.get(`http://localhost:8000/detect-video/status/${id}`);
      const jobStatus = res.data.status;
      const currentProgress = res.data.progress || 0;

      setStatus(jobStatus);
      setProgress(currentProgress);

      if (res.data.total_potholes !== undefined) {
        setLiveCount(res.data.total_potholes);
      }

      if (jobStatus === "completed") {
        setResult(`http://localhost:8000${res.data.output_video}`);
        setTotalPotholes(res.data.total_potholes || 0);
        setLiveCount(res.data.total_potholes || 0);
        setProcessing(false);
      } else if (jobStatus === "failed") {
        setStatus(`Failed: ${res.data.error}`);
        setProcessing(false);
      } else if (jobStatus === "processing" || jobStatus === "queued") {
        setTimeout(() => pollJobStatus(id), 1000);
      }
    } catch (error) {
      console.error("Poll error:", error);
      setStatus("Error checking status");
      setProcessing(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setVideo(URL.createObjectURL(file));
    setProcessing(true);
    setStatus("Uploading...");
    setProgress(5);
    setTotalPotholes(null);
    setLiveCount(0);
    setResult(null);
    setStreamUrl(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        "http://localhost:8000/detect-video",
        formData
      );

      const id = res.data.job_id;
      setJobId(id);
      setStreamUrl(`http://localhost:8000/stream/${file.name}`);
      setStatus("Processing...");
      pollJobStatus(id);
    } catch (error) {
      console.error("Upload error:", error);
      setStatus("Upload failed");
      setProcessing(false);
    }
  };

  const getStatusIcon = () => {
    if (status.includes("Upload")) return "📤";
    if (status.includes("Process")) return "🔄";
    return "⏳";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px", width: "100%" }}>
      <div style={{ textAlign: "center" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "8px" }}>Pothole Detection</h2>
        <p style={{ color: "var(--text-dim)" }}>Upload an video  of a road to detect potholes using AI.</p>
      </div>

      {/* Upload Button */}
      <div style={{ textAlign: "center" }}>
        <label className="btn-primary" style={{ 
          display: "inline-flex", 
          alignItems: "center", 
          justifyContent: "center",
          gap: "10px", 
          minWidth: "130px",
          cursor: processing ? "not-allowed" : "pointer",
          fontSize: "1.1rem",
          fontWeight: 700
        }}>
          <input 
            type="file" 
            accept="video/*" 
            onChange={handleUpload}
            disabled={processing}
            style={{ display: "none" }}
          />
          {processing ? "⏳ Processing..." : "🎥 Upload Video"}
        </label>
      </div>

      {/* Processing Dashboard */}
      {processing && (
        <div className="card" style={{ padding: "24px", borderLeft: "4px solid var(--primary)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "1.2rem" }}>{getStatusIcon()}</span>
              <span style={{ fontWeight: "600", color: "var(--text-heading)" }}>{status}</span>
            </div>
            <span style={{ color: "var(--primary)", fontWeight: "700" }}>{progress}%</span>
          </div>

          <div style={{ height: "8px", backgroundColor: "var(--bg-accent)", borderRadius: "4px", overflow: "hidden", marginBottom: "20px" }}>
            <div style={{ width: `${progress}%`, height: "100%", background: "linear-gradient(to right, var(--primary), var(--secondary))", transition: "width 0.4s ease" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={{ backgroundColor: "var(--bg-accent)", padding: "12px", borderRadius: "var(--radius-sm)", textAlign: "center" }}>
              <div style={{ fontSize: "0.7rem", color: "var(--text-dim)", textTransform: "uppercase" }}>Live Detections</div>
              <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--primary)" }}>{liveCount}</div>
            </div>
            <div style={{ backgroundColor: "var(--bg-accent)", padding: "12px", borderRadius: "var(--radius-sm)", textAlign: "center" }}>
              <div style={{ fontSize: "0.7rem", color: "var(--text-dim)", textTransform: "uppercase" }}>Job ID</div>
              <div style={{ fontSize: "0.8rem", fontWeight: "500", marginTop: "8px" }}>{jobId ? jobId.substring(0, 8) : "---"}</div>
            </div>
          </div>
        </div>
      )}

      {/* Videos Layout */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: (video && (result || streamUrl)) ? "repeat(auto-fit, minmax(400px, 1fr))" : "1fr",
        gap: "32px",
        marginTop: "16px"
      }}>
        {video && (
          <div className="card" style={{ 
            padding: "20px", 
            display: "flex", 
            flexDirection: "column",
            height: "100%",
            boxSizing: "border-box"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--text-dim)" }}></div>
              <h3 style={{ fontSize: "0.9rem", color: "var(--text)", textTransform: "uppercase", letterSpacing: "1px", margin: 0 }}>Original Input</h3>
            </div>
            
            <div style={{ 
              borderRadius: "var(--radius-sm)", 
              overflow: "hidden", 
              backgroundColor: "#000", 
              aspectRatio: "16/9", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              border: "1px solid var(--bg-accent)",
              flex: 1
            }}>
              <video src={video} controls width="100%" style={{ height: "100%", objectFit: "contain" }} />
            </div>
          </div>
        )}

        {(result || streamUrl) && (
          <div className="card" style={{ 
            padding: "20px", 
            display: "flex", 
            flexDirection: "column",
            height: "100%",
            boxSizing: "border-box",
            borderColor: result ? "var(--primary)" : "var(--secondary)",
            borderTop: result ? "6px solid var(--primary)" : "6px solid var(--secondary)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div style={{ 
                width: "8px", 
                height: "8px", 
                borderRadius: "50%", 
                backgroundColor: result ? "var(--primary)" : "#ef4444",
                boxShadow: result ? "none" : "0 0 10px #ef4444"
              }}></div>
              <h3 style={{ fontSize: "0.9rem", color: result ? "var(--primary)" : "var(--secondary)", textTransform: "uppercase", letterSpacing: "1px", margin: 0 }}>
                {result ? "Detection Completed" : "Live Detection Stream"}
              </h3>
            </div>
            
            <div style={{ 
              borderRadius: "var(--radius-sm)", 
              overflow: "hidden", 
              backgroundColor: "#000", 
              aspectRatio: "16/9", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              border: "1px solid var(--bg-accent)",
              flex: 1
            }}>
              {result ? (
                <video controls width="100%" style={{ height: "100%", objectFit: "contain" }}>
                  <source src={result} type="video/mp4" />
                </video>
              ) : (
                <img src={streamUrl} alt="Live stream" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
              )}
            </div>

            {/* Stats Card inside the result card for better grouping */}
            {totalPotholes !== null && (
              <div style={{
                marginTop: "20px",
                padding: "20px",
                backgroundColor: "rgba(245, 158, 11, 0.05)",
                borderRadius: "var(--radius-sm)",
                textAlign: "center",
                border: "1px solid var(--border-strong)"
              }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "2px", fontWeight: "700", marginBottom: "4px" }}>Total Hazards Detected</div>
                <div style={{ fontSize: "3rem", fontWeight: "900", color: "var(--primary)", lineHeight: "1" }}>
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

export default VideoUpload;
