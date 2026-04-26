import uvicorn
import os

if __name__ == "__main__":
    # Ensure directories exist
    os.makedirs("uploads", exist_ok=True)
    os.makedirs("outputs", exist_ok=True)
    os.makedirs("uploads/videos", exist_ok=True)
    os.makedirs("outputs/videos", exist_ok=True)
    
    print("Starting Pothole Detection Backend on http://localhost:8000")
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
