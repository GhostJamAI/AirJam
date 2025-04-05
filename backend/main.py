from pathlib import Path
import uuid
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
import base64
import os
import json
import cv2
import asyncio
from ultralytics.models import YOLO

pose = YOLO("yolo11n-pose.pt")
app = FastAPI()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    random_filename = f"{uuid.uuid4().hex}.png"
    file_path = os.path.join(UPLOAD_DIR, random_filename)

    try:
        while True:
            # Take JSON 
            data = await websocket.receive_text()
            # Parse JSON
            payload = json.loads(data)

            base64_data = payload["data"]

            # Get proper payload from base64 data
            if base64_data.startswith("data:image"):
                base64_data = base64_data.split(",")[1]  # Strip metadata

            # Decode and save the image
            image_bytes = base64.b64decode(base64_data)
            with open(file_path, "wb") as f:
                f.write(image_bytes)
            print(f"Saved {random_filename}")

            data_url = await asyncio.to_thread(alter_image, file_path)
            await websocket.send_text(json.dumps({"data": data_url}))
    except WebSocketDisconnect:
        if os.path.exists(file_path):
            os.remove(file_path)
            print(f"[Deleted] {random_filename}")
        else:
            print(f"[Missing] File was not found: {random_filename}")

def alter_image(file_path):
    img = cv2.imread(file_path)
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    #edges = cv2.Canny(img, 100, 200)

    poseRes = pose(img, conf=0.3)
    pts = poseRes[0].keypoints.data

    skeleton = [
        #(5, 7),
        (7, 9),  # Left arm
        #(6, 8),
        (8, 10),  # Right arm
        #(5, 6),  # Shoulders
        #(5, 11),
        #(6, 12),  # Torso to hips
        #(11, 12),  # Hips
        #(11, 13),
        #13, 15),  # Left leg
        #(12, 14),
        #(14, 16),  # Right leg
    ]

    for person in pts:
        kps = person.cpu().numpy()
        if kps.size == 0:  # Skip if no keypoints are detected
            continue

        
        # Draw skeleton connections
        for start_idx, end_idx in skeleton:
            # Check if keypoint indices are valid
            if start_idx < len(kps) and end_idx < len(kps):
                start_kp = kps[start_idx]
                end_kp = kps[end_idx]
                # Check if both keypoints have sufficient confidence
                if start_kp[2] > 0.3 and end_kp[2] > 0.3:  # Confidence threshold
                    start_x, start_y = int(start_kp[0]), int(start_kp[1])
                    end_x, end_y = int(end_kp[0]), int(end_kp[1])
                    # Ensure the coordinates are within the image bounds
                    if 0 <= start_x < img_rgb.shape[1] and 0 <= start_y < img_rgb.shape[0] and 0 <= end_x < img_rgb.shape[1] and 0 <= end_y < img_rgb.shape[0]:
                        if start_x == 0 and start_y == 0:
                            continue
                        if end_x == 0 and end_y == 0:
                            continue
                        cv2.line(img_rgb, (start_x, start_y), (end_x, end_y), (0, 0, 255), 2)  # Blue lines
        
        # Draw keypoints
        for kp in kps:
            if len(kp) == 3:  # Ensure keypoint has (x, y, confidence)
                x, y, conf = kp
                if conf > 0.3:  # Confidence threshold
                    x, y = int(x), int(y)
                    # Ensure the coordinates are within the image bounds
                    if 0 <= x < img_rgb.shape[1] and 0 <= y < img_rgb.shape[0]:
                        cv2.circle(img_rgb, (x, y), 3, (255, 0, 0), -1)  # Red points

    data = image_array_to_base64(img_rgb)
    return data

def image_array_to_base64(image_np, format=".png"):
    # Encode image to memory
    success, encoded_image = cv2.imencode(format, image_np)
    if not success:
        raise ValueError("Could not encode image")

    # Convert to base64
    base64_bytes = base64.b64encode(encoded_image.tobytes())
    base64_string = base64_bytes.decode("utf-8")
    return f"data:image/png;base64,{base64_string}"
