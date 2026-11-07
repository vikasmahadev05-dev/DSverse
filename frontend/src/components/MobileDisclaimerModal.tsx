import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check } from 'lucide-react';

// Funny duck GIFs (Shuba duck dancing, walking duck)
const DUCK_GIFS = [
  'https://media.giphy.com/media/krewXUB6LBja/giphy.gif', // Legendary dancing duck with shades
  'https://media.giphy.com/media/WsRFoTvgBjA7zE5EZi/giphy.gif', // Funny marching duck
  'https://media.giphy.com/media/B2l0NnxK9KiVa/giphy.gif'  // Funny bobbing duck
];

export const MobileDisclaimerModal: React.FC = () => {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [duckIndex, setDuckIndex] = useState<number>(0);

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
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleImageError = () => {
    if (duckIndex < DUCK_GIFS.length - 1) {
      setDuckIndex((prev) => prev + 1);
    }
  };

  if (!isMobile || isDismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-[#060913]/98 backdrop-blur-xl p-5 text-center select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative max-w-sm w-full bg-[#0d1424] border border-cyan-500/30 rounded-3xl p-7 shadow-2xl shadow-cyan-950/80 flex flex-col items-center"
        >
          {/* Funny Duck Image / Animated GIF */}
          <div className="w-40 h-40 rounded-2xl overflow-hidden border-2 border-amber-400/50 shadow-xl shadow-amber-500/20 bg-navy-900 mb-5 flex items-center justify-center">
            <img
              src={DUCK_GIFS[duckIndex]}
              alt="Funny Duck"
              onError={handleImageError}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Exact Headline Requested */}
          <h1 className="text-xl sm:text-2xl font-black text-amber-300 tracking-tight leading-tight uppercase font-mono mb-2">
            BROTHA UR MASTERS STUDENT OPEN IT USING LAPTOP
          </h1>

          {/* Exact Small Tiny Text Requested */}
          <p className="text-[11px] text-slate-400 font-mono italic mb-6">
            developer was lazy to make it responsive
          </p>

          {/* Copy Link Button */}
          <button
            onClick={handleCopyLink}
            className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-bold font-mono text-xs shadow-lg shadow-amber-400/25 transition-all flex items-center justify-center gap-2 mb-3"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>COPIED LINK!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>COPY LINK FOR LAPTOP 💻</span>
              </>
            )}
          </button>

          {/* Small Peek Anyway Option */}
          <button
            onClick={handleDismiss}
            className="text-[10px] text-slate-600 hover:text-slate-400 font-mono underline transition-colors"
          >
            peek anyway
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
