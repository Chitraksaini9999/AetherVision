import React from 'react';
import { Smile, Sparkles, Flame, TrendingUp } from 'lucide-react';

const EMOTION_CONFIG = {
  happy: { label: 'Joy / Happy', color: '#f59e0b', emoji: '😄', desc: 'Positive valence & smile expression' },
  surprised: { label: 'Surprise', color: '#38bdf8', emoji: '😲', desc: 'Raised eyebrows & eye expansion' },
  neutral: { label: 'Neutral', color: '#00f3ff', emoji: '😐', desc: 'Relaxed baseline state' },
  sad: { label: 'Sadness', color: '#6366f1', emoji: '😔', desc: 'Downturned corners & lowered brow' },
  angry: { label: 'Anger / Focus', color: '#f43f5e', emoji: '😠', desc: 'Furrowed brow & tense muscles' },
  fear: { label: 'Fear / Alarm', color: '#a855f7', emoji: '😨', desc: 'Startled eyes & mouth tension' },
  disgust: { label: 'Disgust', color: '#10b981', emoji: '🤢', desc: 'Nose wrinkle & mouth aversion' }
};

export default function EmotionAnalytics({ primaryFace, emotionHistory = [] }) {
  const emotionData = primaryFace?.emotion || {
    dominant: 'neutral',
    confidence: 0.85,
    scores: { happy: 0.1, neutral: 0.75, surprised: 0.05, sad: 0.03, angry: 0.04, fear: 0.02, disgust: 0.01 },
    smile_detected: false,
    smile_intensity: 0.0
  };

  const currentConfig = EMOTION_CONFIG[emotionData.dominant] || EMOTION_CONFIG.neutral;
  const confPct = Math.round((emotionData.confidence || 0) * 100);

  return (
    <div className="glass-panel" style={{ height: '100%' }}>
      <div className="panel-header">
        <div className="panel-title">
          <Smile size={17} color="var(--neon-amber)" />
          <span>Emotion & Expression Radar</span>
        </div>
        <span style={{
          fontSize: '0.68rem',
          fontFamily: 'JetBrains Mono',
          color: currentConfig.color,
          padding: '0.15rem 0.5rem',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '4px',
          border: `1px solid ${currentConfig.color}40`
        }}>
          CONFIDENCE: {confPct}%
        </span>
      </div>

      <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Dominant Hero Card */}
        <div style={{
          padding: '1rem',
          background: `linear-gradient(135deg, ${currentConfig.color}15, rgba(15, 23, 42, 0.6))`,
          border: `1px solid ${currentConfig.color}40`,
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: `0 0 20px ${currentConfig.color}18`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <span style={{ fontSize: '2.4rem', filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.5))' }}>
              {currentConfig.emoji}
            </span>
            <div>
              <div style={{
                fontSize: '1.15rem',
                fontWeight: '700',
                color: currentConfig.color,
                letterSpacing: '0.04em',
                textTransform: 'uppercase'
              }}>
                {currentConfig.label}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                {currentConfig.desc}
              </div>
            </div>
          </div>

          {/* Smile indicator chip */}
          {emotionData.smile_detected && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.3rem 0.6rem',
              background: 'rgba(245, 158, 11, 0.2)',
              border: '1px solid rgba(245, 158, 11, 0.5)',
              borderRadius: '6px',
              color: '#fbbf24',
              fontSize: '0.72rem',
              fontWeight: '600'
            }}>
              <Flame size={13} />
              <span>Smile Active</span>
            </div>
          )}
        </div>

        {/* 7-Channel Spectrum Equalizer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <div style={{
            fontSize: '0.74rem',
            fontFamily: 'JetBrains Mono',
            color: 'var(--text-dim)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Multiclass Probability Distribution
          </div>

          {Object.entries(EMOTION_CONFIG).map(([key, cfg]) => {
            const score = emotionData.scores?.[key] || 0;
            const pct = Math.round(score * 100);
            const isDominant = key === emotionData.dominant;

            return (
              <div key={key} className="emotion-bar-item">
                <div className="emotion-bar-header">
                  <span style={{
                    color: isDominant ? cfg.color : '#cbd5e1',
                    fontWeight: isDominant ? '700' : '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}>
                    <span>{cfg.emoji}</span>
                    <span>{cfg.label}</span>
                  </span>
                  <span style={{
                    fontFamily: 'JetBrains Mono',
                    fontSize: '0.74rem',
                    color: isDominant ? cfg.color : 'var(--text-dim)',
                    fontWeight: '600'
                  }}>
                    {pct}%
                  </span>
                </div>
                <div className="emotion-track">
                  <div
                    className="emotion-fill"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: cfg.color,
                      color: cfg.color
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Sparkline Strip */}
        <div style={{
          marginTop: '0.25rem',
          padding: '0.85rem',
          background: 'rgba(11, 17, 32, 0.5)',
          borderRadius: '10px',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.5rem',
            fontSize: '0.72rem',
            fontFamily: 'JetBrains Mono',
            color: 'var(--text-muted)'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <TrendingUp size={12} color="#00f3ff" />
              <span>TEMPORAL MOOD TRAJECTORY</span>
            </span>
            <span style={{ color: 'var(--neon-cyan)' }}>REAL-TIME</span>
          </div>

          {/* Sparkline stream bars */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '3px',
            height: '32px',
            overflow: 'hidden'
          }}>
            {emotionHistory.slice(-24).map((hist, idx) => {
              const cfg = EMOTION_CONFIG[hist.dominant] || EMOTION_CONFIG.neutral;
              const h = Math.max(15, Math.round((hist.confidence || 0.5) * 100));
              return (
                <div
                  key={idx}
                  style={{
                    flex: 1,
                    height: `${h}%`,
                    backgroundColor: cfg.color,
                    borderRadius: '2px',
                    opacity: 0.35 + (idx / 24) * 0.65,
                    transition: 'height 0.2s ease'
                  }}
                  title={`${cfg.label} (${Math.round(hist.confidence * 100)}%)`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
