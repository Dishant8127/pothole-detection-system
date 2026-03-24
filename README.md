# Pothole Detection System 🚧

**An end-to-end computer vision web application designed to automatically detect and highlight road potholes in real-time.** 

The system leverages a custom **YOLO** object detection model deployed via a high-performance **FastAPI** backend, seamlessly integrated with a modern **React** frontend for uploading and analyzing images and video streams. This project was developed as part of an AI/ML internship to demonstrate the practical deployment of deep learning models in web environments.

---

##  Objectives
* **Automated Detection:** Develop an accurate and scalable machine learning solution capable of localizing road hazards in varied lighting and environments.
* **Safety & Infrastructure:** Provide an accessible, user-friendly web interface that allows municipalities and drivers to monitor road infrastructure effectively, ultimately improving road safety.
* **End-to-End Deployment:** Bridge the gap between model training and real-world application by building a full-stack architecture that supports real-time video inference.

##  Results
* Successfully integrated a custom-trained **YOLOv8** model that achieves high accuracy in detecting potholes on roads. 
* Engineered a robust backend architecture that rapidly processes incoming video streams and static images, returning precise bounding-box predictions with minimal latency.
* Delivered a fully responsive React frontend, allowing users to seamlessly upload media and view hazard alerts instantly.

##  Technologies Used
* **Machine Learning & Vision:** Ultralytics YOLOv8, PyTorch, OpenCV
* **Backend Development:** Python, FastAPI, Uvicorn
* **Frontend Development:** React 19, JavaScript, Vite, Axios

---

##  Backend API & Inference Architecture

The backend serves as the core processing engine, built entirely in Python using **FastAPI** for its asynchronous speed and automatic documentation generation.

### Inference Pipeline
1. **Media Upload:** The client sends a multipart-form containing an image or video file.
2. **Preprocessing:** OpenCV and custom utilities clean and resize the media.
3. **Detection:** The pre-loaded `best.pt` (YOLOv8) weights model runs inference on the media.
4. **Post-processing:** Bounding boxes and confidence scores are drawn directly onto the frames.
5. **Response:** The backend returns the processed media URL and a JSON payload detailing the list of detected potholes, their coordinates, and confidence levels.

### Key Endpoints
* `POST /detect`: Main route for uploading files and receiving detection results.
* `GET /outputs/{filename}`: Static route to serve the processed files back to the React frontend.

---

##  Getting Started

### Prerequisites
* Node.js (v18+ recommended)
* Python (v3.10+ recommended)

### 1. Backend Setup
Navigate to the backend directory and set up your python environment:
```bash
cd backend

# Create and activate a virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server
uvicorn app.main:app --reload
```
The backend API will be running at `http://localhost:8000`. Output files from detections will be mounted statically at `/outputs`.

### 2. Frontend Setup
Open a new terminal and navigate to the frontend directory:
```bash
cd frontend

# Install Node modules
npm install

# Start the Vite development server
npm run dev
```
The React application will be accessible at the local URL provided by Vite (usually `http://localhost:5173`).
