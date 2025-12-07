export const AI_MODELS = ["cube", "core", "loop", "wave", "line", "coin", "code", "work"];

export const INITIAL_NODES = [
  { id: 'n1', x: 10, y: 90, label: 'DATA', type: 'ROOT', status: 'active', trafficLoad: 'high' },
  { id: 'n6', x: 25, y: 80, label: 'PROXY', type: 'IP', status: 'active', trafficLoad: 'medium' },
  { 
    id: 'n2', 
    x: 40, 
    y: 65, 
    label: 'ASSET', 
    type: 'NFT', 
    status: 'secure', 
    ownership_status: 'owned', 
    contract_address: '0x7A...9F',
    trafficLoad: 'high' 
  },
  { id: 'n3', x: 55, y: 50, label: 'HASH', type: 'HASH', status: 'analyzing', trafficLoad: 'medium' },
  { id: 'n4', x: 75, y: 30, label: 'RELAY', type: 'RELAY', status: 'idle', trafficLoad: 'low' },
  { id: 'n5', x: 90, y: 10, label: 'KEY', type: 'SERVER', status: 'active', trafficLoad: 'medium' },
];

export const MOCK_LOGS = [
  "Initializing orchestrator ai.sh...",
  "Loading scoreboard from memory...",
  "Checking dependencies: curl [OK], jq [OK]",
  "Connecting to OLLAMA_HOST...",
  "Model 'core' ready for meta-eval.",
];