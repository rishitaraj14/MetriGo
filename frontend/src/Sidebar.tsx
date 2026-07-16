import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Compass, Bot, Info, LayoutDashboard, Calendar, Trash2 } from 'lucide-react';

interface HistoryItem {
  id: string;
  timestamp: string;
  city: string;
  startName: string;
  endName: string;
  startCoords: [number, number];
  endCoords: [number, number];
  routePath: [number, number][];
  fares: {
    distance: string;
    duration: number;
    cab: { hatchback: number; sedan: number; suv: number };
    auto: { official: number; streetMin: number; streetMax: number };
    public: { metro: number; bus: number };
  };
  aiInsights: {
    localTransitGuide: string;
    roadAdvisory: string;
    timeSensitiveTips: string;
  };
}

interface SidebarProps {
  city: string;
  history: HistoryItem[];
  activeId: string | null;
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  city,
  history,
  activeId,
  onSelect,
  onDelete
}) => {
  const location = useLocation();

  const getCleanName = (query: string) => {
    return query.split(',')[0].trim();
  };

  const formatTimeAgo = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div style={{
      width: '280px',
      height: '100vh',
      background: 'rgba(15, 15, 25, 0.82)',
      backdropFilter: 'blur(20px)',
      borderRight: '1px solid rgba(255, 255, 255, 0.05)',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 14px 16px 14px',
      position: 'relative',
      flexShrink: 0,
      zIndex: 100
    }}>
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px', paddingLeft: '6px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #ff2d55, #bf5af2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          boxShadow: '0 4px 12px rgba(255, 45, 85, 0.3)'
        }}>
          🛺
        </div>
        <div>
          <span style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #ff2d55, #bf5af2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            MetriGo
          </span>
          <div style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', marginTop: '-2px' }}>
            AI Transit Hub
          </div>
        </div>
      </div>

      {/* Vertical Navigation Links */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '20px' }}>
        <Link to="/" className={`sidebar-link ${location.pathname === '/' ? 'active' : ''}`}>
          <LayoutDashboard size={16} /> Dashboard
        </Link>

        <Link to="/plan" className={`sidebar-link ${location.pathname === '/plan' ? 'active' : ''}`}>
          <Compass size={16} /> Plan Journey
        </Link>

        <Link to="/results" className={`sidebar-link ${location.pathname === '/results' ? 'active' : ''}`}>
          <BarChart3 size={16} /> Fares & Map
        </Link>

        <Link to="/chat" className={`sidebar-link ${location.pathname === '/chat' ? 'active' : ''}`}>
          <Bot size={16} /> AI Assistant
        </Link>

        <Link to="/about" className={`sidebar-link ${location.pathname === '/about' ? 'active' : ''}`}>
          <Info size={16} /> About Stack
        </Link>
      </nav>

      {/* Journey Inbox Header inside Sidebar */}
      <div style={{ 
        padding: '10px 6px', 
        borderTop: '1px solid rgba(255, 255, 255, 0.05)', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        marginTop: '5px'
      }}>
        <span style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' }}>
          Journey Inbox
        </span>
        <span style={{ 
          fontSize: '10px', 
          background: 'rgba(191, 90, 242, 0.15)', 
          color: '#bf5af2', 
          padding: '1px 6px', 
          borderRadius: '10px', 
          marginLeft: 'auto', 
          fontWeight: 'bold' 
        }}>
          {history.length}
        </span>
      </div>

      {/* Scrollable list of Saved Commutes inside Sidebar */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '8px', 
        padding: '2px 4px',
        marginBottom: '15px'
      }}>
        {history.length === 0 ? (
          <div style={{ padding: '20px 10px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '11.5px' }}>
            📬 Inbox empty. Calculate a route to save commutes!
          </div>
        ) : (
          history.map((item) => {
            const isActive = activeId === item.id;
            return (
              <div
                key={item.id}
                onClick={() => onSelect(item)}
                style={{
                  padding: '10px 12px',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  border: isActive ? '1px solid rgba(191, 90, 242, 0.3)' : '1px solid rgba(255,255,255,0.03)',
                  backgroundColor: isActive ? 'rgba(191, 90, 242, 0.08)' : 'rgba(255,255,255,0.01)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  transition: 'all 0.2s',
                }}
              >
                {/* City & Time */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'rgba(255,255,255,0.4)' }}>
                  <span style={{ fontWeight: '600', color: '#bf5af2' }}>{item.city}</span>
                  <span>{formatTimeAgo(item.timestamp)}</span>
                </div>
                {/* Route */}
                <div style={{ fontSize: '11.5px', fontWeight: '500', color: '#f3f4f6', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '15px' }}>
                  {getCleanName(item.startName)} ➔ {getCleanName(item.endName)}
                </div>
                {/* Dist & Cost */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: 'rgba(255,255,255,0.4)' }}>
                  <span>{item.fares.distance} km</span>
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: '600' }}>₹{item.fares.auto.streetMin}-₹{item.fares.auto.streetMax}</span>
                </div>
                {/* Delete button */}
                <button
                  onClick={(e) => onDelete(item.id, e)}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '20px',
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255,255,255,0.3)',
                    cursor: 'pointer',
                    padding: '2px',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#ff453a')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
                >
                  <Trash2 size={11} />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* User Profile Tag at the bottom (Modified: Removed "5th sem student") */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 6px 0 6px',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        marginTop: 'auto'
      }}>
        <div style={{
          width: '30px',
          height: '30px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #bf5af2, #ff2d55)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '700',
          fontSize: '13px',
          color: '#fff'
        }}>
          R
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#f3f4f6', lineHeight: '1.2' }}>rishi</span>
          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>Active Session</span>
        </div>
      </div>
    </div>
  );
};
