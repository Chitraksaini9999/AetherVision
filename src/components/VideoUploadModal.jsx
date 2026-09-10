import React, { useState, useRef } from 'react';
import { X, UploadCloud, Film, Play, CheckCircle2, AlertCircle, Clock, Sparkles } from 'lucide-react';

export default function VideoUploadModal({ isOpen, onClose, onSelectMoment }) {
  if (!isOpen) return null;

  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setErrorMsg(null);
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setErrorMsg(null);
    setResult(null);

    const formData = new FormData();
    formData.append('video', selectedFile);

    try {
      const resp = await fetch('http://127.0.0.1:5000/api/analyze-video', {
        method: 'POST',
        body: formData
      });

      const data = await resp.json();
      if (!data.success) {
        throw new Error(data.error || 'Video analysis failed');
      }

      setResult(data);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Error processing video file. Ensure backend is running.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        {/* Header */}
        <div className="panel-header">
          <div className="panel-title">
            <Film size={17} color="#00f3ff" />
            <span>Video Offline Inspector & Moment Extraction</span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Upload Area */}
          {!result && (
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed rgba(6, 182, 212, 0.4)',
                borderRadius: '12px',
                padding: '2.5rem 1rem',
                textAlign: 'center',
                cursor: 'pointer',
                background: 'rgba(15, 23, 42, 0.5)',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.75rem'
              }}
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault();
                const f = e.dataTransfer.files?.[0];
                if (f) setSelectedFile(f);
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <UploadCloud size={42} color="#00f3ff" />
              <div>
                <div style={{ color: '#f8fafc', fontWeight: '600', fontSize: '0.95rem' }}>
                  {selectedFile ? selectedFile.name : 'Select or Drop Video File'}
                </div>
                <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                  Supported formats: MP4, WebM, QuickTime (up to ~60s recommended)
                </div>
              </div>

              {selectedFile && (
                <div style={{
                  fontSize: '0.72rem',
                  fontFamily: 'JetBrains Mono',
                  color: '#34d399',
                  background: 'rgba(16, 185, 129, 0.15)',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '6px'
                }}>
                  READY FOR SCAN &bull; {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                </div>
              )}
            </div>
          )}

          {errorMsg && (
            <div style={{
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.4)',
              color: '#fb7185',
              padding: '0.6rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.78rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={15} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Processing State */}
          {isProcessing && (
            <div style={{
              textAlign: 'center',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '3px solid rgba(6, 182, 212, 0.2)',
                borderTopColor: '#00f3ff',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
              }}></div>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <div style={{ color: '#00f3ff', fontFamily: 'JetBrains Mono', fontSize: '0.84rem' }}>
                Analyzing video frames, estimating age, and detecting moments...
              </div>
            </div>
          )}

          {/* Analysis Results View */}
          {result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.6rem',
                fontFamily: 'JetBrains Mono'
              }}>
                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.65rem', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>DURATION</div>
                  <div style={{ color: '#00f3ff', fontWeight: '700' }}>{result.duration_sec}s</div>
                </div>
                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.65rem', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>AVG AGE</div>
                  <div style={{ color: '#38bdf8', fontWeight: '700' }}>{result.average_age} yrs</div>
                </div>
                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.65rem', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>MOMENTS FOUND</div>
                  <div style={{ color: '#f59e0b', fontWeight: '700' }}>{result.moments?.length || 0}</div>
                </div>
              </div>

              {/* Moments List from Video */}
              <div>
                <div style={{
                  fontSize: '0.74rem',
                  fontFamily: 'JetBrains Mono',
                  color: 'var(--text-muted)',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}>
                  <Sparkles size={13} color="#00f3ff" />
                  <span>EXTRACTED VIDEO HIGHLIGHTS</span>
                </div>

                <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {result.moments && result.moments.length > 0 ? (
                    result.moments.map(m => (
                      <div
                        key={m.id}
                        className="moment-card"
                        onClick={() => onSelectMoment(m)}
                        style={{ padding: '0.55rem' }}
                      >
                        {m.thumbnail && (
                          <img src={m.thumbnail} alt={m.title} className="moment-thumb" style={{ width: '48px', height: '48px' }} />
                        )}
                        <div className="moment-info">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className="moment-title">{m.title}</span>
                            <span style={{ fontSize: '0.62rem', color: '#00f3ff', fontFamily: 'JetBrains Mono' }}>
                              @{m.video_time_sec}s
                            </span>
                          </div>
                          <p className="moment-desc">{m.description}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', padding: '1rem', textAlign: 'center' }}>
                      No distinct peak moments triggered in this sample video clip.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.65rem', marginTop: '0.5rem' }}>
            {!result ? (
              <button
                className="cyber-btn"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={handleUploadAndAnalyze}
                disabled={!selectedFile || isProcessing}
              >
                <span>Run Deep Scan Analysis</span>
              </button>
            ) : (
              <button
                className="cyber-btn"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => {
                  setResult(null);
                  setSelectedFile(null);
                }}
              >
                <span>Analyze Another Video</span>
              </button>
            )}
            <button
              className="cyber-btn cyber-btn-secondary"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
