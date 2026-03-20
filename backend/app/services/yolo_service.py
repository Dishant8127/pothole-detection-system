from ultralytics import YOLO

model = YOLO("weights/best.pt")

def detect_potholes(image_path):
    results = model(image_path)
    return results