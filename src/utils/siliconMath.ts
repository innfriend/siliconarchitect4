/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WorkloadInputs, EstimationOutputs } from "../types";
export type { WorkloadInputs, EstimationOutputs };


export function estimateAccelerator(inputs: WorkloadInputs): EstimationOutputs {
  const {
    workloadType,
    resolutionWidth = 1920,
    resolutionHeight = 1080,
    fps = 30,
    modelComplexity = "medium",
    powerBudget = 5,
    processNode = "7nm",
    llmParams = 7,
    llmTokensPerSec = 30,
    llmBatchSize = 1,
    precision = "INT8",
    sparsity = "none",
    memoryType = "LPDDR5X",
    interconnectType = "mesh_noc",
  } = inputs;

  // 1. Precision & Sparsity Multipliers
  let precisionFactor = 1.0;     // baseline INT8
  let precisionAreaFactor = 1.0; // baseline INT8
  let precisionBwFactor = 1.0;   // baseline INT8

  switch (precision) {
    case "FP16":
      precisionFactor = 2.2;
      precisionAreaFactor = 2.4;
      precisionBwFactor = 2.0;
      break;
    case "BF16":
      precisionFactor = 2.0;
      precisionAreaFactor = 2.1;
      precisionBwFactor = 2.0;
      break;
    case "INT8":
      precisionFactor = 1.0;
      precisionAreaFactor = 1.0;
      precisionBwFactor = 1.0;
      break;
    case "INT4":
      precisionFactor = 0.55;
      precisionAreaFactor = 0.55;
      precisionBwFactor = 0.5;
      break;
  }

  let sparsityTopsFactor = 1.0;
  let sparsityBwFactor = 1.0;

  switch (sparsity) {
    case "structured_2_4":
      sparsityTopsFactor = 0.5; // Only 50% physical compute required
      sparsityBwFactor = 0.6;   // 40% bandwidth reduction (compressed indexes)
      break;
    case "unstructured_50":
      sparsityTopsFactor = 0.6; // We bypass 50% with slightly lower efficiency
      sparsityBwFactor = 0.55;  // 45% bandwidth savings
      break;
    case "none":
    default:
      sparsityTopsFactor = 1.0;
      sparsityBwFactor = 1.0;
      break;
  }

  // 2. Determine frequency based on Process Node (higher node = higher frequency)
  let frequencyGhz = 1.0;
  switch (processNode) {
    case "28nm":
      frequencyGhz = 0.55;
      break;
    case "16nm":
      frequencyGhz = 0.75;
      break;
    case "7nm":
      frequencyGhz = 1.0;
      break;
    case "5nm":
      frequencyGhz = 1.25;
      break;
    case "3nm":
      frequencyGhz = 1.45;
      break;
  }

  // Complexity multiplier
  const complexityMult = modelComplexity === "lite" ? 0.5 : modelComplexity === "medium" ? 1.0 : 2.5;

  // 3. Compute Demand (Required TOPS)
  let requiredTops = 0.1;
  let recommendedArchitecture = "Systolic Array Accelerator";

  if (workloadType === "resnet_classification") {
    const gopsPerPixel = 0.005;
    const gopsPerFrame = (resolutionWidth * resolutionHeight * gopsPerPixel * complexityMult);
    requiredTops = (gopsPerFrame * fps) / 1000;
    recommendedArchitecture = "SIMD Vector Processor Core";
  } else if (workloadType === "cnn_object_detection") {
    const gopsPerPixel = 0.035;
    const gopsPerFrame = (resolutionWidth * resolutionHeight * gopsPerPixel * complexityMult);
    requiredTops = (gopsPerFrame * fps) / 1000;
    recommendedArchitecture = "Systolic Array Accelerator";
  } else if (workloadType === "cnn_segmentation") {
    const gopsPerPixel = 0.11;
    const gopsPerFrame = (resolutionWidth * resolutionHeight * gopsPerPixel * complexityMult);
    requiredTops = (gopsPerFrame * fps) / 1000;
    recommendedArchitecture = "Hybrid Systolic + Vector ASIC";
  } else if (workloadType === "transformer_llm" || workloadType === "transformer_vlm") {
    requiredTops = (2 * llmParams * llmTokensPerSec * llmBatchSize) / 1000;
    recommendedArchitecture = "Transformer Tensor Core Engine";
  } else if (workloadType === "genai_diffusion") {
    const gopsPerPixelStep = 0.12;
    const steps = 30;
    const gopsPerFrame = (resolutionWidth * resolutionHeight * gopsPerPixelStep * steps * complexityMult) / 1000;
    requiredTops = (gopsPerFrame * fps) / 1000;
    recommendedArchitecture = "High-Throughput Vector Tensor Processor";
  } else {
    const gopsPerPixel = 0.02;
    const gopsPerFrame = (resolutionWidth * resolutionHeight * gopsPerPixel * complexityMult);
    requiredTops = (gopsPerFrame * fps) / 1000;
    recommendedArchitecture = "General Purpose Core";
  }

  // Apply sparsity acceleration factor on physically required TOPS
  requiredTops = requiredTops * sparsityTopsFactor;
  requiredTops = Math.max(0.1, parseFloat(requiredTops.toFixed(3)));

  // 4. Hardware Utilization
  let utilization = 0.6; // average
  if (recommendedArchitecture.includes("Systolic")) {
    utilization = 0.68;
  } else if (recommendedArchitecture.includes("SIMD") || recommendedArchitecture.includes("Vector")) {
    utilization = 0.45;
  } else if (recommendedArchitecture.includes("Transformer")) {
    utilization = 0.58;
  }

  // Interconnect congestion / routing penalty
  if (interconnectType === "shared_bus") {
    utilization = utilization * 0.82; // Bus congestion
  } else if (interconnectType === "hierarchical_ring") {
    utilization = utilization * 0.95; // Moderate ring latency
  } else if (interconnectType === "mesh_noc") {
    utilization = utilization * 1.03; // Efficient 2D packet delivery
  }
  utilization = Math.min(0.95, Math.max(0.25, utilization));

  // 5. Compute MAC Count
  const macCountRaw = (requiredTops * 1e12) / (2 * frequencyGhz * 1e9 * utilization);
  const macCount = Math.max(128, Math.round(macCountRaw / 128) * 128);

  // 6. SRAM Size Estimate (MB)
  let sramMb = 4;
  if (workloadType.startsWith("cnn") || workloadType === "resnet_classification") {
    const baseSram = workloadType === "resnet_classification" ? 4 : workloadType === "cnn_object_detection" ? 12 : 24;
    const resolutionFactor = Math.sqrt((resolutionWidth * resolutionHeight) / (1920 * 1080));
    sramMb = baseSram * complexityMult * resolutionFactor;
  } else if (workloadType.startsWith("transformer")) {
    sramMb = 16 + (llmBatchSize * 12);
  } else {
    sramMb = 8 * complexityMult;
  }
  // Sparsity also compresses activation/SRAM footprint slightly
  if (sparsity !== "none") {
    sramMb = sramMb * 0.85;
  }
  sramMb = Math.max(1, parseFloat(sramMb.toFixed(1)));

  // 7. DDR Bandwidth Estimate (GB/s)
  let ddrBandwidthGbs = 10;
  let arithmeticIntensity = 50; // OPs per byte transferred

  if (workloadType.startsWith("transformer")) {
    // Quantization (precisionBwFactor) and compression (sparsityBwFactor) scale DDR bandwidth directly
    const weightSizeGb = llmParams * 1.0 * precisionBwFactor * sparsityBwFactor; 
    const weightDdrBandwidth = weightSizeGb * llmTokensPerSec;
    const kvCacheDdrBandwidth = llmBatchSize * 4.5 * (llmTokensPerSec / 30) * precisionBwFactor;
    ddrBandwidthGbs = weightDdrBandwidth + kvCacheDdrBandwidth;
    arithmeticIntensity = (requiredTops * 1000) / ddrBandwidthGbs;
  } else {
    // Compute-bound (CNNs/Vision)
    arithmeticIntensity = 45 * Math.log2(sramMb + 1) / (precisionBwFactor * sparsityBwFactor);
    ddrBandwidthGbs = (requiredTops * 1000) / arithmeticIntensity;
  }
  ddrBandwidthGbs = Math.max(1.5, parseFloat(ddrBandwidthGbs.toFixed(1)));
  arithmeticIntensity = parseFloat(arithmeticIntensity.toFixed(1));

  // 8. Area Estimation (mm2)
  let macAreaPer1024 = 1.2; // 28nm
  let sramAreaPerMb = 0.8;
  let logicBaseArea = 10; // peripheral logic

  switch (processNode) {
    case "28nm":
      macAreaPer1024 = 1.2;
      sramAreaPerMb = 0.8;
      logicBaseArea = 10;
      break;
    case "16nm":
      macAreaPer1024 = 0.55;
      sramAreaPerMb = 0.38;
      logicBaseArea = 5.5;
      break;
    case "7nm":
      macAreaPer1024 = 0.22;
      sramAreaPerMb = 0.16;
      logicBaseArea = 2.5;
      break;
    case "5nm":
      macAreaPer1024 = 0.13;
      sramAreaPerMb = 0.095;
      logicBaseArea = 1.6;
      break;
    case "3nm":
      macAreaPer1024 = 0.075;
      sramAreaPerMb = 0.055;
      logicBaseArea = 1.1;
      break;
  }

  // Scale MAC area based on data precision size (FP16 is larger, INT4 is smaller)
  const macArea = (macCount / 1024) * macAreaPer1024 * precisionAreaFactor;
  const sramArea = sramMb * sramAreaPerMb;
  
  // Interconnect logic area overhead
  let interconnectArea = 0;
  if (interconnectType === "mesh_noc") {
    interconnectArea = (macArea + sramArea) * 0.06; // 6% area overhead for packet routers
  } else if (interconnectType === "hierarchical_ring") {
    interconnectArea = (macArea + sramArea) * 0.025; // 2.5% area for ring buffers
  }

  // Stacked High-Bandwidth Memory (HBM3) requires advanced physical PHY layout
  let memoryControllerArea = 0;
  if (memoryType === "HBM3") {
    memoryControllerArea = 3.2; // mm2 additional area for wide HBM controller PHY
  } else if (memoryType === "GDDR6") {
    memoryControllerArea = 1.6;
  } else {
    memoryControllerArea = 0.6; // standard LPDDR
  }

  const estimatedAreaMm2 = parseFloat((logicBaseArea + macArea + sramArea + interconnectArea + memoryControllerArea).toFixed(2));

  // 9. Power Sizing (Watts)
  let dynamicMacCoef = 0.14; // 28nm
  let activeSramCoef = 0.025; // Watts per MB active
  let ddrPhyPowerCoef = 0.012; // Watts per GB/s bandwidth

  switch (processNode) {
    case "28nm":
      dynamicMacCoef = 0.14;
      activeSramCoef = 0.025;
      ddrPhyPowerCoef = 0.012;
      break;
    case "16nm":
      dynamicMacCoef = 0.065;
      activeSramCoef = 0.013;
      ddrPhyPowerCoef = 0.008;
      break;
    case "7nm":
      dynamicMacCoef = 0.022;
      activeSramCoef = 0.005;
      ddrPhyPowerCoef = 0.0045;
      break;
    case "5nm":
      dynamicMacCoef = 0.013;
      activeSramCoef = 0.003;
      ddrPhyPowerCoef = 0.003;
      break;
    case "3nm":
      dynamicMacCoef = 0.008;
      activeSramCoef = 0.002;
      ddrPhyPowerCoef = 0.0022;
      break;
  }

  // Adjust memory interface power based on protocol efficiency
  let memoryPhyEfficiency = 1.0;
  switch (memoryType) {
    case "LPDDR4X":
      memoryPhyEfficiency = 1.25; // Less energy efficient
      break;
    case "LPDDR5X":
      memoryPhyEfficiency = 0.9;  // Excellent modern low-power
      break;
    case "GDDR6":
      memoryPhyEfficiency = 1.45; // High power dissipation
      break;
    case "HBM3":
      memoryPhyEfficiency = 0.35; // Highly efficient parallel wide bus (low pJ/bit)
      break;
  }

  // Dynamic MAC power scaled by precision wordlength (FP16 / INT8 / INT4)
  const dynamicPowerW = (macCount / 1024) * dynamicMacCoef * (frequencyGhz / 1.0) * utilization * precisionFactor;
  const memoryPowerW = (sramMb * activeSramCoef) + (ddrBandwidthGbs * ddrPhyPowerCoef * memoryPhyEfficiency);
  
  // Leakage scaling with process area (smaller node = lower overall leakage but higher density)
  let leakagePowerPerMm2 = 0.05;
  switch (processNode) {
    case "28nm": leakagePowerPerMm2 = 0.025; break;
    case "16nm": leakagePowerPerMm2 = 0.035; break;
    case "7nm": leakagePowerPerMm2 = 0.05; break;
    case "5nm": leakagePowerPerMm2 = 0.065; break;
    case "3nm": leakagePowerPerMm2 = 0.08; break;
  }
  const leakagePowerW = estimatedAreaMm2 * leakagePowerPerMm2;
  const estimatedPowerW = parseFloat((dynamicPowerW + memoryPowerW + leakagePowerW).toFixed(2));

  // 10. Check if power throttled
  const isPowerThrottled = estimatedPowerW > powerBudget;

  // 11. Bottleneck Analysis
  let bottleneckAnalysis = "";
  if (isPowerThrottled) {
    bottleneckAnalysis += `Power Budget Exceeded (${estimatedPowerW}W required vs ${powerBudget}W budget). `;
  }

  if (workloadType.startsWith("transformer")) {
    if (ddrBandwidthGbs > 300 && processNode !== "3nm" && processNode !== "5nm") {
      bottleneckAnalysis += "DRAM Bandwidth extreme bottleneck. Consider HBM3 stacked memory or INT4 quantization to lower physical weight footprint. ";
    } else {
      bottleneckAnalysis += "Memory Bandwidth Bound (Autoregressive Weight Fetching). Performance depends heavily on DDR technology and quantization. ";
    }
  } else {
    // CNN
    if (ddrBandwidthGbs > 120 && sramMb < 16) {
      bottleneckAnalysis += "Memory-bound due to low SRAM capacity. Try increasing SRAM or utilizing structured 2:4 sparsity. ";
    } else {
      bottleneckAnalysis += "Compute-Bound (MACs are heavily utilized). Scaling MAC size is the most effective way to improve frame rates. ";
    }
  }

  if (bottleneckAnalysis === "") {
    bottleneckAnalysis = "Balanced design. No critical performance or thermal throttles detected at the specified power budget.";
  }

  return {
    requiredTops,
    frequencyGhz,
    utilization: parseFloat((utilization * 100).toFixed(0)),
    macCount,
    sramMb,
    ddrBandwidthGbs,
    arithmeticIntensity,
    estimatedAreaMm2,
    estimatedPowerW,
    dynamicPowerW: parseFloat(dynamicPowerW.toFixed(2)),
    leakagePowerW: parseFloat(leakagePowerW.toFixed(2)),
    memoryPowerW: parseFloat(memoryPowerW.toFixed(2)),
    recommendedArchitecture,
    isPowerThrottled,
    bottleneckAnalysis: bottleneckAnalysis.trim(),
  };
}
