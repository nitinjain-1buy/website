import React, { useEffect, useState } from 'react';

const GlobalNetworkMap = () => {
  const [activeFlow, setActiveFlow] = useState(0);

  // Locations with coordinates positioned on the actual world map
  const locations = [
    { id: 'china', name: 'China', x: 770, y: 200, region: 'fareast' },
    { id: 'taiwan', name: 'Taiwan', x: 810, y: 240, region: 'fareast' },
    { id: 'japan', name: 'Japan', x: 850, y: 190, region: 'fareast' },
    { id: 'korea', name: 'Korea', x: 820, y: 185, region: 'fareast' },
    { id: 'vietnam', name: 'Vietnam', x: 755, y: 270, region: 'sea' },
    { id: 'thailand', name: 'Thailand', x: 720, y: 265, region: 'sea' },
    { id: 'india', name: 'India', x: 650, y: 250, region: 'india' },
    { id: 'europe', name: 'Europe', x: 480, y: 150, region: 'europe' },
    { id: 'usa', name: 'USA', x: 200, y: 180, region: 'usa' },
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

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFlow((prev) => (prev + 1) % flows.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [flows.length]);

  const getLocation = (id) => locations.find(loc => loc.id === id);

  const generateCurvedPath = (from, to) => {
    const fromLoc = getLocation(from);
    const toLoc = getLocation(to);
    if (!fromLoc || !toLoc) return '';
    const midX = (fromLoc.x + toLoc.x) / 2;
    const midY = (fromLoc.y + toLoc.y) / 2 - 60;
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
        <div className="relative bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
          <svg viewBox="0 0 1000 450" className="w-full h-auto">
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Proper World Map SVG Paths */}
            <g fill="#1e3a5f" stroke="#3b82f6" strokeWidth="0.5" opacity="0.7">
              {/* North America */}
              <path d="M165,75 L175,73 L185,75 L200,73 L215,75 L225,80 L232,75 L240,73 L248,75 L255,80 L258,85 L260,95 L255,105 L248,115 L245,125 L250,135 L255,145 L252,155 L245,165 L238,175 L235,185 L240,195 L248,200 L255,195 L260,188 L268,185 L275,190 L278,200 L275,210 L268,218 L260,225 L250,230 L240,228 L230,225 L220,230 L210,235 L200,238 L190,235 L180,230 L170,225 L162,218 L158,210 L155,200 L152,190 L148,180 L142,172 L135,165 L128,160 L120,158 L112,160 L105,165 L100,172 L95,165 L92,155 L90,145 L88,135 L90,125 L95,115 L102,105 L110,98 L120,92 L130,88 L140,85 L150,82 L160,78 Z" />
              {/* Greenland */}
              <path d="M320,50 L340,48 L360,52 L375,60 L385,72 L388,85 L385,100 L378,112 L368,120 L355,125 L340,122 L328,115 L318,105 L312,92 L310,78 L315,62 Z" />
              {/* South America */}
              <path d="M240,280 L250,275 L262,278 L275,285 L285,295 L292,308 L295,322 L292,338 L285,355 L275,370 L262,382 L248,390 L235,395 L222,392 L210,385 L200,375 L195,362 L192,348 L195,332 L200,318 L208,305 L218,292 L230,282 Z" />
              {/* Europe */}
              <path d="M440,95 L455,92 L472,95 L488,100 L502,108 L515,118 L525,130 L530,145 L528,160 L520,172 L508,182 L495,188 L480,190 L465,188 L450,182 L438,172 L430,160 L428,145 L432,130 L440,118 L448,108 Z" />
              {/* UK */}
              <path d="M425,115 L432,112 L438,115 L442,122 L440,130 L435,135 L428,132 L422,125 L423,118 Z" />
              {/* Africa */}
              <path d="M460,200 L480,195 L502,200 L522,210 L538,225 L548,245 L552,268 L548,292 L540,315 L528,335 L512,352 L492,365 L470,372 L448,368 L428,358 L415,342 L408,322 L405,300 L410,278 L420,258 L435,240 L452,222 Z" />
              {/* Russia/Northern Asia */}
              <path d="M520,60 L560,55 L605,58 L655,62 L705,68 L755,75 L800,85 L840,95 L870,108 L890,122 L895,138 L888,152 L875,162 L858,168 L838,170 L815,168 L790,165 L762,160 L732,155 L700,152 L668,150 L635,148 L602,148 L570,150 L540,155 L515,162 L498,155 L490,142 L492,125 L500,110 L512,98 L525,85 L535,72 Z" />
              {/* Middle East */}
              <path d="M545,180 L565,178 L585,182 L602,190 L615,202 L622,218 L620,235 L612,250 L598,260 L582,265 L565,262 L550,255 L538,242 L532,228 L535,212 L542,195 Z" />
              {/* India */}
              <path d="M620,210 L642,205 L662,212 L678,225 L688,242 L692,262 L688,282 L678,300 L665,315 L648,325 L628,328 L610,322 L595,310 L585,295 L582,275 L588,255 L600,238 L615,222 Z" fill="#134e4a" stroke="#10b981" strokeWidth="1.5" opacity="0.9" />
              {/* Southeast Asia */}
              <path d="M700,245 L720,240 L742,245 L762,255 L778,270 L788,288 L792,308 L788,328 L778,345 L762,358 L742,365 L720,362 L700,352 L685,338 L678,320 L680,300 L688,282 L700,265 Z" />
              {/* China */}
              <path d="M720,155 L755,148 L790,152 L822,162 L850,178 L868,198 L875,222 L870,245 L858,265 L840,280 L818,290 L792,292 L765,288 L740,278 L720,262 L705,242 L698,220 L700,198 L710,178 Z" fill="#1e4976" stroke="#10b981" strokeWidth="1" opacity="0.8" />
              {/* Japan */}
              <path d="M855,165 L868,162 L880,168 L888,180 L890,195 L885,210 L875,222 L862,228 L850,225 L842,215 L840,200 L845,185 L852,172 Z" fill="#1e4976" stroke="#10b981" strokeWidth="1" opacity="0.8" />
              {/* Indonesia/Philippines */}
              <path d="M760,320 L785,315 L812,322 L838,335 L858,352 L868,372 L865,392 L852,408 L832,418 L808,420 L782,415 L758,405 L740,390 L732,372 L735,352 L748,335 Z" />
              {/* Australia */}
              <path d="M780,380 L820,375 L862,382 L900,398 L928,420 L942,448 L940,478 L925,505 L900,525 L868,538 L832,542 L795,535 L762,520 L738,498 L725,472 L728,445 L745,420 L770,400 Z" />
            </g>

            {/* Grid overlay for tech feel */}
            <g stroke="#334155" strokeWidth="0.3" opacity="0.3">
              {[0, 1, 2, 3, 4, 5, 6].map(i => (
                <line key={`h${i}`} x1="0" y1={i * 75} x2="1000" y2={i * 75} strokeDasharray="5,10" />
              ))}
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                <line key={`v${i}`} x1={i * 100} y1="0" x2={i * 100} y2="450" strokeDasharray="5,10" />
              ))}
            </g>

            {/* Connection Paths */}
            {flows.map((flow, index) => {
              const path = generateCurvedPath(flow.from, flow.to);
              const isActive = index === activeFlow;
              return (
                <g key={`${flow.from}-${flow.to}`}>
                  <path
                    d={path}
                    fill="none"
                    stroke={flow.color}
                    strokeWidth={isActive ? "2.5" : "1"}
                    strokeOpacity={isActive ? "0.8" : "0.3"}
                    strokeDasharray="6,4"
                  />
                  {isActive && (
                    <circle r="6" fill={flow.color} filter="url(#glow)">
                      <animateMotion dur="2s" repeatCount="indefinite" path={path} />
                    </circle>
                  )}
                </g>
              );
            })}

            {/* Location Markers */}
            {locations.map((loc) => (
              <g key={loc.id}>
                <circle cx={loc.x} cy={loc.y} r="15" fill={loc.region === 'india' ? '#10b981' : '#3b82f6'} opacity="0.2">
                  <animate attributeName="r" values="12;20;12" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx={loc.x} cy={loc.y} r="8" fill={loc.region === 'india' ? '#10b981' : '#3b82f6'} stroke="#fff" strokeWidth="2" filter="url(#glow)" />
                <text x={loc.x} y={loc.y - 18} textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="600">{loc.name}</text>
              </g>
            ))}

            {/* Legend */}
            <g transform="translate(30, 380)">
              <rect x="0" y="0" width="220" height="55" rx="8" fill="#1e293b" opacity="0.9" />
              <circle cx="25" cy="20" r="6" fill="#3b82f6" />
              <text x="42" y="24" fill="#94a3b8" fontSize="11">Data Sources</text>
              <circle cx="130" cy="20" r="6" fill="#10b981" />
              <text x="147" y="24" fill="#94a3b8" fontSize="11">Sourcing Hubs</text>
              <text x="15" y="45" fill="#64748b" fontSize="10">Live data flows updating in real-time</text>
            </g>

            {/* Stats */}
            <g transform="translate(780, 380)">
              <rect x="0" y="0" width="180" height="55" rx="8" fill="#1e293b" opacity="0.9" />
              <text x="25" y="25" fill="#10b981" fontSize="20" fontWeight="bold">400+</text>
              <text x="25" y="42" fill="#64748b" fontSize="10">Data Sources</text>
              <text x="110" y="25" fill="#3b82f6" fontSize="20" fontWeight="bold">9</text>
              <text x="110" y="42" fill="#64748b" fontSize="10">Regions</text>
            </g>
          </svg>
        </div>

        {/* Region Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
          {[
            { name: 'Far East', countries: 'China, Taiwan, Japan, Korea', icon: '🏭', type: 'Manufacturing' },
            { name: 'South East Asia', countries: 'Vietnam, Thailand', icon: '🔧', type: 'Assembly' },
            { name: 'India', countries: 'Growing Hub', icon: '🚀', type: 'Design & Mfg' },
            { name: 'Europe', countries: 'Germany, UK, France', icon: '🎯', type: 'High-End' },
            { name: 'Americas', countries: 'USA, Mexico', icon: '🌎', type: 'Consumption' },
          ].map((region) => (
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
