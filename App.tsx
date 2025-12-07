import React, { useState, useEffect } from 'react';
import { Activity, Shield, Cpu, Network, Send, Key } from 'lucide-react';
import TrackingGraph from './components/TrackingGraph';
import AnalysisDashboard from './components/AnalysisDashboard';
import ConsoleLog from './components/ConsoleLog';
import { analyzeTrackingData } from './services/geminiService';
import { AnalysisResult, LogEntry } from './types';
import { MOCK_LOGS, AI_MODELS } from './constants';

const App: React.FC = () => {
  const [active, setActive] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);

  // Initialize Logs
  useEffect(() => {
    let delay = 0;
    MOCK_LOGS.forEach((msg) => {
      setTimeout(() => {
        addLog('INFO', 'BOOT', msg);
      }, delay);
      delay += 800;
    });

    if (!process.env.API_KEY) {
      setTimeout(() => {
        setApiKeyMissing(true);
        addLog('ERROR', 'AUTH', 'API Key not found in environment. AI features disabled.');
      }, 1000);
    }
  }, []);

  const addLog = (level: LogEntry['level'], module: string, message: string) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs(prev => [...prev, { timestamp, level, module, message }]);
  };

  const handleAnalyze = async () => {
    if (!inputValue.trim()) return;
    if (apiKeyMissing) {
        addLog('ERROR', 'AUTH', 'Cannot execute. Missing API Key.');
        return;
    }

    setIsAnalyzing(true);
    addLog('INFO', 'INPUT', `Receiving data stream: ${inputValue.substring(0, 20)}...`);
    
    // Select a random orchestrator model from the script concept
    const model = AI_MODELS[Math.floor(Math.random() * AI_MODELS.length)];
    addLog('INFO', 'ORCH', `Dispatching to model node: '${model}'`);

    const result = await analyzeTrackingData(inputValue);

    if (result) {
      setAnalysisResult(result);
      addLog('SUCCESS', 'AI', `Analysis complete. Focus: ${result.focus}, Spectrum: ${result.spectrum}`);
      addLog('INFO', 'METRIC', `Quality: ${result.quality}% | Quantity: ${result.quantity}%`);
    } else {
      addLog('ERROR', 'AI', 'Analysis failed or returned empty response.');
    }

    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-deep-space text-slate-200 font-sans selection:bg-neon-blue selection:text-black">
      
      {/* Header / Nav */}
      <header className="border-b border-slate-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Network className="w-6 h-6 text-neon-blue animate-pulse" />
              <div className="absolute inset-0 bg-neon-blue blur-lg opacity-20"></div>
            </div>
            <h1 className="text-xl font-bold tracking-wider font-mono">
              WEB<span className="text-neon-blue">TRACKING</span>.AI
            </h1>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
             <div className="flex items-center gap-1">
               <Shield className="w-3 h-3 text-neon-green" />
               SECURE
             </div>
             <div className="flex items-center gap-1">
               <Activity className="w-3 h-3 text-neon-red" />
               LIVE
             </div>
             <div className="px-2 py-1 border border-slate-700 rounded text-[10px] bg-slate-900">
               v2.5-FLASH
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Input & Controls (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Input Panel */}
          <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-5 shadow-xl">
            <h2 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-neon-blue" />
              DATA INJECTION
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-1 block">
                  Target Hash / Text / URL
                </label>
                <div className="relative">
                  <textarea 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full bg-black border border-slate-700 rounded p-3 text-xs font-mono text-neon-blue focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none h-32 resize-none"
                    placeholder="Paste system logs, web content, or origin hash..."
                  />
                  {process.env.API_KEY ? (
                     <div className="absolute bottom-2 right-2 flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse"></div>
                     </div>
                  ) : (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center flex-col gap-2 rounded border border-red-900/50">
                        <Key className="w-5 h-5 text-red-500" />
                        <span className="text-xs text-red-400">API KEY REQUIRED</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || apiKeyMissing}
                className={`w-full py-3 px-4 rounded border font-mono text-xs font-bold tracking-widest transition-all flex items-center justify-center gap-2
                  ${isAnalyzing 
                    ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-wait' 
                    : 'bg-neon-blue/10 border-neon-blue/50 text-neon-blue hover:bg-neon-blue/20 hover:shadow-[0_0_15px_rgba(0,243,255,0.3)]'
                  }`}
              >
                {isAnalyzing ? (
                  <>PROCESSING <span className="animate-spin">/</span></>
                ) : (
                  <>INITIATE ANALYSIS <Send className="w-3 h-3" /></>
                )}
              </button>
            </div>
          </div>

          {/* System Logs */}
          <ConsoleLog logs={logs} />
        </div>

        {/* Right Column: Visualization & Dashboard (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Network Graph */}
          <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-1">
             <TrackingGraph active={active} />
          </div>

          {/* AI Analysis Dashboard */}
          <div className="h-80">
            <AnalysisDashboard data={analysisResult} />
          </div>

        </div>

      </main>

      {/* Footer Status Bar */}
      <footer className="fixed bottom-0 w-full bg-black border-t border-slate-800 text-[10px] font-mono py-1 px-4 flex justify-between text-slate-500 z-50">
        <div>
           STATUS: {active ? 'MONITORING' : 'IDLE'} | ORCHESTRATOR: AI.SH | NODE: LOCALHOST
        </div>
        <div className="flex gap-4">
           <span>MEM: 14%</span>
           <span>LATENCY: 24ms</span>
           <span className={apiKeyMissing ? "text-red-500" : "text-neon-green"}>
              API: {apiKeyMissing ? "DISCONNECTED" : "CONNECTED"}
           </span>
        </div>
      </footer>
    </div>
  );
};

export default App;