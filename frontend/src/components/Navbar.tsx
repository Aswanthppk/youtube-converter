import React from 'react';

export const Navbar: React.FC = () => {
  return (
    <header className="navbar">
      <a href="#" className="nav-brand" aria-label="youmusic.store homepage">
        <div
          className="logo-image"
          role="img"
          aria-label="youmusic.store - Convert Video to MP3"
        />
      </a>
    </header>
  );
};
