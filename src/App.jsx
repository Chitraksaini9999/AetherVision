import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import Header from './components/Header';
import CameraViewport from './components/CameraViewport';
import EmotionAnalytics from './components/EmotionAnalytics';
import AgeDemographics from './components/AgeDemographics';
import MomentsFeed from './components/MomentsFeed';
import MomentDetailModal from './components/MomentDetailModal';
import SessionReportModal from './components/SessionReportModal';
import VideoUploadModal from './components/VideoUploadModal';

export default function App() {
  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // CV Analytics State
  const [faces, setFaces] = useState([]);
  const [moments, setMoments] = useState([]);
  const [telemetry, setTelemetry] = useState({
    fps_estimate: 24,
    inference_time_ms: 32,
    motion_level: 0,
    faces_detected: 0
  });
  const [fps, setFps] = useState(24);
  const [latency, setLatency] = useState(32);
  const [emotionHistory, setEmotionHistory] = useState([]);

  // Modals
  const [selectedMoment, setSelectedMoment] = useState(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const frameCountRef = useRef(0);
  const lastFpsCalcRef = useRef(Date.now());
  const isRequestInFlight = useRef(false);

  // Backend Healthcheck Heartbeat
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const resp = await fetch('http://127.0.0.1:5000/api/health', { method: 'GET' });
        if (resp.ok) {
          const data = await resp.json();
          setIsBackendOnline(true);
        } else {
          setIsBackendOnline(false);
        }
      } catch (err) {
        setIsBackendOnline(false);
      }
    };

    checkHealth();
    const timer = setInterval(checkHealth, 4000);
    return () => clearInterval(timer);
  }, []);

  // Frame Analysis Pipeline
  const handleFrameCaptured = useCallback(async (base64Img) => {
    if (isRequestInFlight.current || !isBackendOnline) return;

    isRequestInFlight.current = true;
    const startInference = performance.now();

    try {
      const resp = await fetch('http://127.0.0.1:5000/api/analyze-frame', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Img })
      });

      const inferenceTime = Math.round(performance.now() - startInference);
      setLatency(inferenceTime);

      if (resp.ok) {
        const data = await resp.json();
        if (data.success) {
          setFaces(data.faces || []);
          setTelemetry(data.telemetry || {});

          // Track FPS
          frameCountRef.current++;
          const now = Date.now();
          if (now - lastFpsCalcRef.current >= 1000) {
            setFps(frameCountRef.current);
            frameCountRef.current = 0;
            lastFpsCalcRef.current = now;
          }

          // Append new moments & trigger joy confetti
          if (data.moments && data.moments.length > 0) {
            setMoments(prev => [...prev, ...data.moments]);

            // Confetti effect for joy peak
            const joyEvent = data.moments.find(m => m.type === 'joy_peak');
            if (joyEvent) {
              confetti({
                particleCount: 40,
                spread: 60,
                origin: { y: 0.7 },
                colors: ['#00f3ff', '#f59e0b', '#3b82f6', '#10b981']
              });
            }
          }

          // Update emotion timeline
          if (data.faces && data.faces.length > 0) {
            const primary = data.faces[0];
            setEmotionHistory(prev => [
              ...prev.slice(-40),
              {
                dominant: primary.emotion?.dominant || 'neutral',
                confidence: primary.emotion?.confidence || 0.8,
                time: Date.now()
              }
            ]);
          }
        }
      }
    } catch (err) {
      console.warn('Frame analysis dispatch error:', err);
    } finally {
      isRequestInFlight.current = false;
    }
  }, [isBackendOnline]);

  // Reset Session
  const handleResetSession = async () => {
    try {
      await fetch('http://127.0.0.1:5000/api/reset-session', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
    setMoments([]);
    setEmotionHistory([]);
    setFaces([]);
  };

  // Instant Snapshot
  const handleTakeSnapshot = () => {
    if (!canvasRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');

    if (videoRef.current && isCameraActive && !isDemoMode) {
      ctx.drawImage(videoRef.current, 0, 0, 640, 480);
    }
    if (canvasRef.current) {
      ctx.drawImage(canvasRef.current, 0, 0, 640, 480);
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `aura_cv_snapshot_${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const primaryFace = faces.length > 0 ? faces[0] : null;

  return (
    <div className="app-container">
      {/* Telemetry Header */}
      <Header
        isBackendOnline={isBackendOnline}
        fps={fps}
        latency={latency}
        facesCount={faces.length}
        onResetSession={handleResetSession}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenReport={() => setIsReportOpen(true)}
        onTakeSnapshot={handleTakeSnapshot}
        isAnalyzing={isAnalyzing}
      />

      {/* Main Center Telemetry Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Left Column: Biometric Camera Viewport */}
        <CameraViewport
          faces={faces}
          telemetry={telemetry}
          onFrameCaptured={handleFrameCaptured}
          isCameraActive={isCameraActive}
          setIsCameraActive={setIsCameraActive}
          isDemoMode={isDemoMode}
          setIsDemoMode={setIsDemoMode}
          videoRef={videoRef}
          canvasRef={canvasRef}
        />

        {/* Right Column: Moments & Highlights Feed */}
        <MomentsFeed
          moments={moments}
          onSelectMoment={m => setSelectedMoment(m)}
          onClearMoments={() => setMoments([])}
        />
      </div>

      {/* Bottom Telemetry Grid: Emotion & Age Demographics */}
      <div className="bottom-grid">
        <EmotionAnalytics
          primaryFace={primaryFace}
          emotionHistory={emotionHistory}
        />
        <AgeDemographics
          primaryFace={primaryFace}
        />
      </div>

      {/* Interactive Modals */}
      <MomentDetailModal
        moment={selectedMoment}
        onClose={() => setSelectedMoment(null)}
      />

      <SessionReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        sessionStats={{ fps, latency, faces_count: faces.length }}
        moments={moments}
        primaryFace={primaryFace}
      />

      <VideoUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSelectMoment={m => setSelectedMoment(m)}
      />
    </div>
  );
}
