import React from 'react';

// Level 1: Parking lot with cars, barrier, buildings
export const ParkingTreasureScene: React.FC = React.memo(() => (
  <svg viewBox="0 0 300 200" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
    <rect x="0" y="0" width="300" height="60" fill="hsl(200,65%,82%)" />
    <circle cx="260" cy="25" r="14" fill="hsl(48,90%,68%)" />
    <rect x="0" y="60" width="300" height="140" fill="hsl(220,10%,48%)" />
    {/* Parking lines */}
    {[40, 100, 160, 220].map(x => (
      <rect key={x} x={x} y="60" width="2" height="140" fill="hsl(48,70%,65%)" opacity="0.5" />
    ))}
    {/* Parked cars */}
    <rect x="50" y="80" width="30" height="16" rx="4" fill="hsl(0,55%,50%)" />
    <rect x="110" y="120" width="30" height="16" rx="4" fill="hsl(195,55%,50%)" />
    <rect x="230" y="80" width="30" height="16" rx="4" fill="hsl(142,45%,45%)" />
    {/* Buildings */}
    <rect x="10" y="15" width="50" height="45" rx="3" fill="hsl(30,25%,60%)" />
    <rect x="15" y="22" width="8" height="8" rx="1" fill="hsl(195,50%,70%)" />
    <rect x="30" y="22" width="8" height="8" rx="1" fill="hsl(195,50%,70%)" />
    {/* Barrier */}
    <rect x="145" y="90" width="10" height="30" rx="2" fill="hsl(220,15%,42%)" opacity="0.5" />
    <rect x="152" y="94" width="50" height="5" rx="2" fill="hsl(0,65%,50%)" opacity="0.5" />
    {/* Trees */}
    <circle cx="280" cy="45" r="12" fill="hsl(142,35%,50%)" />
    <rect x="278" y="52" width="4" height="10" fill="hsl(30,35%,35%)" />
  </svg>
));

// Level 2: Mall basement with pillars, dim lighting
export const MallBasementScene: React.FC = React.memo(() => (
  <svg viewBox="0 0 300 200" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
    {/* Dark ceiling */}
    <rect x="0" y="0" width="300" height="30" fill="hsl(220,15%,25%)" />
    {/* Dim background */}
    <rect x="0" y="30" width="300" height="170" fill="hsl(220,10%,35%)" />
    {/* Ceiling lights */}
    {[60, 150, 240].map(x => (
      <React.Fragment key={x}>
        <rect x={x - 15} y="28" width="30" height="5" rx="1" fill="hsl(48,70%,65%)" />
        <ellipse cx={x} cy="60" rx="30" ry="20" fill="hsl(48,60%,70%)" opacity="0.08" />
      </React.Fragment>
    ))}
    {/* Concrete pillars */}
    {[50, 150, 250].map(x => (
      <rect key={x} x={x - 8} y="30" width="16" height="170" fill="hsl(220,8%,55%)" stroke="hsl(220,8%,45%)" strokeWidth="1" />
    ))}
    {/* Parked cars */}
    <rect x="70" y="120" width="28" height="14" rx="4" fill="hsl(220,50%,45%)" />
    <rect x="180" y="100" width="28" height="14" rx="4" fill="hsl(0,45%,45%)" />
    {/* Parking P sign */}
    <rect x="268" y="45" width="18" height="18" rx="2" fill="hsl(220,60%,50%)" />
    <text x="277" y="58" fontSize="12" fill="white" textAnchor="middle" fontWeight="bold">P</text>
    {/* Barrier */}
    <rect x="130" y="130" width="8" height="25" rx="1" fill="hsl(220,15%,40%)" opacity="0.5" />
    <rect x="136" y="134" width="45" height="4" rx="2" fill="hsl(0,60%,50%)" opacity="0.5" />
  </svg>
));

// Level 3: School gate with building, fence, trees
export const SchoolGateScene: React.FC = React.memo(() => (
  <svg viewBox="0 0 300 200" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
    <rect x="0" y="0" width="300" height="80" fill="hsl(200,70%,82%)" />
    <rect x="0" y="80" width="300" height="120" fill="hsl(142,30%,68%)" />
    {/* School building */}
    <rect x="80" y="20" width="140" height="65" rx="3" fill="hsl(30,30%,65%)" />
    <rect x="130" y="55" width="40" height="30" rx="2" fill="hsl(30,25%,50%)" /> {/* door */}
    <text x="150" y="35" fontSize="10" textAnchor="middle" fill="hsl(0,50%,45%)" fontWeight="bold">学校</text>
    {/* Windows */}
    {[95, 115, 175, 195].map(x => (
      <rect key={x} x={x} y="30" width="12" height="12" rx="1" fill="hsl(195,55%,70%)" />
    ))}
    {/* Fence */}
    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => (
      <rect key={i} x={10 + i * 25} y="80" width="3" height="30" fill="hsl(220,15%,50%)" />
    ))}
    <rect x="0" y="82" width="300" height="3" fill="hsl(220,15%,50%)" />
    <rect x="0" y="105" width="300" height="3" fill="hsl(220,15%,50%)" />
    {/* Trees */}
    <circle cx="30" cy="65" r="15" fill="hsl(142,40%,48%)" />
    <rect x="28" y="74" width="4" height="10" fill="hsl(30,40%,35%)" />
    <circle cx="270" cy="65" r="12" fill="hsl(142,40%,48%)" />
    <rect x="268" y="72" width="4" height="10" fill="hsl(30,40%,35%)" />
    {/* Flowers */}
    {[60, 120, 200, 250].map(x => (
      <circle key={x} cx={x} cy={140 + Math.sin(x) * 10} r="4" fill={x % 2 === 0 ? 'hsl(350,60%,60%)' : 'hsl(48,80%,55%)'} />
    ))}
  </svg>
));

