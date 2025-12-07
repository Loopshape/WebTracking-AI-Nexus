import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';

const ConsoleLog: React.FC<{ logs: LogEntry[] }> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="bg-black border border-slate-800 rounded-lg p-2 h-48 overflow-hidden flex flex-col font-mono text-xs shadow-inner">
      <div className="flex justify-between items-center mb-1 border-b border-slate-800 pb-1">
        <span className="text-slate-500">SYSTEM.LOG</span>
        <span className="text-neon-green text-[10px]">● RUNNING</span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-1 p-1">
        {logs.map((log, idx) => (
          <div key={idx} className="flex gap-2">
            <span className="text-slate-600">[{log.timestamp}]</span>
            <span className={`${
              log.level === 'ERROR' ? 'text-neon-red' : 
              log.level === 'SUCCESS' ? 'text-neon-green' : 
              log.level === 'WARN' ? 'text-yellow-500' : 'text-neon-blue'
            }`}>
              {log.level}
            </span>
            <span className="text-slate-300">{log.message}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default ConsoleLog;