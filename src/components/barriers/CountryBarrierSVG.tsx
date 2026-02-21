import React from 'react';

interface Props {
  countryId: string;
  isLifted: boolean;
}

const CountryBarrierSVG: React.FC<Props> = React.memo(({ countryId, isLifted }) => {
  const armTransform = isLifted ? 'rotate(-85deg)' : 'rotate(0deg)';
  const armStyle = { transformOrigin: '30px 62px', transition: 'transform 0.8s cubic-bezier(0.34,1.56,0.64,1)', transform: armTransform };

  return (
    <svg viewBox="0 0 120 100" className="w-32 h-24 mx-auto">
      {/* Ground */}
      <rect x="0" y="92" width="120" height="8" rx="2" fill="hsl(142,30%,70%)" />

      {countryId === 'cn' && (
        <>
          {/* China: Straight arm red/white stripes */}
          <rect x="20" y="60" width="20" height="35" rx="3" fill="hsl(0,60%,40%)" />
          <rect x="22" y="62" width="16" height="6" rx="2" fill="hsl(0,0%,90%)" />
          <g style={armStyle}>
            <rect x="30" y="58" width="80" height="8" rx="4" fill="hsl(0,72%,55%)" />
            {[40, 52, 64, 76, 88].map(x => <rect key={x} x={x} y="58" width="5" height="8" rx="1" fill="white" />)}
            <circle cx="107" cy="62" r="5" fill="hsl(54,100%,50%)" />
          </g>
        </>
      )}

      {countryId === 'us' && (
        <>
          {/* USA: LED screen panel on pillar */}
          <rect x="18" y="55" width="24" height="40" rx="3" fill="hsl(220,20%,35%)" />
          <rect x="20" y="57" width="20" height="14" rx="2" fill="hsl(195,100%,60%)" />
          <text x="30" y="67" fontSize="5" fill="white" textAnchor="middle" fontWeight="bold">LED</text>
          <rect x="20" y="73" width="20" height="3" rx="1" fill="hsl(142,60%,50%)" />
          <g style={armStyle}>
            <rect x="30" y="58" width="80" height="8" rx="4" fill="hsl(220,20%,50%)" />
            {[45, 60, 75, 90].map(x => <rect key={x} x={x} y="58" width="4" height="8" rx="1" fill="hsl(54,90%,60%)" opacity="0.6" />)}
            <circle cx="107" cy="62" r="5" fill="hsl(54,100%,50%)" />
          </g>
        </>
      )}

      {countryId === 'jp' && (
        <>
          {/* Japan: Folding arm (hinged in middle) */}
          <rect x="20" y="60" width="20" height="35" rx="3" fill="hsl(220,15%,45%)" />
          <circle cx="30" cy="62" r="4" fill="hsl(195,80%,50%)" />
          <g style={armStyle}>
            <rect x="30" y="58" width="40" height="8" rx="4" fill="hsl(0,72%,55%)" />
            <circle cx="70" cy="62" r="4" fill="hsl(220,20%,40%)" />
            <rect x="70" y="50" width="35" height="7" rx="3" fill="hsl(0,72%,55%)" transform="rotate(25,70,53)" />
            {[38, 50].map(x => <rect key={x} x={x} y="58" width="4" height="8" fill="white" opacity="0.5" />)}
          </g>
        </>
      )}

      {countryId === 'au' && (
        <>
          {/* Australia: Solar panel on pillar top */}
          <rect x="20" y="60" width="20" height="35" rx="3" fill="hsl(220,15%,45%)" />
          {/* Solar panel */}
          <rect x="14" y="48" width="32" height="12" rx="2" fill="hsl(220,60%,30%)" />
          <line x1="18" y1="48" x2="18" y2="60" stroke="hsl(195,80%,50%)" strokeWidth="0.5" />
          <line x1="26" y1="48" x2="26" y2="60" stroke="hsl(195,80%,50%)" strokeWidth="0.5" />
          <line x1="34" y1="48" x2="34" y2="60" stroke="hsl(195,80%,50%)" strokeWidth="0.5" />
          <line x1="42" y1="48" x2="42" y2="60" stroke="hsl(195,80%,50%)" strokeWidth="0.5" />
          <g style={armStyle}>
            <rect x="30" y="63" width="80" height="8" rx="4" fill="hsl(142,50%,50%)" />
            {[45, 60, 75, 90].map(x => <rect key={x} x={x} y="63" width="4" height="8" fill="white" opacity="0.5" />)}
            <circle cx="107" cy="67" r="5" fill="hsl(54,100%,50%)" />
          </g>
        </>
      )}

      {countryId === 'de' && (
        <>
          {/* Germany: Fence/grid barrier - multiple vertical bars */}
          <rect x="20" y="60" width="20" height="35" rx="3" fill="hsl(220,15%,40%)" />
          <g style={armStyle}>
            <rect x="30" y="56" width="80" height="3" rx="1" fill="hsl(220,15%,50%)" />
            <rect x="30" y="68" width="80" height="3" rx="1" fill="hsl(220,15%,50%)" />
            {[35, 45, 55, 65, 75, 85, 95, 105].map(x => (
              <rect key={x} x={x} y="56" width="3" height="15" rx="1" fill="hsl(220,15%,55%)" />
            ))}
          </g>
        </>
      )}

      {countryId === 'ke' && (
        <>
          {/* Kenya: Simple wooden manual pole */}
          <circle cx="30" cy="80" r="8" fill="hsl(30,40%,40%)" />
          <circle cx="30" cy="80" r="3" fill="hsl(30,30%,30%)" />
          <g style={armStyle}>
            <rect x="30" y="58" width="75" height="6" rx="3" fill="hsl(30,50%,45%)" />
            <rect x="30" y="58" width="75" height="6" rx="3" fill="url(#woodGrain)" opacity="0.3" />
          </g>
          <defs>
            <pattern id="woodGrain" width="10" height="6" patternUnits="userSpaceOnUse">
              <line x1="0" y1="2" x2="10" y2="2" stroke="hsl(30,30%,30%)" strokeWidth="0.5" />
              <line x1="0" y1="4" x2="10" y2="4" stroke="hsl(30,30%,30%)" strokeWidth="0.3" />
            </pattern>
          </defs>
        </>
      )}

      {countryId === 'ae' && (
        <>
          {/* UAE: Flip-gate / turnstile panels */}
          <rect x="15" y="60" width="10" height="35" rx="2" fill="hsl(220,20%,40%)" />
          <rect x="35" y="60" width="10" height="35" rx="2" fill="hsl(220,20%,40%)" />
          <g style={{ transformOrigin: '30px 75px', transition: 'transform 0.8s cubic-bezier(0.34,1.56,0.64,1)', transform: isLifted ? 'rotate(-90deg)' : 'rotate(0deg)' }}>
            <rect x="25" y="60" width="10" height="30" rx="2" fill="hsl(45,80%,55%)" />
            <rect x="26" y="62" width="8" height="2" rx="1" fill="white" opacity="0.4" />
            <rect x="26" y="66" width="8" height="2" rx="1" fill="white" opacity="0.4" />
          </g>
        </>
      )}

      {countryId === 'br' && (
        <>
          {/* Brazil: Rainbow/colorful stripes */}
          <rect x="20" y="60" width="20" height="35" rx="3" fill="hsl(142,60%,35%)" />
          <rect x="22" y="62" width="16" height="4" rx="1" fill="hsl(54,100%,50%)" />
          <g style={armStyle}>
            <rect x="30" y="58" width="80" height="8" rx="4" fill="hsl(142,60%,50%)" />
            {[0, 1, 2, 3, 4, 5, 6].map(i => (
              <rect key={i} x={35 + i * 10} y="58" width="8" height="8" rx="1"
                fill={['hsl(0,72%,55%)', 'hsl(30,90%,55%)', 'hsl(54,100%,50%)', 'hsl(142,60%,50%)', 'hsl(195,80%,50%)', 'hsl(270,60%,55%)', 'hsl(330,70%,55%)'][i]} />
            ))}
            <circle cx="107" cy="62" r="5" fill="hsl(54,100%,50%)" />
          </g>
        </>
      )}

      {countryId === 'in' && (
        <>
          {/* India: Railway X-shaped double arm */}
          <rect x="20" y="60" width="20" height="35" rx="3" fill="hsl(0,0%,30%)" />
          <circle cx="30" cy="60" r="6" fill="hsl(0,70%,50%)" className={isLifted ? '' : 'animate-glow-pulse'} />
          <g style={armStyle}>
            <rect x="30" y="56" width="80" height="6" rx="3" fill="hsl(0,72%,55%)" />
            <rect x="30" y="64" width="80" height="6" rx="3" fill="hsl(0,72%,55%)" transform="rotate(-10, 30, 67)" />
            {[45, 60, 75, 90].map(x => <rect key={x} x={x} y="56" width="4" height="6" fill="white" />)}
          </g>
        </>
      )}

      {countryId === 'fr' && (
        <>
          {/* France: Rising bollard (cylinder from ground) */}
          <rect x="0" y="85" width="120" height="7" rx="2" fill="hsl(220,15%,55%)" />
          <ellipse cx="60" cy="85" rx="12" ry="4" fill="hsl(220,15%,45%)" />
          <rect x="48" y={isLifted ? '55' : '78'} width="24" height="30" rx="12"
            fill="hsl(220,20%,50%)" style={{ transition: 'y 0.8s cubic-bezier(0.34,1.56,0.64,1)' }} />
          <rect x="50" y={isLifted ? '57' : '80'} width="20" height="3" rx="1"
            fill="hsl(0,72%,55%)" style={{ transition: 'y 0.8s cubic-bezier(0.34,1.56,0.64,1)' }} />
          <rect x="50" y={isLifted ? '63' : '86'} width="20" height="3" rx="1"
            fill="hsl(0,72%,55%)" style={{ transition: 'y 0.8s cubic-bezier(0.34,1.56,0.64,1)' }} />
        </>
      )}

      {countryId === 'kr' && (
        <>
          {/* South Korea: Straight arm with camera */}
          <rect x="20" y="60" width="20" height="35" rx="3" fill="hsl(220,15%,45%)" />
          {/* Camera on top */}
          <rect x="24" y="48" width="12" height="10" rx="2" fill="hsl(0,0%,20%)" />
          <circle cx="30" cy="53" r="3" fill="hsl(195,80%,50%)" />
          <circle cx="30" cy="53" r="1.5" fill="hsl(0,0%,10%)" />
          <g style={armStyle}>
            <rect x="30" y="58" width="80" height="8" rx="4" fill="hsl(195,60%,50%)" />
            {[45, 60, 75, 90].map(x => <rect key={x} x={x} y="58" width="4" height="8" fill="white" opacity="0.5" />)}
            <circle cx="107" cy="62" r="5" fill="hsl(54,100%,50%)" />
          </g>
        </>
      )}

      {countryId === 'eg' && (
        <>
          {/* Egypt: Ornamental/decorated pillar */}
          <rect x="18" y="55" width="24" height="40" rx="4" fill="hsl(40,60%,50%)" />
          {/* Ornamental patterns */}
          <rect x="20" y="57" width="20" height="3" rx="1" fill="hsl(40,80%,65%)" />
          <rect x="20" y="62" width="20" height="3" rx="1" fill="hsl(40,80%,65%)" />
          <polygon points="30,67 24,75 36,75" fill="hsl(40,80%,65%)" /> {/* pyramid shape */}
          <g style={armStyle}>
            <rect x="30" y="58" width="80" height="8" rx="4" fill="hsl(40,60%,55%)" />
            {[45, 60, 75].map(x => <polygon key={x} points={`${x+2},58 ${x},66 ${x+4},66`} fill="hsl(40,80%,65%)" />)}
            <circle cx="107" cy="62" r="5" fill="hsl(54,100%,50%)" />
          </g>
        </>
      )}

      {countryId === 'ca' && (
        <>
          {/* Canada: Heating coil glow effect */}
          <rect x="20" y="60" width="20" height="35" rx="3" fill="hsl(220,15%,45%)" />
          {/* Heating coils */}
          <rect x="22" y="70" width="16" height="3" rx="1" fill="hsl(0,80%,55%)" opacity="0.7" />
          <rect x="22" y="75" width="16" height="3" rx="1" fill="hsl(30,90%,55%)" opacity="0.6" />
          <rect x="22" y="80" width="16" height="3" rx="1" fill="hsl(0,80%,55%)" opacity="0.5" />
          <g style={armStyle}>
            <rect x="30" y="58" width="80" height="8" rx="4" fill="hsl(0,72%,55%)" />
            {[45, 60, 75, 90].map(x => <rect key={x} x={x} y="58" width="4" height="8" fill="white" opacity="0.5" />)}
            <circle cx="107" cy="62" r="5" fill="hsl(54,100%,50%)" />
          </g>
        </>
      )}

      {countryId === 'sg' && (
        <>
          {/* Singapore: ERP gantry arch */}
          <rect x="10" y="70" width="12" height="25" rx="2" fill="hsl(220,15%,45%)" />
          <rect x="98" y="70" width="12" height="25" rx="2" fill="hsl(220,15%,45%)" />
          <rect x="10" y="65" width="100" height="8" rx="3" fill="hsl(220,20%,40%)" />
          {/* Electronic display */}
          <rect x="35" y="66" width="50" height="6" rx="1" fill="hsl(142,60%,40%)" />
          <text x="60" y="71" fontSize="4" fill="hsl(142,80%,70%)" textAnchor="middle" fontWeight="bold">ERP $</text>
          {/* Sensors on arch */}
          <circle cx="25" cy="69" r="2" fill="hsl(0,70%,50%)" />
          <circle cx="95" cy="69" r="2" fill="hsl(0,70%,50%)" />
        </>
      )}

      {countryId === 'mx' && (
        <>
          {/* Mexico: Community swing gate (two panels) */}
          <rect x="10" y="55" width="8" height="40" rx="2" fill="hsl(220,15%,45%)" />
          <rect x="102" y="55" width="8" height="40" rx="2" fill="hsl(220,15%,45%)" />
          <g style={{ transformOrigin: '14px 75px', transition: 'transform 0.8s cubic-bezier(0.34,1.56,0.64,1)', transform: isLifted ? 'rotate(-70deg)' : 'rotate(0deg)' }}>
            <rect x="14" y="60" width="46" height="30" rx="3" fill="hsl(30,50%,45%)" />
            <rect x="16" y="62" width="42" height="26" rx="2" fill="hsl(30,40%,55%)" opacity="0.5" />
            <line x1="37" y1="62" x2="37" y2="88" stroke="hsl(30,30%,35%)" strokeWidth="1" />
          </g>
          <g style={{ transformOrigin: '106px 75px', transition: 'transform 0.8s cubic-bezier(0.34,1.56,0.64,1)', transform: isLifted ? 'rotate(70deg)' : 'rotate(0deg)' }}>
            <rect x="60" y="60" width="46" height="30" rx="3" fill="hsl(30,50%,45%)" />
            <rect x="62" y="62" width="42" height="26" rx="2" fill="hsl(30,40%,55%)" opacity="0.5" />
            <line x1="83" y1="62" x2="83" y2="88" stroke="hsl(30,30%,35%)" strokeWidth="1" />
          </g>
        </>
      )}
    </svg>
  );
});

CountryBarrierSVG.displayName = 'CountryBarrierSVG';
export default CountryBarrierSVG;
