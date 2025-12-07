import React from 'react';
import { AnalysisResult } from '../types';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine
} from 'recharts';

interface AnalysisDashboardProps {
  data: AnalysisResult | null;
}

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="h-full flex items-center justify-center text-slate-500 font-mono text-sm border border-slate-700 rounded-lg p-10 bg-deep-space">
        AWAITING INPUT STREAM...
      </div>
    );
  }

  const radarData = [
    { subject: 'DEFINE', A: data.define, fullMark: 100 },
    { subject: 'RECOGNIZE', A: data.recognize, fullMark: 100 },
    { subject: 'ORDER', A: data.order, fullMark: 100 },
    { subject: 'SORT', A: data.sort, fullMark: 100 },
  ];

  const barData = [
    { name: 'QUALITY', value: data.quality, fill: '#ef4444' },
    { name: 'QUANTITY', value: data.quantity, fill: '#00f3ff' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
      {/* Quadrant Analysis (Radar) */}
      <div className="bg-deep-space border border-slate-700 rounded-lg p-4 shadow-lg relative">
        <h3 className="text-neon-green text-xs font-mono mb-2 border-b border-slate-800 pb-1">
          COGNITIVE MATRIX // {data.focus}
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="Scan" dataKey="A" stroke="#00ff41" fill="#00ff41" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="absolute bottom-2 right-2 text-[10px] text-slate-500 font-mono">
          SPECTRUM: {data.spectrum}
        </div>
      </div>

      {/* Metric Analysis (Bar/Linear) */}
      <div className="bg-deep-space border border-slate-700 rounded-lg p-4 shadow-lg flex flex-col">
        <h3 className="text-neon-red text-xs font-mono mb-2 border-b border-slate-800 pb-1">
          METRIC YIELD
        </h3>
        <div className="h-40 mb-4">
           <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={barData} margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 10 }} width={60} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} 
                itemStyle={{ color: '#fff' }}
                cursor={{fill: 'transparent'}}
              />
              <Bar dataKey="value" barSize={20} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex-1 bg-slate-900/50 p-3 rounded border border-slate-800 overflow-y-auto">
          <p className="text-xs text-slate-300 font-mono leading-relaxed">
            <span className="text-neon-blue">AI_ANALYSIS &gt;&gt;</span> {data.analysis}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDashboard;