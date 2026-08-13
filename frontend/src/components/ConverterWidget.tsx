import React, { useState, useEffect } from 'react';
import { Link2, Clipboard, Wand2, Download, RotateCcw, AlertCircle, Loader2, User, Gauge, Clock, CheckCircle } from 'lucide-react';

interface VideoInfo {
  id: string;
  title: string;
  channel: string;
  duration_str: string;
  thumbnail: string;
}

interface ConversionTask {
  id: string;
  status: 'pending' | 'fetching' | 'downloading' | 'converting' | 'finished' | 'error';
  progress: number;
  speed: string;
  eta: string;
  result?: {
    filename: string;
    filesize_mb: number;
  };
  error?: string;
}

interface ConverterWidgetProps {
  onConversionSuccess: () => void;
}

export const ConverterWidget: React.FC<ConverterWidgetProps> = ({ onConversionSuccess }) => {
  const [url, setUrl] = useState('');
  const [quality, setQuality] = useState('192');
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<VideoInfo | null>(null);
  const [task, setTask] = useState<ConversionTask | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Debounced Video Info Preview
  useEffect(() => {
    const trimmed = url.trim();
    if (!trimmed || (!trimmed.includes('youtube.com') && !trimmed.includes('youtu.be'))) {
      setInfo(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: trimmed })
        });
        const data = await res.json();
        if (data.success && data.info) {
          setInfo(data.info);
        } else {
          setInfo(null);
        }
      } catch {
        setInfo(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [url]);

  // Handle Paste
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
      }
    } catch {
      console.warn("Clipboard access denied");
    }
  };

  // Submit Conversion
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setError(null);
    setTask(null);
    setLoading(true);

    try {
      const res = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), quality })
      });

      const data = await res.json();
      if (data.success && data.task_id) {
        pollStatus(data.task_id);
      } else {
        setError(data.error || 'Failed to start conversion task.');
        setLoading(false);
      }
    } catch {
      setError('Network connection error. Please try again.');
      setLoading(false);
    }
  };

  // Poll Task Status
  const pollStatus = (taskId: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/status/${taskId}`);
        const data = await res.json();

        if (data.success && data.task) {
          setTask(data.task);

          if (data.task.status === 'finished') {
            clearInterval(interval);
            setLoading(false);
            onConversionSuccess();
          } else if (data.task.status === 'error') {
            clearInterval(interval);
            setLoading(false);
            setError(data.task.error || 'Conversion error occurred.');
          }
        }
      } catch (err) {
        console.error("Polling error", err);
      }
    }, 1000);
  };

  const handleReset = () => {
    setUrl('');
    setInfo(null);
    setTask(null);
    setError(null);
    setLoading(false);
  };

  return (
    <div className="converter-card">
      <form onSubmit={handleSubmit} className="input-group">
        <div className="input-box-wrapper">
          <Link2 size={20} className="input-box-icon" />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste YouTube Video URL here..."
            className="url-input-field"
            required
          />
          <button type="button" onClick={handlePaste} className="paste-action-btn">
            <Clipboard size={14} /> Paste
          </button>
        </div>

        {/* Bitrate Quality Selector Tabs */}
        <div className="quality-selector">
          <span className="selector-label">AUDIO BITRATE QUALITY</span>
          <div className="tabs-row">
            {[
              { id: '320', label: '320 kbps (Ultra)' },
              { id: '256', label: '256 kbps (High)' },
              { id: '192', label: '192 kbps (Std)' },
              { id: '128', label: '128 kbps (Mini)' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`tab-btn ${quality === tab.id ? 'active' : ''}`}
                onClick={() => setQuality(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading || !url.trim()} className="btn btn-primary" style={{ width: '100%', marginTop: '8px', padding: '16px' }}>
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Converting Video...
            </>
          ) : (
            <>
              <Wand2 size={18} /> Convert to High-Quality MP3
            </>
          )}
        </button>
      </form>

      {/* Video Metadata Live Preview Card */}
      {info && (
        <div className="video-preview-box">
          <div className="preview-img-container">
            <img src={info.thumbnail} alt={info.title} width="120" height="72" fetchPriority="high" />
            <span className="duration-tag">{info.duration_str}</span>
          </div>
          <div className="preview-info">
            <div className="preview-title">{info.title}</div>
            <div className="preview-channel">
              <User size={14} /> {info.channel}
            </div>
          </div>
        </div>
      )}

      {/* Live Conversion Progress Indicator */}
      {task && task.status !== 'finished' && task.status !== 'error' && (
        <div className="progress-container">
          <div className="progress-header-row">
            <span className="status-txt">
              {task.status === 'fetching' && 'Fetching Stream Metadata...'}
              {task.status === 'downloading' && 'Downloading Audio Stream...'}
              {task.status === 'converting' && 'Encoding MP3 Audio...'}
              {task.status === 'pending' && 'Initializing Task...'}
            </span>
            <span className="percent-txt">{Math.round(task.progress)}%</span>
          </div>

          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${task.progress}%` }}></div>
          </div>

          <div className="progress-submeta">
            <span><Gauge size={13} style={{ display: 'inline', marginRight: 4 }} /> {task.speed || '-- KB/s'}</span>
            <span><Clock size={13} style={{ display: 'inline', marginRight: 4 }} /> ETA: {task.eta || '--'}</span>
          </div>
        </div>
      )}

      {/* Ready Download Result Card with In-Browser MP3 Audio Player */}
      {task && task.status === 'finished' && task.result && (
        <div className="result-success-box">
          <div className="result-icon-badge">
            <CheckCircle size={24} />
          </div>
          <div className="result-heading">MP3 Ready to Play & Download!</div>
          <div className="result-file-title">{task.result.filename}</div>
          <div className="result-file-size">{task.result.filesize_mb} MB • Studio Quality MP3</div>

          {/* Integrated HTML5 Audio Player for Direct Song Playback */}
          <div style={{ margin: '18px 0 20px', padding: '14px', backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #cbd5e1', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#2563eb', marginBottom: '8px', textAlign: 'left' }}>
              🎵 STREAM AUDIO PLAYER
            </div>
            <audio
              controls
              autoPlay
              src={`/api/download/${encodeURIComponent(task.result.filename)}`}
              style={{ width: '100%', height: '42px', outline: 'none' }}
            />
          </div>

          <div className="result-actions-row">
            <a
              href={`/api/download/${encodeURIComponent(task.result.filename)}`}
              download
              className="btn btn-primary"
            >
              <Download size={18} /> Download MP3
            </a>
            <button type="button" onClick={handleReset} className="btn btn-outline">
              <RotateCcw size={16} /> Convert Another
            </button>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div style={{ marginTop: 16, padding: 14, borderRadius: 12, backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
