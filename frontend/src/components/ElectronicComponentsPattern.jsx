import React from 'react';

// Transparent outline-only Electronic Components Pattern - Watermark style
const ElectronicComponentsPattern = ({ className = '' }) => {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <svg
        className="absolute w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Ceramic Capacitor - outline only */}
          <symbol id="cap-ceramic" viewBox="0 0 30 20">
            <rect x="2" y="4" width="26" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1" />
            <rect x="0" y="6" width="3" height="8" fill="none" stroke="currentColor" strokeWidth="0.8" />
            <rect x="27" y="6" width="3" height="8" fill="none" stroke="currentColor" strokeWidth="0.8" />
          </symbol>

          {/* Electrolytic Capacitor - outline only */}
          <symbol id="cap-electrolytic" viewBox="0 0 25 35">
            <ellipse cx="12.5" cy="5" rx="10" ry="4" fill="none" stroke="currentColor" strokeWidth="1" />
            <rect x="2.5" y="5" width="20" height="25" fill="none" stroke="currentColor" strokeWidth="1" />
            <ellipse cx="12.5" cy="30" rx="10" ry="4" fill="none" stroke="currentColor" strokeWidth="1" />
            <line x1="6" y1="32" x2="6" y2="35" stroke="currentColor" strokeWidth="1" />
            <line x1="19" y1="32" x2="19" y2="35" stroke="currentColor" strokeWidth="1" />
            <line x1="7" y1="10" x2="7" y2="24" stroke="currentColor" strokeWidth="0.5" />
          </symbol>

          {/* Resistor with bands - outline only */}
          <symbol id="resistor-bands" viewBox="0 0 50 16">
            <line x1="0" y1="8" x2="10" y2="8" stroke="currentColor" strokeWidth="1" />
            <rect x="10" y="2" width="30" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1" />
            <line x1="15" y1="2" x2="15" y2="14" stroke="currentColor" strokeWidth="0.8" />
            <line x1="21" y1="2" x2="21" y2="14" stroke="currentColor" strokeWidth="0.8" />
            <line x1="27" y1="2" x2="27" y2="14" stroke="currentColor" strokeWidth="0.8" />
            <line x1="35" y1="2" x2="35" y2="14" stroke="currentColor" strokeWidth="0.5" />
            <line x1="40" y1="8" x2="50" y2="8" stroke="currentColor" strokeWidth="1" />
          </symbol>

          {/* SMD Resistor - outline only */}
          <symbol id="resistor-smd" viewBox="0 0 24 12">
            <rect x="0" y="2" width="24" height="8" rx="1" fill="none" stroke="currentColor" strokeWidth="1" />
            <line x1="5" y1="2" x2="5" y2="10" stroke="currentColor" strokeWidth="0.8" />
            <line x1="19" y1="2" x2="19" y2="10" stroke="currentColor" strokeWidth="0.8" />
          </symbol>

          {/* IC Chip DIP - outline only */}
          <symbol id="ic-chip" viewBox="0 0 50 30">
            <rect x="5" y="2" width="40" height="26" rx="1" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="10" cy="8" r="2" fill="none" stroke="currentColor" strokeWidth="0.8" />
            {/* Left pins */}
            <line x1="0" y1="6" x2="5" y2="6" stroke="currentColor" strokeWidth="0.8" />
            <line x1="0" y1="11" x2="5" y2="11" stroke="currentColor" strokeWidth="0.8" />
            <line x1="0" y1="16" x2="5" y2="16" stroke="currentColor" strokeWidth="0.8" />
            <line x1="0" y1="21" x2="5" y2="21" stroke="currentColor" strokeWidth="0.8" />
            {/* Right pins */}
            <line x1="45" y1="6" x2="50" y2="6" stroke="currentColor" strokeWidth="0.8" />
            <line x1="45" y1="11" x2="50" y2="11" stroke="currentColor" strokeWidth="0.8" />
            <line x1="45" y1="16" x2="50" y2="16" stroke="currentColor" strokeWidth="0.8" />
            <line x1="45" y1="21" x2="50" y2="21" stroke="currentColor" strokeWidth="0.8" />
          </symbol>

          {/* QFP IC - outline only */}
          <symbol id="ic-qfp" viewBox="0 0 40 40">
            <rect x="8" y="8" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="12" cy="12" r="1.5" fill="none" stroke="currentColor" strokeWidth="0.6" />
            {/* Top pins */}
            <line x1="12" y1="2" x2="12" y2="8" stroke="currentColor" strokeWidth="0.6" />
            <line x1="16" y1="2" x2="16" y2="8" stroke="currentColor" strokeWidth="0.6" />
            <line x1="20" y1="2" x2="20" y2="8" stroke="currentColor" strokeWidth="0.6" />
            <line x1="24" y1="2" x2="24" y2="8" stroke="currentColor" strokeWidth="0.6" />
            <line x1="28" y1="2" x2="28" y2="8" stroke="currentColor" strokeWidth="0.6" />
            {/* Bottom pins */}
            <line x1="12" y1="32" x2="12" y2="38" stroke="currentColor" strokeWidth="0.6" />
            <line x1="16" y1="32" x2="16" y2="38" stroke="currentColor" strokeWidth="0.6" />
            <line x1="20" y1="32" x2="20" y2="38" stroke="currentColor" strokeWidth="0.6" />
            <line x1="24" y1="32" x2="24" y2="38" stroke="currentColor" strokeWidth="0.6" />
            <line x1="28" y1="32" x2="28" y2="38" stroke="currentColor" strokeWidth="0.6" />
            {/* Left pins */}
            <line x1="2" y1="12" x2="8" y2="12" stroke="currentColor" strokeWidth="0.6" />
            <line x1="2" y1="16" x2="8" y2="16" stroke="currentColor" strokeWidth="0.6" />
            <line x1="2" y1="20" x2="8" y2="20" stroke="currentColor" strokeWidth="0.6" />
            <line x1="2" y1="24" x2="8" y2="24" stroke="currentColor" strokeWidth="0.6" />
            <line x1="2" y1="28" x2="8" y2="28" stroke="currentColor" strokeWidth="0.6" />
            {/* Right pins */}
            <line x1="32" y1="12" x2="38" y2="12" stroke="currentColor" strokeWidth="0.6" />
            <line x1="32" y1="16" x2="38" y2="16" stroke="currentColor" strokeWidth="0.6" />
            <line x1="32" y1="20" x2="38" y2="20" stroke="currentColor" strokeWidth="0.6" />
            <line x1="32" y1="24" x2="38" y2="24" stroke="currentColor" strokeWidth="0.6" />
            <line x1="32" y1="28" x2="38" y2="28" stroke="currentColor" strokeWidth="0.6" />
          </symbol>

          {/* Diode - outline only */}
          <symbol id="diode" viewBox="0 0 30 12">
            <line x1="0" y1="6" x2="8" y2="6" stroke="currentColor" strokeWidth="1" />
            <rect x="8" y="1" width="14" height="10" rx="1" fill="none" stroke="currentColor" strokeWidth="1" />
            <line x1="10" y1="1" x2="10" y2="11" stroke="currentColor" strokeWidth="0.8" />
            <line x1="22" y1="6" x2="30" y2="6" stroke="currentColor" strokeWidth="1" />
          </symbol>

          {/* LED - outline only */}
          <symbol id="led" viewBox="0 0 20 30">
            <ellipse cx="10" cy="10" rx="8" ry="8" fill="none" stroke="currentColor" strokeWidth="1" />
            <ellipse cx="10" cy="8" rx="4" ry="3" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <rect x="6" y="18" width="8" height="6" fill="none" stroke="currentColor" strokeWidth="0.8" />
            <line x1="8" y1="24" x2="8" y2="30" stroke="currentColor" strokeWidth="0.8" />
            <line x1="12" y1="24" x2="12" y2="30" stroke="currentColor" strokeWidth="0.8" />
            {/* Light rays */}
            <line x1="18" y1="4" x2="22" y2="0" stroke="currentColor" strokeWidth="0.5" />
            <line x1="20" y1="8" x2="24" y2="6" stroke="currentColor" strokeWidth="0.5" />
          </symbol>

          {/* Transistor TO-92 - outline only */}
          <symbol id="transistor" viewBox="0 0 20 28">
            <path d="M3,2 L17,2 L17,14 Q10,18 3,14 Z" fill="none" stroke="currentColor" strokeWidth="1" />
            <line x1="6" y1="14" x2="6" y2="28" stroke="currentColor" strokeWidth="0.8" />
            <line x1="10" y1="16" x2="10" y2="28" stroke="currentColor" strokeWidth="0.8" />
            <line x1="14" y1="14" x2="14" y2="28" stroke="currentColor" strokeWidth="0.8" />
          </symbol>

          {/* Crystal - outline only */}
          <symbol id="crystal" viewBox="0 0 16 30">
            <rect x="2" y="4" width="12" height="22" rx="1" fill="none" stroke="currentColor" strokeWidth="1" />
            <rect x="4" y="6" width="8" height="18" fill="none" stroke="currentColor" strokeWidth="0.6" />
            <line x1="6" y1="0" x2="6" y2="4" stroke="currentColor" strokeWidth="0.8" />
            <line x1="10" y1="0" x2="10" y2="4" stroke="currentColor" strokeWidth="0.8" />
          </symbol>

          {/* Inductor - outline only */}
          <symbol id="inductor" viewBox="0 0 30 20">
            <rect x="4" y="4" width="22" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1" />
            <ellipse cx="15" cy="10" rx="7" ry="4" fill="none" stroke="currentColor" strokeWidth="0.8" />
            <line x1="0" y1="10" x2="4" y2="10" stroke="currentColor" strokeWidth="1" />
            <line x1="26" y1="10" x2="30" y2="10" stroke="currentColor" strokeWidth="1" />
          </symbol>

          {/* Potentiometer - outline only */}
          <symbol id="pot" viewBox="0 0 25 25">
            <circle cx="12.5" cy="12.5" r="11" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="12.5" cy="12.5" r="4" fill="none" stroke="currentColor" strokeWidth="0.8" />
            <line x1="12.5" y1="3" x2="12.5" y2="8" stroke="currentColor" strokeWidth="0.8" />
          </symbol>

          {/* Fuse - outline only */}
          <symbol id="fuse" viewBox="0 0 30 12">
            <rect x="2" y="2" width="26" height="8" rx="3" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="6" cy="6" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="0.6" />
            <circle cx="24" cy="6" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="0.6" />
            <line x1="9" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2,1" />
          </symbol>

          {/* Button - outline only */}
          <symbol id="button" viewBox="0 0 20 20">
            <rect x="2" y="8" width="16" height="10" fill="none" stroke="currentColor" strokeWidth="1" />
            <rect x="4" y="2" width="12" height="8" rx="1" fill="none" stroke="currentColor" strokeWidth="1" />
            <line x1="4" y1="18" x2="4" y2="22" stroke="currentColor" strokeWidth="0.8" />
            <line x1="10" y1="18" x2="10" y2="22" stroke="currentColor" strokeWidth="0.8" />
            <line x1="16" y1="18" x2="16" y2="22" stroke="currentColor" strokeWidth="0.8" />
          </symbol>

          {/* Voltage Regulator - outline only */}
          <symbol id="vreg" viewBox="0 0 25 30">
            <rect x="2" y="0" width="21" height="18" fill="none" stroke="currentColor" strokeWidth="1" />
            <rect x="0" y="2" width="25" height="4" fill="none" stroke="currentColor" strokeWidth="0.8" />
            <circle cx="12.5" cy="4" r="2" fill="none" stroke="currentColor" strokeWidth="0.6" />
            <line x1="6" y1="18" x2="6" y2="30" stroke="currentColor" strokeWidth="0.8" />
            <line x1="12.5" y1="18" x2="12.5" y2="30" stroke="currentColor" strokeWidth="0.8" />
            <line x1="19" y1="18" x2="19" y2="30" stroke="currentColor" strokeWidth="0.8" />
          </symbol>
        </defs>
      </svg>

      {/* Dense scattered components - outline watermark style */}
      <div className="absolute inset-0 text-slate-500" style={{ opacity: 0.22 }}>
        {/* Row 1 */}
        <svg className="absolute top-[2%] left-[2%] w-14 h-10" style={{ transform: 'rotate(15deg)' }}><use href="#resistor-bands" /></svg>
        <svg className="absolute top-[5%] left-[12%] w-12 h-10" style={{ transform: 'rotate(-5deg)' }}><use href="#cap-ceramic" /></svg>
        <svg className="absolute top-[3%] left-[22%] w-16 h-12" style={{ transform: 'rotate(25deg)' }}><use href="#ic-chip" /></svg>
        <svg className="absolute top-[8%] left-[35%] w-10 h-14" style={{ transform: 'rotate(-10deg)' }}><use href="#cap-electrolytic" /></svg>
        <svg className="absolute top-[4%] left-[48%] w-12 h-8" style={{ transform: 'rotate(8deg)' }}><use href="#diode" /></svg>
        <svg className="absolute top-[6%] left-[58%] w-8 h-12" style={{ transform: 'rotate(-20deg)' }}><use href="#led" /></svg>
        <svg className="absolute top-[2%] left-[68%] w-14 h-14" style={{ transform: 'rotate(35deg)' }}><use href="#ic-qfp" /></svg>
        <svg className="absolute top-[7%] left-[80%] w-10 h-8" style={{ transform: 'rotate(-8deg)' }}><use href="#resistor-smd" /></svg>
        <svg className="absolute top-[4%] left-[92%] w-8 h-12" style={{ transform: 'rotate(12deg)' }}><use href="#transistor" /></svg>

        {/* Row 2 */}
        <svg className="absolute top-[14%] left-[5%] w-10 h-14" style={{ transform: 'rotate(-15deg)' }}><use href="#cap-electrolytic" /></svg>
        <svg className="absolute top-[16%] left-[18%] w-10 h-7" style={{ transform: 'rotate(22deg)' }}><use href="#diode" /></svg>
        <svg className="absolute top-[12%] left-[30%] w-8 h-12" style={{ transform: 'rotate(-30deg)' }}><use href="#led" /></svg>
        <svg className="absolute top-[18%] left-[42%] w-12 h-10" style={{ transform: 'rotate(5deg)' }}><use href="#inductor" /></svg>
        <svg className="absolute top-[14%] left-[55%] w-14 h-10" style={{ transform: 'rotate(-12deg)' }}><use href="#resistor-bands" /></svg>
        <svg className="absolute top-[17%] left-[70%] w-6 h-12" style={{ transform: 'rotate(18deg)' }}><use href="#crystal" /></svg>
        <svg className="absolute top-[13%] left-[82%] w-16 h-12" style={{ transform: 'rotate(-25deg)' }}><use href="#ic-chip" /></svg>
        <svg className="absolute top-[19%] left-[95%] w-10 h-8" style={{ transform: 'rotate(10deg)' }}><use href="#cap-ceramic" /></svg>

        {/* Row 3 */}
        <svg className="absolute top-[24%] left-[0%] w-16 h-12" style={{ transform: 'rotate(8deg)' }}><use href="#ic-chip" /></svg>
        <svg className="absolute top-[27%] left-[15%] w-8 h-12" style={{ transform: 'rotate(-18deg)' }}><use href="#transistor" /></svg>
        <svg className="absolute top-[22%] left-[26%] w-14 h-10" style={{ transform: 'rotate(30deg)' }}><use href="#resistor-bands" /></svg>
        <svg className="absolute top-[28%] left-[38%] w-10 h-10" style={{ transform: 'rotate(-5deg)' }}><use href="#pot" /></svg>
        <svg className="absolute top-[25%] left-[50%] w-10 h-14" style={{ transform: 'rotate(15deg)' }}><use href="#cap-electrolytic" /></svg>
        <svg className="absolute top-[23%] left-[62%] w-12 h-8" style={{ transform: 'rotate(-22deg)' }}><use href="#fuse" /></svg>
        <svg className="absolute top-[29%] left-[75%] w-8 h-12" style={{ transform: 'rotate(28deg)' }}><use href="#led" /></svg>
        <svg className="absolute top-[26%] left-[88%] w-14 h-14" style={{ transform: 'rotate(-10deg)' }}><use href="#ic-qfp" /></svg>

        {/* Row 4 */}
        <svg className="absolute top-[34%] left-[3%] w-10 h-8" style={{ transform: 'rotate(-20deg)' }}><use href="#diode" /></svg>
        <svg className="absolute top-[38%] left-[14%] w-11 h-8" style={{ transform: 'rotate(12deg)' }}><use href="#cap-ceramic" /></svg>
        <svg className="absolute top-[35%] left-[25%] w-14 h-14" style={{ transform: 'rotate(-35deg)' }}><use href="#ic-qfp" /></svg>
        <svg className="absolute top-[40%] left-[40%] w-10 h-14" style={{ transform: 'rotate(20deg)' }}><use href="#vreg" /></svg>
        <svg className="absolute top-[36%] left-[52%] w-14 h-10" style={{ transform: 'rotate(-8deg)' }}><use href="#resistor-bands" /></svg>
        <svg className="absolute top-[42%] left-[65%] w-8 h-10" style={{ transform: 'rotate(25deg)' }}><use href="#button" /></svg>
        <svg className="absolute top-[37%] left-[78%] w-10 h-14" style={{ transform: 'rotate(-15deg)' }}><use href="#cap-electrolytic" /></svg>
        <svg className="absolute top-[41%] left-[90%] w-8 h-12" style={{ transform: 'rotate(5deg)' }}><use href="#transistor" /></svg>

        {/* Row 5 */}
        <svg className="absolute top-[48%] left-[6%] w-6 h-12" style={{ transform: 'rotate(18deg)' }}><use href="#crystal" /></svg>
        <svg className="absolute top-[52%] left-[18%] w-16 h-12" style={{ transform: 'rotate(-12deg)' }}><use href="#ic-chip" /></svg>
        <svg className="absolute top-[49%] left-[32%] w-8 h-12" style={{ transform: 'rotate(32deg)' }}><use href="#led" /></svg>
        <svg className="absolute top-[54%] left-[45%] w-12 h-10" style={{ transform: 'rotate(-25deg)' }}><use href="#inductor" /></svg>
        <svg className="absolute top-[50%] left-[58%] w-10 h-8" style={{ transform: 'rotate(8deg)' }}><use href="#resistor-smd" /></svg>
        <svg className="absolute top-[55%] left-[70%] w-12 h-10" style={{ transform: 'rotate(-18deg)' }}><use href="#cap-ceramic" /></svg>
        <svg className="absolute top-[51%] left-[85%] w-10 h-8" style={{ transform: 'rotate(22deg)' }}><use href="#diode" /></svg>
        <svg className="absolute top-[47%] left-[95%] w-10 h-10" style={{ transform: 'rotate(-5deg)' }}><use href="#pot" /></svg>

        {/* Row 6 */}
        <svg className="absolute top-[60%] left-[0%] w-14 h-10" style={{ transform: 'rotate(-28deg)' }}><use href="#resistor-bands" /></svg>
        <svg className="absolute top-[64%] left-[12%] w-10 h-14" style={{ transform: 'rotate(15deg)' }}><use href="#cap-electrolytic" /></svg>
        <svg className="absolute top-[61%] left-[24%] w-8 h-12" style={{ transform: 'rotate(-8deg)' }}><use href="#led" /></svg>
        <svg className="absolute top-[66%] left-[36%] w-14 h-14" style={{ transform: 'rotate(40deg)' }}><use href="#ic-qfp" /></svg>
        <svg className="absolute top-[62%] left-[50%] w-8 h-12" style={{ transform: 'rotate(-20deg)' }}><use href="#transistor" /></svg>
        <svg className="absolute top-[68%] left-[62%] w-12 h-8" style={{ transform: 'rotate(10deg)' }}><use href="#fuse" /></svg>
        <svg className="absolute top-[63%] left-[75%] w-16 h-12" style={{ transform: 'rotate(-15deg)' }}><use href="#ic-chip" /></svg>
        <svg className="absolute top-[67%] left-[88%] w-6 h-12" style={{ transform: 'rotate(25deg)' }}><use href="#crystal" /></svg>

        {/* Row 7 */}
        <svg className="absolute top-[74%] left-[5%] w-14 h-14" style={{ transform: 'rotate(20deg)' }}><use href="#ic-qfp" /></svg>
        <svg className="absolute top-[78%] left-[18%] w-10 h-7" style={{ transform: 'rotate(-10deg)' }}><use href="#diode" /></svg>
        <svg className="absolute top-[75%] left-[30%] w-11 h-8" style={{ transform: 'rotate(35deg)' }}><use href="#cap-ceramic" /></svg>
        <svg className="absolute top-[80%] left-[42%] w-8 h-12" style={{ transform: 'rotate(-22deg)' }}><use href="#led" /></svg>
        <svg className="absolute top-[76%] left-[55%] w-14 h-10" style={{ transform: 'rotate(12deg)' }}><use href="#resistor-bands" /></svg>
        <svg className="absolute top-[82%] left-[68%] w-10 h-14" style={{ transform: 'rotate(-30deg)' }}><use href="#vreg" /></svg>
        <svg className="absolute top-[77%] left-[82%] w-10 h-14" style={{ transform: 'rotate(5deg)' }}><use href="#cap-electrolytic" /></svg>
        <svg className="absolute top-[73%] left-[94%] w-8 h-10" style={{ transform: 'rotate(-18deg)' }}><use href="#button" /></svg>

        {/* Row 8 */}
        <svg className="absolute top-[86%] left-[2%] w-12 h-10" style={{ transform: 'rotate(-5deg)' }}><use href="#inductor" /></svg>
        <svg className="absolute top-[90%] left-[15%] w-8 h-12" style={{ transform: 'rotate(28deg)' }}><use href="#transistor" /></svg>
        <svg className="absolute top-[87%] left-[28%] w-16 h-12" style={{ transform: 'rotate(-15deg)' }}><use href="#ic-chip" /></svg>
        <svg className="absolute top-[92%] left-[42%] w-10 h-10" style={{ transform: 'rotate(18deg)' }}><use href="#pot" /></svg>
        <svg className="absolute top-[88%] left-[56%] w-10 h-8" style={{ transform: 'rotate(-25deg)' }}><use href="#resistor-smd" /></svg>
        <svg className="absolute top-[94%] left-[68%] w-6 h-12" style={{ transform: 'rotate(10deg)' }}><use href="#crystal" /></svg>
        <svg className="absolute top-[89%] left-[80%] w-8 h-12" style={{ transform: 'rotate(-8deg)' }}><use href="#led" /></svg>
        <svg className="absolute top-[93%] left-[92%] w-10 h-7" style={{ transform: 'rotate(22deg)' }}><use href="#diode" /></svg>
      </div>
    </div>
  );
};

export default ElectronicComponentsPattern;
