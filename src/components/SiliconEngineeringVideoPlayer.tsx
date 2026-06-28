/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX, 
  Tv, 
  Sparkles, 
  Layers, 
  Cpu, 
  Scale, 
  TrendingUp, 
  Terminal, 
  Code,
  ChevronRight,
  CheckCircle2,
  FileText,
  Settings,
  Thermometer,
  Award
} from "lucide-react";

export const SiliconEngineeringVideoPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isMuted, setIsMuted] = useState(false);
  const [useVoiceover, setUseVoiceover] = useState(true);

  // 8 Chapters matching the 8 steps on the front page
  const chapters = [
    {
      id: "arch",
      title: "1. Specification & Architecture",
      start: 0,
      end: 60,
      caption: "Every successful chip starts with an idea—not with code. Imagine a company wants to build the next-generation AI processor for smartphones. The first question isn't 'How do we design it?' The first question is 'What should this chip be capable of?' This is where the specification phase begins. Product managers, system architects, software engineers, hardware engineers, and customers work together to define the product requirements. They answer questions like: What applications will this chip run? How much AI performance is required? What is the maximum power consumption? What battery life should the device achieve? How much heat can it generate? What manufacturing technology should be used—3nm, 5nm, or 7nm? What is the target production cost? These requirements become the official specification document, which acts as the contract for every engineering team. Once the specifications are finalized, system architects begin designing the internal architecture. Think of this like designing a city before constructing any buildings. They decide: How many CPU cores? Should there be a GPU? Do we need an AI accelerator? How much cache memory? Which communication protocols should be supported? How will all these blocks communicate? Before anything is built, architects evaluate different design options using high-level performance models and simulations. They estimate performance, power consumption, bandwidth, memory usage, and overall efficiency. Multiple architectural alternatives are compared until the best balance between Performance, Power, and Area—commonly called PPA—is achieved. The output of this stage is a complete architectural specification that guides every engineering team throughout the project. Now that we know exactly what needs to be built, it's time to convert this architecture into digital hardware using RTL.",
      technical: "Workload Profile: Transformer Decoder Layer • Parameter Count: 7B • Precision: FP16 • Compute Intensity: 14.2 TOPS • Target Die Budget: 4.5 mm²"
    },
    {
      id: "rtl",
      title: "2. RTL Design (Front-End)",
      start: 60,
      end: 120,
      caption: "Now that the system architecture and PPA targets are finalized, we enter the Register Transfer Level, or RTL design phase. This is where hardware designers translate architectural diagrams into actual digital logic. We write code using high-level Hardware Description Languages—primarily SystemVerilog or VHDL. Unlike writing software for a CPU where instructions execute sequentially, writing RTL is about designing physical hardware that operates concurrently. Every line of code describes hardware blocks, logic gates, and wire connections that run in parallel on every single clock cycle. We structure the design around registers—which act as memory storage cells—and combinational logic blocks that perform calculations as data flows between registers. For an AI processor, RTL designers create specialized components like Multiply-Accumulate, or MAC units, and arrange them into structured arrays. These systolic arrays process matrix multiplications in parallel, flowing weights and inputs step-by-step through register stages. Designers also build custom memory controllers, on-chip buses using protocols like AXI or APB, and control state machines to coordinate data movement. Every signal must be meticulously designed to meet clock targets—for example, a 1.2 Gigahertz target means data has only eight-hundred and thirty-three picoseconds to propagate from one register to the next. Once the RTL description is complete, we have a digital blueprint of the chip, but before we turn it into physical gates, we must prove that this complex logic actually works without a single error.",
      technical: "Hardware Description: IEEE 1800 SystemVerilog • Register Interfaces: AXI4/APB Mirror • Bus Protocols: 128-bit Interconnect • Clock Targets: 1.2 GHz"
    },
    {
      id: "val",
      title: "3. Verification & Simulation",
      start: 120,
      end: 180,
      caption: "With the RTL code written, we enter the critical phase of functional verification and simulation. A single mistake in a chip's logic can render a multi-million dollar piece of silicon completely useless. That is why verification engineers are often called the detectives of the semiconductor world, and why verification typically consumes up to seventy percent of the total chip development time and budget. Rather than testing the design manually, engineers build complex, automated environments using the Universal Verification Methodology, or UVM. We construct a testbench—a software simulation environment that wraps around our RTL design. The testbench generates millions of randomized stimulus inputs to stress-test the hardware under extreme, unexpected conditions. It sends random packets of data, triggers unexpected clock-gating cycles, and injects errors to see if the hardware recovers correctly. Monitors watch the internal signals, and scoreboards automatically compare the RTL behavior against an independent, gold-standard mathematical model of the architecture. We also embed SystemVerilog Assertions directly inside the design to constantly police critical rules—ensuring, for instance, that a FIFO queue never overflows, or that two controllers never try to write to the same bus simultaneously. We track code and functional coverage to ensure every single pathway and conditional branch has been executed and verified. Only when the testbench reaches one-hundred percent coverage and zero bugs can we confidently sign off on the design and prepare to translate our abstract code into actual physical structures.",
      technical: "Testbench Engine: UVM Suite v1.2 • Active Checkers: 450 Assertions • Target Toggle Coverage: 98.4% • Bug Regression Status: 100% Passing"
    },
    {
      id: "synthesis",
      title: "4. Logic Synthesis",
      start: 180,
      end: 240,
      caption: "Once the RTL code is completely verified and bug-free, we transition from the abstract software domain to the physical hardware domain through Logic Synthesis. Synthesis is the process of translating our high-level, human-readable SystemVerilog code into a concrete gate-level netlist. To do this, we use highly sophisticated synthesis tools and a standard cell library provided by the semiconductor foundry, such as TSMC or Samsung. This library contains pre-designed physical layouts for fundamental building blocks—like NAND gates, NOR gates, multiplexers, and flip-flops—each characterized with precise measurements of timing, power, and area. The synthesis tool acts like an extremely advanced compiler. It parses our RTL logic and maps it to these standard cells, optimizing the layout to meet our target timing constraints. We feed the tool a design constraints file that defines the clock frequencies, input delays, and output loads. The compiler then runs millions of iterations, sizing gates and adjusting logic paths to ensure that signals propagate fast enough to prevent setup and hold violations. If a signal arrives too late at a register, it causes timing violations and functional failure. Synthesis output is a gate-level netlist—a massive text file listing millions of standard cells and the microscopic wires that connect them. This netlist is mathematically equivalent to our original RTL, but it is now expressed entirely in physical electronic components ready for layout.",
      technical: "Target Technology Node: TSMC 5nm FinFET • Standard Cell Library: High-Density (HD) Track • Timing Slack Target: +0.05 ns • Total Equivalent Gate Count: 14.2M Gates"
    },
    {
      id: "phys",
      title: "5. Physical Design (Back-End)",
      start: 240,
      end: 300,
      caption: "With the gate-level netlist completed, we move to the physical design phase—the physical implementation of the netlist onto a silicon die. This is where we define the exact coordinates of every transistor and wire. We begin with Floorplanning, where we decide the absolute layout of the chip. We allocate areas for large IP blocks—like CPU cores, GPU engines, memory controllers, and the Multiply-Accumulate arrays—and set up the power grid of copper tracks to distribute stable voltage across the chip. Next is Placement, where the tool places millions of standard cells within the remaining silicon real estate, grouping related components close together to minimize wire length and signal delay. We then perform Clock Tree Synthesis to build a dedicated network of buffer gates that distributes the clock signal simultaneously to every single register on the chip, preventing clock skew. Following this, the Routing engine draws the final microscopic physical copper wires to connect the cells across multiple metal layers, navigating complex paths like a highly dense city highway system. Throughout this process, we perform continuous Design Rule Checks, or DRC, to ensure wire spacings conform to atomic lithography limits, and Layout Versus Schematic, or LVS, checks to verify that the physical wiring perfectly matches the original synthesized netlist. The result is a clean, physically sound layout ready for manufacturing.",
      technical: "Layout Grid: 12 Metal Layers • Density Constraint: 84.2% Area Utilization • DRC Errors: 0 Clean • LVS Check: Match Layout with Schematic"
    },
    {
      id: "mask",
      title: "6. GDSII / Mask Generation",
      start: 300,
      end: 360,
      caption: "Once the physical layout is completed and passes all verification checks, we export the physical coordinates into an industry-standard database format, typically GDSII or OASIS. This file contains the precise geometric polygons representing every single wire, via, and transistor layer on the silicon die. This data is used to manufacture the photolithographic masks, which are polished glass plates coated with chrome patterns. Think of these masks like high-tech stencils or photographic negatives. To manufacture a modern chip, we require a set of seventy or more individual masks—one for each physical layer of the silicon, from the base silicon implants up to the final metal interconnects. However, at advanced process nodes like three-nanometer or five-nanometer, the physical wavelength of the lasers used in manufacturing is larger than the microscopic wires we are trying to print. This causes severe light diffraction, blurring the printed features. To combat this, we perform Optical Proximity Correction, or OPC. Advanced algorithms modify the shapes on the mask—adding serifs to corners, shifting edges, and adding auxiliary features—so that when the laser light diffracts, it lands on the silicon in the exact rectangular shape we intended. Once OPC is completed and verified, the finalized mask data is sent to a mask-writing facility to create the physical mask set, representing the official transition of our design into physical manufacturing.",
      technical: "Database Format: GDSII Stream Format • Photolithography Masks: 72 Glass Plates • EUV Wavelength: 13.5 nm • OPC Resolution Enhancements: Active"
    },
    {
      id: "fab",
      title: "7. Fabrication & Packaging",
      start: 360,
      end: 420,
      caption: "With the physical mask sets complete, we enter the high-precision world of Semiconductor Fabrication and Packaging. Manufacturing takes place inside a semiconductor fabrication plant—often called a fab or a cleanroom—where the air is hundreds of times cleaner than an operating room to prevent microscopic dust from ruining the silicon. The process starts with a circular wafer of pure, ultra-refined silicon, typically three-hundred millimeters in diameter. Over several months, the wafer undergoes a repetitive cycle of hundreds of steps to build the transistors layer by layer. First, we apply a light-sensitive chemical called photoresist to the wafer. We shine deep or extreme ultraviolet light through our photolithographic masks to project the circuit patterns onto the silicon. Exposed areas are chemically washed away in an etching process, and we introduce atomic impurities—called ion implantation—to modify the electrical conductivity of the silicon, creating source and drain regions for our transistors. This cycle repeats for dozens of layers, building up three-dimensional FinFET structures and stacking multiple levels of copper wires to connect them. Once the wafer is fully processed, it is tested for functional yield and diced into thousands of individual rectangular silicon chips, known as dies. Each working die is mounted inside a protective package. We use advanced Flip-Chip packaging, bonding microscopic solder bumps on the chip directly to a package substrate, which is sealed with a metal lid to dissipate heat and expose pins for soldering onto system boards.",
      technical: "Wafer Geometry: 300mm Silicon • Process technology: EUV Lithography • Packaging Style: Flip-Chip Ball Grid Array (FC-BGA) • Pins Count: 1156 Bumps"
    },
    {
      id: "postval",
      title: "8. Post-Silicon Validation",
      start: 420,
      end: 480,
      caption: "Finally, the manufactured and packaged silicon chips arrive back at our testing laboratories, marking the start of Post-Silicon Validation. This is the moment of truth. Unlike pre-silicon simulations which run in software at a snail's pace of a few hertz, physical chips run at their full multi-gigahertz speed in real-time. We mount the first-spin engineering samples onto custom validation boards equipped with specialized testing rigs, cooling chambers, and high-frequency oscilloscopes. We run stress-testing software, operating systems, and real-world AI model workloads to verify that the physical silicon behaves exactly as designed. We perform voltage and temperature sweeps, plotting what is called a Shmoo curve to map out the exact envelope of stable operation. This tells us the maximum frequency the chip can achieve at different supply voltages, and identifies the physical margins of the silicon. We also test for physical reliability and thermal characteristics over extended periods. Even with the best pre-silicon testing, real silicon often reveals subtle hardware errata or bugs. We document these in official errata lists and design firmware or driver workarounds to disable problematic features or adjust timing parameters. Once the chip passes post-silicon validation, has its firmware certified, and reaches target production yields, it is officially ready to be mass-produced and shipped to power consumer devices worldwide.",
      technical: "Lab Validation Board: PCIe Gen5 DevKit • Shmoo Sweep Bounds: 0.7V to 1.15V @ 500MHz to 2.5GHz • Thermal Chambers: -40C to +125C Range • Errata List: 0 Critical Bugs"
    }
  ];

  const activeChapterIdx = Math.min(7, Math.floor(currentTime / 60));
  const activeChapter = chapters[activeChapterIdx];

  // Local step progress drives time-varying animations (0 to 1)
  const localStepProgress = (currentTime % 60) / 60;

  // Web Audio Synth state
  const audioContextRef = useRef<AudioContext | null>(null);
  const droneOscRef = useRef<OscillatorNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const synthIntervalRef = useRef<any>(null);

  // Initialize Audio Context on user click / gesture
  const initAudio = () => {
    if (audioContextRef.current) {
      if (audioContextRef.current.state === "suspended") {
        audioContextRef.current.resume().catch(() => {});
      }
      return;
    }
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;

      // Master Gain
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, ctx.currentTime);
      masterGain.connect(ctx.destination);
      masterGainRef.current = masterGain;

      // Deep Drone Oscillator (triangular for warmth, very low volume)
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(55, ctx.currentTime); // A1 note (55 Hz)

      // Biquad Filter to filter out high harshness, keeping a rich hum
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(150, ctx.currentTime);
      filter.Q.setValueAtTime(3.0, ctx.currentTime);

      osc.connect(filter);
      filter.connect(masterGain);
      osc.start();

      droneOscRef.current = osc;
      filterNodeRef.current = filter;

      if (isPlaying && !isMuted) {
        masterGain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 1.0);
      }
    } catch (e) {
      console.warn("Web Audio API not supported or blocked by browser policies", e);
    }
  };

  const playBleep = (freq: number, duration: number, type: "sine" | "triangle" | "square" = "sine", volume = 0.04) => {
    const ctx = audioContextRef.current;
    const masterGain = masterGainRef.current;
    if (!ctx || !masterGain || isMuted || !isPlaying) return;
    try {
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(masterGain);
      
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Ignore audio errors
    }
  };

  // Speech Synthesis Voiceover API Setup
  const hasSpeechSynth = typeof window !== "undefined" && !!window.speechSynthesis;
  const lastSpokenTextRef = useRef<string>("");

  const speakCurrentCaption = (force = false) => {
    if (!hasSpeechSynth || isMuted || !isPlaying || !useVoiceover) {
      if (hasSpeechSynth) {
        window.speechSynthesis.cancel();
      }
      return;
    }

    const textToSpeak = activeChapter.caption;

    // Avoid double speaking identical captions unless forced
    if (!force && lastSpokenTextRef.current === textToSpeak && window.speechSynthesis.speaking) {
      return;
    }

    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      const voices = window.speechSynthesis.getVoices();
      
      // Select a clear English voice
      const preferredVoice = voices.find(v => 
        v.lang.startsWith("en") && 
        (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Microsoft") || v.name.includes("Samantha") || v.name.includes("Daniel"))
      ) || voices.find(v => v.lang.startsWith("en")) || voices[0];

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      // Slightly slower speaking rate for extreme, premium academic clarity
      utterance.rate = playbackSpeed * 0.95; 
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      lastSpokenTextRef.current = textToSpeak;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis error:", e);
    }
  };

  // Keep Voiceover in sync with video state
  useEffect(() => {
    if (isPlaying && !isMuted && useVoiceover) {
      speakCurrentCaption(true);
    } else {
      if (hasSpeechSynth) {
        window.speechSynthesis.cancel();
      }
    }

    return () => {
      if (hasSpeechSynth) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isPlaying, isMuted, useVoiceover, activeChapterIdx, playbackSpeed]);

  // Handle voices changing asynchronously
  useEffect(() => {
    if (!hasSpeechSynth) return;
    const handleVoicesChanged = () => {
      if (isPlaying && !isMuted && useVoiceover && !window.speechSynthesis.speaking) {
        speakCurrentCaption();
      }
    };
    window.speechSynthesis.addEventListener("voiceschanged", handleVoicesChanged);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", handleVoicesChanged);
    };
  }, [isPlaying, isMuted, useVoiceover, activeChapterIdx]);

  // Keep Audio states synchronised
  useEffect(() => {
    if (isPlaying && !isMuted) {
      initAudio();
      const ctx = audioContextRef.current;
      const masterGain = masterGainRef.current;
      if (ctx) {
        if (ctx.state === "suspended") {
          ctx.resume().catch(() => {});
        }
        masterGain?.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 1.0);
      }

      // Occasional data processing telemetry clicks / synth sounds in background
      synthIntervalRef.current = setInterval(() => {
        const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 523.25]; // Pentatonic notes C4 - C5
        const randomNote = notes[Math.floor(Math.random() * notes.length)];
        
        // 20% chance of random data sound
        if (Math.random() < 0.25) {
          playBleep(randomNote, 0.2, "sine", 0.015);
        }
      }, 1000);

    } else {
      const ctx = audioContextRef.current;
      const masterGain = masterGainRef.current;
      if (ctx && masterGain) {
        masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
      }
      if (synthIntervalRef.current) {
        clearInterval(synthIntervalRef.current);
        synthIntervalRef.current = null;
      }
    }

    return () => {
      if (synthIntervalRef.current) {
        clearInterval(synthIntervalRef.current);
      }
    };
  }, [isPlaying, isMuted]);

  // Double high-tech chime when chapters change
  const lastChapterIdxRef = useRef<number>(0);
  useEffect(() => {
    if (isPlaying && !isMuted) {
      if (activeChapterIdx !== lastChapterIdxRef.current) {
        lastChapterIdxRef.current = activeChapterIdx;
        // Distinctive step chime
        playBleep(587.33, 0.08, "sine", 0.04); // D5
        setTimeout(() => {
          playBleep(880.00, 0.12, "sine", 0.04); // A5
        }, 100);
      }
    } else {
      lastChapterIdxRef.current = activeChapterIdx;
    }
  }, [activeChapterIdx, isPlaying, isMuted]);

  // Scrubber increment effect
  useEffect(() => {
    let intervalId: any = null;
    if (isPlaying) {
      intervalId = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 0.1 * playbackSpeed;
          if (next >= 480) {
            setIsPlaying(false);
            return 480;
          }
          return next;
        });
      }, 100);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPlaying, playbackSpeed]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (synthIntervalRef.current) {
        clearInterval(synthIntervalRef.current);
      }
      try {
        if (droneOscRef.current) {
          droneOscRef.current.stop();
          droneOscRef.current.disconnect();
        }
        if (filterNodeRef.current) {
          filterNodeRef.current.disconnect();
        }
        if (masterGainRef.current) {
          masterGainRef.current.disconnect();
        }
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
      } catch (e) {
        // Safe silence
      }
    };
  }, []);

  // Format second counts to MM:SS
  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div id="video-walkthrough-root" className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full text-left">
      
      {/* VIDEO CONTROLLER SCREEN & PLAYBACK (Col 8) */}
      <div id="video-screen-container" className="xl:col-span-8 flex flex-col gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden p-4 md:p-6 space-y-4 shadow-xl">
          
          {/* HEADER BAR */}
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Tv className="w-4 h-4 text-indigo-400" />
                <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping"></span>
              </div>
              <div>
                <h3 className="text-xs font-black font-mono text-white uppercase tracking-wider">Silicon Engineering Pipeline Walkthrough</h3>
                <p className="text-[9px] text-slate-500 font-mono">8 STEP FULL LIFECYCLE INTERACTIVE SYSTEM</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded border border-slate-850">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              <span className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-wider">8-MINUTE DETAILED LABS</span>
            </div>
          </div>

          {/* VIDEO MONITOR CONTAINER */}
          <div id="video-monitor" className="relative aspect-video w-full rounded-xl bg-slate-950 border border-slate-850 overflow-hidden flex flex-col justify-between shadow-2xl">
            
            {/* STAGE 1: SPECIFICATION & ARCHITECTURE */}
            {activeChapter.id === "arch" && (
              <div id="stage-spec" className="w-full h-full flex flex-col justify-between p-4 bg-slate-950/60 font-mono text-xs">
                <div className="flex justify-between items-center text-[10px] text-slate-500 border-b border-slate-850 pb-2">
                  <span>CO-DESIGN SPACE: SPECS & WORKLOAD</span>
                  <span className="text-emerald-400 font-bold">BLOCK_ARCH_V2.0</span>
                </div>
                
                <div className="flex-1 grid grid-cols-3 gap-3 items-center justify-center overflow-hidden py-2">
                  {/* Left: Workload specifications with animated parsing indicator */}
                  <div className="bg-slate-900/80 border border-emerald-500/30 rounded p-2 h-[120px] flex flex-col justify-between text-[9px]">
                    <div className="flex items-center gap-1 text-emerald-400 font-bold border-b border-emerald-950 pb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                      <span>WORKLOAD SPEC</span>
                    </div>
                    <div className="space-y-1 text-slate-400">
                      <div>Model: <span className="text-white">Llama-3 8B</span></div>
                      <div>Seq Len: <span className="text-white">8K Tokens</span></div>
                      <div>Quant: <span className="text-white">INT8 / FP16</span></div>
                      <div>Throughput: <span className="text-emerald-400">{(30 + localStepProgress * 20).toFixed(0)} T/s</span></div>
                    </div>
                    <div className="h-1 bg-emerald-950 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-emerald-400" 
                        animate={{ width: ["0%", "100%"] }} 
                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                      />
                    </div>
                  </div>

                  {/* Middle: Architectural Matrix co-design trade-off radar */}
                  <div className="bg-slate-900/80 border border-indigo-500/30 rounded p-2 h-[120px] flex flex-col justify-between items-center relative overflow-hidden">
                    <span className="text-[9px] font-black text-indigo-300">PPA TRADE-OFFS</span>
                    
                    <svg className="w-20 h-20" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="35" fill="none" stroke="#312e81" strokeWidth="0.5" />
                      <circle cx="50" cy="50" r="20" fill="none" stroke="#312e81" strokeWidth="0.5" />
                      <line x1="50" y1="15" x2="50" y2="85" stroke="#312e81" strokeWidth="0.5" />
                      <line x1="15" y1="50" x2="85" y2="50" stroke="#312e81" strokeWidth="0.5" />
                      
                      <polygon 
                        points={`
                          50,${50 - (20 + Math.sin(currentTime * 0.8) * 8)} 
                          ${50 + (22 + Math.cos(currentTime * 0.5) * 6)},50 
                          50,${50 + (18 + Math.sin(currentTime * 0.3) * 5)} 
                          ${50 - (24 + Math.sin(currentTime * 0.6) * 7)},50
                        `} 
                        fill="rgba(99, 102, 241, 0.2)" 
                        stroke="#6366f1" 
                        strokeWidth="1.5"
                      />
                      
                      <line 
                        x1="50" y1="50" 
                        x2={`${50 + 35 * Math.cos(currentTime * 1.5)}`} 
                        y2={`${50 + 35 * Math.sin(currentTime * 1.5)}`} 
                        stroke="#818cf8" 
                        strokeWidth="1" 
                        strokeOpacity="0.8" 
                      />
                    </svg>
                    
                    <span className="text-[7px] text-slate-500">Sweeping design space...</span>
                  </div>

                  {/* Right: Core selection blocks & Dynamic Flow */}
                  <div className="bg-slate-900/80 border border-amber-500/30 rounded p-2 h-[120px] flex flex-col justify-between text-[9px] relative overflow-hidden">
                    <div className="flex items-center gap-1 text-amber-400 font-bold border-b border-amber-950 pb-1">
                      <span>CORE ARCH</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 flex-1 py-1">
                      <div className={`p-1 rounded text-center text-[7px] border transition-colors ${localStepProgress < 0.25 ? "bg-amber-500/20 border-amber-500 text-white" : "bg-slate-950 border-slate-800 text-slate-500"}`}>TPU_0</div>
                      <div className={`p-1 rounded text-center text-[7px] border transition-colors ${localStepProgress >= 0.25 && localStepProgress < 0.5 ? "bg-indigo-500/20 border-indigo-500 text-white" : "bg-slate-950 border-slate-800 text-slate-500"}`}>TPU_1</div>
                      <div className={`p-1 rounded text-center text-[7px] border transition-colors ${localStepProgress >= 0.5 && localStepProgress < 0.75 ? "bg-emerald-500/20 border-emerald-500 text-white" : "bg-slate-950 border-slate-800 text-slate-500"}`}>SRAM</div>
                      <div className={`p-1 rounded text-center text-[7px] border transition-colors ${localStepProgress >= 0.75 ? "bg-purple-500/20 border-purple-500 text-white" : "bg-slate-950 border-slate-800 text-slate-500"}`}>DMA</div>
                    </div>
                    <div className="text-[8px] text-center font-bold text-amber-400">
                      {`Intensity: ${(25 + localStepProgress * 39).toFixed(1)} FLOP/B`}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-900 pt-2 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">OPTIMAL_PPA_SWEETPOINT:</span>
                    <span className="text-indigo-400 font-bold">142 TFLOPS @ 3.4W</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">ESTIMATED_DIE_AREA:</span>
                    <span className="text-emerald-400 font-bold">4.52 mm²</span>
                  </div>
                </div>
              </div>
            )}

            {/* STAGE 2: RTL DESIGN */}
            {activeChapter.id === "rtl" && (
              <div id="stage-rtl" className="w-full h-full flex flex-col justify-between p-4 bg-slate-950/60 font-mono text-xs">
                <div className="flex justify-between items-center text-[10px] text-slate-500 border-b border-slate-850 pb-2">
                  <span>RTL_COMPILER: REGISTER_TRANSFER_DESC</span>
                  <span className="text-amber-400 font-bold">asic_pipeline_unit.sv</span>
                </div>

                <div className="flex-1 grid grid-cols-12 gap-3 items-center justify-center py-2 overflow-hidden">
                  {/* Left: scrolling SystemVerilog Terminal with typed characters look */}
                  <div className="col-span-6 bg-slate-950 border border-slate-850 p-2.5 rounded h-[120px] overflow-hidden text-[8px] leading-relaxed relative flex flex-col justify-start">
                    <div className="text-emerald-500 font-bold">// Multiplexer Pipeline Register Stages</div>
                    <div className="text-slate-400">always_ff @(posedge clk or negedge rst_n) begin</div>
                    <div className="text-indigo-400">  if (!rst_n) begin</div>
                    <div className="text-slate-300">    r_stage_mac  &lt;= 32'h0;</div>
                    <div className="text-slate-300">    r_stage_sync &lt;= 1'b0;</div>
                    <div className="text-indigo-400">  end else if (sys_en) begin</div>
                    <div className="text-amber-400">    r_stage_mac  &lt;= w_mac_next;</div>
                    <div className="text-amber-400">    r_stage_sync &lt;= w_stage_ready;</div>
                    <div className="text-indigo-400">  end</div>
                    <div className="text-slate-400">end</div>
                    
                    <div 
                      className="absolute left-2 right-2 h-4 bg-indigo-500/10 border-l-2 border-indigo-500 transition-all pointer-events-none"
                      style={{ top: `${14 + (Math.floor(currentTime * 2.5) % 8) * 11}px` }}
                    />
                  </div>

                  {/* Right: Systolic Array / Core Pipeline visualization */}
                  <div className="col-span-6 bg-slate-900/80 border border-amber-500/20 rounded p-2 h-[120px] flex flex-col justify-between">
                    <span className="text-[8px] font-black text-amber-400 tracking-wider">SYSTOLIC MAC ARRAY</span>
                    
                    <div className="grid grid-cols-4 gap-1.5 justify-center py-1 flex-1 items-center">
                      {Array.from({ length: 12 }).map((_, idx) => {
                        const colIdx = idx % 4;
                        const rowIdx = Math.floor(idx / 4);
                        const waveTime = (currentTime * 4 + rowIdx + colIdx) % 8;
                        const isActive = waveTime < 3;
                        return (
                          <div 
                            key={idx} 
                            className={`h-4 rounded border text-[7px] font-bold flex items-center justify-center transition-all ${
                              isActive 
                                ? "bg-amber-500/20 border-amber-500 text-amber-300 scale-105 shadow-[0_0_6px_rgba(245,158,11,0.4)]" 
                                : "bg-slate-950 border-slate-850 text-slate-600"
                            }`}
                          >
                            MAC
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between text-[7px] text-slate-500">
                      <span>Clock Sync: 1.2GHz</span>
                      <div className="flex gap-0.5 items-end h-2 w-12">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <motion.div 
                            key={i}
                            className="w-1 bg-amber-500"
                            animate={{ height: isPlaying ? [2, 8, 2] : 2 }}
                            transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.08, ease: "easeInOut" }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-900 pt-2 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">HDL_COMPLIANCE:</span>
                    <span className="text-emerald-400 font-bold">SYSTEMVERILOG_2017</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">PIPELINED_STAGES:</span>
                    <span className="text-amber-400 font-bold">12_EXEC_STEPS</span>
                  </div>
                </div>
              </div>
            )}

            {/* STAGE 3: VERIFICATION & SIMULATION */}
            {activeChapter.id === "val" && (
              <div id="stage-val" className="w-full h-full flex flex-col justify-between p-4 bg-slate-950/60 font-mono text-xs">
                <div className="flex justify-between items-center text-[10px] text-slate-500 border-b border-slate-850 pb-2">
                  <span>TEST_HARNESS: UVM_LOG_WAVES</span>
                  <span className="text-indigo-400 font-bold">SIMULATION_REGRESSION</span>
                </div>

                <div className="flex-1 grid grid-cols-12 gap-3 items-center justify-center py-2 overflow-hidden">
                  {/* Left: log console with real-time dynamic timestamping */}
                  <div className="col-span-5 bg-slate-950 border border-slate-850 p-2 rounded h-[120px] text-[7.5px] leading-relaxed text-slate-300 text-left overflow-hidden relative flex flex-col justify-end">
                    <div className="text-slate-500 font-bold">@ {(currentTime * 1250).toFixed(0)}ns: Driving test vectors...</div>
                    <div className="text-indigo-400">[UVM_MONITOR] Transaction observed</div>
                    <div className={`transition-all ${isPlaying ? "text-emerald-400" : "text-slate-500"}`}>
                      [SCOREBOARD] Compare successful, matches golden C++ model
                    </div>
                    <div className="text-indigo-400">[ASSERT] check_fifo_overrun: MET</div>
                    <div className="text-emerald-400">[SCBD] Block packet {Math.floor(2500 + currentTime * 8)} verified OK</div>
                    <div className="text-amber-500">[WARN] @ {(currentTime * 1250 + 200).toFixed(0)}ns: Substrate delta tolerance check</div>
                    {localStepProgress > 0.6 && (
                      <div className="text-emerald-400 font-bold animate-pulse text-[8px] bg-emerald-950/40 p-0.5 rounded text-center border border-emerald-800">
                        🏆 100% COVERAGE EXCEEDED
                      </div>
                    )}
                  </div>

                  {/* Middle: Oscilloscope Waves */}
                  <div className="col-span-4 bg-slate-900 border border-indigo-500/30 rounded p-2 h-[120px] flex flex-col justify-between">
                    <span className="text-[7.5px] text-indigo-300 font-black block">WAVEFORM ANALYZER</span>
                    <div className="space-y-1 py-0.5">
                      {["CLK", "REQ", "ACK"].map((lbl, idx) => (
                        <div key={lbl} className="flex items-center gap-1 text-[6px]">
                          <span className="w-5 text-slate-500 font-bold text-right">{lbl}:</span>
                          <div className="flex-1 h-3 bg-slate-950 rounded border border-slate-850 overflow-hidden relative">
                            <svg className="w-full h-full" viewBox="0 0 100 10" preserveAspectRatio="none">
                              <motion.path
                                d={idx === 0 
                                  ? "M0,5 L10,5 L10,1 L20,1 L20,5 L30,5 L30,1 L40,1 L40,5 L50,5 L50,1 L60,1 L60,5 L70,5 L70,1 L80,1 L80,5 L90,5 L90,1 L100,1"
                                  : idx === 1
                                  ? "M0,9 L20,9 L20,1 L40,1 L40,9 L60,9 L60,1 L80,1 L80,9 L100,9"
                                  : "M0,9 L30,9 L30,1 L70,1 L70,9 L100,9"
                                }
                                fill="none"
                                stroke={idx === 0 ? "#10b981" : idx === 1 ? "#38bdf8" : "#fbbf24"}
                                strokeWidth="1"
                                animate={isPlaying ? { x: [-20, 0] } : { x: 0 }}
                                transition={{ repeat: Infinity, duration: idx === 0 ? 1 : 1.5, ease: "linear" }}
                              />
                            </svg>
                          </div>
                        </div>
                      ))}
                    </div>
                    <span className="text-[6.5px] text-center text-slate-500 font-bold">Synchronous Simulation</span>
                  </div>

                  {/* Right: Automated Checklist */}
                  <div className="col-span-3 bg-slate-900 border border-slate-850 rounded p-2 h-[120px] flex flex-col justify-between text-[7px]">
                    <div className="text-[8px] font-bold text-slate-400">ASSERTIONS</div>
                    <div className="space-y-1 flex-1 justify-center flex flex-col">
                      <div className="flex items-center gap-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-[6px] text-emerald-400 font-bold">✓</div>
                        <span className="text-slate-300">Clock Sync</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-[6px] text-emerald-400 font-bold">✓</div>
                        <span className="text-slate-300">FIFO Overflow</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className={`w-2.5 h-2.5 rounded-full border flex items-center justify-center text-[6px] font-bold ${localStepProgress > 0.4 ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" : "bg-amber-500/10 border-amber-500 text-amber-400 animate-pulse"}`}>
                          {localStepProgress > 0.4 ? "✓" : "●"}
                        </div>
                        <span className={localStepProgress > 0.4 ? "text-slate-300" : "text-amber-400"}>DMA Timing</span>
                      </div>
                    </div>
                    <div className="text-[7px] text-slate-500">UVM Engine Ready</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-900 pt-2 text-[10px]">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">COVERAGE_METRIC:</span>
                    <div className="w-20 bg-slate-950 rounded h-2 overflow-hidden border border-slate-850">
                      <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${Math.floor(91 + localStepProgress * 8.9)}%` }}></div>
                    </div>
                    <span className="text-emerald-400 font-bold">{Math.floor(91 + localStepProgress * 8.9)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">REGRESSION_STATUS:</span>
                    <span className="text-indigo-400 font-bold">ALL_PASS_ACTIVE</span>
                  </div>
                </div>
              </div>
            )}

            {/* STAGE 4: LOGIC SYNTHESIS */}
            {activeChapter.id === "synthesis" && (
              <div id="stage-synthesis" className="w-full h-full flex flex-col justify-between p-4 bg-slate-950/60 font-mono text-xs">
                <div className="flex justify-between items-center text-[10px] text-slate-500 border-b border-slate-850 pb-2">
                  <span>LOGIC_SYNTHESIZER: TRANSLATION_ENGINE</span>
                  <span className="text-purple-400 font-bold">RTL_TO_NETLIST.MAP</span>
                </div>

                <div className="flex-1 grid grid-cols-3 gap-3 items-center justify-center py-2 overflow-hidden">
                  {/* Left: Compilation optimization step tracker */}
                  <div className="bg-slate-900/80 border border-purple-500/20 rounded p-2 h-[120px] flex flex-col justify-between text-[8px]">
                    <span className="text-purple-300 font-black block uppercase text-[8.5px]">OPTIMIZER STATUS</span>
                    <div className="space-y-1.5 flex-1 justify-center flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span className="text-slate-300">Parse SV AST Code</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${localStepProgress > 0.35 ? "bg-emerald-500" : "bg-purple-500 animate-ping"}`}></span>
                        <span className={localStepProgress > 0.35 ? "text-slate-300" : "text-purple-300 font-bold"}>Standard Cell Mapping</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${localStepProgress > 0.7 ? "bg-emerald-500" : "bg-slate-700"}`}></span>
                        <span className={localStepProgress > 0.7 ? "text-slate-300" : "text-slate-500"}>Slack / Fanout Optimize</span>
                      </div>
                    </div>
                    <span className="text-[7px] text-slate-500 text-center">TSMC 5nm Cell Lib</span>
                  </div>

                  {/* Middle: Schematic layout with morphing colors */}
                  <div className="bg-slate-900 border border-slate-850 rounded p-2 h-[120px] flex items-center justify-center relative overflow-hidden">
                    <svg className="w-full h-full" viewBox="0 0 100 80">
                      <g transform="translate(10, 10)">
                        <rect x="0" y="5" width="16" height="10" rx="2" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1" />
                        <text x="8" y="12" fill="#a5b4fc" fontSize="5" textAnchor="middle">IN</text>

                        <rect x="35" y="15" width="22" height="15" rx="2" fill="#1c1917" stroke={localStepProgress > 0.4 ? "#22c55e" : "#f59e0b"} strokeWidth="1" />
                        <text x="46" y="24" fill={localStepProgress > 0.4 ? "#4ade80" : "#fbbf24"} fontSize="5" textAnchor="middle" fontWeight="bold">NAND</text>

                        <rect x="35" y="45" width="22" height="15" rx="2" fill="#1c1917" stroke={localStepProgress > 0.7 ? "#22c55e" : "#d97706"} strokeWidth="1" />
                        <text x="46" y="54" fill={localStepProgress > 0.7 ? "#4ade80" : "#f59e0b"} fontSize="5" textAnchor="middle" fontWeight="bold">DFF</text>

                        <rect x="70" y="30" width="16" height="10" rx="2" fill="#14532d" stroke="#22c55e" strokeWidth="1" />
                        <text x="78" y="37" fill="#86efac" fontSize="5" textAnchor="middle">OUT</text>

                        <path d="M16,10 L35,22 M16,10 L35,52 M57,22 L70,35 M57,52 L70,35" stroke="#475569" strokeWidth="0.8" />
                        {isPlaying && (
                          <>
                            <circle r="1.5" fill="#a5b4fc">
                              <animateMotion path="M16,10 L35,22" dur="1s" repeatCount="indefinite" />
                            </circle>
                            <circle r="1.5" fill="#f59e0b">
                              <animateMotion path="M35,22 L57,22 L70,35" dur="1.2s" repeatCount="indefinite" />
                            </circle>
                          </>
                        )}
                      </g>
                    </svg>
                    <div className="absolute top-1 right-2 text-[7px] text-slate-500">Live Synthesis Map</div>
                  </div>

                  {/* Right: Slack meter visualization */}
                  <div className="bg-slate-900 border border-slate-850 rounded p-2 h-[120px] flex flex-col justify-between text-[8px]">
                    <span className="text-slate-400 font-bold text-[8.5px]">TIMING CRITICAL SLACK</span>
                    <div className="flex-1 flex flex-col justify-center items-center gap-1.5">
                      <div className="w-16 h-16 relative">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="14" fill="none" stroke="#2d1b4e" strokeWidth="3" />
                          <motion.circle 
                            cx="18" cy="18" r="14" fill="none" 
                            stroke={localStepProgress > 0.6 ? "#10b981" : "#f59e0b"} 
                            strokeWidth="3" 
                            strokeDasharray="88"
                            animate={{ strokeDashoffset: 88 - (20 + localStepProgress * 55) }}
                            transition={{ duration: 0.5 }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-[8px] font-black text-white">
                            {`+${(0.01 + localStepProgress * 0.045).toFixed(3)}`}
                          </span>
                          <span className="text-[6px] text-slate-500 font-bold">ns Slack</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[7.5px] text-emerald-400 font-black text-center">Setup Constraints: MET</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-900 pt-2 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">MAPPED_GATES:</span>
                    <span className="text-purple-400 font-bold">14,240,650 GATES</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">CRITICAL_PATH_SLACK:</span>
                    <span className="text-emerald-400 font-bold">+0.052 ns (MET)</span>
                  </div>
                </div>
              </div>
            )}

            {/* STAGE 5: PHYSICAL DESIGN */}
            {activeChapter.id === "phys" && (
              <div id="stage-phys" className="w-full h-full flex flex-col justify-between p-4 bg-slate-950/60 font-mono text-xs">
                <div className="flex justify-between items-center text-[10px] text-slate-500 border-b border-slate-850 pb-2">
                  <span>PLACE_&_ROUTE: FLOORPLANNING_ENGINE</span>
                  <span className="text-rose-400 font-bold">PHYSICAL_LAYOUT_MASK</span>
                </div>

                <div className="flex-1 grid grid-cols-12 gap-3 items-center justify-center py-2 overflow-hidden">
                  {/* Left: interactive grid floorplan with laser scanner */}
                  <div className="col-span-8 bg-slate-950 p-2 rounded-lg border border-slate-850 h-[120px] relative overflow-hidden flex items-center justify-center">
                    <div className="grid grid-cols-4 gap-1.5 w-full max-w-[240px]">
                      {/* Macro cells lighting up and shifting positions */}
                      <div className={`p-1.5 border rounded flex flex-col justify-between h-[45px] transition-all duration-500 ${localStepProgress > 0.1 ? "bg-indigo-950/40 border-indigo-500 text-indigo-300" : "bg-slate-900/40 border-slate-800 text-slate-600"}`}>
                        <span className="text-[8px] font-black">MAC CORE</span>
                        <span className="text-[5.5px] text-slate-500">Placed 82%</span>
                      </div>
                      <div className={`p-1.5 border rounded flex flex-col justify-between h-[45px] transition-all duration-500 ${localStepProgress > 0.3 ? "bg-sky-950/40 border-sky-500 text-sky-300" : "bg-slate-900/40 border-slate-800 text-slate-600"}`}>
                        <span className="text-[8px] font-black">SRAM L2</span>
                        <span className="text-[5.5px] text-slate-500">Route active</span>
                      </div>
                      <div className={`p-1.5 border rounded flex flex-col justify-between h-[45px] transition-all duration-500 ${localStepProgress > 0.5 ? "bg-teal-950/40 border-teal-500 text-teal-300" : "bg-slate-900/40 border-slate-800 text-slate-600"}`}>
                        <span className="text-[8px] font-black">CLOCK TREE</span>
                        <span className="text-[5.5px] text-slate-500">H-Tree map</span>
                      </div>
                      <div className={`p-1.5 border rounded flex flex-col justify-between h-[45px] transition-all duration-500 ${localStepProgress > 0.7 ? "bg-rose-950/40 border-rose-500 text-rose-300" : "bg-slate-900/40 border-slate-800 text-slate-600"}`}>
                        <span className="text-[8px] font-black">PCIe GEN5</span>
                        <span className="text-[5.5px] text-slate-500">BGA Pad out</span>
                      </div>

                      {/* Underneath: Routing channels */}
                      <div className="col-span-4 bg-slate-900 p-1.5 rounded border border-slate-800 h-[38px] flex flex-col justify-between relative overflow-hidden">
                        <span className="text-[6.5px] font-black text-rose-400">ROUTING HIGHWAY: ACTIVE COPPER MAPPING</span>
                        {/* Shifting copper tracks */}
                        <div className="h-1 bg-slate-950 rounded-full overflow-hidden mt-1 relative">
                          <motion.div 
                            className="h-full bg-rose-500" 
                            animate={{ width: ["10%", "100%", "10%"] }}
                            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Sweeping yellow laser scanner over layout die */}
                    {isPlaying && (
                      <motion.div 
                        className="absolute left-0 right-0 h-0.5 bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)] pointer-events-none"
                        animate={{ top: ["5px", "115px", "5px"] }}
                        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                      />
                    )}
                  </div>

                  {/* Right: DRC Error Inspector */}
                  <div className="col-span-4 bg-slate-900 border border-slate-850 rounded p-2 h-[120px] flex flex-col justify-between text-[8px]">
                    <span className="text-slate-400 font-bold block">REALTIME DRC CHECKER</span>
                    <div className="space-y-1.5 flex-1 justify-center flex flex-col text-[7px]">
                      <div className="flex justify-between">
                        <span>Antenna Rule:</span>
                        <span className="text-emerald-400 font-bold">✓ PASSED</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Min Spacing:</span>
                        <span className="text-emerald-400 font-bold">✓ PASSED</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Via Overlap:</span>
                        <span className="text-emerald-400 font-bold">✓ PASSED</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-8850 pt-1 mt-1 font-black">
                        <span>P&R Status:</span>
                        <span className="text-indigo-400 animate-pulse">{localStepProgress > 0.8 ? "CLEAN TAPEOUT" : "ROUTING..."}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-900 pt-2 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">METAL_ROUTING_LAYERS:</span>
                    <span className="text-emerald-400 font-bold">12_METALS</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">DESIGN_RULE_CHECK_ERRS:</span>
                    <span className="text-indigo-400 font-bold">0_DRC_ERRORS (MET)</span>
                  </div>
                </div>
              </div>
            )}

            {/* STAGE 6: GDSII / MASK GENERATION */}
            {activeChapter.id === "mask" && (
              <div id="stage-mask" className="w-full h-full flex flex-col justify-between p-4 bg-slate-950/60 font-mono text-xs">
                <div className="flex justify-between items-center text-[10px] text-slate-500 border-b border-slate-850 pb-2">
                  <span>GDSII_OASIS_EXPORT: PATTERN_POLYGONS</span>
                  <span className="text-cyan-400 font-bold">EUV_PHOTOMASK_PLATE</span>
                </div>

                <div className="flex-1 grid grid-cols-12 gap-3 items-center justify-center py-2 overflow-hidden">
                  {/* Left: Stacking translucent glass layers with laser beam */}
                  <div className="col-span-7 bg-slate-950 border border-slate-850 rounded p-2 h-[120px] relative overflow-hidden flex items-center justify-center">
                    <div className="relative w-[180px] h-[100px] flex flex-col justify-between">
                      {/* Translucent mask layers drawn in axonometric perspective or layers stack */}
                      <div className="space-y-1 w-full">
                        {/* Metal layer 2 mask */}
                        <div className="h-4 bg-cyan-500/10 border border-cyan-500/40 rounded flex items-center justify-between px-2 text-[6.5px]">
                          <span className="text-cyan-400 font-bold">METAL2 MASK</span>
                          <span>Glass Plate #14</span>
                        </div>
                        {/* Poly Silicon layer mask */}
                        <div className="h-4 bg-indigo-500/10 border border-indigo-500/40 rounded flex items-center justify-between px-2 text-[6.5px]">
                          <span className="text-indigo-400 font-bold">POLY_SILICON MASK</span>
                          <span>Glass Plate #08</span>
                        </div>
                        {/* Active diffusion mask */}
                        <div className="h-4 bg-emerald-500/10 border border-emerald-500/40 rounded flex items-center justify-between px-2 text-[6.5px]">
                          <span className="text-emerald-400 font-bold">DIFF_ACTIVE MASK</span>
                          <span>Glass Plate #02</span>
                        </div>
                      </div>

                      {/* Moving laser projection dots */}
                      {isPlaying && (
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                          <motion.div 
                            className="w-1.5 h-1.5 bg-rose-500 rounded-full shadow-[0_0_10px_#f43f5e]"
                            animate={{ x: [-60, 60], y: [-15, 15] }}
                            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Optical Proximity Correction (OPC) slider comparison */}
                  <div className="col-span-5 bg-slate-900 border border-slate-850 rounded p-2 h-[120px] flex flex-col justify-between text-[8px]">
                    <span className="text-slate-400 font-bold">OPC DIFFRACTION CORRECTOR</span>
                    <div className="flex-1 flex gap-2 items-center py-1.5">
                      {/* Target square */}
                      <div className="flex-1 bg-slate-950 border border-slate-800 p-1 rounded flex flex-col items-center justify-center h-full">
                        <span className="text-[6px] text-slate-500 leading-none mb-1">INTENDED</span>
                        <div className="w-7 h-7 border-2 border-indigo-500 bg-indigo-950/20"></div>
                      </div>
                      {/* Mask starburst polygon */}
                      <div className="flex-1 bg-slate-950 border border-slate-800 p-1 rounded flex flex-col items-center justify-center h-full relative">
                        <span className="text-[6px] text-cyan-400 leading-none mb-1 font-bold">OPC MASK</span>
                        {/* Simulated complex polygon with serifs */}
                        <svg className="w-7 h-7" viewBox="0 0 30 30">
                          <path 
                            d="M 5,5 L 5,3 L 7,3 L 7,5 L 23,5 L 23,3 L 25,3 L 25,5 L 25,23 L 25,25 L 23,25 L 23,23 L 7,23 L 7,25 L 5,25 L 5,23 Z" 
                            fill="rgba(14, 165, 233, 0.2)" 
                            stroke="#0ea5e9" 
                            strokeWidth="1" 
                          />
                        </svg>
                      </div>
                    </div>
                    <span className="text-[6.5px] text-cyan-400 font-black text-center">EUV Correction: ACTIVE</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-900 pt-2 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">GLASS_PLATES_MASKSET:</span>
                    <span className="text-cyan-400 font-bold">72_MASKS</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">DATABASE_SIZE_EXPORT:</span>
                    <span className="text-emerald-400 font-bold">4.82 TB OASIS</span>
                  </div>
                </div>
              </div>
            )}

            {/* STAGE 7: FABRICATION & PACKAGING */}
            {activeChapter.id === "fab" && (
              <div id="stage-fab" className="w-full h-full flex flex-col justify-between p-4 bg-slate-950/60 font-mono text-xs">
                <div className="flex justify-between items-center text-[10px] text-slate-500 border-b border-slate-850 pb-2">
                  <span>FOUNDRY_300MM_FAB: SILICON_WAFER</span>
                  <span className="text-emerald-400 font-bold">FINFET_DEPOSITION_PACKAGING</span>
                </div>

                <div className="flex-1 grid grid-cols-12 gap-3 items-center justify-center py-2 overflow-hidden">
                  {/* Left: Interactive Wafer Grid with Laser Dicing Beam */}
                  <div className="col-span-4 bg-slate-950 border border-slate-850 rounded p-1.5 h-[120px] flex flex-col justify-between items-center relative overflow-hidden">
                    <span className="text-[7px] text-slate-500 font-bold">300mm Die Grid</span>
                    <div className="w-16 h-16 rounded-full border border-emerald-500/30 bg-slate-900/40 relative flex items-center justify-center p-1 overflow-hidden">
                      <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 opacity-25 border-slate-800">
                        {Array.from({ length: 64 }).map((_, i) => (
                          <div key={i} className="border-[0.5px] border-emerald-950"></div>
                        ))}
                      </div>
                      {/* Active exposing sweep light */}
                      {isPlaying && (
                        <motion.div 
                          className="absolute inset-x-0 h-1 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] pointer-events-none"
                          animate={{ top: ["0px", "64px", "0px"] }}
                          transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                        />
                      )}
                    </div>
                    <span className="text-[7px] text-emerald-400 font-black">Yield: {(82.4 + localStepProgress * 3.5).toFixed(2)}%</span>
                  </div>

                  {/* Middle: FinFET Deposition Simulator */}
                  <div className="col-span-4 bg-slate-900 border border-slate-850 rounded p-2 h-[120px] flex flex-col justify-between text-[7px]">
                    <span className="text-emerald-300 font-black block text-center">FINFET ATOMIC DEPOSITION</span>
                    <div className="flex-1 flex flex-col justify-center items-center gap-1">
                      {/* Interactive deposition wave layers */}
                      <svg className="w-16 h-10 border border-slate-850 bg-slate-950 rounded" viewBox="0 0 60 40">
                        {/* Substrate */}
                        <rect x="0" y="30" width="60" height="10" fill="#334155" />
                        {/* Fin structures */}
                        <rect x="15" y="15" width="8" height="15" fill="#475569" stroke="#64748b" strokeWidth="0.5" />
                        <rect x="35" y="15" width="8" height="15" fill="#475569" stroke="#64748b" strokeWidth="0.5" />
                        
                        {/* Plasma deposition layer growing dynamically */}
                        <motion.rect 
                          x="0" y="27" width="60" height="3" 
                          fill="rgba(16, 185, 129, 0.4)" 
                          animate={{ opacity: [0.3, 0.9, 0.3] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                        />
                        <motion.path 
                          d="M 15,15 L 23,15 L 23,30 L 35,30 L 35,15 L 43,15" 
                          fill="none" 
                          stroke="#10b981" 
                          strokeWidth="1.5"
                          animate={{ strokeDashoffset: [20, 0] }}
                          style={{ strokeDasharray: "4 2" }}
                          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        />
                      </svg>
                      <span className="text-slate-500 text-[6.5px] text-center">Atomic High-K Dielectric</span>
                    </div>
                  </div>

                  {/* Right: BGA Package with Interactive Bond Wires */}
                  <div className="col-span-4 bg-slate-900 border border-slate-850 rounded p-2 h-[120px] flex flex-col justify-between text-[7.5px] text-center">
                    <span className="text-amber-400 font-black block">FLIP-CHIP BGA PACKAGE</span>
                    <div className="flex-1 flex items-center justify-center relative">
                      <svg className="w-16 h-16" viewBox="0 0 40 40">
                        <rect x="2" y="2" width="36" height="36" rx="2" fill="#1c1917" stroke="#fbbf24" strokeWidth="0.8" />
                        {/* Silicon Die in the middle */}
                        <rect x="12" y="12" width="16" height="16" fill="#1e1b4b" stroke="#312e81" />
                        {/* Micro-bumps / wires */}
                        <circle cx="10" cy="10" r="1" fill="#fbbf24" />
                        <circle cx="30" cy="10" r="1" fill="#fbbf24" />
                        <circle cx="10" cy="30" r="1" fill="#fbbf24" />
                        <circle cx="30" cy="30" r="1" fill="#fbbf24" />

                        {/* Bonding wire drawing path */}
                        <path d="M 12,12 L 4,4 M 28,12 L 36,4 M 12,28 L 4,36 M 28,28 L 36,36" stroke="#fbbf24" strokeWidth="0.5" strokeDasharray="3 1" />
                      </svg>
                    </div>
                    <span className="text-slate-500 text-[6px]">1,156 Contact MicroBumps</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-900 pt-2 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">DIES_PER_WAFER_DPW:</span>
                    <span className="text-emerald-400 font-bold">12,400 GROSS DIES</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">DEFECT_DENSITY_EST:</span>
                    <span className="text-rose-400 font-bold">0.08 / cm²</span>
                  </div>
                </div>
              </div>
            )}

            {/* STAGE 8: POST-SILICON VALIDATION */}
            {activeChapter.id === "postval" && (
              <div id="stage-postval" className="w-full h-full flex flex-col justify-between p-4 bg-slate-950/60 font-mono text-xs">
                <div className="flex justify-between items-center text-[10px] text-slate-500 border-b border-slate-850 pb-2">
                  <span>POST_SILICON_TEST: FREQ_VOLT_SWEEP</span>
                  <span className="text-purple-400 font-bold">SHMOO_MARGIN_CURVE</span>
                </div>

                <div className="flex-1 grid grid-cols-12 gap-3 items-center justify-center py-2 overflow-hidden">
                  {/* Left: Shmoo Plot sweep matrix */}
                  <div className="col-span-7 bg-slate-950 border border-purple-500/20 p-2 rounded h-[120px] flex flex-col justify-between relative overflow-hidden">
                    <div className="flex justify-between text-[7px] text-purple-300 font-black uppercase">
                      <span>VDD (V) vs FREQ (GHz)</span>
                      <span className="text-emerald-400 animate-pulse">SWEEPING...</span>
                    </div>

                    <div className="grid grid-cols-10 gap-0.5 flex-1 py-1.5">
                      {Array.from({ length: 40 }).map((_, idx) => {
                        const col = idx % 10;
                        const row = Math.floor(idx / 10);
                        // Make failure zone dynamic based on local progression or curve boundaries
                        const limit = Math.floor(3 + localStepProgress * 4);
                        const isPass = col < limit + row;
                        // Active sweep cursor highlighted
                        const isSweeping = col === Math.floor(currentTime * 2) % 10;

                        return (
                          <div
                            key={idx}
                            className={`rounded-[1px] h-2 transition-all duration-300 ${
                              isSweeping 
                                ? "bg-amber-400 scale-110 shadow-[0_0_4px_#f59e0b] z-10" 
                                : isPass 
                                ? "bg-emerald-500/80" 
                                : "bg-rose-500/80"
                            }`}
                          />
                        );
                      })}
                    </div>
                    <span className="text-[6.5px] text-center text-slate-500">Silicon Characterization Matrix</span>
                  </div>

                  {/* Right: Thermal & Electrical Sensors readouts */}
                  <div className="col-span-5 bg-slate-900 border border-slate-850 p-2 rounded h-[120px] flex flex-col justify-between text-[7.5px] text-slate-300">
                    <span className="text-slate-400 font-bold block uppercase text-center border-b border-slate-850 pb-1">CHIP TELEMETRY</span>
                    <div className="space-y-1 flex-1 justify-center flex flex-col">
                      <div className="flex justify-between">
                        <span className="text-slate-500">JUNCTION_TEMP:</span>
                        <span className={`font-black ${Math.floor(45 + Math.sin(currentTime * 0.4) * 20) > 60 ? "text-rose-400 animate-pulse" : "text-amber-400"}`}>
                          {`${Math.floor(45 + Math.sin(currentTime * 0.4) * 20)}°C`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">CORE_VDD:</span>
                        <span className="text-sky-400 font-bold">{(0.85 + Math.cos(currentTime * 0.2) * 0.15).toFixed(3)}V</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">SWEEP_MAX_CLK:</span>
                        <span className="text-indigo-400 font-bold">2.84 GHz</span>
                      </div>
                    </div>
                    <div className="bg-emerald-950/40 border border-emerald-800 rounded p-0.5 text-center text-[7px] text-emerald-400 font-black uppercase">
                      MP_GRADE: FIT_ALL_PASS
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-900 pt-2 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">SILICON_ERRATA_COUNT:</span>
                    <span className="text-emerald-400 font-bold">0_CRITICAL_BUGS</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">CHARACTERIZATION:</span>
                    <span className="text-purple-400 font-bold">SHMOO_STABLE</span>
                  </div>
                </div>
              </div>
            )}

            {/* BOTTOM NARRATOR SUBTITLES OVERLAY */}
            <div id="narrator-overlay" className="bg-slate-950/95 border-t border-slate-900 p-4 flex items-start gap-3 min-h-[75px]">
              <div className="w-7 h-7 rounded-full bg-indigo-600/15 flex items-center justify-center shrink-0 mt-0.5 border border-indigo-500/20">
                <Sparkles className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="space-y-0.5 text-left flex-1 min-w-0">
                <span className="text-[8px] font-black text-indigo-400 font-mono uppercase tracking-wider block">
                  AI TUTOR NARRATION {useVoiceover && !isMuted ? "(VOICEOVER ACTIVE 🎙️)" : "(MUTED/SILENT)"}:
                </span>
                <p className="text-[11px] text-slate-200 leading-relaxed font-mono italic">
                  {isMuted ? "[Audio narration is muted. Click 'SOUND_ON' or 'TTS_VOICEOVER: ACTIVE' below to listen to the live voiceover]" : activeChapter.caption}
                </p>
              </div>
            </div>
          </div>

          {/* SCRUBBER PROGRESS TRACKER */}
          <div id="scrubber-container" className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span className="font-bold text-slate-400">
                {formatTime(currentTime)} <span className="text-slate-600">/ 08:00</span>
              </span>
              <span className="text-indigo-400 font-bold uppercase">{activeChapter.title}</span>
            </div>
            <div className="relative flex items-center">
              {/* Render dots for all 8 chapter start markers */}
              {chapters.map((chap, i) => (
                <button
                  key={i}
                  id={`mark-${chap.id}`}
                  onClick={() => {
                    setCurrentTime(chap.start);
                    setIsPlaying(true);
                    initAudio();
                  }}
                  className={`absolute h-2.5 w-2.5 rounded-full border border-slate-950 z-20 transform -translate-x-1/2 cursor-pointer transition-all ${
                    currentTime >= chap.start ? "bg-indigo-400 scale-110 shadow-[0_0_8px_rgba(99,102,241,0.8)]" : "bg-slate-700 hover:bg-slate-500"
                  }`}
                  style={{ left: `${(chap.start / 480) * 100}%` }}
                  title={chap.title}
                />
              ))}
              <input
                id="video-timeline-slider"
                type="range"
                min="0"
                max="480"
                step="0.1"
                value={currentTime}
                onChange={(e) => {
                  setCurrentTime(parseFloat(e.target.value));
                  initAudio();
                }}
                className="w-full accent-indigo-500 bg-slate-950 h-1.5 rounded-lg cursor-pointer border border-slate-800"
              />
            </div>
          </div>
          
          {/* PLAYBACK CONTROLS BAR */}
          <div id="playback-controls" className="flex flex-wrap items-center justify-between gap-4 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              
              {/* Skip Back Chapter */}
              <button
                id="btn-skip-back"
                onClick={() => {
                  const currentChIdx = Math.floor(currentTime / 60);
                  const currentChStart = currentChIdx * 60;
                  // If we are at least 3 seconds inside, skip to start of this chapter
                  if (currentTime - currentChStart > 3) {
                    setCurrentTime(currentChStart);
                  } else {
                    // Skip to start of previous chapter
                    setCurrentTime(Math.max(0, (currentChIdx - 1) * 60));
                  }
                  initAudio();
                }}
                className="p-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-all"
                title="Previous Chapter"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              {/* 10s Rewind seeker */}
              <button
                id="btn-seek-rewind"
                onClick={() => {
                  setCurrentTime((prev) => Math.max(0, prev - 10));
                  initAudio();
                }}
                className="px-2 py-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg text-[9px] font-mono font-bold text-slate-400 hover:text-white transition-all"
                title="Rewind 10s"
              >
                -10s
              </button>
              
              {/* Play / Pause */}
              <button
                id="btn-play-toggle"
                onClick={() => {
                  setIsPlaying(!isPlaying);
                  initAudio();
                }}
                className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all flex items-center justify-center shadow-lg shadow-indigo-950/40"
                title={isPlaying ? "Pause Video" : "Play Video"}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              </button>

              {/* 10s Fast-Forward seeker */}
              <button
                id="btn-seek-forward"
                onClick={() => {
                  setCurrentTime((prev) => Math.min(480, prev + 10));
                  initAudio();
                }}
                className="px-2 py-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg text-[9px] font-mono font-bold text-slate-400 hover:text-white transition-all"
                title="Forward 10s"
              >
                +10s
              </button>

              {/* Skip Forward Chapter */}
              <button
                id="btn-skip-forward"
                onClick={() => {
                  const currentChIdx = Math.floor(currentTime / 60);
                  setCurrentTime(Math.min(420, (currentChIdx + 1) * 60));
                  initAudio();
                }}
                className="p-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-all"
                title="Next Chapter"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Speed Controller */}
            <div id="speed-controls" className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-slate-500">SPEED:</span>
              {[1, 1.5, 2].map((speed) => (
                <button
                  key={speed}
                  id={`speed-${speed}x`}
                  onClick={() => setPlaybackSpeed(speed)}
                  className={`px-2 py-1 rounded text-[9px] font-mono font-bold transition-all ${
                    playbackSpeed === speed 
                      ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/40" 
                      : "bg-slate-900 text-slate-400 border border-transparent hover:text-slate-200"
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            {/* Voiceover Speech Synthesis Toggle */}
            <button
              id="btn-voiceover-toggle"
              onClick={() => {
                setUseVoiceover(!useVoiceover);
                initAudio();
              }}
              className={`p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-all flex items-center gap-1.5 ${
                useVoiceover && !isMuted ? "border-indigo-500/50 text-indigo-400 bg-indigo-950/20" : "text-slate-500"
              }`}
              title={useVoiceover ? "Disable AI Narration Voice" : "Enable AI Narration Voice"}
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-[9px] font-mono font-bold uppercase hidden sm:inline">
                {useVoiceover ? "TTS_VOICEOVER: ACTIVE" : "TTS_VOICEOVER: OFF"}
              </span>
            </button>

            {/* Procedural Audio Mute Toggle */}
            <button
              id="btn-audio-mute"
              onClick={() => {
                setIsMuted(!isMuted);
                initAudio();
              }}
              className={`p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-all flex items-center gap-1.5 ${
                isMuted ? "border-rose-500/30 text-rose-400 animate-pulse" : ""
              }`}
              title={isMuted ? "Unmute Audio" : "Mute Audio"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span className="text-[9px] font-mono font-bold uppercase hidden sm:inline">
                {isMuted ? "MUTED" : "SOUND_ON"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* VIDEO SIDEBAR & TELEMETRY (Col 4) */}
      <div id="video-sidebar" className="xl:col-span-4 flex flex-col gap-6">
        
        {/* Interactive Chapters List */}
        <div id="chapters-list-card" className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4 shadow-xl text-left">
          <h4 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">VIDEO CHAPTERS & SECTIONS</h4>
          <div className="flex flex-col gap-2">
            {chapters.map((chap, idx) => {
              const isCurrent = idx === activeChapterIdx;
              return (
                <button
                  key={chap.id}
                  id={`btn-chapter-${chap.id}`}
                  onClick={() => {
                    setCurrentTime(chap.start);
                    setIsPlaying(true);
                    initAudio();
                  }}
                  className={`p-3 rounded-lg border text-left transition-all font-mono flex items-center justify-between gap-3 ${
                    isCurrent
                      ? "bg-indigo-950/40 border-indigo-500/50 text-indigo-300 shadow-md shadow-indigo-950/20"
                      : "bg-slate-950/40 border-slate-850 text-slate-400 hover:border-slate-800 hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] ${
                      isCurrent ? "bg-indigo-600 text-white" : "bg-slate-900 text-slate-500"
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10.5px] font-bold block leading-none">{chap.title.replace(/^\d\.\s/, '')}</span>
                      <span className="text-[8.5px] text-slate-500 block leading-none">{`0${idx}:00 - 0${idx + 1}:00`}</span>
                    </div>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 ${isCurrent ? "text-indigo-400" : "text-slate-600"}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* LIVE TELEMETRY & SPECIFICATION DIAGNOSTICS */}
        <div id="telemetry-diagnostics-card" className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 shadow-xl text-left">
          <h4 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">LIVE TELEMETRY & DIAGNOSTICS</h4>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 space-y-2.5 font-mono text-[10px]">
            <div className="flex justify-between border-b border-slate-900 pb-1.5">
              <span className="text-slate-500">HARDWARE_STAGE:</span>
              <span className="text-white font-bold uppercase">{activeChapter.id}_PHASE</span>
            </div>
            <div className="space-y-1">
              <span className="text-slate-500 block">SPECIFICATION_SUMMARY:</span>
              <p className="text-indigo-300 leading-normal text-[9.5px] bg-slate-900/40 p-1.5 rounded border border-slate-900">
                {activeChapter.technical}
              </p>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">PLAYBACK_RATE:</span>
              <span className="text-emerald-400">{playbackSpeed}x Normal</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">STREAMING_QUALITY:</span>
              <span className="text-amber-400 font-bold">1080p SOURCE</span>
            </div>
          </div>

          {/* Equalizer Visualizer */}
          {isPlaying && !isMuted && (
            <div id="audio-equalizer-bar" className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-850">
              <div className="flex gap-0.5 items-end h-3 w-5 shrink-0">
                <div className="w-0.5 bg-indigo-500 rounded-full animate-pulse h-2"></div>
                <div className="w-0.5 bg-indigo-500 rounded-full animate-pulse h-3" style={{ animationDelay: "0.2s" }}></div>
                <div className="w-0.5 bg-indigo-500 rounded-full animate-pulse h-1.5" style={{ animationDelay: "0.4s" }}></div>
                <div className="w-0.5 bg-indigo-500 rounded-full animate-pulse h-2.5" style={{ animationDelay: "0.1s" }}></div>
                <div className="w-0.5 bg-indigo-500 rounded-full animate-pulse h-3" style={{ animationDelay: "0.3s" }}></div>
              </div>
              <span className="text-[8.5px] font-mono text-slate-500 uppercase tracking-wider">AUDIO NARRATION ACTIVE</span>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
