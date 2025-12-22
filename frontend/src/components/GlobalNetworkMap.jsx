import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL;

const GlobalNetworkMap = () => {
  const [activeFlow, setActiveFlow] = useState(0);
  const [locations, setLocations] = useState([]);
  const [regionCards, setRegionCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // World map image URL
  const worldMapImage = "https://customer-assets.emergentagent.com/job_procure-sphere/artifacts/4a54wyou_Screenshot%20from%202025-12-21%2018-55-27.png";

  // Fetch locations and region cards from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch map locations
        const locResponse = await axios.get(`${API}/api/map-locations`);
        if (locResponse.data && locResponse.data.length > 0) {
          const transformedLocations = locResponse.data.map(loc => ({
            ...loc,
            id: loc.name.toLowerCase().replace(/\s+/g, ''),
          }));
          setLocations(transformedLocations);
        } else {
          await axios.post(`${API}/api/map-locations/seed`);
          const seededResponse = await axios.get(`${API}/api/map-locations`);
          const transformedLocations = seededResponse.data.map(loc => ({
            ...loc,
            id: loc.name.toLowerCase().replace(/\s+/g, ''),
          }));
          setLocations(transformedLocations);
        }

        // Fetch region cards
        const cardResponse = await axios.get(`${API}/api/region-cards`);
        if (cardResponse.data && cardResponse.data.length > 0) {
          setRegionCards(cardResponse.data);
        } else {
          await axios.post(`${API}/api/region-cards/seed`);
          const seededCards = await axios.get(`${API}/api/region-cards`);
          setRegionCards(seededCards.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback to default locations
        setLocations([
          { id: 'usa', name: 'USA', x: 18, y: 42, type: 'Data Source' },
          { id: 'europe', name: 'Europe', x: 48, y: 32, type: 'Data Source' },
          { id: 'india', name: 'India', x: 66, y: 48, type: 'Data Source' },
          { id: 'china', name: 'China', x: 76, y: 36, type: 'Sourcing Hub' },
          { id: 'korea', name: 'Korea', x: 82, y: 34, type: 'Sourcing Hub' },
          { id: 'japan', name: 'Japan', x: 87, y: 36, type: 'Sourcing Hub' },
          { id: 'taiwan', name: 'Taiwan', x: 82, y: 44, type: 'Sourcing Hub' },
          { id: 'vietnam', name: 'Vietnam', x: 77, y: 50, type: 'Data Source' },
          { id: 'thailand', name: 'Thailand', x: 73, y: 50, type: 'Data Source' },
        ]);
        // Fallback region cards
        setRegionCards([
          { name: 'Far East', countries: 'China, Taiwan, Japan, Korea', icon: '🏭', type: 'Manufacturing' },
          { name: 'South East Asia', countries: 'Vietnam, Thailand', icon: '🔧', type: 'Assembly' },
          { name: 'India', countries: 'Growing Hub', icon: '🚀', type: 'Design & Mfg' },
          { name: 'Europe', countries: 'Germany, UK, France', icon: '🎯', type: 'High-End' },
          { name: 'Americas', countries: 'USA, Mexico', icon: '🌎', type: 'Consumption' },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Source locations (Asian manufacturing/sourcing hubs) - flows originate FROM these
  const sourceLocationNames = ['china', 'taiwan', 'korea', 'japan', 'vietnam', 'thailand', 'india'];
  
  // Colors for different source regions
  const flowColors = {
    china: '#8b5cf6',    // Purple
    taiwan: '#10b981',   // Green
    korea: '#3b82f6',    // Blue
    japan: '#3b82f6',    // Blue
    vietnam: '#f59e0b',  // Orange
    thailand: '#f59e0b', // Orange
    india: '#10b981',    // Green
  };

  // Dynamically generate flows from source locations to destination locations
  const flows = React.useMemo(() => {
    if (locations.length === 0) return [];
    
    const generatedFlows = [];
    const sourceIds = sourceLocationNames.map(name => name.toLowerCase());
    
    // Get destination locations (any location not in source list)
    const destinations = locations.filter(loc => 
      !sourceIds.includes(loc.id?.toLowerCase()) && 
      !sourceIds.includes(loc.name?.toLowerCase())
    );
    
    // Get source locations that exist in our data
    const sources = locations.filter(loc => 
      sourceIds.includes(loc.id?.toLowerCase()) || 
      sourceIds.includes(loc.name?.toLowerCase())
    );
    
    // Generate flows from each source to each destination
    sources.forEach(source => {
      const sourceId = source.id?.toLowerCase() || source.name?.toLowerCase();
      const color = flowColors[sourceId] || '#3b82f6';
      
      destinations.forEach(dest => {
        const destId = dest.id?.toLowerCase() || dest.name?.toLowerCase();
        
        // Determine if line should curve below (for lines going to Americas from Asia)
        // Curve below if destination is west of source (lower X value) and it's a long distance
        const isGoingWest = dest.x < source.x;
        const isLongDistance = Math.abs(dest.x - source.x) > 40;
        const curveBelow = isGoingWest && isLongDistance;
        
        generatedFlows.push({
          from: sourceId,
          to: destId,
          color,
          curveBelow
        });
      });
    });
    
    return generatedFlows;
  }, [locations]);

  useEffect(() => {
    if (flows.length === 0) return;
    const interval = setInterval(() => {
      setActiveFlow((prev) => (prev + 1) % flows.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [flows.length]);

  const getLocation = (id) => locations.find(loc => 
    loc.id?.toLowerCase() === id?.toLowerCase() || 
    loc.name?.toLowerCase() === id?.toLowerCase()
  );

  // Generate curved SVG path between two points (using percentages)
  const generateCurvedPath = (from, to, curveBelow = false) => {
    const fromLoc = getLocation(from);
    const toLoc = getLocation(to);
    if (!fromLoc || !toLoc) return '';
    
    // Scale Y coordinates by 0.5 for the 2:1 aspect ratio viewBox
    const fromY = fromLoc.y * 0.5;
    const toY = toLoc.y * 0.5;
    const midX = (fromLoc.x + toLoc.x) / 2;
    
    // Curve below for westward long-distance paths, otherwise curve upward
    const midY = curveBelow 
      ? Math.max(fromY, toY) + 12  // Curve downward (below both points)
      : Math.min(fromY, toY) - 8;   // Curve upward (above both points)
    
    return `M ${fromLoc.x} ${fromY} Q ${midX} ${midY} ${toLoc.x} ${toY}`;
  };

  return (
    <section className="py-20 bg-slate-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Global Intelligence & Sourcing Network
          </h2>
          <p className="text-lg text-slate-400 max-w-3xl mx-auto">
            Real-time data aggregation and sourcing execution across the world's key electronics manufacturing hubs
          </p>
        </div>

        {/* Map Container */}
        <div className="relative bg-slate-800/30 rounded-2xl p-4 border border-slate-700 overflow-hidden">
          {/* World Map Background Image */}
          <div className="relative w-full" style={{ aspectRatio: '2/1' }}>
            <img 
              src={worldMapImage} 
              alt="World Map"
              className="absolute inset-0 w-full h-full object-cover opacity-30"
              style={{ filter: 'brightness(0.8) contrast(1.2)' }}
            />
            
            {/* SVG Overlay for markers and flow lines */}
            <svg 
              viewBox="0 0 100 50" 
              className="absolute inset-0 w-full h-full"
              preserveAspectRatio="xMidYMid slice"
            >
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="0.5" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="strongGlow">
                  <feGaussianBlur stdDeviation="1" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Connection Flow Lines */}
              {flows.map((flow, index) => {
                const path = generateCurvedPath(flow.from, flow.to, flow.curveBelow);
                const isActive = index === activeFlow;
                return (
                  <g key={`${flow.from}-${flow.to}`}>
                    {/* Base dashed line */}
                    <path
                      d={path}
                      fill="none"
                      stroke={flow.color}
                      strokeWidth={isActive ? "0.4" : "0.15"}
                      strokeOpacity={isActive ? "0.9" : "0.4"}
                      strokeDasharray="1,0.5"
                      filter={isActive ? "url(#glow)" : ""}
                    />
                    {/* Animated dot traveling along path */}
                    {isActive && (
                      <circle r="0.8" fill={flow.color} filter="url(#strongGlow)">
                        <animateMotion dur="2s" repeatCount="indefinite" path={path} />
                      </circle>
                    )}
                  </g>
                );
              })}

              {/* Location Markers */}
              {locations.map((loc) => {
                // Determine color based on type: Sourcing Hub = green, Data Source = blue
                const markerColor = loc.type === 'Sourcing Hub' ? '#10b981' : '#3b82f6';
                const isSourcingHub = loc.type === 'Sourcing Hub';
                // Scale Y by 0.5 for the 2:1 aspect ratio viewBox
                const scaledY = loc.y * 0.5;
                
                return (
                <g key={loc.id}>
                  {/* Pulse animation ring */}
                  <circle 
                    cx={loc.x} 
                    cy={scaledY} 
                    r="1.2" 
                    fill="none"
                    stroke={markerColor} 
                    strokeWidth="0.2"
                    opacity="0.6"
                  >
                    <animate attributeName="r" values="0.8;1.8;0.8" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.6;0.1;0.6" dur="2s" repeatCount="indefinite" />
                  </circle>
                  {/* Main marker dot */}
                  <circle 
                    cx={loc.x} 
                    cy={scaledY} 
                    r={isSourcingHub ? "0.8" : "0.6"} 
                    fill={markerColor} 
                    stroke="#fff" 
                    strokeWidth="0.15"
                    filter="url(#strongGlow)"
                  />
                  {/* Label */}
                  <text 
                    x={loc.x} 
                    y={scaledY - 1.5} 
                    textAnchor="middle" 
                    fill="#fff" 
                    fontSize="1.4" 
                    fontWeight="600"
                    style={{ textShadow: '0 0 3px rgba(0,0,0,0.8)' }}
                  >
                    {loc.name}
                  </text>
                </g>
                );
              })}
            </svg>
          </div>

          {/* Legend - Bottom Left */}
          <div className="absolute bottom-6 left-6 bg-slate-900/80 backdrop-blur-sm rounded-lg px-4 py-3 border border-slate-700">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-slate-300 text-sm">Data Sources</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-slate-300 text-sm">Sourcing Hubs</span>
              </div>
            </div>
            <p className="text-slate-500 text-xs mt-1">Live data flows updating in real-time</p>
          </div>
        </div>

        {/* Region Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
          {regionCards.map((region) => (
            <div
              key={region.id || region.name}
              className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 hover:border-emerald-500/50 transition-colors"
            >
              <div className="text-2xl mb-2">{region.icon}</div>
              <h4 className="font-semibold text-white text-sm">{region.name}</h4>
              <p className="text-xs text-slate-400">{region.countries}</p>
              <p className="text-xs text-emerald-400 mt-1">{region.type}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GlobalNetworkMap;
