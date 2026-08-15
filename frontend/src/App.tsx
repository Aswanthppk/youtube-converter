import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { ConverterWidget } from './components/ConverterWidget';
import { RecentDownloadsGrid, HistoryFile } from './components/RecentDownloadsGrid';
import { FeatureGrid } from './components/FeatureGrid';
import { Play } from 'lucide-react';

export function App() {
  const [historyFiles, setHistoryFiles] = useState<HistoryFile[]>(() => {
    try {
      const saved = sessionStorage.getItem('user_conversions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleConversionSuccess = (newFile: HistoryFile) => {
    setHistoryFiles((prev) => {
      const filtered = prev.filter((f) => f.filename !== newFile.filename);
      const updated = [newFile, ...filtered];
      try {
        sessionStorage.setItem('user_conversions', JSON.stringify(updated));
      } catch {
        // ignore storage errors
      }
      return updated;
    });
  };

  const handleClearHistory = () => {
    setHistoryFiles([]);
    try {
      sessionStorage.removeItem('user_conversions');
    } catch {
      // ignore storage errors
    }
  };

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
              <Play size={16} style={{ color: '#e50914', fill: 'currentColor' }} /> Listen to Music
            </a>
          </div>

          {/* Main Converter Card */}
          <div id="converter" style={{ marginTop: '24px' }}>
            <ConverterWidget onConversionSuccess={handleConversionSuccess} />
          </div>
        </div>

        {/* Recent Song Conversions List with Song Playback */}
        <RecentDownloadsGrid files={historyFiles} onClear={handleClearHistory} />

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
