from pathlib import Path
import uuid
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
import base64
import os
import json
import cv2
import asyncio


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
    edges = cv2.Canny(img, 100, 200)

    data = image_array_to_base64(edges)
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
