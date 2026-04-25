'use client';

import React from 'react';
import { 
  X, 
  Settings2, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Cpu, 
  ArrowRight,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TuningExpertModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestions: any;
}

export function TuningExpertModal({ isOpen, onClose, suggestions }: TuningExpertModalProps) {
  if (!suggestions) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl max-h-[85vh] bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-blue-600/10 to-cyan-600/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-xl">
                  <Settings2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight">Hyperparameter Tuning Guide</h2>
                  <p className="text-xs text-white/40 font-medium">AI-driven optimization strategies for your model.</p>
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
              {/* Tuning Order */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" /> Suggested Optimization Path
                </h3>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {suggestions.tuning_order?.map((step: string, i: number) => (
                    <React.Fragment key={i}>
                      <div className="bg-blue-600/10 border border-blue-500/20 px-4 py-2 rounded-xl whitespace-nowrap">
                        <span className="text-xs font-bold text-blue-400 mr-2">{i + 1}.</span>
                        <span className="text-xs font-medium text-white/80">{step}</span>
                      </div>
                      {i < suggestions.tuning_order.length - 1 && (
                        <ChevronRight className="w-4 h-4 text-white/10 shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Suggestions Grid */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-400" /> Parameter Adjustments
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {suggestions.tuning_suggestions?.map((s: any, i: number) => (
                    <div key={i} className="bg-[#111111] border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 transition-all group relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Cpu className="w-16 h-16 text-blue-400" />
                      </div>
                      
                      <div className="flex flex-col md:flex-row md:items-start gap-6 relative z-10">
                        <div className="md:w-1/3 space-y-3">
                          <div>
                            <span className="text-[10px] font-black uppercase text-blue-400">Parameter</span>
                            <h4 className="text-lg font-black text-white">{s.parameter}</h4>
                          </div>
                          <div className="flex items-center gap-3 bg-black/40 p-3 rounded-xl border border-white/5">
                            <div>
                              <span className="text-[8px] text-white/30 uppercase block">Current</span>
                              <span className="text-sm font-mono text-white/60">{JSON.stringify(s.current_value)}</span>
                            </div>
                            <ArrowRight className="w-3 h-3 text-white/10" />
                            <div>
                              <span className="text-[8px] text-white/30 uppercase block">Recommended Range</span>
                              <span className="text-sm font-bold text-white">
                                {Array.isArray(s.suggested_range) ? `${s.suggested_range[0]} — ${s.suggested_range[1]}` : s.suggested_range}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex-1 space-y-4">
                          <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                            <span className="text-[10px] font-black uppercase text-white/40 block mb-1">Impact Analysis</span>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-white/80">{s.expected_effect.metric_affected}</span>
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-black uppercase flex items-center gap-1 ${s.expected_effect.direction === 'increase' ? 'text-green-400' : 'text-red-400'}`}>
                                  {s.expected_effect.direction === 'increase' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                  {s.expected_effect.direction}
                                </span>
                                <span className="w-1 h-1 bg-white/20 rounded-full" />
                                <span className="text-[10px] font-black uppercase text-blue-400">{s.expected_effect.magnitude} magnitude</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Expert Rationale</span>
                              <p className="text-xs text-white/60 leading-relaxed italic">{s.explanation}</p>
                            </div>
                            <div className="bg-blue-600/5 px-4 py-2 rounded-lg border-l-2 border-blue-500/50">
                              <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest block mb-0.5">When to use</span>
                              <p className="text-[11px] text-white/80">{s.when_to_use}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-4 border-t border-white/5 bg-white/[0.02] flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-blue-600/20 hover:bg-blue-600/30 rounded-xl text-sm font-black text-blue-400 transition-all active:scale-95 border border-blue-500/20"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
