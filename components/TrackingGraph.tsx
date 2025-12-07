import React, { useEffect, useState, useRef } from 'react';
import { TrackingNode } from '../types';
import { INITIAL_NODES } from '../constants';
import { Globe, X, Server, Database, Key, Shield } from 'lucide-react';

const MOCK_LOCATIONS = [
  "US, Virginia", "DE, Frankfurt", "SG, Singapore", "JP, Tokyo", "GB, London", "BR, Sao Paulo", "CA, Toronto", "NL, Amsterdam"
];

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
  const [selectedNode, setSelectedNode] = useState<TrackingNode | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Initialize: Simulate GeoIP Lookup
  useEffect(() => {
    setNodes(prev => prev.map(n => {
      if (n.type === 'IP' && !n.location) {
        return { 
          ...n, 
          location: MOCK_LOCATIONS[Math.floor(Math.random() * MOCK_LOCATIONS.length)] 
        };
      }
      return n;
    }));
  }, []);

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

  // Simulate Stream of Node Status & Traffic Updates
  useEffect(() => {
    if (!active) return;
    
    // Primary Status Cycle
    const statusInterval = setInterval(() => {
      setNodes(prev => prev.map(n => {
        // Toggle Hash Status
        if (n.type === 'HASH') {
          return { ...n, status: n.status === 'secure' ? 'analyzing' : 'secure' };
        }
        return n;
      }));
    }, 4500); 

    // High Frequency Traffic Stream
    const trafficInterval = setInterval(() => {
      setNodes(prev => prev.map(n => {
        // Randomly fluctuate traffic load for visual "stream" effect
        if (Math.random() > 0.7) {
           const loads: TrackingNode['trafficLoad'][] = ['low', 'medium', 'high'];
           return { ...n, trafficLoad: loads[Math.floor(Math.random() * loads.length)] };
        }
        // Randomly toggle IP Status
        if (n.type === 'IP' && Math.random() > 0.8) {
             const states: TrackingNode['status'][] = ['active', 'idle', 'analyzing'];
             return { ...n, status: states[Math.floor(Math.random() * states.length)] };
        }
        return n;
      }));
      
      // Update selected node reference if it changes in the background
      if (selectedNode) {
        setNodes(currentNodes => {
           const currentSelected = currentNodes.find(n => n.id === selectedNode.id);
           if (currentSelected && (currentSelected.status !== selectedNode.status || currentSelected.trafficLoad !== selectedNode.trafficLoad)) {
             setSelectedNode(currentSelected);
           }
           return currentNodes;
        });
      }

    }, 1200);

    return () => {
      clearInterval(statusInterval);
      clearInterval(trafficInterval);
    };
  }, [active, selectedNode]);

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

  const getFlowWidth = (load: string | undefined) => {
    switch (load) {
      case 'high': return 0.8;
      case 'medium': return 0.5;
      case 'low': return 0.2;
      default: return 0.3;
    }
  };

  const getNodeIcon = (type: string) => {
      switch(type) {
          case 'SERVER': return <Server className="w-4 h-4 text-neon-blue"/>;
          case 'ROOT': return <Database className="w-4 h-4 text-neon-red"/>;
          case 'HASH': return <Shield className="w-4 h-4 text-neon-green"/>;
          case 'NFT': return <Key className="w-4 h-4 text-purple-400"/>;
          default: return <Globe className="w-4 h-4 text-slate-400"/>;
      }
  }

  return (
    <div className="relative w-full h-96 bg-deep-space border border-slate-700 rounded-lg overflow-hidden shadow-lg grid-bg">
      <div className="absolute top-2 left-2 text-neon-blue text-xs font-mono z-10 select-none">
        <span className="animate-pulse">●</span> LIVE TRACKING // NETWORK FLOW
      </div>
      
      {/* Details Panel Overlay */}
      {selectedNode && (
          <div className="absolute top-4 right-4 bg-slate-900/90 border border-slate-600 p-4 rounded-lg w-56 backdrop-blur-md z-20 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
              <button 
                  onClick={() => setSelectedNode(null)}
                  className="absolute top-2 right-2 text-slate-400 hover:text-white"
              >
                  <X className="w-3 h-3" />
              </button>
              
              <div className="flex items-center gap-2 mb-3 border-b border-slate-700 pb-2">
                  {getNodeIcon(selectedNode.type)}
                  <div>
                      <h3 className="text-sm font-bold text-white font-mono">{selectedNode.label}</h3>
                      <div className="text-[10px] text-slate-400 font-mono">{selectedNode.id.toUpperCase()}</div>
                  </div>
              </div>
              
              <div className="space-y-2 text-[10px] font-mono">
                  <div className="flex justify-between">
                      <span className="text-slate-500">TYPE</span>
                      <span className="text-neon-blue">{selectedNode.type}</span>
                  </div>
                  <div className="flex justify-between">
                      <span className="text-slate-500">STATUS</span>
                      <span className={`uppercase ${selectedNode.status === 'secure' || selectedNode.status === 'active' ? 'text-neon-green' : 'text-yellow-400'}`}>
                          {selectedNode.status}
                      </span>
                  </div>
                  <div className="flex justify-between">
                      <span className="text-slate-500">LOAD</span>
                      <span className="uppercase text-slate-200">{selectedNode.trafficLoad || 'N/A'}</span>
                  </div>
                  
                  {selectedNode.location && (
                      <div className="flex justify-between">
                          <span className="text-slate-500">LOC</span>
                          <span className="text-white">{selectedNode.location}</span>
                      </div>
                  )}

                  {selectedNode.contract_address && (
                      <div className="pt-2 border-t border-slate-700 mt-2">
                          <span className="text-slate-500 block mb-1">CONTRACT</span>
                          <span className="text-purple-400 break-all">{selectedNode.contract_address}</span>
                      </div>
                  )}

                   {selectedNode.ownership_status && (
                      <div className="flex justify-between">
                          <span className="text-slate-500">OWNERSHIP</span>
                          <span className="text-white uppercase">{selectedNode.ownership_status}</span>
                      </div>
                  )}
              </div>
          </div>
      )}

      <svg ref={svgRef} className="w-full h-full cursor-crosshair" viewBox="0 0 100 100" preserveAspectRatio="none" onClick={() => setSelectedNode(null)}>
        <defs>
          <marker id="arrowhead-blue" markerWidth="6" markerHeight="4" refX="8" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="#00f3ff" />
          </marker>
          <marker id="arrowhead-green" markerWidth="6" markerHeight="4" refX="8" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="#00ff41" />
          </marker>
          <marker id="arrowhead-yellow" markerWidth="6" markerHeight="4" refX="8" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="#facc15" />
          </marker>
          <marker id="arrowhead-slate" markerWidth="6" markerHeight="4" refX="8" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="#475569" />
          </marker>
        </defs>

        {/* Background Grid Path */}
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
          const flowWidth = getFlowWidth(node.trafficLoad);
          const isIdle = next.status === 'idle';
          
          let markerId = "arrowhead-slate";
          if (next.status === 'active') markerId = "arrowhead-blue";
          if (next.status === 'secure') markerId = "arrowhead-green";
          if (next.status === 'analyzing') markerId = "arrowhead-yellow";
          
          return (
            <g key={`flow-${i}`}>
              {/* Base Line with Arrowhead */}
              <line 
                x1={node.x} y1={node.y} 
                x2={next.x} y2={next.y} 
                stroke={flowColor} 
                strokeWidth={isIdle ? "0.2" : flowWidth} 
                opacity="0.4"
                markerEnd={`url(#${markerId})`}
              />
              
              {/* Animated Packet Line */}
              {!isIdle && (
                <line 
                  x1={node.x} y1={node.y} 
                  x2={next.x} y2={next.y} 
                  stroke={flowColor} 
                  strokeWidth={flowWidth * 1.5} 
                  strokeDasharray={`${flowWidth * 8} ${flowWidth * 12}`}
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

        {/* Global Particle Pulses */}
        {pulses.map(pulse => (
          <circle key={pulse.id} cx={pulse.x} cy={pulse.y} r="1" fill="#ffffff" opacity="0.4">
             <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
          </circle>
        ))}

        {/* Nodes Rendering */}
        {nodes.map((node) => (
          <g 
            key={node.id} 
            onClick={(e) => { e.stopPropagation(); setSelectedNode(node); }}
            className="cursor-pointer hover:opacity-100 transition-opacity"
            style={{ opacity: selectedNode && selectedNode.id !== node.id ? 0.4 : 1 }}
          >
            {/* Selection Highlight Ring */}
            {selectedNode && selectedNode.id === node.id && (
                 <circle cx={node.x} cy={node.y} r="7" fill="none" stroke="#fff" strokeWidth="0.3" strokeDasharray="2 2">
                     <animateTransform attributeName="transform" type="rotate" from={`0 ${node.x} ${node.y}`} to={`360 ${node.x} ${node.y}`} dur="4s" repeatCount="indefinite" />
                 </circle>
            )}

            {/* --- IP NODE --- */}
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
                <path d={`M${node.x-2} ${node.y} h4 M${node.x} ${node.y-2} v4`} stroke="#1e293b" strokeWidth="0.5" />
                <circle cx={node.x + 2.5} cy={node.y - 2.5} r="0.8" fill={node.status === 'active' ? '#00f3ff' : '#1e293b'}>
                   {node.status === 'active' && <animate attributeName="opacity" values="1;0.2;1" dur="1s" repeatCount="indefinite" />}
                </circle>
                <text x={node.x} y={node.y + 6} fill="#94a3b8" fontSize="1.8" fontFamily="monospace" textAnchor="middle">::IP::</text>
                {/* GeoIP Location Display */}
                <text x={node.x} y={node.y + 8} fill="#475569" fontSize="1.2" fontFamily="monospace" textAnchor="middle">
                  {node.location || 'LOCATING...'}
                </text>
              </g>
            )}

            {/* --- HASH NODE --- */}
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

            {/* --- NFT NODE --- */}
            {node.type === 'NFT' && (
              <g>
                {/* Outer Ring */}
                <circle cx={node.x} cy={node.y} r="4" fill="#050b14" stroke="#8b5cf6" strokeWidth="0.3" />
                <circle cx={node.x} cy={node.y} r="3.2" fill="none" stroke="#8b5cf6" strokeWidth="0.2" strokeDasharray="1 1">
                  <animateTransform attributeName="transform" type="rotate" from={`0 ${node.x} ${node.y}`} to={`360 ${node.x} ${node.y}`} dur="10s" repeatCount="indefinite" />
                </circle>
                
                {/* Inner Diamond Token Symbol */}
                <polygon points={`${node.x},${node.y-2} ${node.x+2},${node.y} ${node.x},${node.y+2} ${node.x-2},${node.y}`} fill="#8b5cf6" opacity="0.8">
                   <animate attributeName="opacity" values="0.8;0.4;0.8" dur="3s" repeatCount="indefinite" />
                </polygon>
                
                {/* Ownership Badge */}
                {node.ownership_status === 'owned' && (
                   <circle cx={node.x + 3} cy={node.y - 3} r="1" fill="#00ff41" stroke="#050b14" strokeWidth="0.2" />
                )}

                <text x={node.x} y={node.y + 6} fill="#a78bfa" fontSize="1.8" fontFamily="monospace" textAnchor="middle">
                  NFT
                </text>
                <text x={node.x} y={node.y + 8} fill="#64748b" fontSize="1.2" fontFamily="monospace" textAnchor="middle">
                  {node.contract_address ? node.contract_address.substring(0,6) + '...' : '0x...'}
                </text>
              </g>
            )}

            {/* --- GENERIC NODE (ROOT, SERVER, RELAY) --- */}
            {['ROOT', 'SERVER', 'RELAY'].includes(node.type) && (
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