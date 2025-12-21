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

            {/* Simplified World Map Background */}
            <g opacity="0.15" fill="none" stroke="#64748b" strokeWidth="0.5">
              {/* North America */}
              <path d="M80,120 Q120,100 180,110 Q220,115 250,140 Q260,180 240,220 Q200,250 160,240 Q120,230 100,200 Q80,170 80,120" />
              {/* South America */}
              <path d="M200,260 Q230,270 240,320 Q235,370 210,390 Q180,380 175,340 Q170,300 200,260" />
              {/* Europe */}
              <path d="M420,100 Q460,90 500,100 Q520,120 510,150 Q480,170 440,160 Q420,140 420,100" />
              {/* Africa */}
              <path d="M440,180 Q480,175 510,200 Q520,260 490,320 Q450,340 420,300 Q410,240 440,180" />
              {/* Asia */}
              <path d="M520,100 Q600,80 700,100 Q760,120 780,170 Q770,220 720,250 Q650,260 580,240 Q530,200 520,150 Q515,120 520,100" />
              {/* India */}
              <path d="M560,190 Q590,185 600,220 Q595,260 570,270 Q545,255 550,220 Q555,200 560,190" />
              {/* Southeast Asia */}
              <path d="M620,230 Q660,225 700,240 Q720,270 700,290 Q660,295 630,280 Q615,260 620,230" />
              {/* Australia */}
              <path d="M700,320 Q750,310 780,340 Q785,380 750,395 Q710,390 700,360 Q695,340 700,320" />
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
