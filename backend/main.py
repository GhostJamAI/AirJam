import asyncio
import base64
import json
import os
import uuid
from pathlib import Path

import cv2
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
import base64
import os
import json
import cv2
import asyncio
import mediapipe as mp
from ultralytics.models import YOLO


class Rectangle:
    name = ""
    x1 = 0
    y1 = 0
    x2 = 0
    y2 = 0
    collided = 0

    def __init__(self, name, x1, y1, x2, y2):
        self.name = name
        self.x1 = x1
        self.x2 = x2
        self.y1 = y1
        self.y2 = y2

# mp_hands = mp.solutions.hands
# hands = mp_hands.Hands(static_image_mode=True, max_num_hands=10, min_detection_confidence=0.3, min_tracking_confidence=0.2, model_complexity=1)
# mp_draw = mp.solutions.drawing_utils

mp_pose = mp.solutions.pose
mp_pose_model = mp_pose.Pose(static_image_mode=False,
                    model_complexity=2,
                    enable_segmentation=False,
                    min_detection_confidence=0.5,
                    min_tracking_confidence=0.5)
mp_draw = mp.solutions.drawing_utils

pose = YOLO("yolo11n-pose.pt")
app = FastAPI()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

w, h = 320, 180


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

            multiplayer = False
            base64_data = payload["data"]

            # Get proper payload from base64 data
            if base64_data.startswith("data:image"):
                base64_data = base64_data.split(",")[1]  # Strip metadata

            # Decode and save the image
            image_bytes = base64.b64decode(base64_data)
            with open(file_path, "wb") as f:
                f.write(image_bytes)
            print(f"Saved {random_filename}")

            send_data = await asyncio.to_thread(alter_image, file_path, multiplayer)
            await websocket.send_text(json.dumps({"data": send_data["data"], "cols": send_data["cols"]}))
    except WebSocketDisconnect:
        if os.path.exists(file_path):
            os.remove(file_path)
            print(f"[Deleted] {random_filename}")
        else:
            print(f"[Missing] File was not found: {random_filename}")


def alter_yolo(img_rgb, handPts):
    poseRes = pose(img_rgb, conf=0.3)
    pts = poseRes[0].keypoints.data

    skeleton = [
        # (5, 7),
        (7, 9),  # Left arm
        # (6, 8),
        (8, 10),  # Right arm
        # (5, 6),  # Shoulders
        # (5, 11),
        # (6, 12),  # Torso to hips
        # (11, 12),  # Hips
        # (11, 13),
        # 13, 15),  # Left leg
        # (12, 14),
        # (14, 16),  # Right leg
    ]

    for person in pts:
        kps = person.cpu().numpy()
        if kps.size == 0:  # Skip if no keypoints are detected
            continue

        # Draw keypoints
        for i in range(9, 11):
            kp = kps[i]
            handPts.append(kp)
            if len(kp) == 3:  # Ensure keypoint has (x, y, confidence)
                x, y, conf = kp
                if conf > 0.3:  # Confidence threshold
                    x, y = int(x), int(y)
                    # Ensure the coordinates are within the image bounds
                    if 0 <= x < img_rgb.shape[1] and 0 <= y < img_rgb.shape[0]:
                        cv2.circle(img_rgb, (x, y), 3, (255, 0, 0), -1)  # Red points


def alter_mediapipe(img_rgb, handPts):
    result = mp_pose_model.process(img_rgb)


    HAND_LANDMARKS = [
        mp_pose.PoseLandmark.LEFT_WRIST,
        mp_pose.PoseLandmark.RIGHT_WRIST,
    ]

    # Draw pose landmarks
    if result.pose_landmarks:
        for idx in HAND_LANDMARKS:
            landmark = result.pose_landmarks.landmark[idx]
            h, w, _ = img_rgb.shape
            x, y = int(landmark.x * w), int(landmark.y * h)
            handPts.append((x, y, landmark.visibility))
            cv2.circle(img_rgb, (x, y), 6, (0, 255, 0), cv2.FILLED)

def alter_image(file_path, multiplayer):
    img_rgb = cv2.imread(file_path)

    handPts = []

    if (multiplayer):
        alter_yolo(img_rgb, handPts)
    else:
        alter_mediapipe(img_rgb, handPts)
   
    n = 8
    wOff = int(w/n)
    pad = 4
    rects = []

    sideLengths = int(w / 10)

    res = []  # stores booleans of whether each note is being collided with

    for i in range(0, n):
        rects.append(Rectangle("note" + str(i), w - (wOff * i), h, w - (wOff * (i + 1)) + pad, h - 40))

    rects.append(Rectangle("top", sideLengths, 0, w - sideLengths, sideLengths))  # TOP
    rects.append(Rectangle("right", w, 0, w - sideLengths, h - 80))  # RIGHT
    rects.append(Rectangle("left", 0, 0, sideLengths, h - 80))  # LEFT

    for r in rects:
        renderRect(r, handPts, img_rgb)
        res.append({"name": r.name, "col": r.collided})

    data = {"data": image_array_to_base64(img_rgb), "cols": res}
    return data


def renderRect(rect: Rectangle, pts, img):
    for p in pts:
        x, y, conf = p
        np = [x, y]
        if checkCollide(rect, np):
            rect.collided += 1

    cv2.rectangle(img, (rect.x1, rect.y1), (rect.x2, rect.y2), (255 if rect.collided == 1 else 0, 0 if rect.collided != 0 else 255, 255 if rect.collided >= 2 else 0), 2)


def checkCollide(rect: Rectangle, p):
    copy = rect
    if copy.x1 < copy.x2:
        copy.x1, copy.x2 = copy.x2, copy.x1
    if copy.y1 < copy.y2:
        copy.y1, copy.y2 = copy.y2, copy.y1

    return p[0] < copy.x1 and p[0] > copy.x2 and p[1] < copy.y1 and p[1] > copy.y2


def image_array_to_base64(image_np, format=".png"):
    # Encode image to memory
    success, encoded_image = cv2.imencode(format, image_np)
    if not success:
        raise ValueError("Could not encode image")

    # Convert to base64
    base64_bytes = base64.b64encode(encoded_image.tobytes())
    base64_string = base64_bytes.decode("utf-8")
    return f"data:image/png;base64,{base64_string}"
