import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Camera, CameraOff, Sparkles, Layers, Sliders, Volume2, VolumeX, Eye } from 'lucide-react';

export default function CameraViewport({
  faces,
  telemetry,
  onFrameCaptured,
  isCameraActive,
  setIsCameraActive,
  isDemoMode,
  setIsDemoMode,
  videoRef,
  canvasRef
}) {
  const [showLandmarks, setShowLandmarks] = useState(true);
  const [showBBoxes, setShowBBoxes] = useState(true);
  const [showScanlines, setShowScanlines] = useState(true);
  const [audioAlerts, setAudioAlerts] = useState(true);
  const [streamError, setStreamError] = useState(null);

  const demoAnimRef = useRef(null);
  const demoStateRef = useRef({
    x: 240,
    y: 120,
    targetX: 240,
    targetY: 120,
    phase: 0,
    expressionIndex: 0
  });

  // Start / Stop Webcam stream
  useEffect(() => {
    let stream = null;

    async function initCamera() {
      if (isDemoMode) {
        if (videoRef.current && videoRef.current.srcObject) {
          videoRef.current.srcObject.getTracks().forEach(t => t.stop());
          videoRef.current.srcObject = null;
        }
        setStreamError(null);
        return;
      }

      if (!isCameraActive) {
        if (videoRef.current && videoRef.current.srcObject) {
          videoRef.current.srcObject.getTracks().forEach(t => t.stop());
          videoRef.current.srcObject = null;
        }
        return;
      }

      try {
        setStreamError(null);
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          },
          audio: false
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(e => console.warn('Video play error:', e));
        }
      } catch (err) {
        console.warn('Webcam stream access failed:', err);
        setStreamError('Webcam access was denied or device not found. Switched to Interactive Demo Mode.');
        setIsDemoMode(true);
      }
    }

    initCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, [isCameraActive, isDemoMode]);

  // Demo synthetic face generator if camera is unavailable or demo mode is selected
  useEffect(() => {
    if (!isDemoMode) {
      if (demoAnimRef.current) cancelAnimationFrame(demoAnimRef.current);
      return;
    }

    const demoCanvas = document.createElement('canvas');
    demoCanvas.width = 640;
    demoCanvas.height = 480;
    const ctx = demoCanvas.getContext('2d');

    let frameCount = 0;
    const expressions = ['happy', 'neutral', 'surprised', 'happy', 'neutral'];

    const renderDemo = () => {
      frameCount++;
      const t = frameCount * 0.03;

      // Draw cyber background
      ctx.fillStyle = '#070c18';
      ctx.fillRect(0, 0, 640, 480);

      // Subtle grid
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < 640; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 480);
        ctx.stroke();
      }
      for (let y = 0; y < 480; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(640, y);
        ctx.stroke();
      }

      // Smooth organic face floating movement
      const faceX = 320 + Math.sin(t * 0.7) * 45;
      const faceY = 220 + Math.cos(t * 0.5) * 25;
      const faceW = 160;
      const faceH = 200;

      // Draw stylized biometric avatar head
      ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(faceX, faceY, faceW * 0.5, faceH * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Expressions cycle every ~140 frames
      const expIdx = Math.floor((frameCount / 140) % expressions.length);
      const currentExp = expressions[expIdx];

      // Eyes
      const eyeOffset = 36;
      const eyeY = faceY - 25;
      const isSurprise = currentExp === 'surprised';
      const eyeRadius = isSurprise ? 12 : 7;

      ctx.fillStyle = '#00f3ff';
      ctx.beginPath();
      ctx.arc(faceX - eyeOffset, eyeY, eyeRadius, 0, Math.PI * 2);
      ctx.arc(faceX + eyeOffset, eyeY, eyeRadius, 0, Math.PI * 2);
      ctx.fill();

      // Mouth
      ctx.strokeStyle = currentExp === 'happy' ? '#f59e0b' : (isSurprise ? '#38bdf8' : '#94a3b8');
      ctx.lineWidth = 3;
      ctx.beginPath();
      if (currentExp === 'happy') {
        ctx.arc(faceX, faceY + 35, 26, 0.15 * Math.PI, 0.85 * Math.PI, false);
      } else if (isSurprise) {
        ctx.ellipse(faceX, faceY + 45, 12, 18, 0, 0, Math.PI * 2);
      } else {
        ctx.moveTo(faceX - 22, faceY + 45);
        ctx.lineTo(faceX + 22, faceY + 45);
      }
      ctx.stroke();

      // Render to main video viewport by creating base64
      if (frameCount % 6 === 0) { // ~10-15 fps capture loop
        const dataUrl = demoCanvas.toDataURL('image/jpeg', 0.8);
        onFrameCaptured(dataUrl);
      }

      demoAnimRef.current = requestAnimationFrame(renderDemo);
    };

    demoAnimRef.current = requestAnimationFrame(renderDemo);

    return () => {
      if (demoAnimRef.current) cancelAnimationFrame(demoAnimRef.current);
    };
  }, [isDemoMode, onFrameCaptured]);

  // Regular camera frame capture loop
  useEffect(() => {
    if (isDemoMode || !isCameraActive) return;

    const interval = setInterval(() => {
      if (!videoRef.current || videoRef.current.readyState < 2) return;

      const video = videoRef.current;
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = video.videoWidth || 640;
      tempCanvas.height = video.videoHeight || 480;

      const ctx = tempCanvas.getContext('2d');
      // Mirror image for intuitive webcam interaction
      ctx.translate(tempCanvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);

      const base64Img = tempCanvas.toDataURL('image/jpeg', 0.78);
      onFrameCaptured(base64Img);
    }, 120); // ~8-10 FPS continuous inference balance

    return () => clearInterval(interval);
  }, [isCameraActive, isDemoMode, onFrameCaptured]);

  // Render HUD overlays on the viewport canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    if (!faces || faces.length === 0) return;

    faces.forEach((face, idx) => {
      const [bx, by, bw, bh] = face.bbox;
      // Invert X if webcam is mirrored, or scale to canvas coordinates
      const scaleX = width / (telemetry?.frame_size?.[0] || 640);
      const scaleY = height / (telemetry?.frame_size?.[1] || 480);

      const x = bx * scaleX;
      const y = by * scaleY;
      const w = bw * scaleX;
      const h = bh * scaleY;

      // Color based on emotion
      const domEmotion = face.emotion?.dominant || 'neutral';
      let emotionColor = '#00f3ff';
      if (domEmotion === 'happy') emotionColor = '#f59e0b';
      else if (domEmotion === 'surprised') emotionColor = '#38bdf8';
      else if (domEmotion === 'angry') emotionColor = '#f43f5e';
      else if (domEmotion === 'sad') emotionColor = '#6366f1';
      else if (domEmotion === 'fear') emotionColor = '#a855f7';

      if (showBBoxes) {
        // Glowing bounding box with corner reticles
        ctx.save();
        ctx.strokeStyle = emotionColor;
        ctx.lineWidth = 2;
        ctx.shadowColor = emotionColor;
        ctx.shadowBlur = 12;

        // Bounding Box
        ctx.strokeRect(x, y, w, h);

        // Cyber corner brackets
        const cornerLen = Math.min(20, w * 0.2);
        ctx.lineWidth = 3;
        ctx.shadowBlur = 16;
        
        // Top-left
        ctx.beginPath();
        ctx.moveTo(x - 4, y + cornerLen);
        ctx.lineTo(x - 4, y - 4);
        ctx.lineTo(x + cornerLen, y - 4);
        ctx.stroke();

        // Top-right
        ctx.beginPath();
        ctx.moveTo(x + w + 4 - cornerLen, y - 4);
        ctx.lineTo(x + w + 4, y - 4);
        ctx.lineTo(x + w + 4, y + cornerLen);
        ctx.stroke();

        // Bottom-left
        ctx.beginPath();
        ctx.moveTo(x - 4, y + h - cornerLen);
        ctx.lineTo(x - 4, y + h + 4);
        ctx.lineTo(x + cornerLen, y + h + 4);
        ctx.stroke();

        // Bottom-right
        ctx.beginPath();
        ctx.moveTo(x + w + 4 - cornerLen, y + h + 4);
        ctx.lineTo(x + w + 4, y + h + 4);
        ctx.lineTo(x + w + 4, y + h - cornerLen);
        ctx.stroke();

        // Target Tag Header
        ctx.fillStyle = 'rgba(7, 12, 24, 0.85)';
        ctx.fillRect(x, Math.max(0, y - 28), 160, 24);
        ctx.strokeStyle = emotionColor;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, Math.max(0, y - 28), 160, 24);

        ctx.fillStyle = emotionColor;
        ctx.font = 'bold 11px "JetBrains Mono", monospace';
        const ageVal = face.age?.estimated ? `${face.age.estimated}y` : '25y';
        const emoPct = Math.round((face.emotion?.confidence || 0.8) * 100);
        ctx.fillText(`#SUBJ-0${idx + 1} | ${ageVal} | ${domEmotion.toUpperCase()}`, x + 6, Math.max(16, y - 12));

        ctx.restore();
      }

      // Facial Landmarks
      if (showLandmarks && face.landmarks) {
        ctx.save();
        ctx.fillStyle = '#00f3ff';
        ctx.shadowColor = '#00f3ff';
        ctx.shadowBlur = 8;

        Object.entries(face.landmarks).forEach(([name, pt]) => {
          const px = pt[0] * scaleX;
          const py = pt[1] * scaleY;
          ctx.beginPath();
          ctx.arc(px, py, 3.5, 0, Math.PI * 2);
          ctx.fill();
        });

        // Connect eye to eye line
        if (face.landmarks.left_eye && face.landmarks.right_eye) {
          ctx.strokeStyle = 'rgba(0, 243, 255, 0.45)';
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(face.landmarks.left_eye[0] * scaleX, face.landmarks.left_eye[1] * scaleY);
          ctx.lineTo(face.landmarks.right_eye[0] * scaleX, face.landmarks.right_eye[1] * scaleY);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        ctx.restore();
      }
    });
  }, [faces, telemetry, showBBoxes, showLandmarks]);

  return (
    <div className="glass-panel glass-panel-glow" style={{ overflow: 'hidden' }}>
      {/* Panel Header */}
      <div className="panel-header">
        <div className="panel-title">
          <Eye size={17} color="#00f3ff" />
          <span>Biometric Visual Telemetry</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button
            className={`cyber-btn ${isDemoMode ? 'cyber-btn' : 'cyber-btn-secondary'}`}
            style={{ fontSize: '0.74rem', padding: '0.35rem 0.75rem' }}
            onClick={() => setIsDemoMode(!isDemoMode)}
          >
            <Sparkles size={13} />
            {isDemoMode ? 'Demo Mode Active' : 'Switch to Demo'}
          </button>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div style={{ padding: '1rem' }}>
        {streamError && (
          <div style={{
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            color: '#fbbf24',
            padding: '0.5rem 0.85rem',
            borderRadius: '8px',
            fontSize: '0.78rem',
            marginBottom: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span>⚠️ {streamError}</span>
          </div>
        )}

        <div className="viewport-container">
          {/* Cyber HUD Corner Brackets */}
          <div className="hud-corner hud-tl"></div>
          <div className="hud-corner hud-tr"></div>
          <div className="hud-corner hud-bl"></div>
          <div className="hud-corner hud-br"></div>

          {/* Optional Scanlines */}
          {showScanlines && <div className="scanlines-overlay"></div>}

          {/* HTML5 Video element */}
          <video
            ref={videoRef}
            className="viewport-video"
            playsInline
            muted
            style={{
              display: isDemoMode ? 'none' : 'block',
              transform: 'scaleX(-1)' // Mirror for intuitive webcam feel
            }}
          />

          {/* Interactive HUD Overlay Canvas */}
          <canvas
            ref={canvasRef}
            className="viewport-canvas"
            width={640}
            height={480}
          />

          {/* Empty state placeholder when camera is off */}
          {!isCameraActive && !isDemoMode && (
            <div style={{
              position: 'absolute',
              textAlign: 'center',
              zIndex: 20,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <CameraOff size={44} color="#64748b" />
              <div style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: '500' }}>
                Camera Feed Paused
              </div>
              <button
                className="cyber-btn"
                onClick={() => setIsCameraActive(true)}
              >
                <Camera size={15} />
                Activate Camera
              </button>
            </div>
          )}
        </div>

        {/* Viewport Action Controls Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.85rem',
          marginTop: '0.95rem',
          padding: '0.4rem 0.2rem'
        }}>
          {/* Main Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              className={isCameraActive ? "cyber-btn cyber-btn-danger" : "cyber-btn"}
              onClick={() => setIsCameraActive(!isCameraActive)}
            >
              {isCameraActive ? <CameraOff size={15} /> : <Camera size={15} />}
              <span>{isCameraActive ? 'Stop Stream' : 'Start Camera'}</span>
            </button>
          </div>

          {/* Overlay & Feature Toggles */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              className={`cyber-btn ${showBBoxes ? 'cyber-btn' : 'cyber-btn-secondary'}`}
              style={{ padding: '0.45rem 0.75rem', fontSize: '0.74rem' }}
              onClick={() => setShowBBoxes(!showBBoxes)}
              title="Toggle HUD Bounding Box"
            >
              <Layers size={13} />
              <span>Bounding Box</span>
            </button>

            <button
              className={`cyber-btn ${showLandmarks ? 'cyber-btn' : 'cyber-btn-secondary'}`}
              style={{ padding: '0.45rem 0.75rem', fontSize: '0.74rem' }}
              onClick={() => setShowLandmarks(!showLandmarks)}
              title="Toggle Facial Landmark Dots"
            >
              <Sliders size={13} />
              <span>Landmarks</span>
            </button>

            <button
              className={`cyber-btn ${showScanlines ? 'cyber-btn' : 'cyber-btn-secondary'}`}
              style={{ padding: '0.45rem 0.75rem', fontSize: '0.74rem' }}
              onClick={() => setShowScanlines(!showScanlines)}
              title="Toggle Cyber Scanlines"
            >
              <span>Scanlines</span>
            </button>

            <button
              className="cyber-btn cyber-btn-secondary"
              style={{ padding: '0.45rem 0.65rem' }}
              onClick={() => setAudioAlerts(!audioAlerts)}
              title={audioAlerts ? 'Mute Alert Chimes' : 'Enable Alert Chimes'}
            >
              {audioAlerts ? <Volume2 size={14} color="#00f3ff" /> : <VolumeX size={14} color="#94a3b8" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
