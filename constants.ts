export const AI_MODELS = ["cube", "core", "loop", "wave", "line", "coin", "code", "work"];

export const INITIAL_NODES = [
  { id: 'n1', x: 10, y: 90, label: 'DATA', type: 'ROOT' },
  { id: 'n2', x: 30, y: 70, label: 'PRIVATE', type: 'NFT' },
  { id: 'n3', x: 50, y: 50, label: 'HASH', type: 'HASH' },
  { id: 'n4', x: 70, y: 30, label: 'RELAY', type: 'RELAY' },
  { id: 'n5', x: 90, y: 10, label: 'KEY', type: 'SERVER' },
];

export const MOCK_LOGS = [
  "Initializing orchestrator ai.sh...",
  "Loading scoreboard from memory...",
  "Checking dependencies: curl [OK], jq [OK]",
  "Connecting to OLLAMA_HOST...",
  "Model 'core' ready for meta-eval.",
];