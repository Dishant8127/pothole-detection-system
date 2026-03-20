import cv2
from ultralytics import YOLO

model = YOLO("weights/best.pt")

# ✅ Solution 1 & 2: Resize frames + Skip frames
def process_video(input_path, output_path, frame_skip=3, target_width=640, target_height=480, progress_callback=None):
    """
    Process video with optimizations:
    - Resize frames to reduce processing time
    - Skip frames to process every Nth frame
    - Count total potholes detected
    - Use stream=True to avoid RAM accumulation
    - Provide live progress updates
    
    Returns: (output_path, total_potholes)
    """
    cap = cv2.VideoCapture(input_path)

    # Get video properties
    original_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    original_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    # Video writer (output at original resolution for quality)
    # Use avc1 codec for better browser compatibility
    fourcc = cv2.VideoWriter_fourcc(*'avc1')
    out = cv2.VideoWriter(output_path, fourcc, fps // frame_skip, (original_width, original_height))

    frame_count = 0
    total_potholes = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        frame_count += 1
        
        # ✅ Skip frames (process every 3rd frame)
        if frame_count % frame_skip != 0:
            continue

        # ✅ Resize frame for faster inference
        resized_frame = cv2.resize(frame, (target_width, target_height))

        # ✅ Run YOLO on resized frame with stream=True to avoid RAM accumulation
        results = model(resized_frame, stream=False)

        # Calculate scale factors for original frame
        scale_x = original_width / target_width
        scale_y = original_height / target_height

        for r in results:
            for box in r.boxes:
                # Scale coordinates back to original size
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                x1, x2 = int(x1 * scale_x), int(x2 * scale_x)
                y1, y2 = int(y1 * scale_y), int(y2 * scale_y)
                
                conf = float(box.conf[0])
                
                # ✅ Count detections
                total_potholes += 1

                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                cv2.putText(frame, f"Pothole {conf:.2f}",
                            (x1, y1 - 10),
                            cv2.FONT_HERSHEY_SIMPLEX,
                            0.5, (0, 255, 0), 2)

        out.write(frame)

        # ✅ Live progress callback
        if progress_callback:
            progress_percent = int((frame_count / total_frames) * 100)
            progress_callback(progress_percent, total_potholes)

    cap.release()
    out.release()

    return output_path, total_potholes