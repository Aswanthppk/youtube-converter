import React from 'react';
import { Zap, ShieldCheck, Headphones } from 'lucide-react';

export const FeatureGrid: React.FC = () => {
  return (
    <section id="features" className="features-section">
      <div className="pill-badge" style={{ margin: '0 auto 16px' }}>
        <span className="pill-badge-text" style={{ color: '#2563eb' }}>ENTERPRISE FEATURES</span>
      </div>
      <h2 style={{ fontSize: 36, fontWeight: 800, color: '#0f172a', letterSpacing: '-1px' }}>
        Built for Speed and Studio Audio Quality
      </h2>

      <div className="feature-grid-3">
        <div className="feature-card">
          <div className="feature-icon-box">
            <Zap size={24} />
          </div>
          <div className="feature-title">Fast Conversion Engine</div>
          <div className="feature-desc">
            Powered by modern FFmpeg and yt-dlp backends for instantaneous stream extraction and encoding.
          </div>
        </div>

        <div className="feature-card">
          <div className="feature-icon-box" style={{ backgroundColor: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed' }}>
            <Headphones size={24} />
          </div>
          <div className="feature-title">Lossless 320 kbps Bitrate</div>
          <div className="feature-desc">
            Extract pure, original audio frequencies up to 320 kbps without compression artifacts or quality degradation.
          </div>
        </div>

        <div className="feature-card">
          <div className="feature-icon-box" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <ShieldCheck size={24} />
          </div>
          <div className="feature-title">Zero Ads & Registration</div>
          <div className="feature-desc">
            Direct browser downloads with clean UI, zero intrusive ads, no account setup, and unlimited conversion history.
          </div>
        </div>
      </div>
    </section>
  );
};
