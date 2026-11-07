import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  GraduationCap,
  Building,
  AtSign,
  Check,
  RotateCcw,
  ShieldCheck,
  Palette
} from 'lucide-react';
import { UserProfile, useUserProfile } from '../services/profile';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COLOR_THEMES: Array<{
  id: UserProfile['avatarColor'];
  label: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  glow: string;
}> = [
  { id: 'cyan', label: 'Cyber Cyan', badgeBg: 'bg-cyan-500/20', badgeBorder: 'border-cyan-400', badgeText: 'text-cyan-300', glow: 'shadow-cyan-500/30' },
  { id: 'violet', label: 'Quantum Violet', badgeBg: 'bg-violet-500/20', badgeBorder: 'border-violet-400', badgeText: 'text-violet-300', glow: 'shadow-violet-500/30' },
  { id: 'emerald', label: 'Matrix Emerald', badgeBg: 'bg-emerald-500/20', badgeBorder: 'border-emerald-400', badgeText: 'text-emerald-300', glow: 'shadow-emerald-500/30' },
  { id: 'amber', label: 'Amber Solar', badgeBg: 'bg-amber-500/20', badgeBorder: 'border-amber-400', badgeText: 'text-amber-300', glow: 'shadow-amber-500/30' },
  { id: 'rose', label: 'Neon Rose', badgeBg: 'bg-rose-500/20', badgeBorder: 'border-rose-400', badgeText: 'text-rose-300', glow: 'shadow-rose-500/30' },
  { id: 'blue', label: 'Deep Blue', badgeBg: 'bg-blue-500/20', badgeBorder: 'border-blue-400', badgeText: 'text-blue-300', glow: 'shadow-blue-500/30' },
];

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { profile, updateProfile, resetProfile } = useUserProfile();

  const [formData, setFormData] = useState<UserProfile>({ ...profile });
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Sync with current profile whenever opened
  React.useEffect(() => {
    if (isOpen) {
      setFormData({ ...profile });
      setIsSaved(false);
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 700);
  };

  const handleReset = () => {
    const def = resetProfile();
    setFormData(def);
  };

  // Generate 2-letter initials
  const getInitials = (name: string): string => {
    if (!name || !name.trim()) return 'DS';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const currentTheme = COLOR_THEMES.find(t => t.id === formData.avatarColor) || COLOR_THEMES[0];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md">
        {/* Backdrop click dismiss */}
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          className="relative w-full max-w-xl bg-navy-900 border border-navy-700/80 rounded-2xl shadow-2xl shadow-navy-950/80 p-6 z-10 overflow-hidden text-slate-100"
        >
          {/* Subtle Ambient Background Flare */}
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Modal Header */}
          <div className="flex items-center justify-between pb-4 border-b border-navy-800 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-950/70 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">Academic Scholar Profile</h2>
                <p className="text-xs text-slate-400 font-mono">Customize your identity across DSVERSE & Code Arena</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Virtual Student Card Preview */}
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-navy-950 via-[#0a0f1d] to-navy-900 border border-navy-700/80 relative overflow-hidden shadow-inner">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-14 h-14 rounded-2xl ${currentTheme.badgeBg} border-2 ${currentTheme.badgeBorder} flex items-center justify-center font-mono font-black text-lg ${currentTheme.badgeText} shadow-md ${currentTheme.glow}`}
                >
                  {getInitials(formData.name)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-base tracking-tight truncate max-w-[240px]">
                      {formData.name || 'Student Scholar'}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-800">
                      ACTIVE
                    </span>
                  </div>
                  <div className="text-xs font-mono text-cyan-400/90 flex items-center gap-1 mt-0.5">
                    <AtSign className="w-3 h-3" />
                    <span>{formData.username || 'scholar'}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate max-w-[280px]">
                      {formData.program || 'Master of Computer Applications'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <Building className="w-3 h-3 text-slate-600" />
                    <span className="truncate max-w-[280px]">
                      {formData.institution || 'Department of Computer Science'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lab Certification Badge */}
              <div className="hidden sm:flex flex-col items-end text-right">
                <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                  <ShieldCheck className="w-3 h-3" />
                  <span>VERIFIED CS LAB</span>
                </div>
                <span className="text-[9px] font-mono text-slate-600 mt-1">POSIX C11 COMPLIANT</span>
              </div>
            </div>

            {/* Unnoticeable hidden micro-watermark */}
            <div className="mt-3 pt-2 border-t border-navy-800/60 flex items-center justify-between text-[8px] font-mono select-none">
              <span className="text-slate-600/50">DSVERSE ID: {Math.abs(formData.username.split('').reduce((acc, c) => acc + c.charCodeAt(0), 1000))}</span>
              <span
                className="text-slate-800/40 hover:text-slate-600 transition-colors cursor-default"
                title="System Core"
              >
                DSV-ARCH::vikas-dev05
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                  Full Name / Display Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    maxLength={40}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Alex Mercer"
                    className="w-full pl-9 pr-3 py-2 bg-navy-950 border border-navy-700 rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/60 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                  Username / Handle (for code submissions)
                </label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    maxLength={24}
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                    placeholder="e.g. alex_cs"
                    className="w-full pl-9 pr-3 py-2 bg-navy-950 border border-navy-700 rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/60 font-mono transition"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                  Degree / Program
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    maxLength={50}
                    value={formData.program}
                    onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                    placeholder="e.g. MCA / M.Tech CS / B.Tech"
                    className="w-full pl-9 pr-3 py-2 bg-navy-950 border border-navy-700 rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/60 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                  Institution / University
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    maxLength={60}
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    placeholder="e.g. Dept of Computer Science"
                    className="w-full pl-9 pr-3 py-2 bg-navy-950 border border-navy-700 rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/60 transition"
                  />
                </div>
              </div>
            </div>

            {/* Avatar Theme Selection */}
            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-cyan-400" />
                Badge Color Accent
              </label>
              <div className="flex items-center gap-2">
                {COLOR_THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, avatarColor: theme.id })}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono border transition flex items-center justify-center gap-1 ${
                      formData.avatarColor === theme.id
                        ? `${theme.badgeBg} ${theme.badgeBorder} ${theme.badgeText} ring-1 ring-white/20`
                        : 'bg-navy-950 border-navy-800 text-slate-400 hover:border-navy-700'
                    }`}
                  >
                    <span>{theme.label.split(' ')[1]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="pt-2 flex items-center justify-between border-t border-navy-800">
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-slate-200 hover:bg-navy-800 transition flex items-center gap-1.5"
                title="Reset profile to anonymous scholar defaults"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Default</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-xs font-mono text-slate-400 hover:text-slate-200 hover:bg-navy-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold font-mono text-xs shadow-md shadow-cyan-600/30 transition flex items-center gap-1.5"
                >
                  {isSaved ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <span>Save Profile</span>
                  )}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
