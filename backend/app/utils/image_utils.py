import cv2

def draw_boxes(results, image_path, output_path):
    # Use the original image from YOLO results which is robust across formats
    img = results[0].orig_img.copy()
    
    for r in results:
        for box in r.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            conf = float(box.conf[0])
            
            # Use Green (B=0, G=255, R=0 in OpenCV)
            cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.putText(img, f"Pothole {conf:.2f}", 
                        (x1, y1 - 10), 
                        cv2.FONT_HERSHEY_SIMPLEX, 
                        0.5, (0, 255, 0), 2)
    
    # Save the output as JPG regardless of input format for maximum compatibility
    cv2.imwrite(output_path, img)