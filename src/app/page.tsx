'use client';

import React, { useState } from 'react';

interface PlatformCard {
  id: string;
  name: string;
  icon: string;
  isConnected: boolean;
  postingEnabled: boolean;
}

export default function Dashboard() {
  const [businesses] = useState([
    { id: '1', name: 'Alfansay' },
    { id: '2', name: 'Pak Home Tutor' },
    { id: '3', name: 'AI & Robotics Club' }
  ]);
  const [selectedBusiness, setSelectedBusiness] = useState('1');

  const [platforms, setPlatforms] = useState<PlatformCard[]>([
    { id: 'fb-page', name: 'Facebook Page', icon: '📘', isConnected: false, postingEnabled: false },
    { id: 'instagram', name: 'Instagram', icon: '📸', isConnected: false, postingEnabled: false },
    { id: 'linkedin', name: 'LinkedIn Page', icon: '💼', isConnected: false, postingEnabled: false },
    { id: 'tiktok', name: 'TikTok', icon: '🎵', isConnected: false, postingEnabled: false },
    { id: 'youtube', name: 'YouTube', icon: '▶️', isConnected: false, postingEnabled: false }
  ]);

  const handleConnect = (platformId: string) => {
    if (platformId === 'fb-page' || platformId === 'instagram') {
      // Redirects to our secure backend login handler
      window.location.href = '/api/auth/facebook/login';
    } else {
      alert(`Real OAuth integration for ${platformId} will be configured in Phase 5-7.`);
    }
  };

  const togglePosting = (id: string) => {
    setPlatforms(prev =>
      prev.map(p => (p.id === id ? { ...p, postingEnabled: !p.postingEnabled } : p))
    );
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Social Biz Pilot — Connections</h1>

      <label style={{ fontWeight: 'bold' }}>Select Business: </label>
      <select 
        value={selectedBusiness} 
        onChange={(e) => setSelectedBusiness(e.target.value)}
        style={{ padding: '0.5rem', marginBottom: '2rem', marginLeft: '0.5rem' }}
      >
        {businesses.map(b => (
          <option key={b.id} value={b.id}>{b.name}</option>
        ))}
      </select>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {platforms.map(p => (
          <div 
            key={p.id} 
            style={{ 
              border: '1px solid #ccc', 
              borderRadius: '8px', 
              padding: '1rem', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}
          >
            <div>
              <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>{p.icon}</span>
              <strong>{p.name}</strong>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: p.isConnected ? 'green' : 'gray' }}>
                {p.isConnected ? 'Connected' : 'Not Connected'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              {p.isConnected && (
                <label style={{ fontSize: '0.85rem' }}>
                  <input 
                    type="checkbox" 
                    checked={p.postingEnabled} 
                    onChange={() => togglePosting(p.id)} 
                  />
                  Posting Active
                </label>
              )}
              <button 
                onClick={() => handleConnect(p.id)}
                style={{ 
                  padding: '0.5rem 1rem', 
                  backgroundColor: p.isConnected ? '#ff4d4d' : '#0066cc', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {p.isConnected ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
