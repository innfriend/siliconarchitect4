/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { WorkloadInputs, EstimationOutputs } from "../types";
import { 
  Thermometer, 
  Flame, 
  Wind, 
  Sliders, 
  RotateCcw, 
  Activity, 
  Zap, 
  Cpu, 
  ShieldAlert, 
  Info,
  Maximize2,
  Minimize2,
  Play,
  Pause
} from "lucide-react";

interface ThermalMapVisualizerProps {
  inputs: WorkloadInputs;
  outputs: EstimationOutputs;
}

interface GridCell {
  row: number;
  col: number;
  block: "compute" | "sram" | "control" | "ddr" | "io" | "uncore";
  label: string;
  baseWeight: number; // weight of local dynamic power
  leakageWeight: number; // weight of leakage power
}

export const ThermalMapVisualizer: React.FC<ThermalMapVisualizerProps> = ({ inputs, outputs }) => {
  const { processNode, powerBudget } = inputs;
  
  // Interactive thermal configurations
  const [coolingType, setCoolingType] = useState<"passive" | "active" | "liquid">("active");
  const [workloadIntensity, setWorkloadIntensity] = useState<number>(100); // % of nominal activity
  const [hoveredCell, setHoveredCell] = useState<{ cell: GridCell; temp: number } | null>(null);
  const [isStressTestActive, setIsStressTestActive] = useState<boolean>(false);
  const [isThrottling, setIsThrottling] = useState<boolean>(false);
  
  // Realtime simulation state
  const [time, setTime] = useState<number>(0);
  const [throttleFactor, setThrottleFactor] = useState<number>(1.0); // 1.0 = no throttling, e.g. 0.6 = throttled to 60% clock
  const [history, setHistory] = useState<{ time: number; maxTemp: number; sramTemp: number; macTemp: number; clockGhz: number }[]>([]);
  
  const simulationRef = useRef<number | null>(null);

  // 1. Determine Grid Layout (10 columns x 8 rows)
  const gridCells = useRef<GridCell[]>([]);
  if (gridCells.current.length === 0) {
    const tempCells: GridCell[] = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 10; col++) {
        let block: GridCell["block"] = "uncore";
        let label = "Uncore / Guard Ring";
        let baseWeight = 0.15;
        let leakageWeight = 0.3;

        // Map regions on the silicon die
        if (row === 0) {
          block = "ddr";
          label = "DDR Interface PHY";
          baseWeight = 0.65;
          leakageWeight = 0.5;
        } else if (row === 7) {
          block = "io";
          label = "PCIe / High-Speed I/O";
          baseWeight = 0.55;
          leakageWeight = 0.4;
        } else if (col >= 2 && col <= 7 && row >= 2 && row <= 5) {
          // Central compute clusters
          block = "compute";
          label = `Compute cluster (PE_${col - 2}_${row - 2})`;
          baseWeight = 1.6;
          leakageWeight = 1.0;
        } else if ((col < 2 || col > 7) && row >= 1 && row <= 6) {
          // SRAM banks around compute
          block = "sram";
          label = `SRAM cache bank (Block_${col < 2 ? "L" : "R"}_${row})`;
          baseWeight = 0.35;
          leakageWeight = 0.85;
        } else if (row === 1 && col >= 2 && col <= 7) {
          // Control Logic / Instruction Decode
          block = "control";
          label = "Control Unit & Dispatch";
          baseWeight = 0.8;
          leakageWeight = 0.6;
        } else if (row === 6 && col >= 2 && col <= 7) {
          block = "control";
          label = "Address Generation Unit (AGU)";
          baseWeight = 0.7;
          leakageWeight = 0.65;
        }

        tempCells.push({ row, col, block, label, baseWeight, leakageWeight });
      }
    }
    gridCells.current = tempCells;
  }

  // 2. Thermodynamic calculations
  // Process Node thermal scaling factor: smaller node = higher thermal resistance (W/mm² is much denser!)
  const nodeThermalMultiplier = (() => {
    switch (processNode) {
      case "3nm": return 2.6;
      case "5nm": return 2.0;
      case "7nm": return 1.6;
      case "12nm": return 1.2;
      case "16nm": return 1.1;
      case "22nm": return 0.95;
      case "28nm": return 0.8;
      default: return 1.0;
    }
  })();

  // Cooling heat dissipation rate
  const coolingMultiplier = (() => {
    switch (coolingType) {
      case "passive": return 0.65; // Poor dissipation, runs hot
      case "active": return 1.0;   // Moderate fan dissipation
      case "liquid": return 1.55;  // Excellent cooling dissipation
    }
  })();

  // Stress test dynamic factor
  const stressMultiplier = isStressTestActive ? 1.45 : 1.0;

  // Real-time thermal simulation ticking
  useEffect(() => {
    let tickCount = 0;
    const runSimulation = () => {
      setTime(prev => prev + 1);
      tickCount++;
      simulationRef.current = requestAnimationFrame(runSimulation);
    };

    simulationRef.current = requestAnimationFrame(runSimulation);
    return () => {
      if (simulationRef.current) cancelAnimationFrame(simulationRef.current);
    };
  }, []);

  // Compute thermal map cell temperatures based on dynamic and leakage power, cooling, process node, and stress multiplier
  const ambientTemp = 25.0; // Ambient chassis temp in degrees Celsius
  
  // Calculate dynamic temperatures
  const getCellTemperature = (cell: GridCell) => {
    // Basic dynamic power of core scaled by workload intensity, thermal throttling, and stress test
    const dynamicPowerContribution = outputs.dynamicPowerW * (workloadIntensity / 100) * throttleFactor * stressMultiplier;
    const leakagePowerContribution = outputs.leakagePowerW * stressMultiplier;

    // Thermal formula: Temp = Ambient + (P_dynamic * W_base + P_leakage * W_leakage) * NodeResistance / Cooling
    const heatGenerated = (dynamicPowerContribution * cell.baseWeight) + (leakagePowerContribution * cell.leakageWeight);
    const temperatureRise = (heatGenerated * nodeThermalMultiplier) / coolingMultiplier;
    
    // Add small random micro-fluctuation (0.1°C to 0.4°C) to make the simulation feel alive
    const noise = Math.sin(time * 0.1 + cell.row * 0.7 + cell.col * 0.5) * 0.35;
    
    // Apply saturation limit (thermal physics: hot objects radiate heat faster)
    const rawTemp = ambientTemp + temperatureRise + noise;
    return Math.max(ambientTemp, Math.min(125.0, rawTemp));
  };

  // Get max temperature across compute clusters
  const computeClusterCells = gridCells.current.filter(c => c.block === "compute");
  const sramClusterCells = gridCells.current.filter(c => c.block === "sram");

  const computeTemps = computeClusterCells.map(getCellTemperature);
  const sramTemps = sramClusterCells.map(getCellTemperature);

  const peakComputeTemp = computeTemps.length > 0 ? Math.max(...computeTemps) : ambientTemp;
  const avgSramTemp = sramTemps.length > 0 ? sramTemps.reduce((a, b) => a + b, 0) / sramTemps.length : ambientTemp;
  
  // Peak overall chip junction temperature
  const allTemps = gridCells.current.map(getCellTemperature);
  const peakJunctionTemp = Math.max(...allTemps);

  // 3. Dynamic Voltage & Frequency Scaling (DVFS) thermal throttling feedback loop
  useEffect(() => {
    // Thermal threshold check: triggers throttling above 90.0°C to keep silicon within safe operational envelope
    if (peakJunctionTemp >= 90.0) {
      setIsThrottling(true);
      // Throttle proportionally: deeper throttling as temperature rises further
      const throttleTarget = Math.max(0.45, 1.0 - (peakJunctionTemp - 90.0) * 0.025);
      // Smoothly approach throttle target to simulate thermal mass latency
      setThrottleFactor(prev => prev + (throttleTarget - prev) * 0.15);
    } else {
      setIsThrottling(false);
      // Smoothly restore full clock frequency as chip cools down below threshold
      setThrottleFactor(prev => {
        if (prev >= 0.99) return 1.0;
        return prev + (1.0 - prev) * 0.1;
      });
    }
  }, [time]); // eslint-disable-line react-hooks/exhaustive-deps

  // Maintain real-time telemetry log history
  useEffect(() => {
    // Add record every 30 frames
    if (time % 20 === 0) {
      setHistory(prev => {
        const next = [...prev, {
          time: time,
          maxTemp: peakJunctionTemp,
          sramTemp: avgSramTemp,
          macTemp: peakComputeTemp,
          clockGhz: outputs.frequencyGhz * throttleFactor
        }];
        if (next.length > 40) next.shift(); // sliding window of 40 data points
        return next;
      });
    }
  }, [time, peakJunctionTemp, avgSramTemp, peakComputeTemp, outputs.frequencyGhz, throttleFactor]);

  // Color mapping based on temperature scale
  const getCellColor = (temp: number) => {
    if (temp < 40) return "rgba(20, 184, 166, "; // Teal for cold / idle
    if (temp < 55) return "rgba(16, 185, 129, "; // Emerald for nominal
    if (temp < 72) return "rgba(234, 179, 8, ";  // Yellow for warm
    if (temp < 88) return "rgba(249, 115, 22, "; // Orange for hot
    return "rgba(239, 68, 68, ";                // Red for critical
  };

  const getCellHexColor = (temp: number) => {
    if (temp < 40) return "#14b8a6";
    if (temp < 55) return "#10b981";
    if (temp < 72) return "#eab308";
    if (temp < 88) return "#f97316";
    return "#ef4444";
  };

  const triggerStressTest = () => {
    setIsStressTestActive(prev => !prev);
  };

  const resetSimulation = () => {
    setIsStressTestActive(false);
    setThrottleFactor(1.0);
    setHistory([]);
  };

  return (
    <div id="thermal-map-visualizer-card" className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-5">
      {/* Visual Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-slate-800 pb-3 gap-2">
        <div>
          <h4 className="text-sm font-bold font-mono text-slate-200 flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-orange-500 animate-pulse" />
            HIGH-FIDELITY SILICON THERMAL EMULATOR
          </h4>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
            2D junction temperature distribution modeling on {processNode} node with a {powerBudget}W budget.
          </p>
        </div>
        
        {/* Reset & Stress Buttons */}
        <div className="flex gap-2 self-start sm:self-center">
          <button
            onClick={triggerStressTest}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-mono text-[10px] font-bold transition-all border ${
              isStressTestActive
                ? "bg-red-500/20 border-red-500/50 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.3)] animate-pulse"
                : "bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20"
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>{isStressTestActive ? "STOP STRESS TEST" : "STRESS TEST (GEMM)"}</span>
          </button>
          
          <button
            onClick={resetSimulation}
            className="p-1 px-2.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-750 transition-all font-mono text-[10px]"
            title="Reset simulation variables"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Grid & Telemetry Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Left Side: 2D Thermal Matrix Grid (8 Cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background Circuit Grid Glow */}
            <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#0ea5e9_1px,transparent_1px)] [background-size:12px_12px]"></div>

            {/* Simulated 2D Thermal Grid */}
            <div className="grid grid-cols-10 gap-1 w-full max-w-[480px] aspect-[10/8] relative z-10">
              {gridCells.current.map((cell, idx) => {
                const temp = getCellTemperature(cell);
                const isHovered = hoveredCell && hoveredCell.cell.row === cell.row && hoveredCell.cell.col === cell.col;
                const baseColor = getCellColor(temp);
                const hexColor = getCellHexColor(temp);

                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredCell({ cell, temp })}
                    onMouseLeave={() => setHoveredCell(null)}
                    className="relative cursor-crosshair rounded-sm transition-all duration-300 border border-transparent overflow-hidden"
                    style={{
                      backgroundColor: `${baseColor}${isHovered ? "0.6" : "0.2"})`,
                      borderColor: `${baseColor}${isHovered ? "0.9" : "0.15"})`,
                      boxShadow: isHovered ? `0 0 10px ${hexColor}80` : "none",
                    }}
                  >
                    {/* Inner glowing heat core */}
                    <div 
                      className="absolute inset-1 rounded-sm opacity-60"
                      style={{
                        background: `radial-gradient(circle, ${hexColor}dd 0%, transparent 80%)`,
                        filter: "blur(1px)"
                      }}
                    />

                    {/* Block identifiers on cell corners or subtle grid overlay */}
                    {cell.block === "compute" && (
                      <div className="absolute bottom-0.5 right-0.5 w-1 h-1 rounded-full bg-cyan-400/50"></div>
                    )}
                    {cell.block === "sram" && (
                      <div className="absolute top-0.5 left-0.5 w-1 h-1 rounded-full bg-emerald-400/40"></div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Scanning Laser Beam Overlay during stress test */}
            {isStressTestActive && (
              <motion.div
                className="absolute inset-x-0 h-0.5 bg-red-500 shadow-[0_0_12px_#ef4444] pointer-events-none z-20"
                animate={{ top: ["5%", "95%", "5%"] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
          </div>

          {/* Interactive Temperature Legend Map */}
          <div className="bg-slate-950/60 border border-slate-850 rounded-xl p-3">
            <div className="flex justify-between text-[8px] text-slate-500 font-mono mb-1.5 uppercase tracking-widest font-black">
              <span>Junction Temp Profile scale</span>
              <span>Thermodynamic State</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gradient-to-r from-teal-500 via-emerald-500 via-yellow-500 via-orange-500 to-red-500 relative mb-2"></div>
            <div className="grid grid-cols-5 text-[8.5px] font-mono text-slate-400 text-center">
              <span className="text-teal-400 font-bold border-r border-slate-850">Cool (&lt;40°C)</span>
              <span className="text-emerald-400 font-bold border-r border-slate-850">Nominal (&lt;55°C)</span>
              <span className="text-yellow-400 font-bold border-r border-slate-850">Warm (&lt;72°C)</span>
              <span className="text-orange-400 font-bold border-r border-slate-850">Hot (&lt;88°C)</span>
              <span className="text-red-400 font-bold animate-pulse">Critical (&gt;88°C)</span>
            </div>
          </div>
        </div>

        {/* Right Side: Telemetry, Knobs, & Dynamic Charting (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          
          {/* Active Sensor Panel Details */}
          <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 space-y-3 flex-1 flex flex-col justify-between">
            <h5 className="text-[10px] font-black text-slate-400 font-mono tracking-wider uppercase border-b border-slate-850 pb-1.5 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              Realtime Core Junction Telemetry
            </h5>

            <div className="space-y-2 flex-1 flex flex-col justify-center">
              {/* Junction Peak */}
              <div className="flex justify-between items-center bg-slate-900/40 p-2 rounded border border-slate-850/60">
                <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                  <Flame className={`w-3.5 h-3.5 ${peakJunctionTemp >= 80.0 ? "text-red-500 animate-pulse" : "text-amber-500"}`} />
                  PEAK JUNCTION TEMP:
                </span>
                <span className={`text-sm font-black font-mono tracking-tight ${peakJunctionTemp >= 80.0 ? "text-red-400" : "text-slate-100"}`}>
                  {peakJunctionTemp.toFixed(1)}°C
                </span>
              </div>

              {/* Silicon Clock speed showing thermal throttling dynamic effect */}
              <div className="flex justify-between items-center bg-slate-900/40 p-2 rounded border border-slate-850/60">
                <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                  <Zap className={`w-3.5 h-3.5 ${isThrottling ? "text-yellow-500 animate-bounce" : "text-indigo-400"}`} />
                  OPERATIONAL CLOCK:
                </span>
                <div className="text-right font-mono">
                  <span className={`text-sm font-black tracking-tight ${isThrottling ? "text-yellow-400" : "text-emerald-400"}`}>
                    {(outputs.frequencyGhz * throttleFactor).toFixed(2)} GHz
                  </span>
                  {isThrottling && (
                    <span className="block text-[8px] text-yellow-500 font-bold uppercase tracking-tighter">
                      Throttled ({(throttleFactor * 100).toFixed(0)}%)
                    </span>
                  )}
                </div>
              </div>

              {/* Local Power Density estimates */}
              <div className="flex justify-between items-center bg-slate-900/40 p-2 rounded border border-slate-850/60 text-[10px] font-mono">
                <span className="text-slate-400">LOCAL POWER DENSITY:</span>
                <span className="text-slate-300 font-bold">
                  {((outputs.dynamicPowerW * stressMultiplier) / outputs.estimatedAreaMm2).toFixed(3)} W/mm²
                </span>
              </div>
            </div>

            {/* Hover details */}
            <div className="h-12 border border-slate-850 bg-slate-900/20 p-2 rounded text-[10px] font-mono flex items-center justify-between text-slate-400 transition-all">
              {hoveredCell ? (
                <>
                  <div className="space-y-0.5 text-left max-w-[150px] truncate">
                    <span className="text-slate-200 font-bold uppercase text-[9px] block truncate">
                      {hoveredCell.cell.label}
                    </span>
                    <span className="text-[8px] text-slate-500 block">
                      Row {hoveredCell.cell.row} • Col {hoveredCell.cell.col}
                    </span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-slate-200 font-black text-xs block">
                      {hoveredCell.temp.toFixed(1)}°C
                    </span>
                    <span className="text-[7.5px] text-slate-500 uppercase font-black block">
                      {hoveredCell.temp >= 85.0 ? "HOT SPOT" : "NOMINAL"}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-1.5 justify-center w-full text-slate-500 text-[9px] uppercase tracking-wide">
                  <Info className="w-3.5 h-3.5" />
                  <span>Hover over any grid cell to probe junction sensors</span>
                </div>
              )}
            </div>
          </div>

          {/* Configuration Knobs & Sliders */}
          <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 space-y-3">
            <h5 className="text-[10px] font-black text-slate-400 font-mono tracking-wider uppercase flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              Thermal & Environmental Controls
            </h5>

            <div className="space-y-3 font-mono text-[10px]">
              {/* Cooling method picker */}
              <div className="space-y-1">
                <span className="text-slate-500 uppercase text-[9px] block">Heat Dissipation System:</span>
                <div className="grid grid-cols-3 gap-1 bg-slate-900/50 p-1 rounded-lg border border-slate-850">
                  {(["passive", "active", "liquid"] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setCoolingType(type)}
                      className={`py-1.5 rounded-md font-bold uppercase text-[8.5px] tracking-wide transition-all ${
                        coolingType === type
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-950/30"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                      }`}
                    >
                      {type === "passive" ? "Heatsink" : type === "active" ? "Fan" : "Liquid"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Workload intensity multiplier */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[9px]">
                  <span className="text-slate-500 uppercase">Workload Injection Rate:</span>
                  <span className="text-cyan-400 font-black">{workloadIntensity}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="150"
                  step="5"
                  value={workloadIntensity}
                  onChange={e => setWorkloadIntensity(Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Realtime thermal charts or telemetry status logs */}
      <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 space-y-3">
        <div className="flex justify-between items-center border-b border-slate-850 pb-2">
          <h5 className="text-[10px] font-black text-slate-400 font-mono tracking-wider uppercase flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-rose-400" />
            Active Waveform Telemetry Chart
          </h5>
          {isThrottling && (
            <span className="text-[9px] font-black font-mono text-yellow-500 animate-pulse flex items-center gap-1 bg-yellow-950/20 px-2 py-0.5 rounded border border-yellow-800/30">
              <ShieldAlert className="w-3 h-3" />
              DVFS THROTTLED: SLOCK DOWN-STEP
            </span>
          )}
        </div>

        {/* Custom micro sparkline SVG timeline of peak temperatures */}
        <div className="h-20 bg-slate-950 rounded flex items-end relative overflow-hidden p-1 border border-slate-900">
          <svg className="w-full h-full" viewBox="0 0 400 60" preserveAspectRatio="none">
            {/* Horizontal safe threshold gridline */}
            <line x1="0" y1="20" x2="400" y2="20" stroke="#b45309" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.5" />
            <text x="390" y="24" fill="#fbbf24" fontSize="5" fontStyle="italic" textAnchor="end" opacity="0.6">90°C Throttle Threshold</text>
            
            {/* Draw temperature waves */}
            {history.length > 1 && (
              <>
                {/* Max Temp curve */}
                <path
                  d={(() => {
                    const points = history.map((h, i) => {
                      const x = (i / (history.length - 1)) * 400;
                      // map temp 25-115 to y 55-5
                      const y = 55 - ((h.maxTemp - 25) / 90) * 50;
                      return `${x},${y}`;
                    });
                    return `M ${points.join(" L ")}`;
                  })()}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="1.5"
                />
                
                {/* SRAM Temp curve */}
                <path
                  d={(() => {
                    const points = history.map((h, i) => {
                      const x = (i / (history.length - 1)) * 400;
                      const y = 55 - ((h.sramTemp - 25) / 90) * 50;
                      return `${x},${y}`;
                    });
                    return `M ${points.join(" L ")}`;
                  })()}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                  opacity="0.8"
                />

                {/* Clock Ghz curve (drawn from the bottom up or top down) */}
                <path
                  d={(() => {
                    const points = history.map((h, i) => {
                      const x = (i / (history.length - 1)) * 400;
                      // map clock 1Ghz-4Ghz to y 58-10
                      const y = 58 - ((h.clockGhz - 1) / 3) * 45;
                      return `${x},${y}`;
                    });
                    return `M ${points.join(" L ")}`;
                  })()}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="1.2"
                  opacity="0.75"
                />
              </>
            )}
          </svg>
          
          {history.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-slate-600 uppercase">
              Accumulating real-time silicon cycle sweeps...
            </div>
          )}
        </div>

        {/* Legend for active charts */}
        <div className="flex gap-4 text-[8px] font-mono justify-center text-slate-500">
          <span className="flex items-center gap-1"><span className="w-2.5 h-0.5 bg-red-500 block"></span> PEAK COMPUTE (°C)</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-0.5 bg-emerald-500 block border-dashed"></span> SRAM MEMORY (°C)</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-0.5 bg-sky-500 block"></span> SYSTEM CLOCK (GHz)</span>
        </div>
      </div>
    </div>
  );
};
