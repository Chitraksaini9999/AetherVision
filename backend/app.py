import os
import time
import json
import tempfile
import cv2
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from backend.cv_engine import CVEngine

app = Flask(__name__)
# Enable CORS for frontend Vite dev server (typically http://localhost:5173) and local origins
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Initialize CV Engine instance
engine = CVEngine(models_dir="backend/models")

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "online",
        "service": "AURA-CV Real-Time Computer Vision Suite",
        "version": "1.0.0",
        "engine": "OpenCV Multi-cascade + Morphological Age & Emotion Classifier",
        "uptime_sec": round(time.time() - engine.session_start_time, 1),
        "total_moments_captured": len(engine.moments_history)
    })

@app.route("/api/analyze-frame", methods=["POST"])
def analyze_frame():
    try:
        data = request.get_json(silent=True)
        if not data or "image" not in data:
            return jsonify({"success": False, "error": "Missing 'image' payload in base64 format"}), 400

        base64_str = data["image"]
        img = engine.decode_image(base64_str)
        if img is None:
            return jsonify({"success": False, "error": "Invalid or unreadable image data"}), 400

        result = engine.process_frame(img)
        return jsonify(result)
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/moments", methods=["GET"])
def get_moments():
    return jsonify({
        "success": True,
        "moments": engine.moments_history,
        "count": len(engine.moments_history)
    })

@app.route("/api/reset-session", methods=["POST"])
def reset_session():
    engine.reset_session()
    return jsonify({
        "success": True,
        "message": "Session tracking and moments history successfully reset."
    })

@app.route("/api/analyze-video", methods=["POST"])
def analyze_video():
    """Analyzes an uploaded video file (MP4/WebM/MOV) frame-by-frame."""
    if 'video' not in request.files:
        return jsonify({"success": False, "error": "No video file provided"}), 400

    file = request.files['video']
    if file.filename == '':
        return jsonify({"success": False, "error": "Empty filename"}), 400

    temp_path = None
    try:
        suffix = os.path.splitext(file.filename)[1] or ".mp4"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            file.save(temp_file.name)
            temp_path = temp_file.name

        cap = cv2.VideoCapture(temp_path)
        if not cap.isOpened():
            return jsonify({"success": False, "error": "Unable to decode video file"}), 400

        fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
        duration_sec = total_frames / fps if fps > 0 else 0

        # Sample every ~0.3 seconds for fast, responsive processing
        sample_step = max(1, int(fps * 0.35))
        frame_idx = 0

        timeline = []
        video_moments = []
        ages = []
        emotion_totals = {"happy": 0, "neutral": 0, "surprised": 0, "sad": 0, "angry": 0, "fear": 0, "disgust": 0}

        # Temporary engine for this video analysis to isolate session
        video_engine = CVEngine(models_dir="backend/models")

        while cap.isOpened() and frame_idx < 1200:  # Safety limit ~ 50-60 seconds max
            ret, frame = cap.read()
            if not ret:
                break

            if frame_idx % sample_step == 0:
                cur_time = round(frame_idx / fps, 2)
                res = video_engine.process_frame(frame)
                
                if res["faces"]:
                    primary_face = res["faces"][0]
                    ages.append(primary_face["age"]["estimated"])
                    dom_emotion = primary_face["emotion"]["dominant"]
                    emotion_totals[dom_emotion] = emotion_totals.get(dom_emotion, 0) + 1
                    
                    timeline.append({
                        "time_sec": cur_time,
                        "dominant_emotion": dom_emotion,
                        "emotion_scores": primary_face["emotion"]["scores"],
                        "age_est": primary_face["age"]["estimated"],
                        "motion": res["telemetry"]["motion_level"]
                    })
                
                if res["moments"]:
                    for m in res["moments"]:
                        m["video_time_sec"] = cur_time
                        video_moments.append(m)

            frame_idx += 1

        cap.release()

        avg_age = int(round(np.mean(ages))) if ages else 25
        total_emotion_samples = sum(emotion_totals.values()) or 1
        emotion_percentages = {k: round((v / total_emotion_samples) * 100, 1) for k, v in emotion_totals.items()}

        return jsonify({
            "success": True,
            "filename": file.filename,
            "duration_sec": round(duration_sec, 1),
            "analyzed_samples": len(timeline),
            "average_age": avg_age,
            "emotion_breakdown": emotion_percentages,
            "moments": video_moments,
            "timeline": timeline
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"[*] Starting AURA-CV Backend Server on http://127.0.0.1:{port}")
    app.run(host="127.0.0.1", port=port, debug=False)
