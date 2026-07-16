import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Navigation, Car } from 'lucide-react';
import { TransitAssistant } from './TransitAssistant';

interface Fares {
  distance: string;
  duration: number;
  cab: { hatchback: number; sedan: number; suv: number };
  auto: { official: number; streetMin: number; streetMax: number };
  public: { metro: number; bus: number };
}

interface ChatProps {
  startQuery: string;
  endQuery: string;
  fares: Fares | null;
  city: string;
}

export const Chat: React.FC<ChatProps> = ({
  startQuery,
  endQuery,
  fares,
  city
}) => {
  if (!fares) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 120px)', gap: '15px' }}>
        <h2>No Active Journey Planned</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Please go back to the home page and calculate a route first.
        </p>
        <Link to="/" className="btn-primary" style={{ textDecoration: 'none' }}>
          <ArrowLeft size={16} /> Plan a Commute
        </Link>
      </div>
    );
  }

  const getCleanName = (query: string) => {
    return query.split(',')[0].trim();
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '20px', maxWidth: '1600px', margin: '0 auto', padding: '20px', height: 'calc(100vh - 100px)' }}>
      
      {/* Left Column: Journey Details */}
      <div className="glass-panel" style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', overflowY: 'auto' }}>
        <Link 
          to="/results" 
          style={{ textDecoration: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
        >
          <ArrowLeft size={14} /> Back to Fares & Map
        </Link>

        <div>
          <h2 style={{ fontSize: '20px', color: 'var(--accent-cyan)' }}>Commute Summary</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Reference values for AI context</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <MapPin size={16} style={{ color: 'var(--accent-cyan)', marginTop: '2px' }} />
            <div>
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>STARTING POINT</span>
              <p style={{ fontSize: '13px', fontWeight: '500' }}>{getCleanName(startQuery)}</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Navigation size={16} style={{ color: '#ff4757', marginTop: '2px' }} />
            <div>
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>DESTINATION</span>
              <p style={{ fontSize: '13px', fontWeight: '500' }}>{getCleanName(endQuery)}</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h3 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Computed Rates</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>🛺 Auto Rickshaw:</span>
              <strong>₹{fares.auto.streetMin} - ₹{fares.auto.streetMax}</strong>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>🚗 Cab (Hatchback):</span>
              <strong>₹{fares.cab.hatchback}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>🚇 Metro Ticket:</span>
              <strong>₹{fares.public.metro}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>🚌 Local Bus:</span>
              <strong>₹{fares.public.bus}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Chat Box */}
      <div className="glass-panel" style={{ height: '100%', overflow: 'hidden' }}>
        <TransitAssistant 
          city={city}
          startName={startQuery}
          endName={endQuery}
          fares={fares}
          onClose={() => {}}
        />
      </div>

    </div>
  );
};