// Level 4: Park entrance with trees, path, flowers
export const ParkEntranceScene: React.FC = React.memo(() => (
  <svg viewBox="0 0 300 200" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
    <rect x="0" y="0" width="300" height="80" fill="hsl(200,68%,82%)" />
    <rect x="0" y="80" width="300" height="120" fill="hsl(142,35%,60%)" />
    {/* Path */}
    <rect x="120" y="80" width="60" height="120" fill="hsl(30,25%,60%)" rx="3" />
    {/* Big trees */}
    <circle cx="40" cy="50" r="25" fill="hsl(142,45%,40%)" />
    <rect x="37" y="68" width="6" height="20" fill="hsl(30,45%,30%)" />
    <circle cx="260" cy="55" r="22" fill="hsl(142,40%,42%)" />
    <rect x="257" y="70" width="6" height="18" fill="hsl(30,45%,30%)" />
    {/* Flowers */}
    {[70, 95, 195, 220, 240].map((x, i) => (
      <React.Fragment key={i}>
        <circle cx={x} cy={100 + (i * 15) % 40} r="5" fill={['hsl(350,60%,60%)', 'hsl(290,50%,60%)', 'hsl(48,80%,55%)', 'hsl(15,70%,55%)', 'hsl(330,60%,60%)'][i]} />
        <rect x={x - 1} y={105 + (i * 15) % 40} width="2" height="8" fill="hsl(142,40%,40%)" />
      </React.Fragment>
    ))}
    {/* Bench */}
    <rect x="195" y="140" width="30" height="4" rx="1" fill="hsl(30,40%,40%)" />
    <rect x="198" y="144" width="4" height="10" fill="hsl(30,40%,40%)" />
    <rect x="218" y="144" width="4" height="10" fill="hsl(30,40%,40%)" />
    {/* Bird */}
    <text x="100" y="45" fontSize="14">🐦</text>
    {/* Pond */}
    <ellipse cx="60" cy="160" rx="25" ry="15" fill="hsl(200,60%,65%)" opacity="0.6" />
  </svg>
));

// Level 5: Highway toll with road lanes, toll booths
export const HighwayTollScene: React.FC = React.memo(() => (
  <svg viewBox="0 0 300 200" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
    <rect x="0" y="0" width="300" height="70" fill="hsl(200,65%,80%)" />
    {/* Road */}
    <rect x="0" y="70" width="300" height="130" fill="hsl(220,10%,38%)" />
    {/* Lane dividers */}
    {[75, 150, 225].map(x => (
      <line key={x} x1={x} y1="70" x2={x} y2="200" stroke="white" strokeWidth="2" strokeDasharray="10,8" opacity="0.5" />
    ))}
    {/* Toll booth structures */}
    {[37, 112, 187, 262].map((x, i) => (
      <React.Fragment key={i}>
        <rect x={x - 15} y="70" width="30" height="45" rx="2" fill="hsl(220,15%,50%)" />
        <rect x={x - 12} y="75" width="24" height="15" rx="2" fill="hsl(195,60%,65%)" />
        <rect x={x - 20} y="68" width="40" height="5" rx="1" fill="hsl(220,20%,40%)" />
        {/* Barrier arm */}
        <rect x={x + 5} y="108" width="30" height="4" rx="2" fill="hsl(0,65%,55%)" opacity="0.6" />
      </React.Fragment>
    ))}
    {/* Vehicles approaching */}
    <rect x="30" y="155" width="22" height="12" rx="3" fill="hsl(0,50%,50%)" />
    <rect x="108" y="170" width="22" height="12" rx="3" fill="hsl(220,50%,50%)" />
    <rect x="180" y="145" width="28" height="14" rx="3" fill="hsl(142,45%,45%)" />
  </svg>
));

ParkingTreasureScene.displayName = 'ParkingTreasureScene';
MallBasementScene.displayName = 'MallBasementScene';
SchoolGateScene.displayName = 'SchoolGateScene';
ParkEntranceScene.displayName = 'ParkEntranceScene';
HighwayTollScene.displayName = 'HighwayTollScene';
