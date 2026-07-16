import React from 'react';
import { Compass, BarChart3, Bot, Globe, Zap, Cpu } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      <div className="glass-panel" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          About MetriGo
        </h1>
        <p style={{ fontSize: '15px', color: '#d1d5db', lineHeight: '1.6' }}>
          MetriGo is an advanced, full-stack transit intelligence platform built specifically for Indian and global cities. It bridges the gap between official public transit metrics and real-world street negotiation fares (such as auto-rickshaws), augmented with dynamic geocoding, spatial routing, and conversational generative AI.
        </p>
      </div>

      <h2 style={{ fontSize: '22px', borderBottom: '1px solid var(--panel-border)', paddingBottom: '10px' }}>Core Engineering Features</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
        <div className="glass-panel" style={{ padding: '25px', display: 'flex', gap: '15px' }}>
          <div style={{ color: 'var(--accent-cyan)' }}><Globe size={28} /></div>
          <div>
            <h4 style={{ fontSize: '16px', marginBottom: '6px' }}>Spatial Routing & GIS</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Uses the OpenStreetMap Nominatim Geocoding engine proxy to resolve inputs, combined with OSRM (Open Source Routing Machine) to calculate exact driving coordinates.
            </p>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '25px', display: 'flex', gap: '15px' }}>
          <div style={{ color: 'var(--accent-cyan)' }}><Cpu size={28} /></div>
          <div>
            <h4 style={{ fontSize: '16px', marginBottom: '6px' }}>Generative AI Orchestration</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Integrates the Google Gemini API to analyze spatial routes and dynamically formulate local bus numbers, train lines, traffic advisories, and answer user Q&A.
            </p>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '25px', display: 'flex', gap: '15px' }}>
          <div style={{ color: 'var(--accent-cyan)' }}><Zap size={28} /></div>
          <div>
            <h4 style={{ fontSize: '16px', marginBottom: '6px' }}>Three.js 3D WebGL Drive</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Uses raw Three.js geometries to render low-poly, responsive, animatable auto-rickshaws and cabs driving in a continuous physical highway loop.
            </p>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '25px', display: 'flex', gap: '15px' }}>
          <div style={{ color: 'var(--accent-cyan)' }}><Bot size={28} /></div>
          <div>
            <h4 style={{ fontSize: '16px', marginBottom: '6px' }}>Multi-modal Fare Matrices</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Maintains calculated fare matrices comparing hatchback/sedan/SUV cabs, official meters vs street auto fares, metro cards, and local municipal buses.
            </p>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
        <h3 style={{ fontSize: '16px' }}>Project Stack Details</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '15px', border: '1px solid var(--panel-border)' }}>React 18</span>
          <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '15px', border: '1px solid var(--panel-border)' }}>Vite + TypeScript</span>
          <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '15px', border: '1px solid var(--panel-border)' }}>React Router v6</span>
          <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '15px', border: '1px solid var(--panel-border)' }}>Node.js Express</span>
          <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '15px', border: '1px solid var(--panel-border)' }}>Three.js (WebGL)</span>
          <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '15px', border: '1px solid var(--panel-border)' }}>Leaflet Map (OSM)</span>
        </div>
      </div>

    </div>
  );
};
