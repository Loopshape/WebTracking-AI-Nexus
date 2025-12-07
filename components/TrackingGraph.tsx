import React, { useEffect, useState, useRef } from 'react';
import { TrackingNode } from '../types';
import { INITIAL_NODES } from '../constants';

const getHexagonPoints = (cx: number, cy: number, r: number) => {
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle_deg = 60 * i - 30; // -30 for flat top/bottom
    const angle_rad = (Math.PI / 180) * angle_deg;
    const x = cx + r * Math.cos(angle_rad);
    const y = cy + r * Math.sin(angle_rad);
    points.push(`${x},${y}`);
  }
  return points.join(" ");
};

const TrackingGraph: React.FC<{ active: boolean }> = ({ active }) => {
  const [nodes, setNodes] = useState<TrackingNode[]>(INITIAL_NODES as TrackingNode[]);
  const [pulses, setPulses] = useState<{ id: number; x: number; y: number }[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);

  // Simulate network traffic pulses
  useEffect(() => {
    if (!active) return;

    const interval = setInterval(() => {
      const startNode = nodes[0];
      const newPulse = { id: Date.now(), x: startNode.x, y: startNode.y };
      setPulses(prev => [...prev, newPulse]);
    }, 2000);

    return () => clearInterval(interval);
  }, [active, nodes]);

  // Simulate Node Status Updates (Hash & IP)
  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      setNodes(prev => prev.map(n => {
        if (n.type === 'HASH') {
          return {
            ...n,
            status: n.status === 'secure' ? 'analyzing' : 'secure'
          };
        }
        if (n.type === 'IP') {
             // Randomly toggle IP status to simulate traffic load
             const states: TrackingNode['status'][] = ['active', 'idle', 'analyzing'];
             const randomState = states[Math.floor(Math.random() * states.length)];
             return { ...n, status: randomState };
        }
        return n;
      }));
    }, 4500); 
    return () => clearInterval(interval);
  }, [active]);

  // Animate pulses
  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      setPulses(prev => {
        return prev
          .map(p => ({ ...p, x: p.x + 0.5, y: p.y - 0.5 })) // Move diagonally up-right
          .filter(p => p.x <= 90); // Remove when they hit the end
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    if (active) {
      animationFrameId = requestAnimationFrame(animate);
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [active]);

  const getFlowColor = (status: string) => {
    switch (status) {
      case 'active': return '#00f3ff'; // Neon Blue
      case 'secure': return '#00ff41'; // Neon Green
      case 'analyzing': return '#facc15'; // Yellow
      case 'idle': return '#475569'; // Slate
      default: return '#1e293b';
    }
  };

  return (
    <div className="relative w-full h-96 bg-deep-space border border-slate-700 rounded-lg overflow-hidden shadow-lg grid-bg">
      <div className="absolute top-2 left-2 text-neon-blue text-xs font-mono z-10">
        <span className="animate-pulse">●</span> LIVE TRACKING // NETWORK FLOW
      </div>
      
      <svg ref={svgRef} className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        
        {/* Background Grid Lines (Step chart style) */}
        <path d="M10 90 L25 80 L40 65 L55 50 L75 30 L90 10" 
              fill="none" 
              stroke="#1e293b" 
              strokeWidth="0.2" 
        />

        {/* Animated Network Flows (Edges) */}
        {nodes.map((node, i) => {
          if (i === nodes.length - 1) return null;
          const next = nodes[i + 1];
          const flowColor = getFlowColor(next.status);
          const isIdle = next.status === 'idle';
          
          return (
            <g key={`flow-${i}`}>
              {/* Base Line */}
              <line 
                x1={node.x} y1={node.y} 
                x2={next.x} y2={next.y} 
                stroke={flowColor} 
                strokeWidth={isIdle ? "0.2" : "0.5"} 
                opacity="0.3" 
              />
              {/* Animated Flow Packet */}
              {!isIdle && (
                <line 
                  x1={node.x} y1={node.y} 
                  x2={next.x} y2={next.y} 
                  stroke={flowColor} 
                  strokeWidth="0.8" 
                  strokeDasharray="4 6"
                  strokeLinecap="round"
                >
                  <animate 
                    attributeName="stroke-dashoffset" 
                    from="20" 
                    to="0" 
                    dur={next.status === 'analyzing' ? "0.5s" : "1.5s"} 
                    repeatCount="indefinite" 
                  />
                </line>
              )}
            </g>
          );
        })}

        {/* Global Particle Pulses (Atmospheric) */}
        {pulses.map(pulse => (
          <circle key={pulse.id} cx={pulse.x} cy={pulse.y} r="1" fill="#ffffff" opacity="0.4">
             <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
          </circle>
        ))}

        {/* Nodes */}
        {nodes.map((node) => (
          <g key={node.id}>
            
            {/* --- IP NODE VISUALIZATION --- */}
            {node.type === 'IP' && (
              <g>
                <rect 
                  x={node.x - 4} y={node.y - 4} 
                  width="8" height="8" 
                  fill="#050b14" 
                  stroke={node.status === 'active' ? '#00f3ff' : node.status === 'analyzing' ? '#facc15' : '#475569'}
                  strokeWidth="0.5"
                  rx="1"
                />
                {/* Internal Grid Effect */}
                <path d={`M${node.x-2} ${node.y} h4 M${node.x} ${node.y-2} v4`} stroke="#1e293b" strokeWidth="0.5" />
                
                {/* Status Indicator Dot */}
                <circle cx={node.x + 2.5} cy={node.y - 2.5} r="0.8" fill={node.status === 'active' ? '#00f3ff' : '#1e293b'}>
                   {node.status === 'active' && <animate attributeName="opacity" values="1;0.2;1" dur="1s" repeatCount="indefinite" />}
                </circle>

                <text x={node.x} y={node.y + 6} fill="#94a3b8" fontSize="1.8" fontFamily="monospace" textAnchor="middle">
                  ::IP::
                </text>
                 <text x={node.x} y={node.y + 8} fill="#475569" fontSize="1.2" fontFamily="monospace" textAnchor="middle">
                  192.168.1.X
                </text>
              </g>
            )}

            {/* --- HASH NODE VISUALIZATION --- */}
            {node.type === 'HASH' && (
              <g>
                <polygon 
                  points={getHexagonPoints(node.x, node.y, 5)} 
                  fill="none" 
                  stroke={node.status === 'secure' ? '#00ff41' : '#facc15'} 
                  strokeWidth="0.3"
                  strokeDasharray={node.status === 'analyzing' ? "1 1" : "none"}
                  opacity="0.6"
                >
                  {node.status === 'analyzing' && (
                    <animateTransform attributeName="transform" type="rotate" from={`360 ${node.x} ${node.y}`} to={`0 ${node.x} ${node.y}`} dur="6s" repeatCount="indefinite" />
                  )}
                </polygon>

                <polygon 
                  points={getHexagonPoints(node.x, node.y, 3)} 
                  fill="#050b14" 
                  stroke={node.status === 'secure' ? '#00ff41' : '#facc15'} 
                  strokeWidth={node.status === 'analyzing' ? 0.6 : 0.8}
                >
                  {node.status === 'analyzing' && (
                    <animateTransform attributeName="transform" type="rotate" from={`0 ${node.x} ${node.y}`} to={`360 ${node.x} ${node.y}`} dur="3s" repeatCount="indefinite" />
                  )}
                </polygon>
                
                <text x={node.x} y={node.y} dy="0.3em" textAnchor="middle" fill={node.status === 'secure' ? '#00ff41' : '#facc15'} fontSize="1.8" fontFamily="monospace" fontWeight="bold">#</text>
                <text x={node.x} y={node.y + 6} fill={node.status === 'secure' ? '#00ff41' : '#facc15'} fontSize="1.8" fontFamily="monospace" textAnchor="middle">
                   {node.status === 'secure' ? '[VERIFIED]' : '[HASHING]'}
                </text>
              </g>
            )}

            {/* --- STANDARD NODE VISUALIZATION (Root, Server, etc) --- */}
            {node.type !== 'HASH' && node.type !== 'IP' && (
              <g>
                <circle cx={node.x} cy={node.y} r="2" fill="#050b14" stroke={node.type === 'ROOT' ? '#ef4444' : '#00f3ff'} strokeWidth="0.5" />
                {node.status === 'active' && (
                   <circle cx={node.x} cy={node.y} r="3" fill="none" stroke={node.type === 'ROOT' ? '#ef4444' : '#00f3ff'} strokeWidth="0.2" opacity="0.5">
                     <animate attributeName="r" values="2;4;2" dur="2s" repeatCount="indefinite" />
                     <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
                   </circle>
                )}
                <text x={node.x + 4} y={node.y} fill="#94a3b8" fontSize="3" fontFamily="monospace" alignmentBaseline="middle">
                  {node.label}
                </text>
              </g>
            )}
          </g>
        ))}

        {/* Labels */}
        <text x="5" y="50" fill="#00ff41" fontSize="2.5" fontWeight="bold">ROOT</text>
        <text x="50" y="5" fill="#00f3ff" fontSize="2.5" fontWeight="bold">SERVER</text>
        <text x="95" y="50" fill="#00ff41" fontSize="2.5" fontWeight="bold">KEY</text>
        <text x="50" y="95" fill="#ef4444" fontSize="2.5" fontWeight="bold">DATA</text>

      </svg>
    </div>
  );
};

export default TrackingGraph;