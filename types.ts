export interface TrackingNode {
  id: string;
  x: number;
  y: number;
  label: string;
  type: 'ROOT' | 'HASH' | 'IP' | 'RELAY' | 'SERVER' | 'NFT';
  status: 'active' | 'idle' | 'analyzing' | 'secure';
  value?: string;
}

export interface AnalysisResult {
  define: number;
  recognize: number;
  sort: number;
  order: number;
  focus: string;
  spectrum: string;
  quality: number;
  quantity: number;
  analysis: string;
}

export interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';
  module: string;
  message: string;
}

export enum NetworkMode {
  STATIC = 'STATIC',
  DYNAMIC = 'DYNAMIC',
  GENESIS = 'GENESIS'
}