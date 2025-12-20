import React from 'react';

// Dense Electronic Components Pattern with realistic component illustrations
const ElectronicComponentsPattern = ({ className = '' }) => {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <svg
        className="absolute w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Ceramic Capacitor - SMD style */}
          <symbol id="cap-ceramic" viewBox="0 0 30 20">
            <rect x="2" y="4" width="26" height="12" rx="2" fill="#d4a574" stroke="#8b6914" strokeWidth="0.5" />
            <rect x="0" y="6" width="3" height="8" fill="#888" />
            <rect x="27" y="6" width="3" height="8" fill="#888" />
            <text x="15" y="12" fontSize="5" fill="#5c4a1f" textAnchor="middle">104</text>
          </symbol>

          {/* Electrolytic Capacitor - cylindrical */}
          <symbol id="cap-electrolytic" viewBox="0 0 25 35">
            <ellipse cx="12.5" cy="5" rx="10" ry="4" fill="#1a1a2e" stroke="#333" strokeWidth="0.5" />
            <rect x="2.5" y="5" width="20" height="25" fill="#1a1a2e" stroke="#333" strokeWidth="0.5" />
            <ellipse cx="12.5" cy="30" rx="10" ry="4" fill="#0d0d15" stroke="#333" strokeWidth="0.5" />
            <line x1="6" y1="32" x2="6" y2="35" stroke="#888" strokeWidth="1.5" />
            <line x1="19" y1="32" x2="19" y2="35" stroke="#888" strokeWidth="1.5" />
            <text x="12.5" y="18" fontSize="4" fill="#666" textAnchor="middle">100µF</text>
            <rect x="4" y="8" width="3" height="18" fill="#333" opacity="0.3" />
          </symbol>

          {/* Resistor with color bands */}
          <symbol id="resistor-bands" viewBox="0 0 50 16">
            <line x1="0" y1="8" x2="10" y2="8" stroke="#888" strokeWidth="1.5" />
            <rect x="10" y="2" width="30" height="12" rx="2" fill="#d4b896" stroke="#8b7355" strokeWidth="0.5" />
            <rect x="14" y="2" width="3" height="12" fill="#8b4513" />
            <rect x="20" y="2" width="3" height="12" fill="#000" />
            <rect x="26" y="2" width="3" height="12" fill="#ff0000" />
            <rect x="34" y="2" width="2" height="12" fill="#ffd700" />
            <line x1="40" y1="8" x2="50" y2="8" stroke="#888" strokeWidth="1.5" />
          </symbol>

          {/* SMD Resistor */}
          <symbol id="resistor-smd" viewBox="0 0 24 12">
            <rect x="0" y="2" width="24" height="8" rx="1" fill="#1a1a1a" stroke="#333" strokeWidth="0.3" />
            <rect x="0" y="2" width="5" height="8" fill="#888" />
            <rect x="19" y="2" width="5" height="8" fill="#888" />
            <text x="12" y="8" fontSize="4" fill="#fff" textAnchor="middle">1K0</text>
          </symbol>

          {/* IC Chip - DIP package */}
          <symbol id="ic-chip" viewBox="0 0 50 30">
            <rect x="5" y="2" width="40" height="26" rx="1" fill="#1a1a1a" stroke="#333" strokeWidth="0.5" />
            <circle cx="10" cy="8" r="2" fill="#333" />
            {/* Left pins */}
            <rect x="0" y="5" width="6" height="2" fill="#888" />
            <rect x="0" y="10" width="6" height="2" fill="#888" />
            <rect x="0" y="15" width="6" height="2" fill="#888" />
            <rect x="0" y="20" width="6" height="2" fill="#888" />
            {/* Right pins */}
            <rect x="44" y="5" width="6" height="2" fill="#888" />
            <rect x="44" y="10" width="6" height="2" fill="#888" />
            <rect x="44" y="15" width="6" height="2" fill="#888" />
            <rect x="44" y="20" width="6" height="2" fill="#888" />
            <text x="25" y="18" fontSize="5" fill="#888" textAnchor="middle">74HC595</text>
          </symbol>

          {/* QFP IC Package */}
          <symbol id="ic-qfp" viewBox="0 0 40 40">
            <rect x="8" y="8" width="24" height="24" fill="#1a1a1a" stroke="#333" strokeWidth="0.5" />
            <circle cx="12" cy="12" r="1.5" fill="#333" />
            {/* Top pins */}
            <rect x="11" y="2" width="1.5" height="6" fill="#888" />
            <rect x="15" y="2" width="1.5" height="6" fill="#888" />
            <rect x="19" y="2" width="1.5" height="6" fill="#888" />
            <rect x="23" y="2" width="1.5" height="6" fill="#888" />
            <rect x="27" y="2" width="1.5" height="6" fill="#888" />
            {/* Bottom pins */}
            <rect x="11" y="32" width="1.5" height="6" fill="#888" />
            <rect x="15" y="32" width="1.5" height="6" fill="#888" />
            <rect x="19" y="32" width="1.5" height="6" fill="#888" />
            <rect x="23" y="32" width="1.5" height="6" fill="#888" />
            <rect x="27" y="32" width="1.5" height="6" fill="#888" />
            {/* Left pins */}
            <rect x="2" y="11" width="6" height="1.5" fill="#888" />
            <rect x="2" y="15" width="6" height="1.5" fill="#888" />
            <rect x="2" y="19" width="6" height="1.5" fill="#888" />
            <rect x="2" y="23" width="6" height="1.5" fill="#888" />
            <rect x="2" y="27" width="6" height="1.5" fill="#888" />
            {/* Right pins */}
            <rect x="32" y="11" width="6" height="1.5" fill="#888" />
            <rect x="32" y="15" width="6" height="1.5" fill="#888" />
            <rect x="32" y="19" width="6" height="1.5" fill="#888" />
            <rect x="32" y="23" width="6" height="1.5" fill="#888" />
            <rect x="32" y="27" width="6" height="1.5" fill="#888" />
          </symbol>

          {/* Diode */}
          <symbol id="diode" viewBox="0 0 30 12">
            <line x1="0" y1="6" x2="6" y2="6" stroke="#888" strokeWidth="1.5" />
            <rect x="6" y="1" width="18" height="10" rx="1" fill="#1a1a1a" stroke="#333" strokeWidth="0.5" />
            <rect x="6" y="1" width="4" height="10" fill="#888" />
            <line x1="24" y1="6" x2="30" y2="6" stroke="#888" strokeWidth="1.5" />
          </symbol>

          {/* LED */}
          <symbol id="led" viewBox="0 0 20 30">
            <ellipse cx="10" cy="10" rx="8" ry="8" fill="#ff4444" fillOpacity="0.8" stroke="#cc0000" strokeWidth="0.5" />
            <ellipse cx="10" cy="10" rx="5" ry="5" fill="#ff8888" fillOpacity="0.5" />
            <rect x="7" y="18" width="6" height="8" fill="#ddd" stroke="#999" strokeWidth="0.3" />
            <line x1="8" y1="26" x2="8" y2="30" stroke="#888" strokeWidth="1" />
            <line x1="12" y1="26" x2="12" y2="30" stroke="#888" strokeWidth="1" />
          </symbol>

          {/* LED Green */}
          <symbol id="led-green" viewBox="0 0 20 30">
            <ellipse cx="10" cy="10" rx="8" ry="8" fill="#44ff44" fillOpacity="0.8" stroke="#00cc00" strokeWidth="0.5" />
            <ellipse cx="10" cy="10" rx="5" ry="5" fill="#88ff88" fillOpacity="0.5" />
            <rect x="7" y="18" width="6" height="8" fill="#ddd" stroke="#999" strokeWidth="0.3" />
            <line x1="8" y1="26" x2="8" y2="30" stroke="#888" strokeWidth="1" />
            <line x1="12" y1="26" x2="12" y2="30" stroke="#888" strokeWidth="1" />
          </symbol>

          {/* Transistor TO-92 */}
          <symbol id="transistor" viewBox="0 0 20 28">
            <path d="M2,0 Q10,-2 18,0 L18,15 Q10,18 2,15 Z" fill="#1a1a1a" stroke="#333" strokeWidth="0.5" />
            <rect x="2" y="0" width="16" height="15" fill="#1a1a1a" />
            <line x1="5" y1="15" x2="5" y2="28" stroke="#888" strokeWidth="1.2" />
            <line x1="10" y1="15" x2="10" y2="28" stroke="#888" strokeWidth="1.2" />
            <line x1="15" y1="15" x2="15" y2="28" stroke="#888" strokeWidth="1.2" />
          </symbol>

          {/* Crystal Oscillator */}
          <symbol id="crystal" viewBox="0 0 16 30">
            <rect x="2" y="4" width="12" height="22" rx="1" fill="#c0c0c0" stroke="#888" strokeWidth="0.5" />
            <rect x="4" y="6" width="8" height="18" fill="#e8e8e8" stroke="#aaa" strokeWidth="0.3" />
            <line x1="6" y1="0" x2="6" y2="4" stroke="#888" strokeWidth="1" />
            <line x1="10" y1="0" x2="10" y2="4" stroke="#888" strokeWidth="1" />
            <text x="8" y="17" fontSize="3" fill="#666" textAnchor="middle">16M</text>
          </symbol>

          {/* Inductor/Coil */}
          <symbol id="inductor" viewBox="0 0 30 20">
            <rect x="4" y="4" width="22" height="12" rx="2" fill="#2d4a2d" stroke="#1a3a1a" strokeWidth="0.5" />
            <ellipse cx="15" cy="10" rx="8" ry="4" fill="none" stroke="#cc9933" strokeWidth="2" />
            <line x1="0" y1="10" x2="4" y2="10" stroke="#888" strokeWidth="1.5" />
            <line x1="26" y1="10" x2="30" y2="10" stroke="#888" strokeWidth="1.5" />
          </symbol>

          {/* USB Connector */}
          <symbol id="usb" viewBox="0 0 35 20">
            <rect x="0" y="2" width="30" height="16" rx="2" fill="#333" stroke="#222" strokeWidth="0.5" />
            <rect x="2" y="5" width="25" height="10" fill="#888" stroke="#666" strokeWidth="0.3" />
            <rect x="4" y="7" width="3" height="6" fill="#444" />
            <rect x="30" y="4" width="5" height="12" fill="#888" stroke="#666" strokeWidth="0.3" />
          </symbol>

          {/* Voltage Regulator */}
          <symbol id="vreg" viewBox="0 0 25 30">
            <rect x="2" y="0" width="21" height="20" fill="#1a1a1a" stroke="#333" strokeWidth="0.5" />
            <rect x="0" y="2" width="25" height="4" fill="#333" />
            <circle cx="12.5" cy="4" r="2" fill="#1a1a1a" stroke="#444" strokeWidth="0.3" />
            <line x1="6" y1="20" x2="6" y2="30" stroke="#888" strokeWidth="1.2" />
            <line x1="12.5" y1="20" x2="12.5" y2="30" stroke="#888" strokeWidth="1.2" />
            <line x1="19" y1="20" x2="19" y2="30" stroke="#888" strokeWidth="1.2" />
            <text x="12.5" y="14" fontSize="4" fill="#888" textAnchor="middle">7805</text>
          </symbol>

          {/* Potentiometer */}
          <symbol id="pot" viewBox="0 0 25 25">
            <circle cx="12.5" cy="12.5" r="11" fill="#0066cc" stroke="#004499" strokeWidth="0.5" />
            <circle cx="12.5" cy="12.5" r="3" fill="#333" />
            <line x1="12.5" y1="3" x2="12.5" y2="9" stroke="#fff" strokeWidth="1" />
          </symbol>

          {/* Fuse */}
          <symbol id="fuse" viewBox="0 0 30 12">
            <rect x="2" y="2" width="26" height="8" rx="3" fill="#f5f5dc" stroke="#ccc" strokeWidth="0.5" />
            <ellipse cx="6" cy="6" rx="3" ry="3" fill="#c0c0c0" />
            <ellipse cx="24" cy="6" rx="3" ry="3" fill="#c0c0c0" />
            <line x1="8" y1="6" x2="22" y2="6" stroke="#888" strokeWidth="0.5" strokeDasharray="1,1" />
          </symbol>

          {/* Button/Switch */}
          <symbol id="button" viewBox="0 0 20 20">
            <rect x="2" y="8" width="16" height="10" fill="#333" stroke="#222" strokeWidth="0.5" />
            <rect x="4" y="2" width="12" height="8" rx="1" fill="#ff4444" stroke="#cc0000" strokeWidth="0.5" />
            <line x1="4" y1="18" x2="4" y2="20" stroke="#888" strokeWidth="1" />
            <line x1="10" y1="18" x2="10" y2="20" stroke="#888" strokeWidth="1" />
            <line x1="16" y1="18" x2="16" y2="20" stroke="#888" strokeWidth="1" />
          </symbol>
        </defs>
      </svg>

      {/* Dense scattered components */}
      <div className="absolute inset-0" style={{ opacity: 0.15 }}>
        {/* Row 1 */}
        <svg className="absolute top-[2%] left-[2%] w-12 h-8" style={{ transform: 'rotate(15deg)' }}><use href="#resistor-bands" /></svg>
        <svg className="absolute top-[5%] left-[12%] w-10 h-8" style={{ transform: 'rotate(-5deg)' }}><use href="#cap-ceramic" /></svg>
        <svg className="absolute top-[3%] left-[22%] w-14 h-10" style={{ transform: 'rotate(25deg)' }}><use href="#ic-chip" /></svg>
        <svg className="absolute top-[8%] left-[35%] w-8 h-10" style={{ transform: 'rotate(-10deg)' }}><use href="#cap-electrolytic" /></svg>
        <svg className="absolute top-[4%] left-[48%] w-10 h-6" style={{ transform: 'rotate(8deg)' }}><use href="#diode" /></svg>
        <svg className="absolute top-[6%] left-[58%] w-6 h-10" style={{ transform: 'rotate(-20deg)' }}><use href="#led" /></svg>
        <svg className="absolute top-[2%] left-[68%] w-12 h-12" style={{ transform: 'rotate(35deg)' }}><use href="#ic-qfp" /></svg>
        <svg className="absolute top-[7%] left-[80%] w-8 h-6" style={{ transform: 'rotate(-8deg)' }}><use href="#resistor-smd" /></svg>
        <svg className="absolute top-[4%] left-[92%] w-6 h-9" style={{ transform: 'rotate(12deg)' }}><use href="#transistor" /></svg>

        {/* Row 2 */}
        <svg className="absolute top-[14%] left-[5%] w-10 h-12" style={{ transform: 'rotate(-15deg)' }}><use href="#cap-electrolytic" /></svg>
        <svg className="absolute top-[16%] left-[18%] w-8 h-5" style={{ transform: 'rotate(22deg)' }}><use href="#diode" /></svg>
        <svg className="absolute top-[12%] left-[30%] w-6 h-9" style={{ transform: 'rotate(-30deg)' }}><use href="#led-green" /></svg>
        <svg className="absolute top-[18%] left-[42%] w-10 h-7" style={{ transform: 'rotate(5deg)' }}><use href="#inductor" /></svg>
        <svg className="absolute top-[14%] left-[55%] w-12 h-8" style={{ transform: 'rotate(-12deg)' }}><use href="#resistor-bands" /></svg>
        <svg className="absolute top-[17%] left-[70%] w-5 h-8" style={{ transform: 'rotate(18deg)' }}><use href="#crystal" /></svg>
        <svg className="absolute top-[13%] left-[82%] w-14 h-10" style={{ transform: 'rotate(-25deg)' }}><use href="#ic-chip" /></svg>
        <svg className="absolute top-[19%] left-[95%] w-9 h-6" style={{ transform: 'rotate(10deg)' }}><use href="#cap-ceramic" /></svg>

        {/* Row 3 */}
        <svg className="absolute top-[24%] left-[0%] w-14 h-10" style={{ transform: 'rotate(8deg)' }}><use href="#ic-chip" /></svg>
        <svg className="absolute top-[27%] left-[15%] w-7 h-10" style={{ transform: 'rotate(-18deg)' }}><use href="#transistor" /></svg>
        <svg className="absolute top-[22%] left-[26%] w-10 h-8" style={{ transform: 'rotate(30deg)' }}><use href="#resistor-bands" /></svg>
        <svg className="absolute top-[28%] left-[38%] w-8 h-8" style={{ transform: 'rotate(-5deg)' }}><use href="#pot" /></svg>
        <svg className="absolute top-[25%] left-[50%] w-10 h-11" style={{ transform: 'rotate(15deg)' }}><use href="#cap-electrolytic" /></svg>
        <svg className="absolute top-[23%] left-[62%] w-8 h-5" style={{ transform: 'rotate(-22deg)' }}><use href="#fuse" /></svg>
        <svg className="absolute top-[29%] left-[75%] w-6 h-9" style={{ transform: 'rotate(28deg)' }}><use href="#led" /></svg>
        <svg className="absolute top-[26%] left-[88%] w-12 h-12" style={{ transform: 'rotate(-10deg)' }}><use href="#ic-qfp" /></svg>

        {/* Row 4 */}
        <svg className="absolute top-[34%] left-[3%] w-8 h-6" style={{ transform: 'rotate(-20deg)' }}><use href="#diode" /></svg>
        <svg className="absolute top-[38%] left-[14%] w-9 h-6" style={{ transform: 'rotate(12deg)' }}><use href="#cap-ceramic" /></svg>
        <svg className="absolute top-[35%] left-[25%] w-12 h-12" style={{ transform: 'rotate(-35deg)' }}><use href="#ic-qfp" /></svg>
        <svg className="absolute top-[40%] left-[40%] w-7 h-10" style={{ transform: 'rotate(20deg)' }}><use href="#vreg" /></svg>
        <svg className="absolute top-[36%] left-[52%] w-10 h-7" style={{ transform: 'rotate(-8deg)' }}><use href="#resistor-bands" /></svg>
        <svg className="absolute top-[42%] left-[65%] w-6 h-6" style={{ transform: 'rotate(25deg)' }}><use href="#button" /></svg>
        <svg className="absolute top-[37%] left-[78%] w-8 h-10" style={{ transform: 'rotate(-15deg)' }}><use href="#cap-electrolytic" /></svg>
        <svg className="absolute top-[41%] left-[90%] w-6 h-9" style={{ transform: 'rotate(5deg)' }}><use href="#transistor" /></svg>

        {/* Row 5 */}
        <svg className="absolute top-[48%] left-[6%] w-5 h-8" style={{ transform: 'rotate(18deg)' }}><use href="#crystal" /></svg>
        <svg className="absolute top-[52%] left-[18%] w-14 h-10" style={{ transform: 'rotate(-12deg)' }}><use href="#ic-chip" /></svg>
        <svg className="absolute top-[49%] left-[32%] w-6 h-9" style={{ transform: 'rotate(32deg)' }}><use href="#led-green" /></svg>
        <svg className="absolute top-[54%] left-[45%] w-10 h-6" style={{ transform: 'rotate(-25deg)' }}><use href="#inductor" /></svg>
        <svg className="absolute top-[50%] left-[58%] w-8 h-5" style={{ transform: 'rotate(8deg)' }}><use href="#resistor-smd" /></svg>
        <svg className="absolute top-[55%] left-[70%] w-10 h-8" style={{ transform: 'rotate(-18deg)' }}><use href="#cap-ceramic" /></svg>
        <svg className="absolute top-[51%] left-[85%] w-8 h-5" style={{ transform: 'rotate(22deg)' }}><use href="#diode" /></svg>
        <svg className="absolute top-[47%] left-[95%] w-8 h-8" style={{ transform: 'rotate(-5deg)' }}><use href="#pot" /></svg>

        {/* Row 6 */}
        <svg className="absolute top-[60%] left-[0%] w-10 h-7" style={{ transform: 'rotate(-28deg)' }}><use href="#resistor-bands" /></svg>
        <svg className="absolute top-[64%] left-[12%] w-8 h-10" style={{ transform: 'rotate(15deg)' }}><use href="#cap-electrolytic" /></svg>
        <svg className="absolute top-[61%] left-[24%] w-6 h-9" style={{ transform: 'rotate(-8deg)' }}><use href="#led" /></svg>
        <svg className="absolute top-[66%] left-[36%] w-12 h-12" style={{ transform: 'rotate(40deg)' }}><use href="#ic-qfp" /></svg>
        <svg className="absolute top-[62%] left-[50%] w-7 h-10" style={{ transform: 'rotate(-20deg)' }}><use href="#transistor" /></svg>
        <svg className="absolute top-[68%] left-[62%] w-8 h-6" style={{ transform: 'rotate(10deg)' }}><use href="#fuse" /></svg>
        <svg className="absolute top-[63%] left-[75%] w-14 h-10" style={{ transform: 'rotate(-15deg)' }}><use href="#ic-chip" /></svg>
        <svg className="absolute top-[67%] left-[88%] w-5 h-8" style={{ transform: 'rotate(25deg)' }}><use href="#crystal" /></svg>

        {/* Row 7 */}
        <svg className="absolute top-[74%] left-[5%] w-12 h-12" style={{ transform: 'rotate(20deg)' }}><use href="#ic-qfp" /></svg>
        <svg className="absolute top-[78%] left-[18%] w-8 h-5" style={{ transform: 'rotate(-10deg)' }}><use href="#diode" /></svg>
        <svg className="absolute top-[75%] left-[30%] w-9 h-6" style={{ transform: 'rotate(35deg)' }}><use href="#cap-ceramic" /></svg>
        <svg className="absolute top-[80%] left-[42%] w-6 h-9" style={{ transform: 'rotate(-22deg)' }}><use href="#led-green" /></svg>
        <svg className="absolute top-[76%] left-[55%] w-10 h-8" style={{ transform: 'rotate(12deg)' }}><use href="#resistor-bands" /></svg>
        <svg className="absolute top-[82%] left-[68%] w-7 h-10" style={{ transform: 'rotate(-30deg)' }}><use href="#vreg" /></svg>
        <svg className="absolute top-[77%] left-[82%] w-8 h-10" style={{ transform: 'rotate(5deg)' }}><use href="#cap-electrolytic" /></svg>
        <svg className="absolute top-[73%] left-[94%] w-6 h-6" style={{ transform: 'rotate(-18deg)' }}><use href="#button" /></svg>

        {/* Row 8 */}
        <svg className="absolute top-[86%] left-[2%] w-10 h-7" style={{ transform: 'rotate(-5deg)' }}><use href="#inductor" /></svg>
        <svg className="absolute top-[90%] left-[15%] w-6 h-9" style={{ transform: 'rotate(28deg)' }}><use href="#transistor" /></svg>
        <svg className="absolute top-[87%] left-[28%] w-14 h-10" style={{ transform: 'rotate(-15deg)' }}><use href="#ic-chip" /></svg>
        <svg className="absolute top-[92%] left-[42%] w-8 h-8" style={{ transform: 'rotate(18deg)' }}><use href="#pot" /></svg>
        <svg className="absolute top-[88%] left-[56%] w-8 h-5" style={{ transform: 'rotate(-25deg)' }}><use href="#resistor-smd" /></svg>
        <svg className="absolute top-[94%] left-[68%] w-5 h="8" style={{ transform: 'rotate(10deg)' }}><use href="#crystal" /></svg>
        <svg className="absolute top-[89%] left-[80%] w-6 h-9" style={{ transform: 'rotate(-8deg)' }}><use href="#led" /></svg>
        <svg className="absolute top-[93%] left-[92%] w-8 h-5" style={{ transform: 'rotate(22deg)' }}><use href="#diode" /></svg>
      </div>
    </div>
  );
};

export default ElectronicComponentsPattern;
