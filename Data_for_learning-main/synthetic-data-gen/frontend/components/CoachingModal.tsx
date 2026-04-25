'use client';

import React from 'react';
import { 
  X, 
  Brain, 
  CheckCircle2, 
  Zap, 
  AlertTriangle, 
  ArrowRight,
  TrendingUp,
  Lightbulb,
  ShieldCheck,
  Flag,
  Target,
  Trophy,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CoachingModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
}

export function CoachingModal({ isOpen, onClose, data }: CoachingModalProps) {
  if (!data) return null;

  const getProblemColor = (problem: string) => {
    switch(problem) {
      case 'overfitting': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'underfitting': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'class_imbalance': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      default: return 'text-red-400 bg-red-500/10 border-red-500/20';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-5xl max-h-[90vh] bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-emerald-600/10 to-blue-600/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-600 rounded-xl shadow-lg shadow-emerald-500/20">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight">ML Coaching Assistant</h2>
                  <p className="text-xs text-white/40 font-medium">Personalized strategy to improve your model performance.</p>
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
              {/* Diagnosis Section */}
              <div className="bg-[#111] border border-white/10 rounded-3xl p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                   <Target className="w-48 h-48 text-white" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
                   <div className={`px-6 py-4 rounded-2xl border ${getProblemColor(data.diagnosis.primary_problem)} flex flex-col items-center justify-center min-w-[200px]`}>
                      <Flag className="w-6 h-6 mb-2" />
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">Primary Problem</span>
                      <span className="text-sm font-black uppercase tracking-tight">{data.diagnosis.primary_problem.replace('_', ' ')}</span>
                   </div>
                   <div className="flex-1">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-2">Diagnosis Evidence</h3>
                      <p className="text-lg font-bold text-white leading-snug">
                        {data.diagnosis.evidence}
                      </p>
                   </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" /> Strategic Recommendations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.recommendations?.map((rec: any, i: number) => (
                    <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-6 flex flex-col space-y-4 hover:border-emerald-500/30 transition-all group">
                       <div className="flex justify-between items-center">
                          <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-black border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                            {rec.rank}
                          </div>
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                            rec.difficulty === 'easy' ? 'bg-green-500/10 text-green-400' :
                            rec.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400'
                          }`}>
                            {rec.difficulty}
                          </span>
                       </div>
                       <div>
                          <h4 className="text-sm font-black text-white mb-2 leading-tight">{rec.action}</h4>
                          <p className="text-xs text-white/50 leading-relaxed italic">{rec.rationale}</p>
                       </div>
                       <div className="pt-4 border-t border-white/5 space-y-3">
                          <div className="flex items-center gap-2">
                             <Zap className="w-3 h-3 text-emerald-400" />
                             <span className="text-[10px] text-emerald-400 font-bold">{rec.expected_improvement}</span>
                          </div>
                          <div className="flex items-center gap-2">
                             <Lightbulb className="w-3 h-3 text-blue-400" />
                             <span className="text-[10px] text-blue-400 font-black uppercase tracking-widest">{rec.related_concept}</span>
                          </div>
                       </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Wins & Long Term */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <div className="bg-emerald-600/5 border border-emerald-500/20 rounded-3xl p-8 space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                      <Zap className="w-4 h-4" /> Quick Wins (Try First)
                    </h3>
                    <div className="space-y-4">
                      {data.quick_wins?.map((win: string, i: number) => (
                        <div key={i} className="flex gap-4 items-start">
                           <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0" />
                           <p className="text-xs text-white/80 font-medium leading-relaxed">{win}</p>
                        </div>
                      ))}
                    </div>
                 </div>

                 <div className="bg-blue-600/5 border border-blue-500/20 rounded-3xl p-8 space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-blue-400 flex items-center gap-2">
                      <History className="w-4 h-4" /> Long-Term Improvements
                    </h3>
                    <div className="space-y-4">
                      {data.long_term_improvements?.map((item: string, i: number) => (
                        <div key={i} className="flex gap-4 items-start">
                           <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                           <p className="text-xs text-white/80 font-medium leading-relaxed">{item}</p>
                        </div>
                      ))}
                    </div>
                 </div>
              </div>

              {/* Warnings */}
              {data.warning && (
                <div className="bg-red-600/5 border border-red-500/20 rounded-3xl p-6 flex items-start gap-4">
                  <div className="p-2 bg-red-500/20 rounded-xl shrink-0">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-red-400 uppercase tracking-widest mb-1">Important Warning</h4>
                    <p className="text-xs text-white/80 font-medium leading-relaxed">{data.warning}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 py-4 border-t border-white/5 bg-white/[0.02] flex justify-end">
              <button
                onClick={onClose}
                className="px-8 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-black text-white transition-all active:scale-95 flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Apply Strategy
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
