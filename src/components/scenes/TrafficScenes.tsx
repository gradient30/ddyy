import React from 'react';

// Parking lot scene background
export const ParkingLotScene: React.FC = React.memo(() => (
  <svg viewBox="0 0 300 200" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
    {/* Sky */}
    <rect x="0" y="0" width="300" height="80" fill="hsl(200,70%,85%)" />
    <circle cx="260" cy="30" r="18" fill="hsl(48,95%,70%)" />
    {/* Buildings */}
    <rect x="10" y="30" width="40" height="50" rx="2" fill="hsl(220,15%,60%)" />
    <rect x="14" y="38" width="8" height="8" rx="1" fill="hsl(195,60%,70%)" />
    <rect x="28" y="38" width="8" height="8" rx="1" fill="hsl(195,60%,70%)" />
    <rect x="14" y="52" width="8" height="8" rx="1" fill="hsl(195,60%,70%)" />
    <rect x="28" y="52" width="8" height="8" rx="1" fill="hsl(195,60%,70%)" />
    <rect x="250" y="40" width="35" height="40" rx="2" fill="hsl(220,15%,55%)" />
    <rect x="254" y="48" width="6" height="6" rx="1" fill="hsl(48,80%,70%)" />
    <rect x="266" y="48" width="6" height="6" rx="1" fill="hsl(48,80%,70%)" />
    {/* Ground / parking lot */}
    <rect x="0" y="80" width="300" height="120" fill="hsl(220,10%,50%)" />
    {/* Lane markings */}
    {[60, 120, 180, 240].map(x => (
      <rect key={x} x={x} y="80" width="2" height="120" fill="hsl(48,80%,70%)" opacity="0.6" />
    ))}
    {/* Parking spot lines */}
    {[70, 130, 190].map(x => (
      <React.Fragment key={x}>
        <rect x={x} y="85" width="50" height="2" fill="white" opacity="0.5" />
        <rect x={x} y="115" width="50" height="2" fill="white" opacity="0.5" />
        <rect x={x} y="145" width="50" height="2" fill="white" opacity="0.5" />
      </React.Fragment>
    ))}
    {/* Parked cars */}
    <rect x="75" y="90" width="20" height="12" rx="3" fill="hsl(0,60%,55%)" />
    <rect x="135" y="120" width="20" height="12" rx="3" fill="hsl(220,60%,55%)" />
    <rect x="195" y="90" width="20" height="12" rx="3" fill="hsl(142,50%,50%)" />
    {/* Trees */}
    <circle cx="55" cy="72" r="10" fill="hsl(142,40%,50%)" />
    <rect x="53" y="76" width="4" height="8" fill="hsl(30,40%,35%)" />
    {/* Barrier outline */}
    <rect x="145" y="140" width="8" height="25" rx="1" fill="hsl(220,15%,45%)" opacity="0.4" />
    <rect x="150" y="143" width="40" height="4" rx="2" fill="hsl(0,70%,55%)" opacity="0.4" />
  </svg>
));

// Road intersection scene
export const IntersectionScene: React.FC = React.memo(() => (
  <svg viewBox="0 0 300 200" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
    <rect x="0" y="0" width="300" height="200" fill="hsl(142,30%,70%)" />
    {/* Horizontal road */}
    <rect x="0" y="75" width="300" height="50" fill="hsl(220,10%,40%)" />
    <line x1="0" y1="100" x2="300" y2="100" stroke="hsl(48,80%,60%)" strokeWidth="2" strokeDasharray="12,8" />
    {/* Vertical road */}
    <rect x="125" y="0" width="50" height="200" fill="hsl(220,10%,40%)" />
    <line x1="150" y1="0" x2="150" y2="200" stroke="hsl(48,80%,60%)" strokeWidth="2" strokeDasharray="12,8" />
    {/* Crosswalks */}
    {[0, 1, 2, 3, 4].map(i => (
      <React.Fragment key={i}>
        <rect x={128 + i * 8} y="68" width="5" height="7" fill="white" opacity="0.8" />
        <rect x={128 + i * 8} y="125" width="5" height="7" fill="white" opacity="0.8" />
        <rect x="118" y={78 + i * 8} width="7" height="5" fill="white" opacity="0.8" />
        <rect x="175" y={78 + i * 8} width="7" height="5" fill="white" opacity="0.8" />
      </React.Fragment>
    ))}
    {/* Buildings */}
    <rect x="10" y="10" width="100" height="55" rx="3" fill="hsl(30,30%,65%)" />
    <rect x="190" y="10" width="90" height="55" rx="3" fill="hsl(210,20%,60%)" />
    <rect x="10" y="135" width="100" height="55" rx="3" fill="hsl(350,20%,65%)" />
    <rect x="190" y="135" width="90" height="55" rx="3" fill="hsl(142,20%,60%)" />
    {/* Windows */}
    {[20, 40, 60, 80].map(x => (
      <rect key={x} x={x} y="20" width="10" height="8" rx="1" fill="hsl(195,60%,75%)" />
    ))}
    {/* Pedestrian */}
    <circle cx="180" cy="70" r="3" fill="hsl(30,60%,55%)" />
    <rect x="178" y="73" width="4" height="6" rx="1" fill="hsl(220,50%,50%)" />
  </svg>
));

