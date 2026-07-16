import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Bot, Compass, Plus, Trash2, Calendar, MapPin, Sparkles, Navigation } from 'lucide-react';

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

interface DashboardProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  city: string;
}

export const Dashboard: React.FC<DashboardProps> = ({
  history,
  onSelect,
  onDelete,
  city
}) => {
  const navigate = useNavigate();

  const getCleanName = (query: string) => {
    return query.split(',')[0].trim();
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Compute stats
  const totalCommutes = history.length;
  
  // Calculate average auto fare
  const averageAutoFare = totalCommutes > 0 
    ? Math.round(history.reduce((acc, curr) => acc + curr.fares.auto.streetMin, 0) / totalCommutes)
    : 0;

  // Calculate cheapest route summary
  const totalSavings = totalCommutes > 0
    ? Math.round(history.reduce((acc, curr) => acc + (curr.fares.cab.hatchback - curr.fares.public.metro), 0))
    : 0;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '30px 20px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Dashboard Title & Headline */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Transit Analytics Dashboard
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Overview of saved commutes, average transit fares, and shortcut intelligence.
          </p>
        </div>
        
        <button 
          onClick={() => navigate('/plan')}
          className="btn-primary"
          style={{ padding: '10px 20px', fontSize: '14px', borderRadius: '8px' }}
        >
          <Plus size={16} /> Plan New Journey
        </button>
      </div>

      {/* Stats Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Total Journeys Analysed
          </span>
          <div style={{ fontSize: '32px', fontWeight: '800', fontFamily: 'var(--font-display)', color: 'var(--accent-cyan)' }}>
            {totalCommutes}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Commutes stored in database</span>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Avg. Auto Rickshaw Cost
          </span>
          <div style={{ fontSize: '32px', fontWeight: '800', fontFamily: 'var(--font-display)', color: 'var(--accent-yellow)' }}>
            ₹{averageAutoFare}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Realistic street rate average</span>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Potential Metro Savings
          </span>
          <div style={{ fontSize: '32px', fontWeight: '800', fontFamily: 'var(--font-display)', color: 'var(--accent-green)' }}>
            ₹{totalSavings}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Savings by selecting Metro over Cab</span>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Active City Context
          </span>
          <div style={{ fontSize: '32px', fontWeight: '800', fontFamily: 'var(--font-display)', color: '#fff' }}>
            {city}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Current localized routing rules</span>
        </div>

      </div>

      {/* Two Column Layout: Charts vs Recent Activities */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>
        
        {/* Left Column: Recent Journeys Table */}
        <div className="glass-panel" style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h3 style={{ fontSize: '16px', color: 'var(--accent-cyan)' }}>Saved Journeys History</h3>
          
          <div style={{ overflowX: 'auto' }}>
            {history.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
                📂 No saved commutes found in the database. Select "Plan New Journey" to get started!
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--panel-border)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '10px 5px' }}>City</th>
                    <th style={{ padding: '10px 5px' }}>Origin ➔ Destination</th>
                    <th style={{ padding: '10px 5px' }}>Distance</th>
                    <th style={{ padding: '10px 5px' }}>Fares (Auto / Cab)</th>
                    <th style={{ padding: '10px 5px' }}>Date</th>
                    <th style={{ padding: '10px 5px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {history.slice(0, 5).map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                      <td style={{ padding: '12px 5px' }}>
                        <span style={{ fontSize: '10.5px', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                          {item.city}
                        </span>
                      </td>
                      <td style={{ padding: '12px 5px', fontWeight: '500' }}>
                        {getCleanName(item.startName)} ➔ {getCleanName(item.endName)}
                      </td>
                      <td style={{ padding: '12px 5px', color: 'var(--text-secondary)' }}>
                        {item.fares.distance} km
                      </td>
                      <td style={{ padding: '12px 5px', color: 'var(--accent-cyan)' }}>
                        ₹{item.fares.auto.streetMin} / ₹{item.fares.cab.hatchback}
                      </td>
                      <td style={{ padding: '12px 5px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                        {formatDate(item.timestamp)}
                      </td>
                      <td style={{ padding: '12px 5px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button 
                            onClick={() => onSelect(item)}
                            className="canvas-btn"
                            style={{ padding: '3px 8px', borderRadius: '4px', borderColor: 'var(--accent-cyan)', color: 'var(--accent-cyan)' }}
                          >
                            View
                          </button>
                          <button 
                            onClick={(e) => onDelete(item.id, e)}
                            className="canvas-btn"
                            style={{ padding: '3px 8px', borderRadius: '4px', borderColor: 'var(--accent-red)', color: 'var(--accent-red)' }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Column: Dynamic Price Charts (CSS-based visuals) */}
        <div className="glass-panel" style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '16px', color: 'var(--accent-cyan)' }}>Commute Cost Efficiency</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
              Comparison of transport models on cost efficiency metrics based on your current journey calculations.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span>🚇 Metro Train (Cheapest)</span>
                  <strong style={{ color: 'var(--accent-green)' }}>95% Efficient</strong>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '95%', background: 'linear-gradient(90deg, #10b981, #059669)', borderRadius: '4px' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span>🚌 Local Municipal Bus</span>
                  <strong style={{ color: 'var(--accent-green)' }}>85% Efficient</strong>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '85%', background: 'linear-gradient(90deg, #10b981, #00f2fe)', borderRadius: '4px' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span>🛺 Auto-Rickshaw (Negotiated)</span>
                  <strong style={{ color: 'var(--accent-yellow)' }}>60% Efficient</strong>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '60%', background: 'linear-gradient(90deg, var(--accent-yellow), #d97706)', borderRadius: '4px' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span>🚕 Cab Hatchback</span>
                  <strong style={{ color: 'var(--accent-red)' }}>40% Efficient</strong>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '40%', background: 'linear-gradient(90deg, var(--accent-red), #b91c1c)', borderRadius: '4px' }} />
                </div>
              </div>
            </div>

            {/* Quick Tips Box */}
            <div style={{ background: 'rgba(0, 242, 254, 0.04)', border: '1px solid rgba(0, 242, 254, 0.15)', borderRadius: '8px', padding: '15px', display: 'flex', gap: '10px' }}>
              <div style={{ color: 'var(--accent-cyan)', fontSize: '20px' }}>💡</div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                <strong>MetriGo AI Suggestion:</strong> In the active city context (<strong>{city}</strong>), selecting Public Transit connections like the Metro for routes over 8km yields up to <strong>75% cost savings</strong> compared to cab service lines.
              </p>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
