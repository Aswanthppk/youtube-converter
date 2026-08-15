import React, { useState } from 'react';
import { Music, Download, RotateCw, Play, Pause } from 'lucide-react';

export interface HistoryFile {
  filename: string;
  filesize_mb: number;
  modified_time: number;
}

interface RecentDownloadsGridProps {
  files: HistoryFile[];
  onClear: () => void;
}

export const RecentDownloadsGrid: React.FC<RecentDownloadsGridProps> = ({ files, onClear }) => {
  const [playingFilename, setPlayingFilename] = useState<string | null>(null);

  const togglePlay = (filename: string) => {
    if (playingFilename === filename) {
      setPlayingFilename(null);
    } else {
      setPlayingFilename(filename);
    }
  };

  return (
    <section id="history" className="history-container">
      <div className="section-head-row">
        <h2>Your Converted Songs</h2>
        {files.length > 0 && (
          <button onClick={onClear} className="btn btn-outline" style={{ padding: '8px 16px', fontSize: 13 }}>
            <RotateCw size={14} /> Clear History
          </button>
        )}
      </div>

      {files.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#71717a', background: '#ffffff', borderRadius: 16, border: '1px dashed #e4e4e7' }}>
          <Music size={32} style={{ margin: '0 auto 12px', display: 'block', color: '#a1a1aa' }} />
          <p style={{ fontWeight: 600, color: '#09090b' }}>No songs converted yet.</p>
          <p style={{ fontSize: 13, color: '#71717a' }}>Convert a video above to stream and download your MP3s.</p>
        </div>
      ) : (
        <div className="history-grid-list">
          {files.map((file, idx) => {
            const isPlaying = playingFilename === file.filename;
            const audioSrc = `/api/download/${encodeURIComponent(file.filename)}`;

            return (
              <div key={idx} className="history-card-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <div className="card-item-left">
                    <button
                      onClick={() => togglePlay(file.filename)}
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        backgroundColor: isPlaying ? '#e50914' : '#fef2f2',
                        color: isPlaying ? '#ffffff' : '#e50914',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        flexShrink: 0,
                        transition: 'all 0.2s ease',
                        boxShadow: isPlaying ? '0 4px 12px rgba(229, 9, 20, 0.3)' : 'none'
                      }}
                      title={isPlaying ? "Pause Song" : "Play Song Online"}
                    >
                      {isPlaying ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: 2 }} />}
                    </button>

                    <div className="item-meta-text">
                      <div className="item-filename">{file.filename}</div>
                      <div className="item-filesize">{file.filesize_mb} MB • High Quality MP3</div>
                    </div>
                  </div>

                  <a
                    href={audioSrc}
                    download
                    className="btn btn-outline"
                    style={{ padding: '8px 14px', fontSize: 13, flexShrink: 0 }}
                  >
                    <Download size={14} /> Download
                  </a>
                </div>

                {/* Inline Audio Player Bar when Playing */}
                {isPlaying && (
                  <div style={{ paddingTop: 8, borderTop: '1px solid #f4f4f5' }}>
                    <audio
                      controls
                      autoPlay
                      src={audioSrc}
                      style={{ width: '100%', height: '36px', outline: 'none' }}
                      onEnded={() => setPlayingFilename(null)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
