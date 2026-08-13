import React from 'react';
import { Music2 } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <header className="navbar" style={{ justifyContent: 'flex-start' }}>
      <a href="#" className="nav-brand">
        <div className="brand-icon" style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)' }}>
          <Music2 size={22} />
        </div>
        <span className="brand-title" style={{ fontSize: '24px', fontWeight: 800 }}>youmusic.store</span>
      </a>
    </header>
  );
};