// Road with varied vehicles for counting
export const RoadWithCarsScene: React.FC<{ carCount: number }> = React.memo(({ carCount }) => (
  <svg viewBox="0 0 300 120" className="w-full mb-2" preserveAspectRatio="xMidYMid slice">
    {/* Road */}
    <rect x="0" y="30" width="300" height="60" fill="hsl(220,10%,40%)" />
    <line x1="0" y1="60" x2="300" y2="60" stroke="hsl(48,80%,60%)" strokeWidth="2" strokeDasharray="10,8" />
    {/* Grass */}
    <rect x="0" y="0" width="300" height="30" fill="hsl(142,35%,65%)" />
    <rect x="0" y="90" width="300" height="30" fill="hsl(142,35%,65%)" />
    {/* Trees on grass */}
    {[30, 100, 200, 270].map(x => (
      <React.Fragment key={x}>
        <circle cx={x} cy="18" r="8" fill="hsl(142,40%,50%)" />
        <rect x={x - 2} y="22" width="4" height="8" fill="hsl(30,40%,35%)" />
      </React.Fragment>
    ))}
  </svg>
));

// Crosswalk scene
export const CrosswalkScene: React.FC = React.memo(() => (
  <svg viewBox="0 0 300 130" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
    {/* Sidewalks */}
    <rect x="0" y="0" width="300" height="30" fill="hsl(30,20%,70%)" />
    <rect x="0" y="100" width="300" height="30" fill="hsl(30,20%,70%)" />
    {/* Road */}
    <rect x="0" y="30" width="300" height="70" fill="hsl(220,10%,40%)" />
    {/* Zebra crossing */}
    {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
      <rect key={i} x={100 + i * 14} y="30" width="8" height="70" fill="white" opacity="0.7" />
    ))}
    {/* Traffic lights */}
    <rect x="88" y="5" width="8" height="25" rx="2" fill="hsl(220,15%,35%)" />
    <rect x="222" y="5" width="8" height="25" rx="2" fill="hsl(220,15%,35%)" />
    {/* Buildings */}
    <rect x="5" y="2" width="70" height="26" rx="2" fill="hsl(220,20%,55%)" />
    <rect x="235" y="2" width="55" height="26" rx="2" fill="hsl(350,20%,60%)" />
  </svg>
));

// Driving road scene
export const DrivingRoadScene: React.FC = React.memo(() => (
  <svg viewBox="0 0 160 260" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
    {/* Grass sides */}
    <rect x="0" y="0" width="20" height="260" fill="hsl(142,35%,60%)" />
    <rect x="140" y="0" width="20" height="260" fill="hsl(142,35%,60%)" />
    {/* Road */}
    <rect x="20" y="0" width="120" height="260" fill="hsl(220,10%,35%)" />
    {/* Lane dividers */}
    {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
      <React.Fragment key={i}>
        <rect x="58" y={i * 30} width="2" height="18" fill="white" opacity="0.5" />
        <rect x="100" y={i * 30} width="2" height="18" fill="white" opacity="0.5" />
      </React.Fragment>
    ))}
    {/* Road edge markings */}
    <rect x="20" y="0" width="2" height="260" fill="white" opacity="0.3" />
    <rect x="138" y="0" width="2" height="260" fill="white" opacity="0.3" />
    {/* Bushes/trees on sides */}
    <circle cx="8" cy="50" r="6" fill="hsl(142,40%,45%)" />
    <circle cx="152" cy="120" r="6" fill="hsl(142,40%,45%)" />
    <circle cx="8" cy="180" r="5" fill="hsl(142,40%,50%)" />
  </svg>
));

ParkingLotScene.displayName = 'ParkingLotScene';
IntersectionScene.displayName = 'IntersectionScene';
RoadWithCarsScene.displayName = 'RoadWithCarsScene';
CrosswalkScene.displayName = 'CrosswalkScene';
DrivingRoadScene.displayName = 'DrivingRoadScene';
