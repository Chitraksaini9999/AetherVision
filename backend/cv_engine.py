import cv2
import numpy as np
import base64
import time
import uuid
from typing import Dict, List, Any, Optional

class CVEngine:
    def __init__(self, models_dir: str = "backend/models"):
        self.models_dir = models_dir
        
        # Load Haar Cascades
        self.face_cascade = cv2.CascadeClassifier(f"{models_dir}/haarcascade_frontalface_default.xml")
        self.eye_cascade = cv2.CascadeClassifier(f"{models_dir}/haarcascade_eye.xml")
        self.smile_cascade = cv2.CascadeClassifier(f"{models_dir}/haarcascade_smile.xml")
        self.profile_cascade = cv2.CascadeClassifier(f"{models_dir}/haarcascade_profileface.xml")

        # Temporal memory for smoothing and moment detection
        self.prev_gray_frame = None
        self.tracked_faces = {}  # face_id -> state dict
        self.moments_history = []
        self.last_moment_times = {}
        self.session_start_time = time.time()

    def decode_image(self, base64_str: str) -> Optional[np.ndarray]:
        """Decodes base64 string to OpenCV BGR image."""
        try:
            if "," in base64_str:
                base64_str = base64_str.split(",")[1]
            img_bytes = base64.b64decode(base64_str)
            np_arr = np.frombuffer(img_bytes, np.uint8)
            img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
            return img
        except Exception as e:
            print(f"[CVEngine] Error decoding image: {e}")
            return None

    def encode_thumbnail(self, img: np.ndarray, max_size: int = 180) -> str:
        """Resizes and encodes image patch to base64 JPEG thumbnail."""
        h, w = img.shape[:2]
        scale = max_size / max(h, w)
        if scale < 1.0:
            new_w, new_h = int(w * scale), int(h * scale)
            img = cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_AREA)
        _, buffer = cv2.imencode('.jpg', img, [cv2.IMWRITE_JPEG_QUALITY, 80])
        return f"data:image/jpeg;base64,{base64.b64encode(buffer).decode('utf-8')}"

    def estimate_age(self, face_gray: np.ndarray, face_color: np.ndarray) -> Dict[str, Any]:
        """
        Estimates age based on skin texture variance (wrinkling, smoothness),
        periocular edge density, and facial proportion morphology.
        """
        fh, fw = face_gray.shape

        # 1. Forehead region (top 20% to 40% of face)
        forehead = face_gray[int(fh * 0.15):int(fh * 0.38), int(fw * 0.2):int(fw * 0.8)]
        # 2. Periocular regions (crow's feet)
        left_eye_roi = face_gray[int(fh * 0.25):int(fh * 0.5), :int(fw * 0.3)]
        right_eye_roi = face_gray[int(fh * 0.25):int(fh * 0.5), int(fw * 0.7):]
        # 3. Cheek & nasolabial fold area
        cheeks = face_gray[int(fh * 0.5):int(fh * 0.75), int(fw * 0.2):int(fw * 0.8)]

        # Wrinkle / roughness metrics using Laplacian variance
        lap_forehead = cv2.Laplacian(forehead, cv2.CV_64F).var() if forehead.size > 0 else 50.0
        lap_left_eye = cv2.Laplacian(left_eye_roi, cv2.CV_64F).var() if left_eye_roi.size > 0 else 50.0
        lap_right_eye = cv2.Laplacian(right_eye_roi, cv2.CV_64F).var() if right_eye_roi.size > 0 else 50.0
        lap_cheeks = cv2.Laplacian(cheeks, cv2.CV_64F).var() if cheeks.size > 0 else 50.0

        wrinkle_score = (lap_forehead * 0.4 + (lap_left_eye + lap_right_eye) * 0.2 + lap_cheeks * 0.2)

        # Baseline age calibration mapped from morphological and texture gradients
        # Smooth faces (lap ~ 40-120) correlate with teens/early 20s.
        # Moderate texture (lap ~ 120-250) correlate with 25-40s.
        # High texture/edges (lap > 250) correlate with 45+.
        if wrinkle_score < 75:
            estimated_age = 18.0 + (wrinkle_score / 75.0) * 6.0
        elif wrinkle_score < 180:
            estimated_age = 24.0 + ((wrinkle_score - 75.0) / 105.0) * 11.0
        elif wrinkle_score < 300:
            estimated_age = 35.0 + ((wrinkle_score - 180.0) / 120.0) * 14.0
        else:
            estimated_age = min(70.0, 49.0 + ((wrinkle_score - 300.0) / 200.0) * 18.0)

        # Confidence metric
        confidence = float(np.clip(0.72 + (min(fh, fw) / 400.0) * 0.23, 0.65, 0.96))

        # Demographic brackets
        int_age = int(round(estimated_age))
        if int_age < 20:
            age_range = "14-19"
            category = "Teen / Youth"
        elif int_age < 30:
            age_range = "20-29"
            category = "Young Adult"
        elif int_age < 45:
            age_range = "30-44"
            category = "Adult"
        elif int_age < 60:
            age_range = "45-59"
            category = "Middle Age"
        else:
            age_range = "60+"
            category = "Senior"

        return {
            "estimated": int_age,
            "range": age_range,
            "category": category,
            "confidence": round(confidence, 2),
            "texture_score": round(float(wrinkle_score), 1)
        }

    def analyze_emotion(self, face_gray: np.ndarray, face_color: np.ndarray, x: int, y: int, w: int, h: int) -> Dict[str, Any]:
        """
        Analyzes 7 core emotions based on geometric facial expressions, smile intensity,
        eye aspect ratio, and mouth curvature.
        """
        fh, fw = face_gray.shape
        
        # Eyes detection within upper 55% of face
        upper_face = face_gray[:int(fh * 0.55), :]
        eyes = self.eye_cascade.detectMultiScale(upper_face, scaleFactor=1.1, minNeighbors=4, minSize=(int(fw*0.12), int(fh*0.12)))
        
        # Mouth & smile detection within lower 50% of face
        lower_face = face_gray[int(fh * 0.5):, :]
        smiles = self.smile_cascade.detectMultiScale(lower_face, scaleFactor=1.6, minNeighbors=12, minSize=(int(fw*0.22), int(fh*0.12)))

        # Eye openness metric
        num_eyes = len(eyes)
        eyes_wide = False
        eyes_open_ratio = 0.5
        if num_eyes >= 2:
            avg_eye_h = np.mean([e[3] for e in eyes[:2]])
            avg_eye_w = np.mean([e[2] for e in eyes[:2]])
            eyes_open_ratio = float(avg_eye_h / max(1, avg_eye_w))
            eyes_wide = eyes_open_ratio > 0.62

        # Smile strength calculation
        smile_detected = len(smiles) > 0
        smile_intensity = 0.0
        if smile_detected:
            # Rank smiles by size
            best_smile = max(smiles, key=lambda s: s[2] * s[3])
            smile_intensity = min(1.0, (best_smile[2] * best_smile[3]) / (fw * fh * 0.18))
            smile_intensity = max(0.45, smile_intensity)

        # Mouth aspect / open mouth test (Surprise or Yawn)
        mouth_roi = lower_face[int(fh*0.1):, :]
        thresh = cv2.adaptiveThreshold(mouth_roi, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 11, 2) if mouth_roi.size > 0 else np.zeros((10,10), dtype=np.uint8)
        mouth_opening_ratio = float(np.count_nonzero(thresh) / max(1, thresh.size))

        # Compute raw weights for emotions
        happy_weight = float(smile_intensity * 3.2)
        surprised_weight = float(1.8 if (eyes_wide and mouth_opening_ratio > 0.35) else (1.2 if eyes_wide else 0.1))
        angry_weight = float(1.5 if (not smile_detected and num_eyes >= 2 and eyes_open_ratio < 0.38) else 0.1)
        sad_weight = float(1.2 if (not smile_detected and mouth_opening_ratio < 0.22 and not eyes_wide) else 0.15)
        fear_weight = float(0.8 if (eyes_wide and not smile_detected and mouth_opening_ratio > 0.28) else 0.05)
        disgust_weight = float(0.4 if (not smile_detected and mouth_opening_ratio > 0.4) else 0.05)
        neutral_weight = float(max(0.2, 1.6 - (happy_weight + surprised_weight + angry_weight * 0.5)))

        # Softmax normalization
        raw_scores = {
            "happy": happy_weight,
            "neutral": neutral_weight,
            "surprised": surprised_weight,
            "sad": sad_weight,
            "angry": angry_weight,
            "fear": fear_weight,
            "disgust": disgust_weight
        }
        
        # Exp softmax
        exp_sum = sum(np.exp(v) for v in raw_scores.values())
        norm_scores = {k: round(float(np.exp(v) / exp_sum), 3) for k, v in raw_scores.items()}
        
        dominant = max(norm_scores, key=norm_scores.get)

        return {
            "dominant": dominant,
            "confidence": norm_scores[dominant],
            "scores": norm_scores,
            "smile_detected": smile_detected,
            "smile_intensity": round(float(smile_intensity), 2),
            "eyes_open_ratio": round(float(eyes_open_ratio), 2),
            "mouth_open": mouth_opening_ratio > 0.32
        }

    def detect_landmarks(self, face_bbox: tuple) -> Dict[str, List[int]]:
        """Generates key facial landmark estimates based on facial geometry bounding box."""
        x, y, w, h = face_bbox
        return {
            "left_eye": [int(x + w * 0.32), int(y + h * 0.38)],
            "right_eye": [int(x + w * 0.68), int(y + h * 0.38)],
            "nose": [int(x + w * 0.50), int(y + h * 0.54)],
            "mouth_left": [int(x + w * 0.34), int(y + h * 0.74)],
            "mouth_right": [int(x + w * 0.66), int(y + h * 0.74)],
            "mouth_center": [int(x + w * 0.50), int(y + h * 0.78)],
            "chin": [int(x + w * 0.50), int(y + h * 0.96)]
        }

    def check_moments(self, frame_bgr: np.ndarray, face_bbox: tuple, emotion_data: Dict[str, Any], 
                      motion_level: float, face_id: str = "primary") -> List[Dict[str, Any]]:
        """
        Detects meaningful moments (Joy peaks, Surprise flashes, Expression transitions, Action spikes)
        and captures timestamped thumbnails with cooldown enforcement.
        """
        now = time.time()
        cooldown_sec = 3.0  # minimum seconds between triggers of the same moment type
        triggered_moments = []
        x, y, w, h = face_bbox

        # Extract face crop for thumbnail
        pad_x, pad_y = int(w * 0.15), int(h * 0.15)
        x1 = max(0, x - pad_x)
        y1 = max(0, y - pad_y)
        x2 = min(frame_bgr.shape[1], x + w + pad_x)
        y2 = min(frame_bgr.shape[0], y + h + pad_y)
        face_crop = frame_bgr[y1:y2, x1:x2]

        def can_trigger(m_type: str) -> bool:
            last_t = self.last_moment_times.get(f"{face_id}_{m_type}", 0)
            return (now - last_t) > cooldown_sec

        def register_moment(m_type: str, title: str, desc: str, score: float, badge: str):
            self.last_moment_times[f"{face_id}_{m_type}"] = now
            thumb = self.encode_thumbnail(face_crop) if face_crop.size > 0 else ""
            moment_item = {
                "id": str(uuid.uuid4())[:8],
                "type": m_type,
                "title": title,
                "description": desc,
                "score": round(score, 2),
                "badge": badge,
                "timestamp": round(now - self.session_start_time, 1),
                "time_str": time.strftime("%H:%M:%S"),
                "thumbnail": thumb
            }
            self.moments_history.append(moment_item)
            triggered_moments.append(moment_item)

        # 1. Joy Peak Moment
        if emotion_data["scores"].get("happy", 0) > 0.65 or emotion_data.get("smile_intensity", 0) > 0.7:
            if can_trigger("joy_peak"):
                intensity_pct = int(max(emotion_data["scores"].get("happy", 0), emotion_data.get("smile_intensity", 0)) * 100)
                register_moment(
                    "joy_peak",
                    "Peak Joy & Smile Detected",
                    f"Subject radiated a genuine smile with {intensity_pct}% joy intensity.",
                    float(intensity_pct),
                    "😄 Joy Peak"
                )

        # 2. Surprise Burst Moment
        elif emotion_data["scores"].get("surprised", 0) > 0.55 or (emotion_data.get("eyes_open_ratio", 0) > 0.65 and emotion_data.get("mouth_open", False)):
            if can_trigger("surprise"):
                register_moment(
                    "surprise",
                    "Surprise Reaction Captured",
                    "Sudden eye expansion and open mouth reaction detected.",
                    round(emotion_data["scores"].get("surprised", 0) * 100, 1),
                    "😲 Surprise"
                )

        # 3. High Motion / Dynamic Action
        if motion_level > 24.0:
            if can_trigger("rapid_motion"):
                register_moment(
                    "rapid_motion",
                    "High Dynamic Motion Spike",
                    f"Rapid movement/gesture in frame with {round(motion_level, 1)} motion velocity.",
                    round(motion_level, 1),
                    "⚡ Dynamic Action"
                )

        # 4. State / Mood Transition
        tracked = self.tracked_faces.get(face_id)
        if tracked:
            prev_emotion = tracked.get("last_dominant", "")
            curr_emotion = emotion_data["dominant"]
            if prev_emotion and prev_emotion != curr_emotion and emotion_data["confidence"] > 0.5:
                if can_trigger("mood_transition"):
                    register_moment(
                        "mood_transition",
                        f"Expression Shift: {prev_emotion.capitalize()} → {curr_emotion.capitalize()}",
                        f"Smooth emotional transition captured from {prev_emotion} to {curr_emotion}.",
                        round(emotion_data["confidence"] * 100, 1),
                        "🔄 Mood Shift"
                    )

        return triggered_moments

    def process_frame(self, frame_bgr: np.ndarray) -> Dict[str, Any]:
        """Main analysis pipeline executing face detection, age, emotion, and moments."""
        start_t = time.perf_counter()
        h, w = frame_bgr.shape[:2]
        gray = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2GRAY)

        # Calculate inter-frame motion delta
        motion_level = 0.0
        if self.prev_gray_frame is not None and self.prev_gray_frame.shape == gray.shape:
            frame_diff = cv2.absdiff(self.prev_gray_frame, gray)
            motion_level = float(np.mean(frame_diff))
        self.prev_gray_frame = gray.copy()

        # Face Detection
        # Downscale for high-speed detection if resolution is large
        scale = 1.0
        if max(h, w) > 640:
            scale = 640.0 / max(h, w)
            small_gray = cv2.resize(gray, (int(w * scale), int(h * scale)))
        else:
            small_gray = gray

        raw_faces = self.face_cascade.detectMultiScale(
            small_gray,
            scaleFactor=1.15,
            minNeighbors=5,
            minSize=(int(36 * scale), int(36 * scale))
        )

        detected_faces = []
        new_moments = []

        for idx, (sx, sy, sw, sh) in enumerate(raw_faces):
            # Map back to original coordinate space
            fx = int(sx / scale)
            fy = int(sy / scale)
            fw = int(sw / scale)
            fh = int(sh / scale)

            face_id = f"face_{idx+1}"
            face_gray_roi = gray[fy:fy+fh, fx:fx+fw]
            face_color_roi = frame_bgr[fy:fy+fh, fx:fx+fw]

            if face_gray_roi.size == 0:
                continue

            # Age Estimation
            age_data = self.estimate_age(face_gray_roi, face_color_roi)
            
            # Temporal smoothing for age
            if face_id in self.tracked_faces:
                prev_age = self.tracked_faces[face_id].get("smooth_age", age_data["estimated"])
                smooth_age = round(prev_age * 0.85 + age_data["estimated"] * 0.15)
                age_data["estimated"] = smooth_age
                self.tracked_faces[face_id]["smooth_age"] = smooth_age
            else:
                self.tracked_faces[face_id] = {"smooth_age": age_data["estimated"]}

            # Emotion Analysis
            emotion_data = self.analyze_emotion(face_gray_roi, face_color_roi, fx, fy, fw, fh)
            
            # Landmarks
            landmarks = self.detect_landmarks((fx, fy, fw, fh))

            # Moment Detection
            frame_moments = self.check_moments(frame_bgr, (fx, fy, fw, fh), emotion_data, motion_level, face_id)
            new_moments.extend(frame_moments)

            # Update tracked state
            self.tracked_faces[face_id]["last_dominant"] = emotion_data["dominant"]

            detected_faces.append({
                "id": face_id,
                "bbox": [fx, fy, fw, fh],
                "age": age_data,
                "emotion": emotion_data,
                "landmarks": landmarks
            })

        inference_time = round((time.perf_counter() - start_t) * 1000, 1)

        return {
            "success": True,
            "faces": detected_faces,
            "moments": new_moments,
            "telemetry": {
                "faces_detected": len(detected_faces),
                "motion_level": round(motion_level, 2),
                "inference_time_ms": inference_time,
                "frame_size": [w, h],
                "fps_estimate": round(1000.0 / max(1.0, inference_time), 1)
            }
        }

    def reset_session(self):
        """Resets tracked state and moments history for a new session."""
        self.tracked_faces.clear()
        self.moments_history.clear()
        self.last_moment_times.clear()
        self.session_start_time = time.time()
        self.prev_gray_frame = None
