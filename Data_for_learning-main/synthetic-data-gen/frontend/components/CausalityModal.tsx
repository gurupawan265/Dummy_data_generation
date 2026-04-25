'use client';

import React from 'react';
import { 
  X, 
  Cpu, 
  Activity, 
  Zap, 
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Info,
  Layers,
  Scale,
  Brain,
  Binary
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CausalityModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
}

export function CausalityModal({ isOpen, onClose, data }: CausalityModalProps) {
  if (!data) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-5xl max-h-[90vh] bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-blue-600/10 to-indigo-600/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20">
                  <Binary className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight">ML Causality Expert</h2>
                  <p className="text-xs text-white/40 font-medium italic">Uncovering the logical links between data shifts and metrics.</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/40 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* Characteristic Change Card */}
              <div className="bg-blue-600/5 border border-blue-500/20 p-6 rounded-2xl">
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2 flex items-center gap-2">
                   <Layers className="w-3 h-3" /> Data Characteristic Shift
                 </h3>
                 <p className="text-lg font-bold text-white leading-snug">
                   {data.characteristic_change}
                 </p>
              </div>

              {/* Causal Analysis of Metrics */}
              <div className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-400" /> Metric Causality
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {data.affected_metrics?.map((m: any, i: number) => (
                    <div key={i} className="bg-[#111] border border-white/10 rounded-2xl p-6 space-y-4 hover:border-indigo-500/30 transition-all group">
                       <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">{m.metric}</span>
                          <div className={`flex items-center gap-1 text-xs font-black ${m.change.includes('dropped') || m.change.includes('down') ? 'text-red-400' : 'text-green-400'}`}>
                             {m.change.includes('dropped') || m.change.includes('down') ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                             {m.change}
                          </div>
                       </div>
                       <div className="space-y-3">
                          <p className="text-sm font-bold text-white leading-tight">{m.causal_explanation}</p>
                          <div className="bg-white/5 p-3 rounded-lg border border-white/5 flex gap-3 items-start">
                             <Scale className="w-3.5 h-3.5 text-white/30 shrink-0 mt-0.5" />
                             <div>
                                <span className="text-[9px] font-black text-white/30 uppercase tracking-widest block mb-1">Mathematical Intuition</span>
                                <p className="text-[11px] text-white/60 leading-relaxed italic">{m.mathematical_intuition}</p>
                             </div>
                          </div>
                       </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comparison & Trade-offs */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <div className="bg-[#111] border border-white/10 rounded-3xl p-8 space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-400" /> Non-Equal Impact
                    </h3>
                    <p className="text-sm text-white/80 leading-relaxed font-medium">
                      {data.why_not_all_metrics_change_equally}
                    </p>
                 </div>

                 <div className="bg-indigo-600/5 border border-indigo-500/20 rounded-3xl p-8 space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                       <Scale className="w-32 h-32 text-white" />
                    </div>
                    <div className="relative z-10">
                       <h3 className="text-xs font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2 mb-4">
                         <Scale className="w-4 h-4" /> The Trade-off Explanation
                       </h3>
                       <p className="text-sm text-white/80 leading-relaxed">
                         {data.trade_off_explanation}
                       </p>
                    </div>
                 </div>
              </div>

              {/* Principles & Takeaways */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                      <Brain className="w-3.5 h-3.5 text-blue-400" /> Broader Principle
                    </h4>
                    <p className="text-xs text-white/80 leading-relaxed font-bold">{data.broader_principle}</p>
                 </div>
                 <div className="bg-blue-600/10 border border-blue-500/30 rounded-2xl p-6 space-y-3 flex flex-col justify-center items-center text-center">
                    <Info className="w-6 h-6 text-blue-400 mb-2" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1">Conceptual Takeaway</h4>
                    <p className="text-sm text-white font-black leading-tight tracking-tight uppercase">"{data.conceptual_takeaway}"</p>
                 </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-4 border-t border-white/5 bg-white/[0.02] flex justify-end">
              <button
                onClick={onClose}
                className="px-8 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-black text-white transition-all active:scale-95 flex items-center gap-2"
              >
                Analyze Deeper
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
