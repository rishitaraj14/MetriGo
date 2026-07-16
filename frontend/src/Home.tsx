import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, ChevronDown, Check, ArrowRight, Loader } from 'lucide-react';
import { ThreeCanvas } from './ThreeCanvas';
import { CITIES, City } from './cities';
import { geocodeLocation } from './api';

const LOCAL_PRESETS: { [key: string]: string[] } = {
  'Bangalore': [
    'Electronic City',
    'Whitefield',
    'Indiranagar',
    'Koramangala',
    'HSR Layout',
    'Majestic (KSR Bengaluru Station)',
    'Kempegowda International Airport (KIAL)',
    'Marathahalli',
    'Jayanagar',
    'MG Road',
    'Yeshwanthpur'
  ],
  'Chennai': [
    'Anna Nagar',
    'T Nagar',
    'Adyar',
    'Velachery',
    'Marina Beach',
    'Chennai Central Railway Station',
    'Koyambedu (CMBT Bus Terminus)',
    'Guindy',
    'Tambaram',
    'Nungambakkam',
    'OMR (Old Mahabalipuram Road)'
  ],
  'Delhi': [
    'Connaught Place (CP)',
    'Karol Bagh',
    'New Delhi Railway Station',
    'Indira Gandhi International Airport (IGI)',
    'Hauz Khas',
    'Chandni Chowk',
    'Dwarka',
    'Noida Sector 62',
    'Gurugram Cyber City',
    'Lajpat Nagar',
    'Saket'
  ],
  'Mumbai': [
    'Colaba',
    'Bandra (West)',
    'Andheri (East)',
    'Chhatrapati Shivaji Maharaj Terminus (CSMT)',
    'Dadar',
    'Gateway of India',
    'Juhu Beach',
    'Nariman Point',
    'Thane',
    'Borivali',
    'Kurla'
  ],
  'Ranchi': [
    'Lalpur',
    'Kanke Road',
    'Ranchi Junction Railway Station',
    'Birsa Munda Airport',
    'Albert Ekka Chowk',
    'Main Road',
    'Dhurwa',
    'Bariatu',
    'Kokar',
    'Ratu Road'
  ]
};

// Fallback dynamic presets for any city in India
const getPlaceholderPresets = (cityName: string) => {
  return [
    `Railway Station, ${cityName}`,
    `Bus Stand, ${cityName}`,
    `Main Market, ${cityName}`,
    `Civil Hospital, ${cityName}`,
    `Police Station, ${cityName}`
  ];
};

