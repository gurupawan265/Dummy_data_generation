'use client';

import React from 'react';
import { 
  X, 
  BarChart2, 
  Lightbulb, 
  AlertTriangle, 
  CheckCircle2, 
  Dna,
  ArrowRight,
  TrendingUp,
  Brain
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FeatureAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: any;
}

export function FeatureAnalysisModal({ isOpen, onClose, analysis }: FeatureAnalysisModalProps) {
  if (!analysis) return null;

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
            className="relative w-full max-w-5xl max-h-[90vh] bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-emerald-600/10 to-teal-600/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-600 rounded-xl">
                  <BarChart2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight">Feature Influence Report</h2>
                  <p className="text-xs text-white/40 font-medium">Deciphering the "Why" behind your model's predictions.</p>
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
              {/* Top Summary */}
              <div className="bg-emerald-600/5 border border-emerald-500/20 p-6 rounded-2xl">
                <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-2 flex items-center gap-2">
                  <Brain className="w-4 h-4" /> The Prediction Drivers
                </h3>
                <p className="text-lg font-bold text-white leading-snug">
                  {analysis.top_3_features_explain}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Feature Rankings */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" /> Influence Rankings
                  </h3>
                  <div className="space-y-3">
                    {analysis.feature_rankings?.map((f: any) => (
                      <div key={f.rank} className="bg-white/5 border border-white/5 rounded-2xl p-5 hover:bg-white/[0.07] transition-all group">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 bg-emerald-500 text-black text-[10px] font-black rounded-lg flex items-center justify-center">
                              #{f.rank}
                            </span>
                            <h4 className="text-sm font-black text-white uppercase tracking-tight">{f.feature}</h4>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-black text-emerald-400">{Math.round(f.percentage || (f.importance_score * 100))}%</span>
                            <div className="w-24 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                              <div 
                                className="h-full bg-emerald-500" 
                                style={{ width: `${Math.round(f.percentage || (f.importance_score * 100))}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <p className="text-xs text-white/80 leading-relaxed font-medium">
                            {f.why_it_matters}
                          </p>
                          <div className="flex items-start gap-2 bg-black/40 p-3 rounded-xl border border-white/5">
                            <Lightbulb className="w-3 h-3 text-yellow-400 shrink-0 mt-0.5" />
                            <p className="text-[10px] text-white/50 italic leading-relaxed">
                              <span className="text-white/70 font-bold not-italic">Intuition:</span> {f.real_world_intuition}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Low Importance & Engineering */}
                <div className="space-y-8">
                  {/* Low Importance */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-400" /> Low-Signal Features
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      {analysis.low_importance_features?.map((f: any, i: number) => (
                        <div key={i} className="bg-white/5 border border-white/5 rounded-xl p-4 flex items-center justify-between group">
                          <div>
                            <h4 className="text-xs font-bold text-white/80 mb-1">{f.feature}</h4>
                            <p className="text-[10px] text-white/40 leading-tight pr-4">{f.likely_reason}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-full ${
                              f.recommendation === 'remove' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'
                            }`}>
                              {f.recommendation}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Feature Engineering Ideas */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
                      <Dna className="w-4 h-4 text-emerald-400" /> Signal Evolution Ideas
                    </h3>
                    <div className="space-y-3">
                      {analysis.feature_engineering_ideas?.map((idea: string, i: number) => (
                        <div key={i} className="bg-emerald-600/5 border border-emerald-500/10 rounded-2xl p-5 flex items-start gap-4 hover:border-emerald-500/30 transition-all group">
                          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          </div>
                          <p className="text-xs text-white/70 leading-relaxed font-medium mt-1">
                            {idea}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-4 border-t border-white/5 bg-white/[0.02] flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 rounded-xl text-sm font-black text-emerald-400 transition-all active:scale-95 border border-emerald-500/20"
              >
                Close Report
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
