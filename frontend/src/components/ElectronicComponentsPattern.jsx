import React from 'react';

// SVG patterns for electronic components
const ElectronicComponentsPattern = ({ className = '' }) => {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <svg
        className="absolute w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Capacitor Symbol */}
          <symbol id="capacitor" viewBox="0 0 40 40">
            <line x1="10" y1="20" x2="17" y2="20" stroke="currentColor" strokeWidth="1.5" />
            <line x1="17" y1="10" x2="17" y2="30" stroke="currentColor" strokeWidth="1.5" />
            <line x1="23" y1="10" x2="23" y2="30" stroke="currentColor" strokeWidth="1.5" />
            <line x1="23" y1="20" x2="30" y2="20" stroke="currentColor" strokeWidth="1.5" />
          </symbol>

          {/* Resistor Symbol */}
          <symbol id="resistor" viewBox="0 0 50 30">
            <line x1="0" y1="15" x2="10" y2="15" stroke="currentColor" strokeWidth="1.5" />
            <polyline 
              points="10,15 13,5 17,25 21,5 25,25 29,5 33,25 37,5 40,15" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5"
            />
            <line x1="40" y1="15" x2="50" y2="15" stroke="currentColor" strokeWidth="1.5" />
          </symbol>

          {/* Diode Symbol */}
          <symbol id="diode" viewBox="0 0 40 30">
            <line x1="5" y1="15" x2="15" y2="15" stroke="currentColor" strokeWidth="1.5" />
            <polygon points="15,5 15,25 30,15" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <line x1="30" y1="5" x2="30" y2="25" stroke="currentColor" strokeWidth="1.5" />
            <line x1="30" y1="15" x2="35" y2="15" stroke="currentColor" strokeWidth="1.5" />
          </symbol>

          {/* IC Chip Symbol */}
          <symbol id="chip" viewBox="0 0 50 40">
            <rect x="10" y="5" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.5" rx="2" />
            {/* Left pins */}
            <line x1="2" y1="10" x2="10" y2="10" stroke="currentColor" strokeWidth="1.5" />
            <line x1="2" y1="20" x2="10" y2="20" stroke="currentColor" strokeWidth="1.5" />
            <line x1="2" y1="30" x2="10" y2="30" stroke="currentColor" strokeWidth="1.5" />
            {/* Right pins */}
            <line x1="40" y1="10" x2="48" y2="10" stroke="currentColor" strokeWidth="1.5" />
            <line x1="40" y1="20" x2="48" y2="20" stroke="currentColor" strokeWidth="1.5" />
            <line x1="40" y1="30" x2="48" y2="30" stroke="currentColor" strokeWidth="1.5" />
            {/* Notch */}
            <circle cx="25" cy="10" r="3" fill="none" stroke="currentColor" strokeWidth="1" />
          </symbol>

          {/* Transistor Symbol */}
          <symbol id="transistor" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="15" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <line x1="5" y1="20" x2="15" y2="20" stroke="currentColor" strokeWidth="1.5" />
            <line x1="15" y1="10" x2="15" y2="30" stroke="currentColor" strokeWidth="1.5" />
            <line x1="15" y1="12" x2="28" y2="6" stroke="currentColor" strokeWidth="1.5" />
            <line x1="15" y1="28" x2="28" y2="34" stroke="currentColor" strokeWidth="1.5" />
            {/* Arrow */}
            <polygon points="24,30 28,34 22,34" fill="currentColor" />
          </symbol>

          {/* Inductor/Coil Symbol */}
          <symbol id="inductor" viewBox="0 0 50 20">
            <line x1="0" y1="10" x2="8" y2="10" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8,10 Q12,0 16,10 Q20,20 24,10 Q28,0 32,10 Q36,20 40,10" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <line x1="40" y1="10" x2="50" y2="10" stroke="currentColor" strokeWidth="1.5" />
          </symbol>

          {/* LED Symbol */}
          <symbol id="led" viewBox="0 0 45 35">
            <line x1="5" y1="17" x2="15" y2="17" stroke="currentColor" strokeWidth="1.5" />
            <polygon points="15,7 15,27 30,17" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <line x1="30" y1="7" x2="30" y2="27" stroke="currentColor" strokeWidth="1.5" />
            <line x1="30" y1="17" x2="40" y2="17" stroke="currentColor" strokeWidth="1.5" />
            {/* Light rays */}
            <line x1="25" y1="5" x2="30" y2="0" stroke="currentColor" strokeWidth="1" />
            <line x1="30" y1="3" x2="35" y2="0" stroke="currentColor" strokeWidth="1" />
            <polygon points="29,1 32,0 30,3" fill="currentColor" />
            <polygon points="34,1 37,0 35,3" fill="currentColor" />
          </symbol>

          {/* Fuse Symbol */}
          <symbol id="fuse" viewBox="0 0 40 20">
            <line x1="0" y1="10" x2="8" y2="10" stroke="currentColor" strokeWidth="1.5" />
            <rect x="8" y="5" width="24" height="10" fill="none" stroke="currentColor" strokeWidth="1.5" rx="2" />
            <line x1="12" y1="10" x2="28" y2="10" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2" />
            <line x1="32" y1="10" x2="40" y2="10" stroke="currentColor" strokeWidth="1.5" />
          </symbol>
        </defs>
      </svg>

      {/* Scattered Components Pattern */}
      <div className="absolute inset-0 text-slate-300/50">
        {/* Row 1 */}
        <svg className="absolute top-[5%] left-[5%] w-16 h-12 rotate-12 opacity-70">
          <use href="#capacitor" />
        </svg>
        <svg className="absolute top-[8%] left-[25%] w-20 h-12 -rotate-6 opacity-60">
          <use href="#resistor" />
        </svg>
        <svg className="absolute top-[3%] left-[45%] w-20 h-16 rotate-45 opacity-50">
          <use href="#chip" />
        </svg>
        <svg className="absolute top-[10%] left-[70%] w-16 h-12 -rotate-15 opacity-65">
          <use href="#diode" />
        </svg>
        <svg className="absolute top-[5%] left-[88%] w-16 h-16 rotate-30 opacity-55">
          <use href="#transistor" />
        </svg>

        {/* Row 2 */}
        <svg className="absolute top-[20%] left-[10%] w-16 h-12 -rotate-20 opacity-60">
          <use href="#diode" />
        </svg>
        <svg className="absolute top-[25%] left-[35%] w-20 h-10 rotate-8 opacity-55">
          <use href="#inductor" />
        </svg>
        <svg className="absolute top-[18%] left-[55%] w-16 h-12 -rotate-12 opacity-65">
          <use href="#capacitor" />
        </svg>
        <svg className="absolute top-[22%] left-[80%] w-18 h-14 rotate-25 opacity-50">
          <use href="#led" />
        </svg>

        {/* Row 3 */}
        <svg className="absolute top-[35%] left-[3%] w-24 h-18 rotate-5 opacity-55">
          <use href="#chip" />
        </svg>
        <svg className="absolute top-[40%] left-[20%] w-16 h-16 -rotate-30 opacity-60">
          <use href="#transistor" />
        </svg>
        <svg className="absolute top-[38%] left-[42%] w-16 h-8 rotate-15 opacity-65">
          <use href="#fuse" />
        </svg>
        <svg className="absolute top-[32%] left-[65%] w-20 h-12 -rotate-8 opacity-55">
          <use href="#resistor" />
        </svg>
        <svg className="absolute top-[40%] left-[92%] w-16 h-12 rotate-20 opacity-60">
          <use href="#capacitor" />
        </svg>

        {/* Row 4 */}
        <svg className="absolute top-[52%] left-[8%] w-18 h-14 -rotate-5 opacity-65">
          <use href="#led" />
        </svg>
        <svg className="absolute top-[55%] left-[30%] w-16 h-12 rotate-35 opacity-50">
          <use href="#diode" />
        </svg>
        <svg className="absolute top-[50%] left-[52%] w-16 h-16 -rotate-25 opacity-60">
          <use href="#transistor" />
        </svg>
        <svg className="absolute top-[58%] left-[75%] w-20 h-10 rotate-10 opacity-55">
          <use href="#inductor" />
        </svg>

        {/* Row 5 */}
        <svg className="absolute top-[68%] left-[2%] w-20 h-12 rotate-18 opacity-60">
          <use href="#resistor" />
        </svg>
        <svg className="absolute top-[72%] left-[22%] w-16 h-12 -rotate-15 opacity-55">
          <use href="#capacitor" />
        </svg>
        <svg className="absolute top-[65%] left-[40%] w-24 h-18 rotate-3 opacity-65">
          <use href="#chip" />
        </svg>
        <svg className="absolute top-[70%] left-[62%] w-16 h-8 -rotate-10 opacity-50">
          <use href="#fuse" />
        </svg>
        <svg className="absolute top-[68%] left-[85%] w-16 h-12 rotate-40 opacity-60">
          <use href="#diode" />
        </svg>

        {/* Row 6 */}
        <svg className="absolute top-[82%] left-[12%] w-16 h-16 -rotate-22 opacity-55">
          <use href="#transistor" />
        </svg>
        <svg className="absolute top-[85%] left-[35%] w-18 h-14 rotate-12 opacity-65">
          <use href="#led" />
        </svg>
        <svg className="absolute top-[80%] left-[58%] w-16 h-12 -rotate-8 opacity-60">
          <use href="#capacitor" />
        </svg>
        <svg className="absolute top-[88%] left-[78%] w-20 h-12 rotate-28 opacity-50">
          <use href="#resistor" />
        </svg>
        <svg className="absolute top-[83%] left-[95%] w-20 h-10 -rotate-5 opacity-55">
          <use href="#inductor" />
        </svg>
      </div>
    </div>
  );
};

export default ElectronicComponentsPattern;
