import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MessageSquareCode, Flame, Car } from 'lucide-react';
import { InteractiveMap } from './InteractiveMap';

interface Fares {
  distance: string;
  duration: number;
  cab: { hatchback: number; sedan: number; suv: number };
  auto: { official: number; streetMin: number; streetMax: number };
  public: { metro: number; bus: number };
}

interface AIInsights {
  localTransitGuide: string;
  roadAdvisory: string;
  timeSensitiveTips: string;
}

interface ResultsProps {
  startQuery: string;
  endQuery: string;
  startCoords: [number, number] | null;
  endCoords: [number, number] | null;
  routePath: [number, number][];
  fares: Fares | null;
  aiInsights: AIInsights | null;
  activeMode: 'auto' | 'cab' | 'public';
  setActiveMode: (m: 'auto' | 'cab' | 'public') => void;
  city: string;
  hasMetro: boolean;
}

export const Results: React.FC<ResultsProps> = ({
  startQuery,
  endQuery,
  startCoords,
  endCoords,
  routePath,
  fares,
  aiInsights,
  activeMode,
  setActiveMode,
  city,
  hasMetro
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'transit' | 'road' | 'tips'>('transit');

  const formatMarkdown = (mdText: string | undefined) => {
    if (!mdText) return '';
    
    // Split by newlines to process line-by-line safely and prevent regex leaks
    const lines = mdText.split('\n');
    const formattedLines = lines.map(line => {
      let trimmed = line.trim();
      
      // Parse headers
      if (trimmed.startsWith('###')) {
        return `<h4 style="margin: 12px 0 6px 0; color: var(--accent-cyan); font-size: 14px;">${trimmed.replace(/^###\s*/, '')}</h4>`;
      }
      if (trimmed.startsWith('##')) {
        return `<h3 style="margin: 14px 0 8px 0; color: var(--accent-cyan); font-size: 16px;">${trimmed.replace(/^##\s*/, '')}</h3>`;
      }
      
      // Parse bold tags: **text** -> <strong>text</strong>
      let parsed = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      // Parse bullet points: * text -> <li>text</li>
      if (parsed.startsWith('*')) {
        return `<li style="margin-left: 15px; margin-bottom: 5px; list-style-type: disc;">${parsed.replace(/^\*\s*/, '')}</li>`;
      }
      
      return parsed ? `<div>${parsed}</div>` : '<div style="height: 8px;"></div>';
    });

    return formattedLines.join('');
  };

  const getTabContent = () => {
    if (!aiInsights) return '';
    
    // Normalize keys to lowercase and remove underscores to match case-insensitively
    const normalized: { [key: string]: string } = {};
    Object.keys(aiInsights).forEach(key => {
      normalized[key.toLowerCase().replace(/_/g, '')] = (aiInsights as any)[key];
    });

    let content = '';
    if (activeTab === 'transit') {
      content = normalized['localtransitguide'] || normalized['transitguide'] || normalized['localtransit'] || normalized['transit'] || '';
    } else if (activeTab === 'road') {
      content = normalized['roadadvisory'] || normalized['roadconditions'] || normalized['road'] || '';
    } else if (activeTab === 'tips') {
      content = normalized['timesensitivetips'] || normalized['localtips'] || normalized['tips'] || '';
    }

    // Dynamic fallback to first non-empty string value if activeTab specific key is missing
    if (!content) {
      const stringValues = Object.values(aiInsights).filter(val => typeof val === 'string' && val.length > 0);
      if (stringValues.length > 0) {
        content = stringValues[0] as string;
      }
    }

    return content;
  };

  if (!fares) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 120px)', gap: '15px' }}>
        <h2>No Active Journey Planned</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Please go back to the home page and input your commute queries.
        </p>
        <Link to="/" className="btn-primary" style={{ textDecoration: 'none' }}>
          <ArrowLeft size={16} /> Plan a Commute
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '480px 1fr', gap: '20px', maxWidth: '1600px', margin: '0 auto', padding: '20px', height: 'calc(100vh - 100px)' }}>
      
      {/* Left panel: Fares breakdown & AI guide */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}>
        <div style={{ padding: '20px 20px 10px 20px', borderBottom: '1px solid var(--panel-border)' }}>
          <button 
            onClick={() => navigate('/')}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', marginBottom: '10px' }}
          >
            <ArrowLeft size={14} /> Back to Search
          </button>
          
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Est. Distance</span>
              <h4 style={{ fontSize: '18px', fontWeight: 'bold' }}>{fares.distance} km</h4>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Est. Travel Time</span>
              <h4 style={{ fontSize: '18px', fontWeight: 'bold' }}>{fares.duration} mins</h4>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-cyan)' }}>Estimated Fares</h3>
          
          <div className="fare-grid">
            <div 
              className={`fare-card ${activeMode === 'auto' ? 'auto-active' : ''}`}
              onClick={() => setActiveMode('auto')}
            >
              <div className="fare-header">
                <span className="fare-name">Auto Rickshaw</span>
                <span style={{ fontSize: '16px' }}>🛺</span>
              </div>
              <div className="fare-price">₹{fares.auto.streetMin} - ₹{fares.auto.streetMax}</div>
              <span className="fare-desc">Govt. meter: ₹{fares.auto.official}</span>
            </div>

            <div 
              className={`fare-card ${activeMode === 'cab' ? 'active' : ''}`}
              onClick={() => setActiveMode('cab')}
            >
              <div className="fare-header">
                <span className="fare-name">Cab (Ola/Uber)</span>
                <Car size={16} style={{ color: 'var(--accent-cyan)' }} />
              </div>
              <div className="fare-price">₹{fares.cab.hatchback}</div>
              <span className="fare-desc">Sedan: ₹{fares.cab.sedan} | SUV: ₹{fares.cab.suv}</span>
            </div>

            {hasMetro && (
              <div 
                className={`fare-card ${activeMode === 'public' ? 'active' : ''}`}
                onClick={() => setActiveMode('public')}
              >
                <div className="fare-header">
                  <span className="fare-name">Metro Rail</span>
                  <span style={{ fontSize: '16px' }}>🚇</span>
                </div>
                <div className="fare-price">₹{fares.public.metro}</div>
                <span className="fare-desc">Single transit card ticket</span>
              </div>
            )}

            <div 
              className={`fare-card ${activeMode === 'public' ? 'active' : ''}`}
              onClick={() => setActiveMode('public')}
            >
              <div className="fare-header">
                <span className="fare-name">Local Bus</span>
                <span style={{ fontSize: '16px' }}>🚌</span>
              </div>
              <div className="fare-price">₹{fares.public.bus}</div>
              <span className="fare-desc">Local bus route ticketing</span>
            </div>
          </div>
          {!hasMetro && (
            <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-secondary)', fontSize: '13px' }}>
              This city does not currently have metro service. Only bus and road transit estimates are shown.
            </div>
          )}

          <button 
            onClick={() => navigate('/chat')}
            className="btn-primary" 
            style={{ background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))', border: 'none', color: '#000', fontWeight: 'bold' }}
          >
            <MessageSquareCode size={18} /> Ask AI Travel Assistant
          </button>

          {aiInsights && (
            <div className="glass-panel ai-section" style={{ margin: '10px 0 0 0' }}>
              <div className="ai-header">
                <Flame size={18} style={{ color: 'var(--accent-cyan)' }} />
                <h3 style={{ fontSize: '14px' }}>MetriGo Smart Insights</h3>
              </div>

              <div className="ai-tabs">
                <button 
                  className={`ai-tab ${activeTab === 'transit' ? 'active' : ''}`}
                  onClick={() => setActiveTab('transit')}
                >
                  Transit Guide
                </button>
                <button 
                  className={`ai-tab ${activeTab === 'road' ? 'active' : ''}`}
                  onClick={() => setActiveTab('road')}
                >
                  Road/Traffic
                </button>
                <button 
                  className={`ai-tab ${activeTab === 'tips' ? 'active' : ''}`}
                  onClick={() => setActiveTab('tips')}
                >
                  Local Tips
                </button>
              </div>

              <div 
                className="ai-content"
                dangerouslySetInnerHTML={{
                  __html: formatMarkdown(getTabContent())
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Right panel: Route map */}
      <div className="glass-panel" style={{ overflow: 'hidden', height: '100%' }}>
        <InteractiveMap 
          startCoords={startCoords}
          endCoords={endCoords}
          routePath={routePath}
        />
      </div>

    </div>
  );
};
