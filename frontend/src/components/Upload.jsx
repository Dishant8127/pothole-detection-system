import { useState } from "react";
import axios from "axios";

function App() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [totalPotholes, setTotalPotholes] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    setImage(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.post(
      "http://localhost:8000/detect",
      formData
    );

    setResult(`http://localhost:8000/outputs/${res.data.output_image}`);
    setTotalPotholes(res.data.total_potholes || 0);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Pothole Detection 🚧</h2>

      <input type="file" onChange={handleUpload} />

      <div style={{ marginTop: "20px" }}>
        {image && <img src={image} width="300" alt="input" />}
        {result && (
          <div>
            <img src={result} width="300" alt="result" />
            
            {/* ✅ Detection Count */}
            {totalPotholes !== null && (
              <div style={{
                marginTop: "15px",
                padding: "15px",
                backgroundColor: "#FFE5E5",
                borderRadius: "8px",
                textAlign: "center",
                border: "2px solid #FF6B6B"
              }}>
                <h4 style={{ margin: "0 0 10px 0", color: "#C92A2A" }}>
                  🎯 Detection Results
                </h4>
                <p style={{ margin: "0", fontSize: "20px", fontWeight: "bold", color: "#C92A2A" }}>
                  Total Potholes: {totalPotholes}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;