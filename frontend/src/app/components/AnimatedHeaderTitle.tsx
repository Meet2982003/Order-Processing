"use client";

import React from 'react';

export default function AnimatedHeaderTitle() {
  return (
    <div className="flex items-center gap-3 group cursor-pointer select-none">
      <div className="relative w-10 h-10 perspective-[1000px]">
        {/* Glow behind the box on hover */}
        <div className="absolute inset-0 bg-cobalt/30 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-sm">
          {/* Animated processing particles that shoot out of the box on hover */}
          <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
             <circle cx="50" cy="40" r="3" fill="#1F9D6C" className="animate-[shootUp_1s_ease-out_infinite]" />
             <circle cx="40" cy="45" r="2.5" fill="#1E3A8A" className="animate-[shootUp_1.5s_ease-out_infinite_0.2s]" />
             <circle cx="60" cy="45" r="3.5" fill="#60A5FA" className="animate-[shootUp_1.2s_ease-out_infinite_0.4s]" />
          </g>

          {/* Base of the 3D Box */}
          <g transform="translate(50, 65)">
             {/* Left side */}
             <path d="M 0 0 L -30 -15 L -30 -40 L 0 -25 Z" fill="#1E3A8A" />
             {/* Right side */}
             <path d="M 0 0 L 30 -15 L 30 -40 L 0 -25 Z" fill="#2563EB" />
             {/* Inner shadow/depth (inside the box) */}
             <path d="M -30 -40 L 0 -55 L 30 -40 L 0 -25 Z" fill="#101828" opacity="0.1" />
          </g>
          
          {/* Animated 3D Lid */}
          <g className="animate-[floatLid_4s_ease-in-out_infinite] group-hover:animate-[floatLidHigh_2s_ease-in-out_infinite]">
             {/* Top Plane of the Lid */}
             <path d="M 50 25 L 20 40 L 50 55 L 80 40 Z" fill="#60A5FA" />
             {/* Left Edge Depth */}
             <path d="M 20 40 L 50 55 L 50 58 L 20 43 Z" fill="#3B82F6" />
             {/* Right Edge Depth */}
             <path d="M 80 40 L 50 55 L 50 58 L 80 43 Z" fill="#2563EB" />
          </g>
        </svg>
        
        {/* Inject keyframes locally so they don't leak, keeping it totally self-contained */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes floatLid {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
          }
          @keyframes floatLidHigh {
            0%, 100% { transform: translateY(-12px); }
            50% { transform: translateY(-20px); }
          }
          @keyframes shootUp {
            0% { transform: translateY(0) scale(1); opacity: 1; }
            100% { transform: translateY(-35px) scale(0); opacity: 0; }
          }
        `}} />
      </div>
      
      {/* Sleek Brand Name */}
      <div className="flex flex-col justify-center">
        <span className="font-display font-black text-2xl tracking-tighter text-ink leading-none">
          OPP<span className="text-cobalt">.</span>
        </span>
      </div>
    </div>
  );
}
