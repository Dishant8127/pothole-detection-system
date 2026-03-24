from fastapi import APIRouter, UploadFile, File, BackgroundTasks
from fastapi.responses import JSONResponse, StreamingResponse
import shutil
import os
import uuid
import cv2
import time
from app.services.yolo_service import detect_potholes, model
from app.utils.image_utils import draw_boxes
from app.utils.video_utils import process_video

router = APIRouter()

UPLOAD_DIR = "uploads"
OUTPUT_DIR = "outputs"
VIDEOS_UPLOAD_DIR = "uploads/videos"
VIDEOS_OUTPUT_DIR = "outputs/videos"

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(VIDEOS_UPLOAD_DIR, exist_ok=True)
os.makedirs(VIDEOS_OUTPUT_DIR, exist_ok=True)

job_status = {}

@router.post("/detect")
async def detect(file: UploadFile = File(...)):
    base_filename = os.path.splitext(file.filename)[0]
    output_filename = f"output_{base_filename}.jpg"
    
    file_path = f"{UPLOAD_DIR}/{file.filename}"
    output_path = f"{OUTPUT_DIR}/{output_filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    results = detect_potholes(file_path)

    draw_boxes(results, file_path, output_path)

    total_potholes = 0
    for r in results:
        total_potholes += len(r.boxes) if r.boxes else 0

    return {
        "message": "Detection complete",
        "output_image": output_filename,
        "total_potholes": total_potholes
    }

def process_video_background(job_id: str, input_path: str, output_path: str):
    try:
        job_status[job_id] = {"status": "processing", "progress": 10, "total_potholes": 0}
        
        def update_progress(progress_percent, pothole_count):
            overall_progress = 10 + int((progress_percent / 100) * 85)
            job_status[job_id] = {
                "status": "processing",
                "progress": overall_progress,
                "total_potholes": pothole_count
            }

        result_path, total_potholes = process_video(input_path, output_path, progress_callback=update_progress)

        filename = result_path.split("/")[-1]
        serve_path = f"/outputs/videos/{filename}"
        
        job_status[job_id] = {
            "status": "completed",
            "output_video": serve_path,
            "total_potholes": total_potholes,
            "progress": 100
        }
    except Exception as e:
        job_status[job_id] = {
            "status": "failed",
            "error": str(e),
            "progress": 0,
            "total_potholes": 0
        }

@router.post("/detect-video")
async def detect_video(file: UploadFile = File(...), background_tasks: BackgroundTasks = None):
    job_id = str(uuid.uuid4())
    
    input_path = f"{VIDEOS_UPLOAD_DIR}/{file.filename}"
    output_path = f"{VIDEOS_OUTPUT_DIR}/output_{file.filename}"

    with open(input_path, "wb") as buffer:
        buffer.write(await file.read())

    if background_tasks:
        background_tasks.add_task(process_video_background, job_id, input_path, output_path)
        job_status[job_id] = {"status": "queued", "progress": 0, "total_potholes": 0}
    else:

        result_path, total_potholes = process_video(input_path, output_path)
        filename = result_path.split("/")[-1]
        serve_path = f"videos/{filename}"
        return {
            "message": "Video processed",
            "output_video": serve_path,
            "total_potholes": total_potholes
        }

    return {
        "job_id": job_id,
        "message": "Video processing started",
        "status": "queued"
    }

@router.get("/detect-video/status/{job_id}")
async def get_job_status(job_id: str):
    if job_id not in job_status:
        return {"error": "Job not found"}, 404
    
    return job_status[job_id]

def generate_video_stream(video_path: str):
    cap = cv2.VideoCapture(video_path)
    
    if not cap.isOpened():
        return

    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps <= 0: fps = 30
    frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    target_width, target_height = 640, 480
    scale_x = target_width / frame_width
    scale_y = target_height / frame_height
    
    frame_count = 0
    try:
        while True:
            start_time = time.time()
            success, frame = cap.read()
            if not success:
                break

            frame_count += 1
            if frame_count % 2 != 0:
                continue

            frame_resized = cv2.resize(frame, (target_width, target_height))

            results = model(frame_resized, verbose=False, stream=False)

            for r in results:
                if r.boxes:
                    for box in r.boxes:
                        x1, y1, x2, y2 = map(int, box.xyxy[0])
                        conf = float(box.conf[0])

                        cv2.rectangle(frame_resized, (x1, y1), (x2, y2), (0, 255, 0), 2)
                        cv2.putText(frame_resized, f"Pothole {conf:.2f}", 
                                    (x1, y1-10), 
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

            ret, buffer = cv2.imencode('.jpg', frame_resized, [cv2.IMWRITE_JPEG_QUALITY, 80])
            frame_bytes = buffer.tobytes()

            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n'
                   b'Content-Length: ' + str(len(frame_bytes)).encode() + b'\r\n\r\n'
                   + frame_bytes + b'\r\n')

            elapsed = time.time() - start_time
            sleep_time = max(0.0, (1.0 / (fps / 2)) - elapsed)
            if sleep_time > 0:
                time.sleep(sleep_time)  
    
    finally:
        cap.release()

@router.get("/stream/{video_filename}")
async def stream_video(video_filename: str):
    video_path = f"{VIDEOS_UPLOAD_DIR}/{video_filename}"

    if not os.path.exists(video_path):
        return JSONResponse(
            {"error": f"Video not found: {video_path}"},
            status_code=404
        )
    
    return StreamingResponse(
        generate_video_stream(video_path),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )