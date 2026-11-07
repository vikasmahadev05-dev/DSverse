import React from 'react';

interface AppLogoProps {
  size?: number;
  className?: string;
  withGlow?: boolean;
}

export const AppLogo: React.FC<AppLogoProps> = ({ size = 38, className = '', withGlow = true }) => {
  return (
    <div
      className={`relative flex items-center justify-center flex-shrink-0 transition-transform duration-300 hover:scale-105 ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Background Ambient Glow */}
      {withGlow && (
        <div
          className="absolute inset-0 rounded-xl bg-gradient-to-tr from-accent-blue/30 via-accent-violet/30 to-pink-500/30 blur-md opacity-70 animate-pulse pointer-events-none"
          style={{ animationDuration: '4s' }}
        />
      )}

      {/* SVG Isometric Data Core */}
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10"
      >
        <defs>
          <linearGradient id="logoCubeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
          <linearGradient id="logoCoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
          <radialGradient id="nucleusGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="40%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#6366F1" />
          </radialGradient>
        </defs>

        {/* Outer Shield Box */}
        <rect
          x="2"
          y="2"
          width="60"
          height="60"
          rx="14"
          fill="#0B0F19"
          stroke="url(#logoCubeGrad)"
          strokeWidth="1.5"
          className="shadow-inner"
        />

        {/* Isometric Faces */}
        {/* Top Diamond Face */}
        <polygon
          points="32,13 48,22 32,31 16,22"
          stroke="url(#logoCubeGrad)"
          strokeWidth="1.8"
          fill="#111827"
          fillOpacity="0.8"
        />
        {/* Left Face */}
        <polygon
          points="16,22 32,31 32,49 16,40"
          stroke="url(#logoCubeGrad)"
          strokeWidth="1.8"
          fill="#080C16"
          fillOpacity="0.9"
        />
        {/* Right Face */}
        <polygon
          points="32,31 48,22 48,40 32,49"
          stroke="url(#logoCubeGrad)"
          strokeWidth="1.8"
          fill="#0F172A"
          fillOpacity="0.85"
        />

        {/* Internal Pointer Vectors / Data Channels */}
        <line x1="32" y1="13" x2="32" y2="31" stroke="#38BDF8" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="16" y1="22" x2="32" y2="31" stroke="#8B5CF6" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="48" y1="22" x2="32" y2="31" stroke="#EC4899" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="32" y1="31" x2="32" y2="49" stroke="#38BDF8" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="2 2" />

        {/* Peripheral Vertices */}
        <circle cx="32" cy="13" r="2.8" fill="#38BDF8" />
        <circle cx="16" cy="22" r="2.8" fill="#8B5CF6" />
        <circle cx="48" cy="22" r="2.8" fill="#EC4899" />
        <circle cx="32" cy="49" r="2.8" fill="#38BDF8" />

        {/* Central Quantum Node Core */}
        <circle cx="32" cy="31" r="4.2" fill="url(#nucleusGrad)" stroke="#FFFFFF" strokeWidth="1" />
      </svg>
    </div>
  );
};

