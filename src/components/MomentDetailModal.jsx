import React from 'react';
import { X, Clock, Zap, Download, Share2, Sparkles } from 'lucide-react';

export default function MomentDetailModal({ moment, onClose }) {
  if (!moment) return null;

  let tagColor = '#00f3ff';
  if (moment.type === 'joy_peak') tagColor = '#f59e0b';
  else if (moment.type === 'surprise') tagColor = '#38bdf8';
  else if (moment.type === 'rapid_motion') tagColor = '#f43f5e';
  else if (moment.type === 'mood_transition') tagColor = '#a855f7';

  const downloadSnapshot = () => {
    if (!moment.thumbnail) return;
    const a = document.createElement('a');
    a.href = moment.thumbnail;
    a.download = `moment_${moment.type}_${moment.id}.jpg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        {/* Modal Header */}
        <div className="panel-header" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="panel-title" style={{ color: tagColor }}>
            <Sparkles size={16} />
            <span>Moment Telemetry Snapshot</span>
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

        {/* Modal Body */}
        <div style={{ padding: '1.4rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Big Thumbnail */}
          {moment.thumbnail && (
            <div style={{
              width: '100%',
              borderRadius: '12px',
              overflow: 'hidden',
              border: `1px solid ${tagColor}60`,
              boxShadow: `0 0 25px ${tagColor}25`,
              background: '#070c18',
              textAlign: 'center'
            }}>
              <img
                src={moment.thumbnail}
                alt={moment.title}
                style={{
                  width: '100%',
                  maxHeight: '260px',
                  objectFit: 'contain'
                }}
              />
            </div>
          )}

          {/* Details */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '1.15rem', color: '#f8fafc', fontWeight: '700' }}>
                {moment.title}
              </h3>
              <span style={{
                fontSize: '0.72rem',
                fontFamily: 'JetBrains Mono',
                padding: '0.2rem 0.5rem',
                borderRadius: '6px',
                background: `${tagColor}20`,
                color: tagColor,
                border: `1px solid ${tagColor}50`
              }}>
                {moment.badge}
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginTop: '0.4rem', lineHeight: 1.45 }}>
              {moment.description}
            </p>
          </div>

          {/* Telemetry Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.5rem',
            padding: '0.85rem',
            background: 'rgba(15, 23, 42, 0.6)',
            borderRadius: '10px',
            border: '1px solid var(--border-subtle)',
            fontFamily: 'JetBrains Mono',
            fontSize: '0.75rem'
          }}>
            <div>
              <div style={{ color: 'var(--text-dim)', fontSize: '0.68rem' }}>TIMESTAMP</div>
              <div style={{ color: '#00f3ff', fontWeight: '700' }}>+{moment.timestamp}s</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-dim)', fontSize: '0.68rem' }}>CONFIDENCE</div>
              <div style={{ color: tagColor, fontWeight: '700' }}>{moment.score}%</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-dim)', fontSize: '0.68rem' }}>EVENT ID</div>
              <div style={{ color: '#cbd5e1' }}>#{moment.id}</div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.65rem', marginTop: '0.5rem' }}>
            <button
              className="cyber-btn"
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={downloadSnapshot}
            >
              <Download size={15} />
              <span>Download Image</span>
            </button>
            <button
              className="cyber-btn cyber-btn-secondary"
              onClick={onClose}
            >
              <span>Close</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
