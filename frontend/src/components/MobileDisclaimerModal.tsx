import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Laptop, Copy, Check, Terminal, AlertOctagon, Sparkles, Eye } from 'lucide-react';

// Reliable animated GIFs for developer coding humor
const STICKER_GIFS = [
  'https://media.giphy.com/media/unQ3IJU2RG7DO/giphy.gif', // Cat frantically typing fast on laptop
  'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif', // Cute cat typing
  'https://media.giphy.com/media/ule4akeXnY9Fb4xFWU/giphy.gif', // Intense cat hacking
  'https://media1.tenor.com/m/Yw7P39U0D1EAAAAC/cat-typing.gif'  // Tenor cat typing
];

export const MobileDisclaimerModal: React.FC = () => {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [currentGifIndex, setCurrentGifIndex] = useState<number>(0);
  const [imgError, setImgError] = useState<boolean>(false);

  useEffect(() => {
    // Check if user already dismissed for this session
    const dismissed = sessionStorage.getItem('dsverse_mobile_dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }

    const checkMobile = () => {
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isSmallScreen = window.innerWidth < 1024;
      setIsMobile(isMobileUA || isSmallScreen);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem('dsverse_mobile_dismissed', 'true');
    } catch {
      // ignore
    }
  };

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleImageError = () => {
    if (currentGifIndex < STICKER_GIFS.length - 1) {
      setCurrentGifIndex(prev => prev + 1);
    } else {
      setImgError(true);
    }
  };

  if (!isMobile || isDismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-[#050811]/96 backdrop-blur-2xl p-4 overflow-y-auto">
        {/* Ambient Glowing Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-80 h-80 bg-violet-600/15 rounded-full blur-[100px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative max-w-lg w-full bg-[#0a0f1d]/90 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/60 text-center flex flex-col items-center my-auto ring-1 ring-cyan-400/20"
        >
          {/* Top Status Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-medium tracking-wide uppercase mb-4 shadow-inner">
            <AlertOctagon className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>CRITICAL HARDWARE DETECTED</span>
          </div>

          {/* Animated Sticker GIF Container */}
          <div className="relative mb-5 group">
            <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden border-2 border-cyan-400/50 shadow-lg shadow-cyan-500/30 bg-navy-900/80 flex items-center justify-center relative">
              {!imgError ? (
                <img
                  src={STICKER_GIFS[currentGifIndex]}
                  alt="Funny Coder Cat GIF"
                  onError={handleImageError}
                  className="w-full h-full object-cover select-none"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-4 text-cyan-400">
                  <Laptop className="w-16 h-16 animate-bounce mb-2 text-cyan-300" />
                  <span className="text-xs font-mono">⚡ LAPTOP REQUIRED ⚡</span>
                </div>
              )}
              {/* Live Sticker Badge */}
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1 shadow">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                LIVE
              </div>
            </div>

            {/* Glowing ring animation */}
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-500 opacity-20 blur-md -z-10 group-hover:opacity-40 transition-opacity" />
          </div>

          {/* Exact Headline Requested */}
          <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-amber-300 tracking-tight leading-tight uppercase font-mono mb-3">
            BROTHA YOURE A MASTER STUDENT OPEN IS USING LAPTOP
          </h1>

          {/* Funny CS Academic Subtitle */}
          <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed max-w-md mb-5">
            Bro, you really trying to debug double pointers <code className="text-amber-300 font-mono text-xs bg-navy-900 px-1 py-0.5 rounded">**ptr</code>, compile C memory structs, and run AST graph visualizers on a 6-inch phone screen?! 💀💻
          </p>

          <div className="w-full bg-[#0d1424] border border-cyan-500/20 rounded-xl p-3 mb-6 text-xs text-slate-400 font-mono space-y-1 text-left">
            <div className="flex items-center justify-between text-cyan-300 font-bold border-b border-white/5 pb-1">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" /> CS Diagnostic
              </span>
              <span className="text-amber-400">Warning: Screen Deficit</span>
            </div>
            <div className="text-slate-300 pt-1">
              • Minimum recommended screen: <span className="text-cyan-400 font-bold">13&quot;+ Display</span>
            </div>
            <div>
              • Monaco Editor + GCC 16.2.0: <span className="text-emerald-400">Ready for keyboard</span>
            </div>
            <div>
              • Degree status: <span className="text-purple-300 font-bold">Master of Computer Applications / CS</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full space-y-3">
            <button
              onClick={handleCopyLink}
              className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-cyan-500 hover:from-cyan-400 to-blue-600 hover:to-blue-500 text-slate-950 font-bold font-mono text-sm shadow-lg shadow-cyan-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
                  <span>LINK COPIED! PASTE ON YOUR LAPTOP</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-950" />
                  <span>COPY DSVERSE LINK FOR LAPTOP</span>
                </>
              )}
            </button>

            <button
              onClick={handleDismiss}
              className="w-full py-2.5 px-4 rounded-xl bg-navy-900/60 hover:bg-navy-800/80 border border-slate-700/60 hover:border-slate-500 text-slate-400 hover:text-slate-200 text-xs font-mono transition-all flex items-center justify-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>I know, let me peek anyway (Preview Mode)</span>
            </button>
          </div>

          {/* Footer note */}
          <div className="mt-5 text-[11px] text-slate-500 font-mono flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>DSVERSE Academic Laboratory • Full Experience on Desktop</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

