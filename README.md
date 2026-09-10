# AetherVision

## Real-Time Computer Vision Suite

AetherVision is a real-time computer vision and visual analytics suite built with **React, Vite, Python, Flask, and OpenCV**.

The system captures live camera frames, sends them to a Python computer vision backend, analyzes faces and facial expressions, estimates age demographics, measures motion, detects visual moments, and presents the results through an interactive real-time dashboard.

It also supports uploaded video analysis for generating emotion timelines, age estimates, motion information, and detected moments.

---

## Features

### Real-Time Camera Analysis

* Live webcam processing
* Real-time face detection
* Face bounding boxes
* Facial landmarks
* Multi-face detection
* Real-time FPS monitoring
* Inference latency tracking
* Motion-level telemetry

### Facial Analysis

AetherVision performs several forms of facial analysis:

* Face detection
* Eye detection
* Smile detection
* Profile-face detection
* Facial landmark analysis
* Age estimation
* Age-group classification
* Facial expression analysis
* Emotion confidence scoring

The current emotion analysis supports seven core emotional categories:

* Happy
* Neutral
* Surprised
* Sad
* Angry
* Fear
* Disgust

### Visual Moments

The CV engine can detect notable events during a session, including:

* Joy peaks
* Surprise reactions
* High-motion events
* Mood/expression transitions

Detected moments are stored in the session history and displayed through the dashboard.

### Video Analysis

AetherVision can analyze uploaded video files frame-by-frame.

The backend provides:

* Video duration
* Number of analyzed samples
* Average estimated age
* Emotion breakdown
* Emotion timeline
* Motion information
* Detected moments

For performance, the backend samples video frames rather than processing every frame continuously. The current implementation samples approximately every 0.35 seconds and applies a safety limit to the number of processed frames.

### Dashboard

The frontend provides an interactive telemetry dashboard containing:

* Camera viewport
* Face detection results
* Moments feed
* Emotion analytics
* Age demographics
* FPS
* Backend status
* Inference latency
* Session controls
* Video upload
* Session report
* Snapshot capture

The React application connects to the Flask API for real-time analysis and updates the dashboard as new frames are processed.

---

## Technology Stack

### Frontend

* React 19
* Vite 8
* JavaScript / JSX
* CSS
* Lucide React
* Canvas Confetti

### Backend

* Python
* Flask
* Flask-CORS
* OpenCV
* NumPy
* Pillow

### Computer Vision

* OpenCV Haar Cascades
* OpenCV YuNet face detection model
* Image processing
* Facial feature analysis
* Motion analysis

The repository currently includes YuNet and several Haar Cascade model files under `backend/models`.

---

## Architecture

```text
                    AetherVision
                         |
          +--------------+--------------+
          |                             |
     React Frontend                Flask Backend
          |                             |
          | HTTP / JSON                 |
          +------------->---------------+
                                        |
                                  CVEngine
                                        |
                    +-------------------+-------------------+
                    |                   |                   |
              Face Detection      Facial Analysis     Motion Analysis
                    |                   |                   |
                    |          +--------+--------+          |
                    |          |                 |          |
                    |        Age             Emotion       |
                    |          |                 |          |
                    +----------+-----------------+----------+
                                        |
                                  Moment Detection
                                        |
                                  Analysis Results
                                        |
                                  React Dashboard
```

---

## Project Structure

```text
AetherVision/
│
├── backend/
│   ├── models/
│   │   ├── face_detection_yunet_2023mar.onnx
│   │   ├── haarcascade_eye.xml
│   │   ├── haarcascade_frontalface_default.xml
│   │   ├── haarcascade_profileface.xml
│   │   └── haarcascade_smile.xml
│   │
│   ├── app.py
│   ├── cv_engine.py
│   └── requirements.txt
│
├── public/
│   ├── favicon.svg
│   └── icons.svg
│
├── src/
│   ├── assets/
│   │
│   ├── components/
│   │   ├── AgeDemographics.jsx
│   │   ├── CameraViewport.jsx
│   │   ├── EmotionAnalytics.jsx
│   │   ├── Header.jsx
│   │   ├── MomentDetailModal.jsx
│   │   ├── MomentsFeed.jsx
│   │   ├── SessionReportModal.jsx
│   │   └── VideoUploadModal.jsx
│   │
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
│
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```

The structure above reflects the current repository layout.

---

# Installation

## Prerequisites

Make sure you have installed:

* Python 3.x
* Node.js
* npm
* A working webcam

---

## 1. Clone the Repository

```bash
git clone https://github.com/Chitraksaini9999/AetherVision.git
```

```bash
cd AetherVision
```

---

# Backend Setup

Open a terminal inside the project directory.

### Create a virtual environment

```bash
python -m venv venv
```

### Activate the environment

### Windows

```bash
venv\Scripts\activate
```

### macOS / Linux

```bash
source venv/bin/activate
```

### Install Python dependencies

```bash
pip install -r backend/requirements.txt
```

The repository's current backend dependency file contains Flask, Flask-CORS, OpenCV, NumPy, and Pillow.

---

# Start the Backend

Run:

```bash
python -m backend.app
```

The backend runs on:

```text
http://127.0.0.1:5000
```

The Flask application exposes the following API endpoints:

