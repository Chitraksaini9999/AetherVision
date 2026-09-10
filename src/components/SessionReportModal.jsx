import React from 'react';
import { X, BarChart3, Download, Award, Clock, Activity, User, Smile } from 'lucide-react';

export default function SessionReportModal({
  isOpen,
  onClose,
  sessionStats,
  moments = [],
  primaryFace
}) {
  if (!isOpen) return null;

  const totalMoments = moments.length;
  const joyMoments = moments.filter(m => m.type === 'joy_peak').length;
  const surpriseMoments = moments.filter(m => m.type === 'surprise').length;
  const actionMoments = moments.filter(m => m.type === 'rapid_motion').length;

  const exportFullReport = () => {
    const reportData = {
      title: "AURA-CV Biometric Telemetry Session Report",
      generated_at: new Date().toISOString(),
      summary: {
        total_moments_captured: totalMoments,
        joy_peaks: joyMoments,
        surprise_reactions: surpriseMoments,
        action_spikes: actionMoments,
        estimated_age: primaryFace?.age?.estimated || 25,
        demographic_bracket: primaryFace?.age?.range || '20-29',
        dominant_emotion: primaryFace?.emotion?.dominant || 'neutral'
      },
      moments_log: moments
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `aura_cv_session_report_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '620px' }}>
        {/* Header */}
        <div className="panel-header">
          <div className="panel-title">
            <BarChart3 size={17} color="#00f3ff" />
            <span>Biometric Analytics & Session Dossier</span>
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

        {/* Content */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Top Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            <div style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '10px',
              padding: '0.85rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono' }}>
                TOTAL MOMENTS
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#00f3ff', marginTop: '0.2rem' }}>
                {totalMoments}
              </div>
            </div>

            <div style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '10px',
              padding: '0.85rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono' }}>
                ESTIMATED AGE
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#38bdf8', marginTop: '0.2rem' }}>
                {primaryFace?.age?.estimated || 25} yrs
              </div>
            </div>

            <div style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '10px',
              padding: '0.85rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono' }}>
                JOY SURGES
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#f59e0b', marginTop: '0.2rem' }}>
                {joyMoments}
              </div>
            </div>
          </div>

          {/* Emotional Composition */}
          <div style={{
            background: 'rgba(10, 16, 30, 0.4)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '1rem'
          }}>
            <div style={{
              fontSize: '0.78rem',
              fontFamily: 'JetBrains Mono',
              color: 'var(--text-muted)',
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem'
            }}>
              <Smile size={14} color="#f59e0b" />
              <span>EMOTIONAL SIGNATURE SUMMARY</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                <span>Primary Expressed State:</span>
                <span style={{ fontWeight: '700', color: '#00f3ff', textTransform: 'uppercase' }}>
                  {primaryFace?.emotion?.dominant || 'Neutral'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                <span>Peak Smile Occurrences:</span>
                <span style={{ fontWeight: '700', color: '#f59e0b' }}>
                  {joyMoments} events detected
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                <span>Surprise / Attention Shifts:</span>
                <span style={{ fontWeight: '700', color: '#38bdf8' }}>
                  {surpriseMoments} triggers
                </span>
              </div>
            </div>
          </div>

          {/* Demographic Bracket Assessment */}
          <div style={{
            background: 'rgba(10, 16, 30, 0.4)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '1rem'
          }}>
            <div style={{
              fontSize: '0.78rem',
              fontFamily: 'JetBrains Mono',
              color: 'var(--text-muted)',
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem'
            }}>
              <User size={14} color="#00f3ff" />
              <span>DEMOGRAPHIC PROFILE</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8rem' }}>
              <div>
                <span style={{ color: 'var(--text-dim)' }}>Age Bracket:</span>
                <div style={{ fontWeight: '700', color: '#f8fafc', marginTop: '2px' }}>
                  {primaryFace?.age?.range || '20-29'} ({primaryFace?.age?.category || 'Young Adult'})
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)' }}>Skin Texture Score:</span>
                <div style={{ fontWeight: '700', color: '#38bdf8', marginTop: '2px' }}>
                  {primaryFace?.age?.texture_score || '115.4'}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              className="cyber-btn"
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={exportFullReport}
            >
              <Download size={15} />
              <span>Export Full Dossier (JSON)</span>
            </button>
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
