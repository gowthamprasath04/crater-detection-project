from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from PIL import Image
import io
import torch
from ultralytics import YOLO
import numpy as np
import os

app = FastAPI()

# Serve static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Load your YOLO model
model = YOLO('crater/craters/fine_tuned_model.pt')  # Adjust to your actual model path


@app.get("/")
async def serve_index():
    return FileResponse("static/index.html")

@app.post("/detect/")
async def detect_craters(file: UploadFile = File(...)):
    try:
        # Read the uploaded image
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        
        # Convert image to a format expected by the model (if needed)
        image_np = np.array(image)

        # Run the image through the model
        results = model(image_np)

        # Process results to return the bounding boxes and confidence scores
        detections = []
        for result in results[0].boxes:
            x_min, y_min, x_max, y_max = result.xyxy[0].tolist()
            conf = result.conf[0].item()
            detections.append({
                "box": [x_min, y_min, x_max, y_max],
                "confidence": conf
            })
        
        return JSONResponse(content={"detections": detections})
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
