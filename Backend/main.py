from pathlib import Path
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
import base64
import os
import json
import time

app = FastAPI()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    try:
        while True:
            # Take JSON 
            data = await websocket.receive_text()
            # Parse JSON
            payload = json.loads(data)
            
            filename = "frame.png"
            base64_data = payload["data"]

            # Get proper payload from base64 data
            if base64_data.startswith("data:image"):
                base64_data = base64_data.split(",")[1]  # Strip metadata

            # Decode and save the image
            image_bytes = base64.b64decode(base64_data)
            with open(os.path.join(UPLOAD_DIR, filename), "wb") as f:
                f.write(image_bytes)

            print(f"Saved {filename} at {time.time()}")
    except WebSocketDisconnect:
        print("Client disconnected.")