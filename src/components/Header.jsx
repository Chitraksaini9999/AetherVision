import React from 'react';
import { Activity, Shield, Camera, UploadCloud, BarChart3, RefreshCw, Zap } from 'lucide-react';

export default function Header({
  isBackendOnline,
  fps,
  latency,
  facesCount,
  onResetSession,
  onOpenUpload,
  onOpenReport,
  onTakeSnapshot,
  isAnalyzing
}) {
  return (
    <header className="glass-panel" style={{ padding: '0.85rem 1.4rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        {/* Brand & Subtitle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(139, 92, 246, 0.2))',
            border: '1px solid rgba(6, 182, 212, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(6, 182, 212, 0.3)'
          }}>
            <Shield size={22} color="#00f3ff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '0.04em', color: '#f8fafc' }}>
                AURA<span style={{ color: 'var(--neon-cyan)' }}>-CV</span>
              </h1>
              <span style={{
                fontSize: '0.65rem',
                fontFamily: 'JetBrains Mono, monospace',
                padding: '0.15rem 0.45rem',
                borderRadius: '4px',
                background: 'rgba(6, 182, 212, 0.15)',
                color: '#00f3ff',
                border: '1px solid rgba(6, 182, 212, 0.3)'
              }}>
                v1.0.4 PRO
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.02em' }}>
              Real-Time Computer Vision Suite &bull; Age, Emotion & Moments Telemetry
            </p>
          </div>
        </div>

        {/* Telemetry Metrics */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Status Beacon */}
          <div className={`status-pill ${isBackendOnline ? 'status-online' : 'status-offline'}`}>
            <span className="status-beacon"></span>
            {isBackendOnline ? 'Python Engine Online' : 'Python Disconnected'}
          </div>

          {/* FPS Counter */}
          <div className="metric-chip">
            <Activity size={14} color="#00f3ff" />
            <span className="metric-label">FPS</span>
            <span className="metric-val">{fps}</span>
          </div>

          {/* Latency */}
          <div className="metric-chip">
            <Zap size={14} color="#f59e0b" />
            <span className="metric-label">Latency</span>
            <span className="metric-val" style={{ color: latency < 60 ? '#10b981' : '#f59e0b' }}>
              {latency}ms
            </span>
          </div>

          {/* Detected Subject Count */}
          <div className="metric-chip">
            <span className="metric-label">Target(s)</span>
            <span className="metric-val" style={{ color: facesCount > 0 ? '#38bdf8' : '#64748b' }}>
              {facesCount}
            </span>
          </div>
        </div>

        {/* Global Suite Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button
            className="cyber-btn"
            onClick={onTakeSnapshot}
            title="Capture Instant Frame Snapshot"
          >
            <Camera size={15} />
            <span>Snapshot</span>
          </button>

          <button
            className="cyber-btn cyber-btn-secondary"
            onClick={onOpenUpload}
            title="Upload MP4/WebM video for moment-by-moment scan"
          >
            <UploadCloud size={15} />
            <span>Scan Video</span>
          </button>

          <button
            className="cyber-btn cyber-btn-secondary"
            onClick={onOpenReport}
            title="View Session Statistics & Report"
          >
            <BarChart3 size={15} />
            <span>Analytics</span>
          </button>

          <button
            className="cyber-btn cyber-btn-secondary"
            onClick={onResetSession}
            title="Reset active tracker & timeline"
            style={{ padding: '0.6rem 0.75rem' }}
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>
    </header>
  );
}
