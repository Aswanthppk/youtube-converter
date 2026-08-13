import React from 'react';
import { Store, Music } from 'lucide-react';

export const FloatingShowcase: React.FC = () => {
  return (
    <div className="hero-right">
      {/* Studio Quality Tag */}
      <div className="floating-widget widget-country-badge">
        <div style={{ fontSize: '24px' }}>🎧</div>
        <div className="widget-country-text">
          <div className="country-name">320 kbps</div>
          <div className="country-sub">Studio Quality</div>
        </div>
      </div>

      {/* Multiple Quality Store Tag */}
      <div className="floating-widget widget-store-tag">
        <Store size={18} style={{ color: '#7c3aed' }} />
        <span>Batch Engine Active</span>
      </div>

      {/* Audio Spectrum Bar Chart Widget */}
      <div className="floating-widget widget-chart-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>AUDIO BITRATE OUTPUT</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>100% Lossless</div>
          </div>
          <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '12px', background: '#e0e7ff', color: '#3730a3', fontWeight: 700 }}>
            Active
          </span>
        </div>

        <div className="chart-bars">
          <div className="chart-bar-group">
            <div className="bar-fill" style={{ height: '110px' }}>
              <div className="bar-fill-inner" style={{ height: '70%' }}></div>
            </div>
            <span className="bar-label">128k</span>
          </div>

          <div className="chart-bar-group">
            <div className="bar-fill" style={{ height: '110px' }}>
              <div className="bar-fill-inner" style={{ height: '40%' }}></div>
            </div>
            <span className="bar-label">192k</span>
          </div>

          <div className="chart-bar-group">
            <div className="bar-fill" style={{ height: '110px' }}>
              <div className="bar-fill-inner active" style={{ height: '90%' }}></div>
            </div>
            <span className="bar-label">256k</span>
          </div>

          <div className="chart-bar-group">
            <div className="bar-fill" style={{ height: '110px' }}>
              <div className="bar-fill-inner active" style={{ height: '65%' }}></div>
            </div>
            <span className="bar-label">320k</span>
          </div>
        </div>
      </div>

      {/* Music Note Tag (Replacing Avatar/Chatbot Icon) */}
      <div className="floating-widget widget-user-avatar" style={{ padding: '12px 18px', background: '#ffffff', borderRadius: '16px' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Music size={20} />
        </div>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>Instant Streaming</div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>Play MP3 Online</div>
        </div>
      </div>
    </div>
  );
};
