import { useState, useEffect } from "react";
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
  const [videoFilename, setVideoFilename] = useState(null);

  const pollJobStatus = async (id) => {
    try {
      const res = await axios.get(`http://localhost:8000/detect-video/status/${id}`);
      const jobStatus = res.data.status;
      const currentProgress = res.data.progress || 0;

      setStatus(jobStatus);
      setProgress(currentProgress);

      // Live update of pothole count
      if (res.data.total_potholes !== undefined) {
        setLiveCount(res.data.total_potholes);
      }

      if (jobStatus === "completed") {
        const videoPath = `http://localhost:8000${res.data.output_video}`;
        console.log("Video URL:", videoPath);
        setResult(videoPath);
        setTotalPotholes(res.data.total_potholes || 0);
        setLiveCount(res.data.total_potholes || 0);
        setProcessing(false);
      } else if (jobStatus === "failed") {
        setStatus(`Failed: ${res.data.error}`);
        setProcessing(false);
      } else if (jobStatus === "processing" || jobStatus === "queued") {
        // Poll more frequently for live updates
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
    setStatus("📤 Uploading file...");
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
      
      // Construct stream URL - stream expects the uploaded filename
      const streamUri = `http://localhost:8000/stream/${file.name}`;
      setStreamUrl(streamUri);
      setVideoFilename(file.name);
      
      setStatus("🔄 Processing video... (Live Stream Starting)");
      setProgress(15);

      // Start polling for live updates
      pollJobStatus(id);
    } catch (error) {
      console.error("Upload error:", error);
      setStatus("❌ Upload failed");
      setProcessing(false);
    }
  };

  const getStatusIcon = () => {
    if (status.includes("Upload")) return "📤";
    if (status.includes("Process")) return "🔄";
    if (status.includes("Detect")) return "🔍";
    return "⏳";
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <h1 style={{ textAlign: "center", color: "#222", marginBottom: "30px" }}>🎥 Video Pothole Detection</h1>

      {/* Upload Button */}
      <div style={{ marginBottom: "20px", textAlign: "center" }}>
        <label style={{ 
          display: "inline-block",
          padding: "12px 30px",
          backgroundColor: processing ? "#ccc" : "#FF6B6B",
          color: "white",
          borderRadius: "8px",
          cursor: processing ? "not-allowed" : "pointer",
          fontWeight: "bold",
          fontSize: "16px",
          transition: "all 0.3s ease"
        }}>
          <input 
            type="file" 
            accept="video/*" 
            onChange={handleUpload}
            disabled={processing}
            style={{ display: "none" }}
          />
          {processing ? "⏳ Processing..." : "📂 Choose Video File"}
        </label>
      </div>

      {/* Live Status Display */}
      {processing && (
        <div style={{
          backgroundColor: "white",
          border: "3px solid #FF6B6B",
          borderRadius: "10px",
          padding: "20px",
          marginBottom: "20px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
        }}>
          {/* Status with Icon */}
          <div style={{ 
            fontSize: "20px", 
            fontWeight: "bold", 
            marginBottom: "15px",
            color: "#FF6B6B"
          }}>
            {getStatusIcon()} {status}
          </div>

          {/* Progress Bar */}
          <div style={{
            width: "100%",
            backgroundColor: "#E0E0E0",
            borderRadius: "10px",
            overflow: "hidden",
            height: "40px",
            marginBottom: "20px"
          }}>
            <div style={{
              width: `${progress}%`,
              backgroundColor: "#FF6B6B",
              height: "100%",
              transition: "width 0.3s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "bold",
              fontSize: "14px"
            }}>
              {progress}%
            </div>
          </div>

          {/* Live Statistics */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "15px"
          }}>
            <div style={{
              backgroundColor: "#FFE5E5",
              padding: "15px",
              borderRadius: "8px",
              textAlign: "center",
              border: "2px solid #FF6B6B"
            }}>
              <div style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>🔍 Live Detections</div>
              <div style={{ fontSize: "32px", fontWeight: "bold", color: "#FF6B6B" }}>
                {liveCount}
              </div>
            </div>

            {jobId && (
              <div style={{
                backgroundColor: "#f0f0f0",
                padding: "15px",
                borderRadius: "8px",
                textAlign: "center",
                border: "2px solid #ddd"
              }}>
                <div style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>📋 Job ID</div>
                <div style={{ fontSize: "14px", fontWeight: "bold", color: "#333", wordBreak: "break-all" }}>
                  {jobId.substring(0, 12)}...
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Video Display */}
      <div style={{ 
        marginTop: "20px", 
        display: "grid",
        gridTemplateColumns: (video && result) || (video && streamUrl) ? "1fr 1fr" : "1fr",
        gap: "20px",
        justifyItems: "center"
      }}>
        {video && (
          <div style={{ 
            backgroundColor: "white",
            border: "2px solid #ddd",
            borderRadius: "10px",
            padding: "15px",
            textAlign: "center",
            width: "100%",
            maxWidth: "500px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
          }}>
            <h3 style={{ marginTop: "0", color: "#333" }}>📹 Original Video</h3>
            <video 
              src={video} 
              controls 
              width="100%" 
              style={{ 
                borderRadius: "5px",
                backgroundColor: "#000",
                maxHeight: "400px"
              }} 
            />
          </div>
        )}

        {(result || processing) && (
          <div style={{ 
            backgroundColor: result ? "white" : "#f9f9f9",
            border: result ? "2px solid #4CAF50" : "2px dashed #ccc",
            borderRadius: "10px",
            padding: "15px",
            textAlign: "center",
            width: "100%",
            maxWidth: "500px",
            boxShadow: result ? "0 4px 6px rgba(0,0,0,0.1)" : "none",
            minHeight: "450px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center"
          }}>
            <h3 style={{ marginTop: "0", color: result ? "#4CAF50" : (streamUrl ? "#2196F3" : "#999") }}>
              {result ? "✅ Processed Video" : (streamUrl ? "🔴 Live Stream" : "⏳ Processing...")}
            </h3>
            
            {result ? (
              <>
                <video 
                  controls 
                  width="100%" 
                  style={{ 
                    borderRadius: "5px",
                    backgroundColor: "#000",
                    maxHeight: "400px"
                  }} 
                >
                  <source src={result} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                
                {/* Final Detection Card */}
                {totalPotholes !== null && (
                  <div style={{
                    marginTop: "15px",
                    padding: "15px",
                    backgroundColor: "#FFE5E5",
                    borderRadius: "8px",
                    border: "2px solid #FF6B6B"
                  }}>
                    <h4 style={{ margin: "0 0 10px 0", color: "#C92A2A" }}>
                      🎯 Detection Results
                    </h4>
                    <p style={{ 
                      margin: "0", 
                      fontSize: "28px", 
                      fontWeight: "bold", 
                      color: "#FF6B6B" 
                    }}>
                      Total Potholes: <span>{totalPotholes}</span>
                    </p>
                  </div>
                )}
              </>
            ) : (
              <>
                {streamUrl ? (
                  <>
                    <img 
                      src={streamUrl} 
                      alt="Live stream detection" 
                      style={{
                        borderRadius: "5px",
                        backgroundColor: "#000",
                        maxHeight: "380px",
                        width: "100%",
                        objectFit: "contain"
                      }}
                    />
                    <p style={{ color: "#666", fontSize: "12px", margin: "10px 0 0 0" }}>
                      🔴 Live detection stream running...
                    </p>
                  </>
                ) : (
                  <>
                    <div style={{
                      fontSize: "48px",
                      animation: "spin 2s linear infinite"
                    }}>⏳</div>
                    <p style={{ color: "#999", fontSize: "14px", margin: "10px 0 0 0" }}>
                      Processing in background...
                    </p>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Add animation for spinner */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default VideoUpload;
