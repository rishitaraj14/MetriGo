import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, BarChart3, Bot, Info } from 'lucide-react';

interface NavbarProps {
  city: string;
  startQuery: string;
  endQuery: string;
  hasFares: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ city, startQuery, endQuery, hasFares }) => {
  const location = useLocation();

  const getCleanName = (query: string) => {
    return query.split(',')[0].trim();
  };

  return (
    <header className="header" style={{ marginBottom: '10px', borderBottom: '1px solid var(--panel-border)', paddingBottom: '15px' }}>
      <div className="logo">
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '24px' }}>🛺</span>
          <span className="logo-text">MetriGo</span>
        </Link>
        <span className="logo-tag">AI Transit</span>
      </div>

      <nav style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <Link 
          to="/" 
          className={`ai-tab ${location.pathname === '/' ? 'active' : ''}`}
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <BarChart3 size={14} /> Dashboard
        </Link>

        <Link 
          to="/plan" 
          className={`ai-tab ${location.pathname === '/plan' ? 'active' : ''}`}
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Compass size={14} /> Plan Journey
        </Link>

        {hasFares && (
          <>
            <Link 
              to="/results" 
              className={`ai-tab ${location.pathname === '/results' ? 'active' : ''}`}
              style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <BarChart3 size={14} /> Fares & Map
            </Link>
            <Link 
              to="/chat" 
              className={`ai-tab ${location.pathname === '/chat' ? 'active' : ''}`}
              style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Bot size={14} /> AI Assistant
            </Link>
          </>
        )}

        <Link 
          to="/about" 
          className={`ai-tab ${location.pathname === '/about' ? 'active' : ''}`}
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Info size={14} /> About
        </Link>
      </nav>

      {hasFares && (
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', background: 'rgba(0, 242, 254, 0.08)', padding: '4px 12px', borderRadius: '15px', border: '1px solid rgba(0, 242, 254, 0.2)' }}>
            📍 <strong style={{ color: 'var(--accent-cyan)' }}>{city}</strong>: {getCleanName(startQuery)} ➔ {getCleanName(endQuery)}
          </span>
        </div>
      )}
    </header>
  );
};
