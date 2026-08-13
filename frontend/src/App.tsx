import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ConverterWidget } from './components/ConverterWidget';
import { RecentDownloadsGrid, HistoryFile } from './components/RecentDownloadsGrid';
import { FeatureGrid } from './components/FeatureGrid';
import { Play } from 'lucide-react';

export function App() {
  const [historyFiles, setHistoryFiles] = useState<HistoryFile[]>([]);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      if (data.success && data.files) {
        setHistoryFiles(data.files);
      }
    } catch (err) {
      console.warn("Failed to load history list", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="app-container">
      <Navbar />

      {/* Hero Section - Streamlined Clean Centered Layout */}
      <main>
        <div className="hero-centered-container">
          <div className="pill-badge" style={{ margin: '0 auto 20px' }}>
            <div className="pill-badge-icon">Y</div>
            <span className="pill-badge-text">Powered by yt-dlp & FFmpeg 8.0</span>
          </div>

          <h1 className="hero-heading">
            Streamline Converts, Maximize Audio
          </h1>

          <p className="hero-subtext" style={{ margin: '0 auto 32px' }}>
            Take control of your audio downloads with <strong>youmusic.store</strong>. Convert, stream, and play every YouTube video in studio-grade MP3 format.
          </p>

          <div className="hero-cta-group" style={{ justifyContent: 'center' }}>
            <a href="#converter" className="btn btn-primary btn-pill" style={{ padding: '14px 32px' }}>
              Start Converting
            </a>
            <a href="#history" className="btn btn-outline btn-pill" style={{ padding: '14px 28px' }}>
              <Play size={16} style={{ color: '#2563eb', fill: 'currentColor' }} /> Listen to Music
            </a>
          </div>

          {/* Main Converter Card */}
          <div id="converter" style={{ marginTop: '24px' }}>
            <ConverterWidget onConversionSuccess={fetchHistory} />
          </div>
        </div>

        {/* Recent Song Conversions List with Song Playback */}
        <RecentDownloadsGrid files={historyFiles} onRefresh={fetchHistory} />

        {/* Features Grid */}
        <FeatureGrid />
      </main>

      <footer className="footer-bar">
        <p>© 2026 <strong>youmusic.store</strong>. Built with React & Python. Stream and download high-quality YouTube MP3 audio online.</p>
      </footer>
    </div>
  );
}

export default App;
