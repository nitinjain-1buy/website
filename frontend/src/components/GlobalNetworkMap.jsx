import React, { useEffect, useState } from 'react';

const GlobalNetworkMap = () => {
  const [activeFlow, setActiveFlow] = useState(0);

  // Locations with coordinates (approximate positions on the SVG viewBox)
  const locations = [
    { id: 'china', name: 'China', x: 680, y: 180, region: 'fareast' },
    { id: 'taiwan', name: 'Taiwan', x: 710, y: 210, region: 'fareast' },
    { id: 'japan', name: 'Japan', x: 760, y: 170, region: 'fareast' },
    { id: 'korea', name: 'Korea', x: 720, y: 165, region: 'fareast' },
    { id: 'vietnam', name: 'Vietnam', x: 665, y: 230, region: 'sea' },
    { id: 'thailand', name: 'Thailand', x: 640, y: 225, region: 'sea' },
    { id: 'india', name: 'India', x: 580, y: 210, region: 'india' },
    { id: 'europe', name: 'Europe', x: 450, y: 140, region: 'europe' },
    { id: 'usa', name: 'USA', x: 180, y: 170, region: 'usa' },
  ];

  // Flow paths showing global sourcing connections
  const flows = [
    { from: 'china', to: 'india', color: '#10b981' },
    { from: 'taiwan', to: 'india', color: '#10b981' },
    { from: 'korea', to: 'europe', color: '#3b82f6' },
    { from: 'japan', to: 'usa', color: '#3b82f6' },
    { from: 'china', to: 'europe', color: '#8b5cf6' },
    { from: 'vietnam', to: 'usa', color: '#f59e0b' },
    { from: 'thailand', to: 'europe', color: '#f59e0b' },
    { from: 'india', to: 'usa', color: '#10b981' },
    { from: 'india', to: 'europe', color: '#10b981' },
    { from: 'china', to: 'usa', color: '#8b5cf6' },
  ];

  // Cycle through highlighting different flows
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFlow((prev) => (prev + 1) % flows.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [flows.length]);

  const getLocation = (id) => locations.find(loc => loc.id === id);

  // Generate curved path between two points
  const generateCurvedPath = (from, to) => {
    const fromLoc = getLocation(from);
    const toLoc = getLocation(to);
    if (!fromLoc || !toLoc) return '';

    const midX = (fromLoc.x + toLoc.x) / 2;
    const midY = (fromLoc.y + toLoc.y) / 2 - 50; // Curve upward

    return `M ${fromLoc.x} ${fromLoc.y} Q ${midX} ${midY} ${toLoc.x} ${toLoc.y}`;
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
        <div className="relative">
          <svg
            viewBox="0 0 900 400"
            className="w-full h-auto"
            style={{ maxHeight: '500px' }}
          >
            <defs>
              {/* Gradient for paths */}
              <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                <stop offset="50%" stopColor="#10b981" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
              </linearGradient>

              {/* Glow filter */}
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Animated dot */}
              <circle id="dot" r="4" fill="#10b981">
                <animate
                  attributeName="opacity"
                  values="1;0.3;1"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
              </circle>
            </defs>

            {/* World Map Background - More Visible */}
            <g>
              {/* Ocean/Background */}
              <rect x="0" y="0" width="900" height="400" fill="#0f172a" />
              
              {/* North America */}
              <path 
                d="M50,80 L100,60 L150,55 L200,60 L240,80 L260,100 L270,130 L280,160 L270,190 L250,210 L230,230 L200,240 L170,235 L140,220 L120,200 L100,180 L80,150 L60,120 L50,100 Z" 
                fill="#1e3a5f" 
                stroke="#3b82f6" 
                strokeWidth="1"
                opacity="0.6"
              />
              {/* USA Detail */}
              <path 
                d="M80,140 L150,130 L200,140 L240,160 L250,180 L240,200 L200,210 L150,200 L100,180 L80,160 Z" 
                fill="#1e4976" 
                stroke="#3b82f6" 
                strokeWidth="0.5"
                opacity="0.5"
              />
              
              {/* South America */}
              <path 
                d="M180,250 L220,245 L250,260 L260,300 L255,340 L240,370 L210,385 L180,375 L165,340 L170,300 L175,270 Z" 
                fill="#1e3a5f" 
                stroke="#3b82f6" 
                strokeWidth="1"
                opacity="0.6"
              />
              
              {/* Europe */}
              <path 
                d="M400,70 L440,60 L480,65 L510,80 L525,100 L520,130 L505,150 L480,160 L450,155 L420,145 L400,125 L395,100 Z" 
                fill="#1e3a5f" 
                stroke="#3b82f6" 
                strokeWidth="1"
                opacity="0.6"
              />
              {/* UK */}
              <path 
                d="M390,90 L400,85 L405,95 L400,105 L390,100 Z" 
                fill="#1e4976" 
                stroke="#3b82f6" 
                strokeWidth="0.5"
                opacity="0.5"
              />
              
              {/* Africa */}
              <path 
                d="M430,170 L480,165 L520,180 L540,220 L535,270 L520,310 L490,340 L450,345 L420,320 L410,280 L415,230 L425,190 Z" 
                fill="#1e3a5f" 
                stroke="#3b82f6" 
                strokeWidth="1"
                opacity="0.6"
              />
              
              {/* Russia/Northern Asia */}
              <path 
                d="M500,50 L560,40 L640,45 L720,55 L780,70 L800,90 L790,110 L760,120 L700,115 L640,110 L580,100 L530,90 L510,70 Z" 
                fill="#1e3a5f" 
                stroke="#3b82f6" 
                strokeWidth="1"
                opacity="0.6"
              />
              
              {/* China/East Asia */}
              <path 
                d="M620,110 L680,105 L730,120 L760,150 L755,180 L730,200 L690,210 L650,200 L620,180 L610,150 L615,125 Z" 
                fill="#1e4976" 
                stroke="#10b981" 
                strokeWidth="1.5"
                opacity="0.7"
              />
              
              {/* India */}
              <path 
                d="M550,180 L590,175 L610,195 L605,230 L590,260 L565,270 L545,255 L540,220 L545,195 Z" 
                fill="#134e4a" 
                stroke="#10b981" 
                strokeWidth="2"
                opacity="0.8"
              />
              
              {/* Southeast Asia */}
              <path 
                d="M620,220 L660,215 L700,230 L720,260 L710,290 L680,300 L640,290 L620,260 L615,240 Z" 
                fill="#1e4976" 
                stroke="#10b981" 
                strokeWidth="1"
                opacity="0.6"
              />
              
              {/* Japan */}
              <path 
                d="M760,140 L775,135 L785,150 L780,170 L765,175 L755,160 Z" 
                fill="#1e4976" 
                stroke="#10b981" 
                strokeWidth="1.5"
                opacity="0.7"
              />
              
              {/* Taiwan */}
              <ellipse cx="720" cy="200" rx="8" ry="12" fill="#1e4976" stroke="#10b981" strokeWidth="1" opacity="0.7" />
              
              {/* Australia */}
              <path 
                d="M700,310 L760,300 L800,320 L810,360 L790,390 L740,395 L700,375 L690,340 Z" 
                fill="#1e3a5f" 
                stroke="#3b82f6" 
                strokeWidth="1"
                opacity="0.6"
              />
              
              {/* Grid lines for tech feel */}
              <g stroke="#334155" strokeWidth="0.3" opacity="0.4">
                <line x1="0" y1="100" x2="900" y2="100" strokeDasharray="5,10" />
                <line x1="0" y1="200" x2="900" y2="200" strokeDasharray="5,10" />
                <line x1="0" y1="300" x2="900" y2="300" strokeDasharray="5,10" />
                <line x1="150" y1="0" x2="150" y2="400" strokeDasharray="5,10" />
                <line x1="300" y1="0" x2="300" y2="400" strokeDasharray="5,10" />
                <line x1="450" y1="0" x2="450" y2="400" strokeDasharray="5,10" />
                <line x1="600" y1="0" x2="600" y2="400" strokeDasharray="5,10" />
                <line x1="750" y1="0" x2="750" y2="400" strokeDasharray="5,10" />
              </g>
            </g>

            {/* Connection Paths */}
            {flows.map((flow, index) => {
              const path = generateCurvedPath(flow.from, flow.to);
              const isActive = index === activeFlow;
              return (
                <g key={`${flow.from}-${flow.to}`}>
                  {/* Base path */}
                  <path
                    d={path}
                    fill="none"
                    stroke={flow.color}
                    strokeWidth={isActive ? "2" : "1"}
                    strokeOpacity={isActive ? "0.6" : "0.2"}
                    strokeDasharray="4,4"
                  />
                  {/* Animated flowing dot */}
                  {isActive && (
                    <circle r="5" fill={flow.color} filter="url(#glow)">
                      <animateMotion
                        dur="2s"
                        repeatCount="indefinite"
                        path={path}
                      />
                      <animate
                        attributeName="r"
                        values="3;5;3"
                        dur="1s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                </g>
              );
            })}

            {/* Location Markers */}
            {locations.map((loc) => (
              <g key={loc.id} className="cursor-pointer">
                {/* Pulse animation */}
                <circle
                  cx={loc.x}
                  cy={loc.y}
                  r="12"
                  fill={loc.region === 'india' ? '#10b981' : '#3b82f6'}
                  opacity="0.3"
                >
                  <animate
                    attributeName="r"
                    values="8;15;8"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.4;0.1;0.4"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>
                {/* Main dot */}
                <circle
                  cx={loc.x}
                  cy={loc.y}
                  r="6"
                  fill={loc.region === 'india' ? '#10b981' : '#3b82f6'}
                  stroke="#fff"
                  strokeWidth="2"
                  filter="url(#glow)"
                />
                {/* Label */}
                <text
                  x={loc.x}
                  y={loc.y - 15}
                  textAnchor="middle"
                  fill="#e2e8f0"
                  fontSize="10"
                  fontWeight="500"
                >
                  {loc.name}
                </text>
              </g>
            ))}

            {/* Legend */}
            <g transform="translate(30, 340)">
              <rect x="0" y="0" width="200" height="50" rx="5" fill="#1e293b" opacity="0.8" />
              <circle cx="20" cy="18" r="5" fill="#3b82f6" />
              <text x="35" y="22" fill="#94a3b8" fontSize="10">Data Sources</text>
              <circle cx="110" cy="18" r="5" fill="#10b981" />
              <text x="125" y="22" fill="#94a3b8" fontSize="10">Sourcing Hubs</text>
              <text x="15" y="42" fill="#64748b" fontSize="9">Live data flows updating in real-time</text>
            </g>
          </svg>

          {/* Stats Overlay */}
          <div className="absolute bottom-4 right-4 hidden md:block">
            <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg p-4 border border-slate-700">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-emerald-400">400+</p>
                  <p className="text-xs text-slate-400">Data Sources</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-400">9</p>
                  <p className="text-xs text-slate-400">Regions</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Region Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
          {[
            { name: 'Far East', countries: 'China, Taiwan, Japan, Korea', icon: '🏭', type: 'Manufacturing' },
            { name: 'South East Asia', countries: 'Vietnam, Thailand', icon: '🔧', type: 'Assembly' },
            { name: 'India', countries: 'Growing Hub', icon: '🚀', type: 'Design & Mfg' },
            { name: 'Europe', countries: 'Germany, UK, France', icon: '🎯', type: 'High-End' },
            { name: 'Americas', countries: 'USA, Mexico', icon: '🌎', type: 'Consumption' },
          ].map((region, index) => (
            <div
              key={region.name}
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