```text
GET  /api/health
POST /api/analyze-frame
GET  /api/moments
POST /api/reset-session
POST /api/analyze-video
```

These endpoints are implemented in the current backend application.

---

# Frontend Setup

Open another terminal in the project directory.

Install the JavaScript dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

The frontend can then be opened using the local URL displayed by Vite.

The current `package.json` provides the following scripts:

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

---

# Running the Complete System

You need two terminals.

### Terminal 1: Backend

```bash
python -m backend.app
```

### Terminal 2: Frontend

```bash
npm run dev
```

Then open the Vite development URL in your browser.

Make sure the backend is running before starting real-time camera analysis.

---

# API

## Health Check

```http
GET /api/health
```

Example response:

```json
{
  "status": "online",
  "service": "AURA-CV Real-Time Computer Vision Suite",
  "version": "1.0.0"
}
```

---

## Analyze Frame

```http
POST /api/analyze-frame
```

The frontend sends a Base64-encoded image to the backend.

The CV engine processes the frame and returns information such as:

```text
faces
moments
telemetry
```

Telemetry includes:

```text
faces_detected
motion_level
inference_time_ms
frame_size
fps_estimate
```

---

## Get Moments

```http
GET /api/moments
```

Returns the moments recorded during the current session.

---

## Reset Session

```http
POST /api/reset-session
```

Clears:

* Tracked faces
* Moment history
* Moment timing state
* Previous frame state

and starts a fresh analysis session.

---

## Analyze Video

```http
POST /api/analyze-video
```

Accepts an uploaded video file and analyzes sampled frames.

The response includes:

```text
filename
duration_sec
analyzed_samples
average_age
emotion_breakdown
moments
timeline
```

---

# Computer Vision Pipeline

Each incoming frame follows a processing pipeline:

```text
Camera Frame
     |
     v
Grayscale Conversion
     |
     v
Motion Calculation
     |
     v
Face Detection
     |
     +-------------------+
     |                   |
     v                   v
Age Estimation      Emotion Analysis
     |                   |
     +---------+---------+
               |
               v
        Facial Landmarks
               |
               v
        Moment Detection
               |
               v
        Telemetry Output
               |
               v
        React Dashboard
```

The backend also downsizes larger frames before face detection to improve processing speed.

---

# Age Estimation

AetherVision currently uses image-based facial texture and morphology calculations for age estimation.

The implementation analyzes regions such as:

* Forehead
* Eye regions
* Cheeks

It calculates texture-related measurements and maps them into estimated age ranges.

The result includes:

```text
estimated age
age range
age category
confidence
texture score
```

> Age estimation is an experimental computer-vision feature and should not be treated as an accurate measurement of a person's actual age.

---

# Emotion Analysis

The emotion pipeline analyzes facial characteristics including:

* Eye openness
* Smile intensity
* Facial geometry
* Mouth characteristics

The system produces:

```text
dominant emotion
confidence
emotion scores
```

It also tracks changes in dominant expression over time.

---

# Motion Detection

AetherVision compares consecutive grayscale frames to calculate an approximate motion level.

```text
Previous Frame
      |
      v
Current Frame
      |
      v
Absolute Difference
      |
      v
Mean Pixel Difference
      |
      v
Motion Level
```

A high motion level can trigger a dynamic-action moment.

---

# Session Moments

The system maintains a session history of notable events.

Examples include:

```text
Joy Peak
Surprise Reaction
Dynamic Action
Mood Shift
```

These events can be displayed in the Moments Feed and included in analysis reports.

---

# Snapshot Capture

The frontend includes an instant snapshot feature that captures the current camera/analysis view and saves it as a JPEG image.

The generated filename follows the pattern:

```text
aura_cv_snapshot_<timestamp>.jpg
```

---

# Performance

AetherVision is designed for interactive real-time computer vision.

Performance is monitored through:

* FPS
* Inference latency
* Motion level
* Frame dimensions
* Number of detected faces

The backend calculates inference time for each processed frame and exposes an FPS estimate through telemetry.

Actual performance depends on:

* CPU
* Camera resolution
* Number of faces
* Browser performance
* OpenCV processing time
* System workload

---

# Future Improvements

Potential future development areas include:

* More accurate face tracking
* Improved age estimation models
* Deep-learning-based emotion recognition
* Pose estimation
* Object detection
* Hand gesture recognition
* Multi-person identity tracking
* GPU acceleration
* WebSocket-based streaming
* Advanced analytics
* Persistent session storage
* Cloud deployment
* Authentication
* Exportable analytics reports

---

# Disclaimer

AetherVision is an experimental computer vision project intended for learning, development, and demonstration purposes.

Computer vision predictions such as estimated age and emotion are inherently uncertain and should not be treated as definitive personal or psychological measurements.

---

# Author

## Chitrak Saini

Computer Science Engineering Student

Interested in:

* Artificial Intelligence
* Machine Learning
* Computer Vision
* Software Development
* Web Development
* Data Analytics

GitHub:

https://github.com/Chitraksaini9999

---

# License

No license is currently specified in the repository.

If you intend to distribute AetherVision as an open-source project, consider adding an appropriate license such as MIT.

---

## Project

**AetherVision**
Real-Time Computer Vision Suite

Built with React, Python, Flask, OpenCV, and modern web technologies.
