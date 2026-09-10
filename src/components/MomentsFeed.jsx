import React, { useState } from 'react';
import { Sparkles, Download, Clock, Zap, Smile, RefreshCw, ChevronRight } from 'lucide-react';

export default function MomentsFeed({ moments = [], onSelectMoment, onClearMoments }) {
  const [filter, setFilter] = useState('all');

  const filteredMoments = moments.filter(m => {
    if (filter === 'all') return true;
    if (filter === 'joy') return m.type === 'joy_peak';
    if (filter === 'surprise') return m.type === 'surprise';
    if (filter === 'action') return m.type === 'rapid_motion';
    if (filter === 'transition') return m.type === 'mood_transition';
    return true;
  });

  const exportMomentsJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(moments, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `aura_cv_moments_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Panel Header */}
      <div className="panel-header">
        <div className="panel-title">
          <Sparkles size={17} color="var(--neon-cyan)" />
          <span>Real-Time Moments & Highlights</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            fontSize: '0.72rem',
            fontFamily: 'JetBrains Mono',
            color: 'var(--neon-cyan)',
            padding: '0.15rem 0.5rem',
            background: 'rgba(6, 182, 212, 0.12)',
            borderRadius: '4px',
            border: '1px solid rgba(6, 182, 212, 0.3)'
          }}>
            {moments.length} Captured
          </span>
          <button
            className="cyber-btn cyber-btn-secondary"
            style={{ padding: '0.35rem 0.55rem' }}
            onClick={exportMomentsJSON}
            disabled={moments.length === 0}
            title="Download Moments JSON"
          >
            <Download size={13} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{
        padding: '0.65rem 1rem',
        background: 'rgba(10, 16, 30, 0.35)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        gap: '0.35rem',
        overflowX: 'auto'
      }}>
        {[
          { key: 'all', label: 'All' },
          { key: 'joy', label: '😄 Joy' },
          { key: 'surprise', label: '😲 Surprise' },
          { key: 'action', label: '⚡ Action' },
          { key: 'transition', label: '🔄 Shifts' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              padding: '0.3rem 0.65rem',
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontFamily: 'JetBrains Mono',
              background: filter === tab.key ? 'rgba(6, 182, 212, 0.25)' : 'transparent',
              color: filter === tab.key ? '#00f3ff' : '#94a3b8',
              border: filter === tab.key ? '1px solid rgba(6, 182, 212, 0.5)' : '1px solid transparent',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Moments List */}
      <div className="panel-body" style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>
        {filteredMoments.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            color: 'var(--text-dim)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.65rem'
          }}>
            <Clock size={32} color="#475569" />
            <div style={{ fontSize: '0.84rem' }}>Awaiting Event Triggers...</div>
            <div style={{ fontSize: '0.74rem', maxWidth: '240px', lineHeight: 1.4 }}>
              Smile into camera, express surprise, or move to trigger automatic moment detection!
            </div>
          </div>
        ) : (
          <div className="moments-scroll-area">
            {filteredMoments.slice().reverse().map(moment => {
              let tagColor = '#00f3ff';
              if (moment.type === 'joy_peak') tagColor = '#f59e0b';
              else if (moment.type === 'surprise') tagColor = '#38bdf8';
              else if (moment.type === 'rapid_motion') tagColor = '#f43f5e';
              else if (moment.type === 'mood_transition') tagColor = '#a855f7';

              return (
                <div
                  key={moment.id}
                  className="moment-card"
                  onClick={() => onSelectMoment(moment)}
                >
                  {/* Thumbnail */}
                  {moment.thumbnail ? (
                    <img
                      src={moment.thumbnail}
                      alt={moment.title}
                      className="moment-thumb"
                      style={{ borderColor: `${tagColor}50` }}
                    />
                  ) : (
                    <div className="moment-thumb" style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: tagColor
                    }}>
                      <Zap size={20} />
                    </div>
                  )}

                  {/* Info */}
                  <div className="moment-info" style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <span className="moment-title" title={moment.title}>
                        {moment.title}
                      </span>
                      <span style={{
                        fontSize: '0.65rem',
                        fontFamily: 'JetBrains Mono',
                        padding: '0.1rem 0.4rem',
                        borderRadius: '4px',
                        backgroundColor: `${tagColor}18`,
                        color: tagColor,
                        border: `1px solid ${tagColor}40`,
                        flexShrink: 0
                      }}>
                        {moment.badge || moment.type}
                      </span>
                    </div>

                    <p className="moment-desc">
                      {moment.description}
                    </p>

                    <div className="moment-meta">
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={11} />
                        <span>+{moment.timestamp}s</span>
                      </span>
                      <span>&bull;</span>
                      <span style={{ color: tagColor }}>
                        SCORE: {moment.score}%
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-dim)' }}>
                    <ChevronRight size={16} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
