import React from 'react';
import { User, ShieldCheck, Gauge, Layers } from 'lucide-react';

const COHORTS = [
  { key: 'teen', label: '14-19', name: 'Youth' },
  { key: 'young', label: '20-29', name: 'Young Adult' },
  { key: 'adult', label: '30-44', name: 'Adult' },
  { key: 'middle', label: '45-59', name: 'Middle Age' },
  { key: 'senior', label: '60+', name: 'Senior' }
];

export default function AgeDemographics({ primaryFace }) {
  const ageData = primaryFace?.age || {
    estimated: 25,
    range: '20-29',
    category: 'Young Adult',
    confidence: 0.88,
    texture_score: 115.4
  };

  const estAge = ageData.estimated || 25;
  const confPct = Math.round((ageData.confidence || 0.85) * 100);

  // SVG Gauge calculations
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  // Normalized age 10 to 80
  const normAge = Math.min(1.0, Math.max(0, (estAge - 10) / 70.0));
  const strokeDashoffset = circumference - normAge * circumference;

  return (
    <div className="glass-panel" style={{ height: '100%' }}>
      <div className="panel-header">
        <div className="panel-title">
          <User size={17} color="var(--neon-cyan)" />
          <span>Biometric Age & Demographics</span>
        </div>
        <span style={{
          fontSize: '0.68rem',
          fontFamily: 'JetBrains Mono',
          color: 'var(--neon-emerald)',
          padding: '0.15rem 0.5rem',
          background: 'rgba(16, 185, 129, 0.1)',
          borderRadius: '4px',
          border: '1px solid rgba(16, 185, 129, 0.3)'
        }}>
          CONFIDENCE: {confPct}%
        </span>
      </div>

      <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Main Gauge Hero Area */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '0.85rem 0.5rem',
          background: 'rgba(10, 16, 30, 0.4)',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)'
        }}>
          {/* Circular SVG Gauge */}
          <div style={{ position: 'relative', width: '130px', height: '130px' }}>
            <svg width="130" height="130" style={{ transform: 'rotate(-90deg)' }}>
              {/* Background ring */}
              <circle
                cx="65"
                cy="65"
                r={radius}
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="10"
                fill="transparent"
              />
              {/* Active neon stroke */}
              <circle
                cx="65"
                cy="65"
                r={radius}
                stroke="url(#ageGradient)"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                style={{ transition: 'stroke-dashoffset 0.6s ease' }}
              />
              <defs>
                <linearGradient id="ageGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00f3ff" />
                  <stop offset="50%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>

            {/* Centered age number */}
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{
                fontSize: '2.1rem',
                fontWeight: '800',
                fontFamily: 'JetBrains Mono',
                color: '#f8fafc',
                lineHeight: 1
              }}>
                {estAge}
              </span>
              <span style={{
                fontSize: '0.68rem',
                color: 'var(--neon-cyan)',
                fontFamily: 'JetBrains Mono',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Years Old
              </span>
            </div>
          </div>

          {/* Demographic details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontFamily: 'JetBrains Mono' }}>
                Classification
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#38bdf8' }}>
                {ageData.category || 'Young Adult'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontFamily: 'JetBrains Mono' }}>
                Estimated Range
              </div>
              <div style={{
                fontSize: '0.88rem',
                fontWeight: '600',
                fontFamily: 'JetBrains Mono',
                color: '#e2e8f0'
              }}>
                [{ageData.range || '20-29'}]
              </div>
            </div>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.7rem',
              color: 'var(--text-muted)'
            }}>
              <ShieldCheck size={13} color="#10b981" />
              <span>Morphology Calibrated</span>
            </div>
          </div>
        </div>

        {/* Cohort Brackets Bar */}
        <div>
          <div style={{
            fontSize: '0.72rem',
            fontFamily: 'JetBrains Mono',
            color: 'var(--text-dim)',
            textTransform: 'uppercase',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
            <Layers size={13} color="#00f3ff" />
            <span>Demographic Cohort Distribution</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.35rem' }}>
            {COHORTS.map(c => {
              const isMatch = (ageData.range || '').includes(c.label.split('-')[0]) || 
                              (ageData.category || '').toLowerCase().includes(c.name.toLowerCase());

              return (
                <div
                  key={c.key}
                  style={{
                    padding: '0.5rem 0.3rem',
                    textAlign: 'center',
                    borderRadius: '8px',
                    background: isMatch ? 'rgba(6, 182, 212, 0.2)' : 'rgba(15, 23, 42, 0.4)',
                    border: isMatch ? '1px solid #00f3ff' : '1px solid var(--border-subtle)',
                    boxShadow: isMatch ? '0 0 12px rgba(6, 182, 212, 0.3)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{
                    fontSize: '0.72rem',
                    fontWeight: isMatch ? '700' : '500',
                    fontFamily: 'JetBrains Mono',
                    color: isMatch ? '#00f3ff' : '#94a3b8'
                  }}>
                    {c.label}
                  </div>
                  <div style={{
                    fontSize: '0.62rem',
                    color: isMatch ? '#e2e8f0' : 'var(--text-dim)',
                    marginTop: '2px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {c.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Skin Texture Variance Metric */}
        <div style={{
          padding: '0.75rem',
          background: 'rgba(11, 17, 32, 0.45)',
          borderRadius: '10px',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono' }}>
              TEXTURE VARIANCE (LAPLACIAN)
            </div>
            <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '2px' }}>
              Micro-surface sharpness gradient
            </div>
          </div>
          <div style={{
            fontFamily: 'JetBrains Mono',
            fontSize: '0.92rem',
            fontWeight: '700',
            color: 'var(--neon-cyan)'
          }}>
            {ageData.texture_score || 115.4}
          </div>
        </div>
      </div>
    </div>
  );
}
