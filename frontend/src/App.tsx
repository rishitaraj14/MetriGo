import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Home } from './Home';
import { Results } from './Results';
import { Chat } from './Chat';
import { About } from './About';
import { Dashboard } from './Dashboard';
import { CITIES } from './cities';
import { geocodeLocation, calculateFares, generateMockInsights, Fares, AIInsights } from './api';

interface HistoryItem {
  id: string;
  timestamp: string;
  city: string;
  startName: string;
  endName: string;
  startCoords: [number, number];
  endCoords: [number, number];
  routePath: [number, number][];
  fares: Fares;
  aiInsights: AIInsights;
}

interface AIInsights {
  localTransitGuide: string;
  roadAdvisory: string;
  timeSensitiveTips: string;
}

interface HistoryItem {
  id: string;
  timestamp: string;
  city: string;
  startName: string;
  endName: string;
  startCoords: [number, number];
  endCoords: [number, number];
  routePath: [number, number][];
  fares: Fares;
  aiInsights: AIInsights;
}

// Inner component to access router hooks (like useNavigate)
function AppContent() {
  const navigate = useNavigate();

  const [startQuery, setStartQuery] = useState('Anna Nagar, Chennai');
  const [endQuery, setEndQuery] = useState('T Nagar, Chennai');
  
  const [startCoords, setStartCoords] = useState<[number, number] | null>([13.0850, 80.2101]); // Anna Nagar
  const [endCoords, setEndCoords] = useState<[number, number] | null>([13.0405, 80.2337]);     // T Nagar
  const [routePath, setRoutePath] = useState<[number, number][]>([]);
  
  const [fares, setFares] = useState<Fares | null>(null);
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [activeMode, setActiveMode] = useState<'auto' | 'cab' | 'public'>('auto');
  
  // City Select States
  const [city, setCity] = useState('Chennai');
  const [cityInput, setCityInput] = useState('Chennai');

  const selectedCity = CITIES.find(c => c.name.toLowerCase() === city.toLowerCase());
  const hasMetro = selectedCity?.hasMetro ?? false;

  // Database History States
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);

  // Session ID for multi-user storage partitioning
  const [sessionId] = useState(() => {
    let id = localStorage.getItem('metrigo_session_id');
    if (!id) {
      id = 'session_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('metrigo_session_id', id);
    }
    return id;
  });

  // Fetch saved history from backend
  const fetchHistory = async () => {
    try {
      const stored = localStorage.getItem('metrigo_journey_history');
      const data = stored ? JSON.parse(stored) : [];
      setHistory(data);
    } catch (e) {
      console.error('Error fetching commute history:', e);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [sessionId]);

  const performSearch = async (start: string, end: string, cityName: string) => {
    setLoading(true);
    setError(null);

    try {
      // Ensure Nominatim search is scoped to the selected city to avoid incorrect matches
      const geocodeStartQuery = start.toLowerCase().includes(cityName.toLowerCase()) 
        ? start 
        : `${start}, ${cityName}`;
        
      const geocodeEndQuery = end.toLowerCase().includes(cityName.toLowerCase()) 
        ? end 
        : `${end}, ${cityName}`;

      // 1. Geocode Start location with fallback
      const startData = await geocodeLocation(geocodeStartQuery);
      let startLat: number;
      let startLon: number;

      if (!startData || startData.length === 0) {
        const cityData = await geocodeLocation(cityName);
        if (!cityData || cityData.length === 0) {
          throw new Error(`Location "${start}" and city "${cityName}" could not be located.`);
        }
        startLat = parseFloat(cityData[0].lat);
        startLon = parseFloat(cityData[0].lon);
      } else {
        const startLoc = startData[0];
        startLat = parseFloat(startLoc.lat);
        startLon = parseFloat(startLoc.lon);
      }

      const endData = await geocodeLocation(geocodeEndQuery);
      let endLat: number;
      let endLon: number;

      if (!endData || endData.length === 0) {
        const cityData = await geocodeLocation(cityName);
        if (!cityData || cityData.length === 0) {
          throw new Error(`Location "${end}" and city "${cityName}" could not be located.`);
        }
        endLat = parseFloat(cityData[0].lat);
        endLon = parseFloat(cityData[0].lon);
      } else {
        const endLoc = endData[0];
        endLat = parseFloat(endLoc.lat);
        endLon = parseFloat(endLoc.lon);
      }

      // 3. Self-healing offset: If start and end points resolve to the exact same coordinates, 
      // offset one of them slightly (e.g. 0.02 deg ~ 2.2 km) so a valid road commute route is generated!
      if (startLat === endLat && startLon === endLon) {
        endLat += 0.018;
        endLon += 0.018;
      }

      setStartCoords([startLat, startLon]);
      setEndCoords([endLat, endLon]);

      // 3. Get OSRM Routing
      const routeRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${startLon},${startLat};${endLon},${endLat}?overview=full&geometries=geojson&steps=true`);
      const routeData = await routeRes.json();
      if (!routeData.routes || routeData.routes.length === 0) {
        throw new Error('No driving route found between these locations.');
      }

      const route = routeData.routes[0];
      const coordinates: [number, number][] = route.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]);
      setRoutePath(coordinates);

      // 4. Get dynamic fare & AI transit advice
      const faresData = calculateFares(route.distance / 1000, route.duration / 60, cityName);
      const insightsData = generateMockInsights(cityName, start, end, faresData);
      setFares(faresData);
      setAiInsights(insightsData);

      // 5. POST to Persistent History Database
      try {
        const newJourney = {
          id: `journey_${Date.now()}`,
          timestamp: new Date().toISOString(),
          sessionId,
          city: cityName,
          startName: start,
          endName: end,
          startCoords: [startLat, startLon],
          endCoords: [endLat, endLon],
          routePath: coordinates,
          fares: faresData,
          aiInsights: insightsData
        };

        const stored = localStorage.getItem('metrigo_journey_history');
        const journeys = stored ? JSON.parse(stored) : [];
        const filtered = journeys.filter((entry: any) => entry.id !== newJourney.id);
        filtered.unshift(newJourney);
        localStorage.setItem('metrigo_journey_history', JSON.stringify(filtered));
        setActiveHistoryId(newJourney.id);
        fetchHistory();
      } catch (saveErr) {
        console.error('Failed to save search query to local history:', saveErr);
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while routing.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setActiveHistoryId(item.id);
    setCity(item.city);
    setCityInput(item.city);
    setStartQuery(item.startName);
    setEndQuery(item.endName);
    setStartCoords(item.startCoords);
    setEndCoords(item.endCoords);
    setRoutePath(item.routePath);
    setFares(item.fares);
    setAiInsights(item.aiInsights);
    
    // Auto redirect to fares dashboard
    navigate('/results');
  };

  const handleDeleteHistoryItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const stored = localStorage.getItem('metrigo_journey_history');
      const journeys = stored ? JSON.parse(stored) : [];
      const remaining = journeys.filter((entry: any) => entry.id !== id);
      localStorage.setItem('metrigo_journey_history', JSON.stringify(remaining));
      if (activeHistoryId === id) {
        setActiveHistoryId(null);
      }
      fetchHistory();
    } catch (err) {
      console.error('Failed to delete history item:', err);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Vertical Navigation Sidebar containing the Journey Inbox */}
      <Sidebar 
        city={city} 
        history={history}
        activeId={activeHistoryId}
        onSelect={handleSelectHistoryItem}
        onDelete={handleDeleteHistoryItem}
      />
      
      {/* Main Content Area */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
          <Routes>
            <Route 
              path="/" 
              element={
                <Dashboard 
                  history={history}
                  onSelect={handleSelectHistoryItem}
                  onDelete={handleDeleteHistoryItem}
                  city={city}
                />
              } 
            />
            <Route 
              path="/plan" 
              element={
                <Home 
                  startQuery={startQuery}
                  setStartQuery={setStartQuery}
                  endQuery={endQuery}
                  setEndQuery={setEndQuery}
                  city={city}
                  setCity={setCity}
                  cityInput={cityInput}
                  setCityInput={setCityInput}
                  performSearch={performSearch}
                  loading={loading}
                  error={error}
                />
              } 
            />
            <Route 
              path="/results" 
              element={
                <Results 
                  startQuery={startQuery}
                  endQuery={endQuery}
                  startCoords={startCoords}
                  endCoords={endCoords}
                  routePath={routePath}
                  fares={fares}
                  aiInsights={aiInsights}
                  activeMode={activeMode}
                  setActiveMode={setActiveMode}
                  city={city}
                  hasMetro={hasMetro}
                />
              } 
            />
            <Route 
              path="/chat" 
              element={
                <Chat 
                  startQuery={startQuery}
                  endQuery={endQuery}
                  fares={fares}
                  city={city}
                />
              } 
            />
            <Route path="/about" element={<About />} />
          </Routes>
        </div>
      </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
