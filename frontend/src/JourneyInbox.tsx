import React from 'react';
import { Mail, Trash2, Calendar, MapPin } from 'lucide-react';

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

interface JourneyInboxProps {
  history: HistoryItem[];
  activeId: string | null;
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

export const JourneyInbox: React.FC<JourneyInboxProps> = ({
  history,
  activeId,
  onSelect,
  onDelete
}) => {
  const getCleanName = (query: string) => {
    return query.split(',')[0].trim();
  };

  const formatTimeAgo = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div style={{ width: '300px', display: 'flex', flexDirection: 'column', height: '100%', borderRight: '1px solid var(--panel-border)', background: 'rgba(9, 9, 15, 0.45)' }}>
      {/* Inbox Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--panel-border)', display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255, 255, 255, 0.02)' }}>
        <Mail size={16} style={{ color: 'var(--accent-cyan)' }} />
        <h3 style={{ fontSize: '14px', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-primary)' }}>
          Journey Inbox
        </h3>
        <span style={{ fontSize: '11px', background: 'rgba(0, 242, 254, 0.15)', color: 'var(--accent-cyan)', padding: '2px 8px', borderRadius: '10px', marginLeft: 'auto', fontWeight: 'bold' }}>
          {history.length}
        </span>
      </div>

      {/* Inbox Items Scroll List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {history.length === 0 ? (
          <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '12.5px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span>📬</span>
            Your inbox is empty. Plan a route on the homepage to save commutes!
          </div>
        ) : (
          history.map((item) => {
            const isActive = activeId === item.id;
            return (
              <div
                key={item.id}
                onClick={() => onSelect(item)}
                className={`glass-panel`}
                style={{
                  padding: '12px 14px',
                  cursor: 'pointer',
                  borderLeft: isActive ? '3px solid var(--accent-cyan)' : '1px solid var(--panel-border)',
                  backgroundColor: isActive ? 'rgba(0, 242, 254, 0.04)' : 'rgba(255,255,255,0.01)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  transition: 'all 0.2s',
                  borderRadius: '10px'
                }}
              >
                {/* City Badge & Time */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)', padding: '1px 6px', borderRadius: '4px', fontWeight: '500' }}>
                    {item.city}
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Calendar size={10} /> {formatTimeAgo(item.timestamp)}
                  </span>
                </div>

                {/* Start ➔ End */}
                <div style={{ fontSize: '12.5px', fontWeight: '500', paddingRight: '20px', wordBreak: 'break-all' }}>
                  {getCleanName(item.startName)} ➔ {getCleanName(item.endName)}
                </div>

                {/* Distance & Price summary */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  <span>📍 {item.fares.distance} km</span>
                  <strong style={{ color: 'var(--accent-cyan)' }}>
                    ₹{item.fares.auto.streetMin} - ₹{item.fares.auto.streetMax}
                  </strong>
                </div>

                {/* Delete button absolute positioned */}
                <button
                  onClick={(e) => onDelete(item.id, e)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '32px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    padding: '4px',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-red)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