interface HomeProps {
  startQuery: string;
  setStartQuery: (q: string) => void;
  endQuery: string;
  setEndQuery: (q: string) => void;
  city: string;
  setCity: (c: string) => void;
  cityInput: string;
  setCityInput: (c: string) => void;
  performSearch: (start: string, end: string, cityName: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const Home: React.FC<HomeProps> = ({
  startQuery,
  setStartQuery,
  endQuery,
  setEndQuery,
  city,
  setCity,
  cityInput,
  setCityInput,
  performSearch,
  loading,
  error
}) => {
  const navigate = useNavigate();
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [resolvingCity, setResolvingCity] = useState(false);

  // Suggestions state
  const [startSuggestions, setStartSuggestions] = useState<string[]>([]);
  const [showStartSuggestions, setShowStartSuggestions] = useState(false);
  const [endSuggestions, setEndSuggestions] = useState<string[]>([]);
  const [showEndSuggestions, setShowEndSuggestions] = useState(false);

  // References for debouncing
  const startTimerRef = useRef<any>(null);
  const endTimerRef = useRef<any>(null);

  // Filter cities for city dropdown
  const filteredCities = CITIES.filter(c => 
    c.name.toLowerCase().includes(cityInput.toLowerCase())
  );

  const handleCitySelect = (selectedCity: City) => {
    setCity(selectedCity.name);
    setCityInput(selectedCity.name);
    setStartQuery(selectedCity.defaultStart);
    setEndQuery(selectedCity.defaultEnd);
    setShowCityDropdown(false);
    setStartSuggestions([]);
    setEndSuggestions([]);
    if (startTimerRef.current) clearTimeout(startTimerRef.current);
    if (endTimerRef.current) clearTimeout(endTimerRef.current);
  };

  // Dynamically geocode and resolve coordinates for any city in India
  const handleDynamicCityResolve = async (cityName: string) => {
    if (!cityName.trim()) return;
    setResolvingCity(true);
    try {
      const data = await geocodeLocation(cityName);
      if (data && data.length > 0) {
        const firstMatch = data[0];
        const resolvedCityName = firstMatch.display_name.split(',')[0].trim();
        
        const resolvedCity: City = {
          name: resolvedCityName,
          lat: parseFloat(firstMatch.lat),
          lon: parseFloat(firstMatch.lon),
          defaultStart: `Railway Station, ${resolvedCityName}`,
          defaultEnd: `Bus Stand, ${resolvedCityName}`
        };
        
        setCity(resolvedCity.name);
        setCityInput(resolvedCity.name);
        setStartQuery(resolvedCity.defaultStart);
        setEndQuery(resolvedCity.defaultEnd);
        setStartSuggestions([]);
        setEndSuggestions([]);
      }
    } catch (err) {
      console.error('Failed to dynamically geocode city:', err);
    } finally {
      setResolvingCity(false);
      setShowCityDropdown(false);
    }
  };

  const handleStartChange = (val: string) => {
    setStartQuery(val);
    if (startTimerRef.current) clearTimeout(startTimerRef.current);
    
    if (!val.trim()) {
      setStartSuggestions(LOCAL_PRESETS[city] || getPlaceholderPresets(city));
      return;
    }

    // 1. Search locally in presets for instant options
    const cityPresets = LOCAL_PRESETS[city] || getPlaceholderPresets(city);
    const matchedPresets = cityPresets.filter(p => 
      p.toLowerCase().includes(val.toLowerCase())
    );
    setStartSuggestions(matchedPresets);
    setShowStartSuggestions(true);

    // 2. Debounce call to search database via Nominatim geocoder
    startTimerRef.current = setTimeout(async () => {
      try {
        const query = val.toLowerCase().includes(city.toLowerCase()) ? val : `${val}, ${city}`;
        const data = await geocodeLocation(query);
        if (data && Array.isArray(data)) {
          const apiNames = data
            .filter((item: any) => 
              item.display_name.toLowerCase().includes(city.toLowerCase())
            )
            .map((item: any) => {
              const parts = item.display_name.split(',');
              return parts[0].trim() + (parts[1] ? ', ' + parts[1].trim() : '');
            });
          setStartSuggestions(prev => {
            const combined = [...prev, ...apiNames];
            return Array.from(new Set(combined)).slice(0, 6);
          });
        }
      } catch (err) {
        console.error('Start geocoder autocompletion error:', err);
      }
    }, 350);
  };

  const handleEndChange = (val: string) => {
    setEndQuery(val);
    if (endTimerRef.current) clearTimeout(endTimerRef.current);

    if (!val.trim()) {
      setEndSuggestions(LOCAL_PRESETS[city] || getPlaceholderPresets(city));
      return;
    }

    // 1. Search locally in presets for instant options
    const cityPresets = LOCAL_PRESETS[city] || getPlaceholderPresets(city);
    const matchedPresets = cityPresets.filter(p => 
      p.toLowerCase().includes(val.toLowerCase())
    );
    setEndSuggestions(matchedPresets);
    setShowEndSuggestions(true);

    // 2. Debounce call to search database
    endTimerRef.current = setTimeout(async () => {
      try {
        const query = val.toLowerCase().includes(city.toLowerCase()) ? val : `${val}, ${city}`;
        const data = await geocodeLocation(query);
        if (data && Array.isArray(data)) {
          const apiNames = data
            .filter((item: any) => 
              item.display_name.toLowerCase().includes(city.toLowerCase())
            )
            .map((item: any) => {
              const parts = item.display_name.split(',');
              return parts[0].trim() + (parts[1] ? ', ' + parts[1].trim() : '');
            });
          setEndSuggestions(prev => {
            const combined = [...prev, ...apiNames];
            return Array.from(new Set(combined)).slice(0, 6);
          });
        }
      } catch (err) {
        console.error('End geocoder autocompletion error:', err);
      }
    }, 350);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const query = cityInput.trim();
    if (!query) return;

    let finalCity = city;
    const matchingCity = CITIES.find(c => c.name.toLowerCase() === query.toLowerCase());
    
    if (matchingCity) {
      handleCitySelect(matchingCity);
      finalCity = matchingCity.name;
    } else if (city.toLowerCase() !== query.toLowerCase()) {
      setResolvingCity(true);
      try {
        const data = await geocodeLocation(query);
        if (data && data.length > 0) {
          const firstMatch = data[0];
          const resolvedCityName = firstMatch.display_name.split(',')[0].trim();
          setCity(resolvedCityName);
          setCityInput(resolvedCityName);
          finalCity = resolvedCityName;
        } else {
          alert(`City "${query}" could not be located. Please type a valid city.`);
          setResolvingCity(false);
          return;
        }
      } catch (err) {
        console.error('Failed to resolve city on submit:', err);
        setResolvingCity(false);
        return;
      }
      setResolvingCity(false);
    }

    await performSearch(startQuery, endQuery, finalCity);
    navigate('/results');
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (startTimerRef.current) clearTimeout(startTimerRef.current);
      if (endTimerRef.current) clearTimeout(endTimerRef.current);
    };
  }, []);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '40px', maxWidth: '1600px', margin: '0 auto', padding: '20px', minHeight: 'calc(100vh - 120px)', alignItems: 'center' }}>
      
      {/* Left Panel: Search Form */}
      <div className="glass-panel" style={{ padding: '35px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '800', background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Navigate Smart.
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '5px' }}>
            Calculate transport fares, check MTC/BMTC/Metro buses, and resolve negotiations with street-smart AI advice.
          </p>
        </div>

        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* City select dropdown input */}
          <div className="input-group">
            <label>Select City</label>
            <div className="input-wrapper">
              <Navigation className="input-icon" size={16} style={{ transform: 'rotate(45deg)' }} />
              <input
                type="text"
                className="search-input"
                value={cityInput}
                onChange={(e) => {
                  setCityInput(e.target.value);
                  setShowCityDropdown(true);
                }}
                onFocus={() => setShowCityDropdown(true)}
                onBlur={() => setTimeout(() => {
                  const query = cityInput.trim();
                  if (!query) return;

                  const matchingCity = CITIES.find(c => c.name.toLowerCase() === query.toLowerCase());
                  if (matchingCity) {
                    handleCitySelect(matchingCity);
                  }
                  setShowCityDropdown(false);
                }, 220)}
                placeholder="Type to search city... (e.g. Saharsa)"
                required
                disabled={resolvingCity}
              />
              {resolvingCity ? (
                <Loader className="input-icon spin" size={16} style={{ left: 'auto', right: '12px' }} />
              ) : (
                <ChevronDown 
                  size={16} 
                  style={{ position: 'absolute', right: '12px', color: 'var(--text-secondary)', cursor: 'pointer' }}
                  onClick={() => setShowCityDropdown(!showCityDropdown)}
                />
              )}
            </div>

            {showCityDropdown && (
              <div className="autocomplete-dropdown">
                {filteredCities.map((c) => (
                  <div 
                    key={c.name} 
                    className="autocomplete-item"
                    onClick={() => handleCitySelect(c)}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <span>{c.name}</span>
                    {city === c.name && <Check size={14} style={{ color: 'var(--accent-cyan)' }} />}
                  </div>
                ))}
                
                {/* Dynamically search and select any Indian city if it is not predefined */}
                {cityInput.trim().length > 0 && !filteredCities.some(c => c.name.toLowerCase() === cityInput.toLowerCase()) && (
                  <div 
                    className="autocomplete-item"
                    onClick={() => handleDynamicCityResolve(cityInput.trim())}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)', fontWeight: 'bold' }}
                  >
                    🔍 Search & calculate for "{cityInput.trim()}"...
                  </div>
                )}

                {filteredCities.length === 0 && cityInput.trim().length === 0 && (
                  <div className="autocomplete-item" style={{ color: 'var(--text-secondary)', cursor: 'default' }}>
                    Type to search city...
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Starting Point suggestions input */}
          <div className="input-group">
            <label>Starting Point</label>
            <div className="input-wrapper">
              <MapPin className="input-icon" size={16} />
              <input
                type="text"
                className="search-input"
                value={startQuery}
                onChange={(e) => handleStartChange(e.target.value)}
                onFocus={() => {
                  setShowStartSuggestions(true);
                  if (!startQuery.trim() || startSuggestions.length === 0) {
                    setStartSuggestions(LOCAL_PRESETS[city] || getPlaceholderPresets(city));
                  }
                }}
                onBlur={() => setTimeout(() => setShowStartSuggestions(false), 220)}
                placeholder={`E.g., Station, ${city}`}
                required
              />
            </div>

            {showStartSuggestions && startSuggestions.length > 0 && (
              <div className="autocomplete-dropdown" style={{ zIndex: 1001 }}>
                {startSuggestions.map((s, idx) => (
                  <div 
                    key={idx} 
                    className="autocomplete-item"
                    onClick={() => {
                      setStartQuery(s);
                      setShowStartSuggestions(false);
                    }}
                  >
                    📍 {s}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Destination suggestions input */}
          <div className="input-group">
            <label>Destination</label>
            <div className="input-wrapper">
              <Navigation className="input-icon" size={16} />
              <input
                type="text"
                className="search-input"
                value={endQuery}
                onChange={(e) => handleEndChange(e.target.value)}
                onFocus={() => {
                  setShowEndSuggestions(true);
                  if (!endQuery.trim() || endSuggestions.length === 0) {
                    setEndSuggestions(LOCAL_PRESETS[city] || getPlaceholderPresets(city));
                  }
                }}
                onBlur={() => setTimeout(() => setShowEndSuggestions(false), 220)}
                placeholder={`E.g., Bus Stand, ${city}`}
                required
              />
            </div>

            {showEndSuggestions && endSuggestions.length > 0 && (
              <div className="autocomplete-dropdown" style={{ zIndex: 1001 }}>
                {endSuggestions.map((s, idx) => (
                  <div 
                    key={idx} 
                    className="autocomplete-item"
                    onClick={() => {
                      setEndQuery(s);
                      setShowEndSuggestions(false);
                    }}
                  >
                    📍 {s}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" className="btn-primary" style={{ padding: '16px' }} disabled={loading || resolvingCity}>
            {loading ? 'Analyzing Routes...' : 'Calculate Transit Fares'} <ArrowRight size={18} />
          </button>

          {error && (
            <div style={{ color: 'var(--accent-red)', fontSize: '13px', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px' }}>
              ⚠️ {error}
            </div>
          )}
        </form>
      </div>

      {/* Right Panel: 3D Scene and Visuals */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
        <ThreeCanvas mode="auto" />
        
        <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h3 style={{ color: 'var(--accent-cyan)', fontSize: '18px' }}>Why MetriGo?</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.5px', color: 'var(--text-secondary)' }}>
            <p>
              🚦 <strong>Dynamic street fare engines:</strong> Auto rickshaws in India rarely follow government meter rates. MetriGo projects realistic negotiated street prices based on distance.
            </p>
            <p>
              🚇 <strong>Cross-modal transit advice:</strong> Computes cabs, autos, metro connections, and local bus details concurrently.
            </p>
            <p>
              🤖 <strong>AI Chat assistant:</strong> Ask queries in natural language to find local shortcuts, weather delays, or bus route details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
