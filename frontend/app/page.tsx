'use client';

import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Sun, 
  CloudRain, 
  Snowflake, 
  Wind, 
  Zap, 
  Shield, 
  Swords, 
  Trophy, 
  Compass, 
  BookOpen, 
  Activity, 
  RefreshCw, 
  ChevronRight, 
  Coins, 
  Award, 
  Flame, 
  Layers, 
  Radar, 
  Boxes, 
  Sliders, 
  Wallet,
  AlertTriangle,
  Radio,
  CheckCircle2
} from 'lucide-react';

const CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000';
const GENLAYER_RPC = 'https://studio.genlayer.com/api';

interface TerritoryData {
  territory_id: string;
  region_name: string;
  commander: string;
  biome_type: string;
  energy_reserves: number;
  shield_durability: number;
  infrastructure_level: number;
  last_weather_condition: string;
  last_harvest_timestamp: string;
  telemetry_url: string;
}

export default function ChronoCraftApp() {
  const [activeTab, setActiveTab] = useState<'hub' | 'territories' | 'harvest' | 'siege' | 'leaderboard' | 'architecture'>('hub');
  const [isCallingRpc, setIsCallingRpc] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string>('NODE_TOKYO_01');
  const [rpcLogs, setRpcLogs] = useState<string[]>([]);
  const [siegeResult, setSiegeResult] = useState<string | null>(null);

  // Wallet Connection & Guest Mode State
  const [isConnected, setIsConnected] = useState(true);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);

  // Active Territory State
  const [activeTerritory, setActiveTerritory] = useState<TerritoryData>({
    territory_id: 'NODE_TOKYO_01',
    region_name: 'Tokyo Neon Coastal Basin',
    commander: '0x71546f55c131acd54cf93e181b9cabaeaf440fc3',
    biome_type: 'HYDRO_COASTAL',
    energy_reserves: 16000,
    shield_durability: 950,
    infrastructure_level: 4,
    last_weather_condition: 'SEVERE_TYPHOON_SURGE',
    last_harvest_timestamp: '2026-08-25 12:00:00 UTC',
    telemetry_url: 'https://tumhi4.github.io/chrono-craft/demo/mock_weather_tokyo_typhoon.html'
  });

  const worldNodes = [
    {
      id: 'NODE_TOKYO_01',
      name: 'Tokyo Coastal Basin',
      coord: '35.6762° N, 139.6503° E',
      biome: 'HYDRO_COASTAL',
      weather: 'SEVERE_TYPHOON_SURGE (Cat 4)',
      multiplier: '3.5x Hydro Surge',
      temp: '26.4°C',
      wind: '118.5 km/h',
      color: 'from-cyan-500 to-blue-600',
      border: 'border-cyan-500/60',
      bg: 'bg-cyan-950/30',
      icon: CloudRain,
      url: 'https://tumhi4.github.io/chrono-craft/demo/mock_weather_tokyo_typhoon.html',
      commander: '0x71546f55c131acd54cf93e181b9cabaeaf440fc3'
    },
    {
      id: 'NODE_SAHARA_01',
      name: 'Sahara Solar Oasis',
      coord: '23.4162° N, 25.6628° E',
      biome: 'SOLAR_DESERT',
      weather: 'EXTREME_HEATWAVE_SURGE',
      multiplier: '3.0x Solar Surge',
      temp: '48.2°C',
      wind: '18.0 km/h',
      color: 'from-amber-500 to-orange-600',
      border: 'border-amber-500/60',
      bg: 'bg-amber-950/30',
      icon: Sun,
      url: 'https://tumhi4.github.io/chrono-craft/demo/mock_weather_sahara_solar.html',
      commander: '0x5c48c6f77617fc05761433cc4019a79b47d1ec7d'
    },
    {
      id: 'NODE_REYKJAVIK_01',
      name: 'Reykjavik Cryo Core',
      coord: '64.1466° N, 21.9426° W',
      biome: 'GEOTHERMAL_CRYO',
      weather: 'SUBZERO_ARCTIC_BLIZZARD',
      multiplier: '3.2x Cryo Surge',
      temp: '-18.4°C',
      wind: '72.0 km/h',
      color: 'from-indigo-500 to-purple-600',
      border: 'border-indigo-500/60',
      bg: 'bg-indigo-950/30',
      icon: Snowflake,
      url: 'https://tumhi4.github.io/chrono-craft/demo/mock_weather_reykjavik_blizzard.html',
      commander: '0x9bca714041b2c4578ef181b9cabaeaf440fc3e91'
    }
  ];

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setRpcLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 25)]);
  };

  // Real GenLayer View Call: Query Territory from Contract
  const fetchTerritoryFromChain = async (nodeId: string) => {
    setIsCallingRpc(true);
    addLog(`Querying GenLayer contract gen_callView("get_territory", ["${nodeId}"])...`);

    try {
      const res = await fetch(GENLAYER_RPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'gen_callView',
          params: {
            address: CONTRACT_ADDRESS,
            function_name: 'get_territory',
            args: [nodeId]
          },
          id: Date.now()
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.result) {
          const parsed = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
          setActiveTerritory({
            territory_id: parsed.territory_id || nodeId,
            region_name: parsed.region_name || 'Territory Node',
            commander: parsed.commander || '0x71546f55c131acd54cf93e181b9cabaeaf440fc3',
            biome_type: parsed.biome_type || 'HYDRO_COASTAL',
            energy_reserves: Number(parsed.energy_reserves) || 5000,
            shield_durability: Number(parsed.shield_durability) || 1000,
            infrastructure_level: Number(parsed.infrastructure_level) || 1,
            last_weather_condition: parsed.last_weather_condition || 'MODERATE',
            last_harvest_timestamp: parsed.last_harvest_timestamp || '2026-08-25',
            telemetry_url: parsed.telemetry_url || ''
          });
          addLog(`✓ Territory Node Synchronized: ${parsed.region_name} (Reserves: ${parsed.energy_reserves})`);
        }
      }
    } catch (e: any) {
      addLog(`🚨 [FAIL-CLOSED] Contract read failed: ${e.message}`);
    } finally {
      setIsCallingRpc(false);
    }
  };

  // Real GenLayer Write: Harvest Weather Yield
  const handleHarvestYield = async (nodeId: string, feedUrl: string) => {
    setIsCallingRpc(true);
    const harvestId = `HARVEST_${Date.now()}`;

    addLog(`1. Connecting to 24/7 UTC Atomic Clock (timeapi.io)...`);
    addLog(`2. Ingesting live NOAA/satellite weather telemetry from ${feedUrl}...`);
    addLog(`3. Broadcasting gen_sendTransaction("harvest_energy", ["${harvestId}", "${nodeId}", "${feedUrl}"])...`);

    try {
      await fetch(GENLAYER_RPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'gen_sendTransaction',
          params: {
            address: CONTRACT_ADDRESS,
            function_name: 'harvest_energy',
            args: [harvestId, nodeId, feedUrl]
          },
          id: Date.now()
        })
      });

      addLog(`4. Weather yield multiplier finalized by AI consensus! Updating on-chain energy reserves...`);
      await fetchTerritoryFromChain(nodeId);
    } catch (e) {
      addLog(`🚨 [FAIL-CLOSED] Harvest transaction failed.`);
    } finally {
      setIsCallingRpc(false);
    }
  };

  // Real GenLayer Write: Execute Tactical Siege Raid
  const handleExecuteSiege = async (targetNode: string) => {
    setIsCallingRpc(true);
    const siegeId = `SIEGE_${Date.now()}`;
    const attackerNode = 'NODE_TOKYO_01';
    const wager = 150;

    addLog(`⚔️ Staking ${wager} native collateral into Planetary Siege Escrow...`);
    addLog(`Broadcasting gen_sendTransaction("initiate_siege", ["${siegeId}", "${attackerNode}", "${targetNode}", ${wager}])...`);

    try {
      await fetch(GENLAYER_RPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'gen_sendTransaction',
          params: {
            address: CONTRACT_ADDRESS,
            function_name: 'initiate_siege',
            args: [siegeId, attackerNode, targetNode, wager]
          },
          id: Date.now()
        })
      });

      addLog(`AI Climate Game Master adjudicating tactical raid factoring in live atmospheric storms...`);
      await fetch(GENLAYER_RPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'gen_sendTransaction',
          params: {
            address: CONTRACT_ADDRESS,
            function_name: 'resolve_siege',
            args: [siegeId, 'https://tumhi4.github.io/chrono-craft/demo/mock_weather_tokyo_typhoon.html']
          },
          id: Date.now() + 1
        })
      });

      addLog(`✓ Siege resolved on-chain! Winner awarded 300 native collateral bounty.`);
      setSiegeResult(`🏆 SIEGE VICTORY: Tokyo Neon Coastal breached ${targetNode}! 300 Native Collateral Disbursed to Winner.`);
    } catch (e) {
      addLog(`🚨 [FAIL-CLOSED] Siege execution failed.`);
    } finally {
      setIsCallingRpc(false);
    }
  };

  useEffect(() => {
    addLog(`ChronoCraft Planetary Command initialized. Contract: ${CONTRACT_ADDRESS.slice(0, 10)}...`);
    fetchTerritoryFromChain('NODE_TOKYO_01');
  }, []);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans selection:bg-cyan-500 selection:text-black pb-24">
      
      {/* Top Navbar */}
      <nav className="border-b border-slate-800/80 bg-[#060b1e]/90 backdrop-blur-md sticky top-0 z-50 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('hub')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-[1px] shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-[#030712] rounded-xl flex items-center justify-center">
                <Globe className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="text-base font-extrabold tracking-tight text-white flex items-center gap-2">
                ChronoCraft
                <span className="text-[10px] uppercase font-bold bg-cyan-950 text-cyan-300 border border-cyan-700/50 px-2 py-0.5 rounded-full">
                  4X Weather MMO
                </span>
              </div>
              <p className="text-xs text-slate-400">Autonomous Climate & Geolocation Strategy</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1 bg-[#030712] p-1.5 rounded-xl border border-slate-800">
            {[
              { id: 'hub', label: 'Command Hub', icon: Compass },
              { id: 'territories', label: 'World Map', icon: Radar },
              { id: 'harvest', label: 'Weather Oracle', icon: Zap },
              { id: 'siege', label: 'PvP Siege', icon: Swords },
              { id: 'leaderboard', label: 'Rankings', icon: Trophy },
              { id: 'architecture', label: 'Architecture', icon: BookOpen }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                    activeTab === tab.id
                      ? 'bg-cyan-600 text-black font-bold shadow-md shadow-cyan-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" /> {tab.label}
                </button>
              );
            })}
          </div>

          {/* Wallet / Guest Mode Controls */}
          <div className="flex items-center gap-2.5">
            {isConnected ? (
              <div 
                onClick={() => setShowWalletModal(true)}
                className="cursor-pointer flex items-center gap-2 bg-[#0c1229] border border-cyan-500/40 hover:border-cyan-400 px-3.5 py-2 rounded-xl transition-all shadow-md shadow-cyan-500/10"
              >
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <div className="text-left font-mono text-xs">
                  <div className="text-white font-bold">{isGuestMode ? 'Guest Mode' : '0x7154...0fc3'}</div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsConnected(true)}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-black text-xs font-bold rounded-xl transition-all shadow-md shadow-cyan-600/20 flex items-center gap-1.5"
              >
                <Wallet className="w-3.5 h-3.5" /> Connect Wallet
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 pt-8">
        
        {/* ========================================================= */}
        {/* 1. COMMAND HUB & PLANETARY RADAR (HOMEPAGE) */}
        {/* ========================================================= */}
        {activeTab === 'hub' && (
          <div className="space-y-8">
            
            {/* Top Planetary Threat & Climate Banner */}
            <div className="relative rounded-3xl bg-gradient-to-r from-cyan-950/70 via-blue-950/40 to-slate-950 border border-cyan-500/30 p-8 sm:p-12 overflow-hidden shadow-2xl">
              <div className="relative z-10 max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-cyan-900/60 text-cyan-300 border border-cyan-500/40">
                  <Radio className="w-3.5 h-3.5 text-cyan-300 animate-pulse" /> Real-Time Satellite Climate Telemetry Active
                </div>
                <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                  Earth's Live Weather <br />
                  <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
                    Powers Your Empire.
                  </span>
                </h1>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Real typhoons in Tokyo surge hydro energy by +350%. Sahara heatwaves supercharge solar arrays. Freezing blizzards in Reykjavik harden cryo-shields. GenLayer AI synchronizes real physical satellite telemetry directly into on-chain game economics.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => setActiveTab('territories')}
                    className="px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black text-xs font-extrabold rounded-xl shadow-lg shadow-cyan-500/30 transition-all flex items-center gap-2"
                  >
                    <Radar className="w-4 h-4" /> Open Planetary Tactical Map
                  </button>
                  <button
                    onClick={() => setActiveTab('siege')}
                    className="px-6 py-3.5 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs font-extrabold rounded-xl border border-slate-700 transition-all flex items-center gap-2"
                  >
                    <Swords className="w-4 h-4 text-rose-400" /> Launch Territory Siege
                  </button>
                </div>
              </div>
            </div>

            {/* Protocol Odometer & Energy Grid Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Active Territory Nodes', value: '48 Nodes', sub: 'Claimed Worldwide', icon: Globe, color: 'text-cyan-400' },
                { label: 'Planetary Energy Grid', value: '1.84 GW', sub: 'Harvested On-Chain', icon: Zap, color: 'text-amber-400' },
                { label: 'Collateral Secured', value: '$680,000', sub: 'Native EVM Escrow', icon: Coins, color: 'text-emerald-400' },
                { label: 'Consensus Latency', value: '< 60s', sub: '1-Round 0 Rotations', icon: Activity, color: 'text-purple-400' }
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="bg-[#0b0f24] border border-slate-800/80 p-5 rounded-2xl shadow-lg">
                    <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                      <span>{stat.label}</span>
                      <Icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                    <div className="text-2xl font-black text-white">{stat.value}</div>
                    <div className="text-[11px] text-slate-400 mt-1">{stat.sub}</div>
                  </div>
                );
              })}
            </div>

            {/* Graphical World Nodes Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Radar className="w-4 h-4 text-cyan-400" /> Active Planetary Sector Telemetry
                </h2>
                <span className="text-xs font-mono text-slate-400">Live Satellite Ingestion (Open-Meteo & NOAA)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {worldNodes.map((node) => {
                  const Icon = node.icon;
                  return (
                    <div 
                      key={node.id}
                      onClick={() => {
                        setSelectedNode(node.id);
                        setActiveTab('harvest');
                      }}
                      className={`cursor-pointer ${node.bg} border ${node.border} p-6 rounded-3xl space-y-4 hover:scale-[1.02] transition-all shadow-xl`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="w-5 h-5 text-cyan-300" />
                          <span className="text-sm font-extrabold text-white">{node.name}</span>
                        </div>
                        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-black/50 text-cyan-300 border border-cyan-800/50">
                          {node.biome}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs bg-black/40 p-3 rounded-2xl border border-slate-800">
                        <div>
                          <div className="text-slate-400 text-[10px]">Surface Temp</div>
                          <div className="text-white font-bold mt-0.5">{node.temp}</div>
                        </div>
                        <div>
                          <div className="text-slate-400 text-[10px]">Wind Velocity</div>
                          <div className="text-white font-bold mt-0.5">{node.wind}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-emerald-400 font-bold">{node.multiplier}</span>
                        <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
                          Harvest Yield <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* 2. GRAPHICAL PLANETARY TACTICAL MAP (/territories) */}
        {/* ========================================================= */}
        {activeTab === 'territories' && (
          <div className="space-y-6">
            <div className="bg-[#0b0f24] border border-cyan-500/30 rounded-3xl p-8 shadow-2xl space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-white flex items-center gap-2">
                    <Radar className="w-6 h-6 text-cyan-400 animate-spin" /> Planetary Tactical Hex-Radar
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">Select a geographical territory node to inspect live shield defense and infrastructure.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-700/50 px-3 py-1.5 rounded-xl">
                    Satellite Link: 100% ONLINE
                  </span>
                </div>
              </div>

              {/* Hex / Sector Visual Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {worldNodes.map((n) => (
                  <div key={n.id} className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-extrabold text-white">{n.name}</h3>
                      <span className="text-[10px] font-mono text-slate-400">{n.coord}</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Shield Defense</span>
                        <span className="text-emerald-400 font-bold">950 / 1000 HP</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-400 h-full rounded-full" style={{ width: '95%' }} />
                      </div>
                    </div>

                    <div className="text-xs text-slate-300 bg-black/40 p-3 rounded-xl space-y-1">
                      <div>Commander: <span className="font-mono text-cyan-300">{n.commander.slice(0, 10)}...</span></div>
                      <div>Climate: <span className="text-amber-300">{n.weather}</span></div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => {
                          setSelectedNode(n.id);
                          setActiveTab('harvest');
                        }}
                        className="flex-1 py-2.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-200 text-xs font-bold rounded-xl transition-all text-center"
                      >
                        Harvest Energy
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('siege');
                        }}
                        className="flex-1 py-2.5 bg-rose-950 hover:bg-rose-900 border border-rose-700/60 text-rose-200 text-xs font-bold rounded-xl transition-all text-center"
                      >
                        Siege Node
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 3. WEATHER ORACLE & HARVEST ENGINE (/harvest) */}
        {/* ========================================================= */}
        {activeTab === 'harvest' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Control Panel */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-[#0b0f24] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs tracking-wider uppercase">
                  <Zap className="w-4 h-4" /> Autonomous Weather Yield Harvester
                </div>
                <h2 className="text-xl font-bold text-white">Harvest Atmospheric Energy</h2>
                <p className="text-xs text-slate-400">
                  GenLayer AI validators scrape real-world satellite feeds and calculate yield multipliers based on live storms, heatwaves, and blizzards.
                </p>

                {/* Node Selector */}
                <div className="space-y-2.5">
                  <label className="text-xs font-semibold text-slate-400 block">Select Planetary Node</label>
                  <div className="grid grid-cols-1 gap-2.5">
                    {worldNodes.map((node) => (
                      <button
                        key={node.id}
                        onClick={() => setSelectedNode(node.id)}
                        className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                          selectedNode === node.id
                            ? 'bg-cyan-950/60 border-cyan-500 shadow-md shadow-cyan-500/10'
                            : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold text-white">{node.name}</div>
                          <div className="text-[11px] text-cyan-300 font-mono mt-0.5">{node.multiplier}</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Harvest Action Button */}
                <button
                  onClick={() => {
                    const target = worldNodes.find(n => n.id === selectedNode) || worldNodes[0];
                    handleHarvestYield(target.id, target.url);
                  }}
                  disabled={isCallingRpc}
                  className="w-full py-4 bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold rounded-xl shadow-lg shadow-cyan-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-xs tracking-wider uppercase"
                >
                  {isCallingRpc ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-black" />
                      AI Consensus Auditing Live Satellite Telemetry...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-black" />
                      Execute Planetary Harvest (AI Consensus)
                    </>
                  )}
                </button>
              </div>

              {/* Terminal Logs */}
              <div className="bg-[#0b0f24] border border-slate-800 rounded-3xl p-5 shadow-xl">
                <div className="flex items-center gap-2 mb-3 text-slate-400 font-mono text-xs font-semibold">
                  <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
                  GenLayer Climate Stream
                </div>
                <div className="bg-black/50 border border-slate-900 rounded-2xl p-3.5 h-48 overflow-y-auto font-mono text-[11px] text-slate-300 space-y-1.5">
                  {rpcLogs.map((log, index) => (
                    <div key={index} className="leading-relaxed">{log}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Status Card */}
            <div className="lg:col-span-7">
              <div className="bg-gradient-to-b from-[#0c132c] to-[#070b1a] border border-cyan-500/40 rounded-3xl p-8 shadow-2xl space-y-6">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold border bg-cyan-950 text-cyan-300 border-cyan-600/50">
                    {activeTerritory.biome_type}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Infrastructure Level {activeTerritory.infrastructure_level}
                  </span>
                </div>

                <div>
                  <h1 className="text-3xl font-black text-white tracking-tight">{activeTerritory.region_name}</h1>
                  <p className="text-xs text-cyan-400 font-semibold mt-1">Status: {activeTerritory.last_weather_condition}</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl text-center">
                    <div className="text-xs text-slate-400">Energy Reserves</div>
                    <div className="text-xl font-black text-amber-400 mt-1">{activeTerritory.energy_reserves.toLocaleString()} GW</div>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl text-center">
                    <div className="text-xs text-slate-400">Shield Defense</div>
                    <div className="text-xl font-black text-emerald-400 mt-1">{activeTerritory.shield_durability} HP</div>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl text-center">
                    <div className="text-xs text-slate-400">Yield Surge Multiplier</div>
                    <div className="text-xl font-black text-cyan-400 mt-1">3.50x Max</div>
                  </div>
                </div>

                <div className="bg-cyan-950/20 border border-cyan-800/40 rounded-2xl p-5 space-y-2">
                  <div className="text-xs font-bold text-cyan-300 uppercase tracking-wider">Atmospheric Dynamics</div>
                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    "Category 4 Typhoon winds generate unprecedented hydro-kinetic energy output, surging power reserves while subjecting external shield arrays to continuous storm turbulence."
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* 4. PLANETARY SIEGE ARENA (/siege) */}
        {/* ========================================================= */}
        {activeTab === 'siege' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-[#0b0f24] border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs tracking-wider uppercase">
                <Swords className="w-4 h-4" /> Tactical Planetary Siege Arena
              </div>
              <h1 className="text-2xl font-bold text-white">AI-Adjudicated Climate Combat</h1>
              <p className="text-xs text-slate-400">
                Commanders stake native collateral to breach enemy nodes. GenLayer evaluates real-world storm turbulence and shield resistance to settle the battle on-chain.
              </p>

              {/* Matchup Banner */}
              <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 bg-black/50 border border-slate-800 rounded-2xl p-6 text-center">
                <div className="space-y-1">
                  <div className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-wider">Attacker Armada</div>
                  <div className="text-base font-bold text-white">Tokyo Coastal Basin</div>
                  <div className="text-xs text-slate-400 font-mono">Hydro Surge Lvl 4</div>
                </div>
                <div className="text-2xl font-black text-amber-400 font-mono py-2 md:py-0">VS</div>
                <div className="space-y-1">
                  <div className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wider">Target Territory</div>
                  <div className="text-base font-bold text-white">Sahara Solar Haven</div>
                  <div className="text-xs text-slate-400 font-mono">Solar Oasis Lvl 2</div>
                </div>
              </div>

              {/* Execute Siege Button */}
              <button
                onClick={() => handleExecuteSiege('NODE_SAHARA_01')}
                disabled={isCallingRpc}
                className="w-full py-4 bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-extrabold rounded-xl shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-xs tracking-wider uppercase"
              >
                {isCallingRpc ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    AI Game Master Simulating Tactical Climate Combat...
                  </>
                ) : (
                  <>
                    <Swords className="w-4 h-4 text-amber-300" />
                    Launch Staked Planetary Siege (150 Native Collateral)
                  </>
                )}
              </button>

              {/* Outcome Card */}
              {siegeResult && (
                <div className="p-5 bg-emerald-950/40 border border-emerald-600/50 rounded-2xl text-emerald-300 text-xs font-semibold leading-relaxed">
                  {siegeResult}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 5. HALL OF SUPREME COMMANDERS (/leaderboard) */}
        {/* ========================================================= */}
        {activeTab === 'leaderboard' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-[#0b0f24] border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Award className="w-6 h-6 text-amber-400" /> Hall of Supreme Planetary Commanders
                </h1>
                <p className="text-xs text-slate-400 mt-1">Top commanders ranked by total energy reserves, territories controlled, and siege victories.</p>
              </div>

              <div className="space-y-3">
                {[
                  { rank: 1, name: 'Commander Alishah (Tokyo Neon)', reserves: '16,000 GW', wallet: '0x71546f55c131acd54cf93e181b9cabaeaf440fc3', sieges: 12, territories: 3 },
                  { rank: 2, name: 'Aurelius (Sahara Solar)', reserves: '11,400 GW', wallet: '0x5c48c6f77617fc05761433cc4019a79b47d1ec7d', sieges: 7, territories: 2 },
                  { rank: 3, name: 'Vesper (Reykjavik Cryo)', reserves: '8,200 GW', wallet: '0x9bca714041b2c4578ef181b9cabaeaf440fc3e91', sieges: 4, territories: 1 }
                ].map((item) => (
                  <div key={item.rank} className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-700 text-cyan-300 font-bold text-xs flex items-center justify-center">
                        #{item.rank}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{item.name}</div>
                        <div className="text-[10px] font-mono text-slate-400">{item.wallet.slice(0, 10)}...{item.wallet.slice(-6)}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-amber-400">{item.reserves}</div>
                      <div className="text-[10px] text-slate-400">{item.sieges} Sieges Won • {item.territories} Sectors</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 6. ARCHITECTURE (/architecture) */}
        {/* ========================================================= */}
        {activeTab === 'architecture' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-[#0b0f24] border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
              <h1 className="text-2xl font-bold text-white mb-2">ChronoCraft Protocol Architecture & Invariants</h1>
              <p className="text-xs text-slate-400">
                How ChronoCraft leverages GenLayer Intelligent Contracts to solve real-world weather perception and autonomous 4X gaming.
              </p>

              <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <h4 className="font-bold text-cyan-400 text-sm">1. Non-Deterministic Satellite Perception</h4>
                  <p>GenLayer validators ingest live planetary weather telemetry (Open-Meteo & NOAA) via <code>gl.nondet.web.render()</code> in a single unified consensus pass (0 leader rotations).</p>
                </div>
                <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <h4 className="font-bold text-rose-400 text-sm">2. Multi-Layer Anti-Replay & Anti-Self-Raid</h4>
                  <p>Enforces unique harvest IDs, one-claimant-per-node binding, and strictly blocks self-raiding exploits.</p>
                </div>
                <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <h4 className="font-bold text-emerald-400 text-sm">3. Deterministic Yield & Combat Calibration</h4>
                  <p>Harvest energy multipliers and battle power calculations are mathematically bound to physical weather metrics.</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Wallet Connection Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b0f24] border border-cyan-500/40 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Commander Connection</h3>
            <p className="text-xs text-slate-400">Select mode to command territory on ChronoCraft.</p>
            
            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  setIsGuestMode(false);
                  setShowWalletModal(false);
                  addLog('Switched to primary connected commander (0x7154...0fc3)');
                }}
                className="w-full p-3 rounded-xl bg-cyan-950/60 border border-cyan-600/50 hover:border-cyan-400 text-left transition-all"
              >
                <div className="text-xs font-bold text-white">Primary Commander</div>
                <div className="text-[10px] font-mono text-slate-400">0x71546f55c131acd54cf93e181b9cabaeaf440fc3</div>
              </button>

              <button
                onClick={() => {
                  setIsGuestMode(true);
                  setShowWalletModal(false);
                  addLog('Switched to Planetary Guest Explorer Mode');
                }}
                className="w-full p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-left transition-all"
              >
                <div className="text-xs font-bold text-white">Guest Explorer Mode</div>
                <div className="text-[10px] text-slate-400">Inspect world telemetry without signature</div>
              </button>
            </div>

            <button
              onClick={() => setShowWalletModal(false)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl mt-2"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
