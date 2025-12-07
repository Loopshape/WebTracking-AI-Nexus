import React, { useEffect, useState, useRef } from 'react';
import { TrackingNode } from '../types';
import { INITIAL_NODES } from '../constants';

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

  return (
    <div className="relative w-full h-96 bg-deep-space border border-slate-700 rounded-lg overflow-hidden shadow-lg grid-bg">
      <div className="absolute top-2 left-2 text-neon-blue text-xs font-mono">
        <span className="animate-pulse">●</span> LIVE TRACKING // HASH FLOW
      </div>
      
      <svg ref={svgRef} className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Diagonal Axis */}
        <line x1="10" y1="90" x2="90" y2="10" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="2 2" />
        
        {/* Vertical/Horizontal Connectors (Step chart style) */}
        <path d="M10 90 L30 90 L30 70 L50 70 L50 50 L70 50 L70 30 L90 30 L90 10" 
              fill="none" 
              stroke="#00f3ff" 
              strokeWidth="0.5" 
              opacity="0.6"
        />

        {/* Moving Pulses */}
        {pulses.map(pulse => (
          <circle key={pulse.id} cx={pulse.x} cy={pulse.y} r="1.5" fill="#00ff41" opacity="0.8">
             <animate attributeName="r" values="1;2;1" dur="1s" repeatCount="indefinite" />
          </circle>
        ))}

        {/* Nodes */}
        {nodes.map((node, i) => (
          <g key={node.id}>
            {/* Connection Lines */}
            {i < nodes.length - 1 && (
               <line 
                x1={node.x} y1={node.y} 
                x2={nodes[i+1].x} y2={nodes[i+1].y} 
                stroke="#334155" 
                strokeWidth="0.2" 
               />
            )}
            
            <circle cx={node.x} cy={node.y} r="2" fill="#050b14" stroke={node.type === 'HASH' ? '#ef4444' : '#00f3ff'} strokeWidth="0.5" />
            
            {/* Labels */}
            <text x={node.x + 3} y={node.y} fill="#94a3b8" fontSize="3" fontFamily="monospace" alignmentBaseline="middle">
              {node.label}
            </text>
            <text x={node.x + 3} y={node.y + 3} fill="#475569" fontSize="2" fontFamily="monospace">
              {node.type === 'HASH' ? '0x...' : 'ID'}
            </text>
          </g>
        ))}

        {/* Quadrant Labels inspired by images */}
        <text x="5" y="50" fill="#00ff41" fontSize="2.5" fontWeight="bold">ROOT</text>
        <text x="50" y="5" fill="#00f3ff" fontSize="2.5" fontWeight="bold">SERVER</text>
        <text x="95" y="50" fill="#00ff41" fontSize="2.5" fontWeight="bold">KEY</text>
        <text x="50" y="95" fill="#ef4444" fontSize="2.5" fontWeight="bold">DATA</text>

      </svg>
    </div>
  );
};

export default TrackingGraph;