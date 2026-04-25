'use client';

import React from 'react';
import { 
  X, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle2, 
  Zap, 
  BarChart3,
  Search,
  ArrowRight,
  Brain,
  Info,
  BookOpen,
  HelpCircle,
  Lightbulb
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImpactAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: any;
}

export function ImpactAnalysisModal({ isOpen, onClose, analysis }: ImpactAnalysisModalProps) {
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
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-5xl max-h-[90vh] bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-purple-600/10 to-blue-600/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-600 rounded-xl">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight">Machine Learning Interpreter</h2>
                  <p className="text-xs text-white/40 font-medium italic">Translating complex model behavior into plain English.</p>
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
              {/* Summary Section */}
              <div className="bg-purple-600/10 border border-purple-500/20 p-8 rounded-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                  <Zap className="w-48 h-48 text-white" />
                </div>
                <div className="relative z-10 max-w-3xl">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-purple-400 mb-4 flex items-center gap-2">
                    <Info className="w-4 h-4" /> The Bottom Line
                  </h3>
                  <p className="text-2xl font-black text-white leading-tight">
                    {analysis.summary}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* What Changed in Data */}
                <div className="space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
                    <Search className="w-4 h-4 text-blue-400" /> 1. The Cause (What changed in data)
                  </h3>
                  <div className="space-y-3">
                    {analysis.what_changed_in_data?.map((item: any, i: number) => (
                      <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-6 hover:bg-white/[0.07] transition-all">
                        <div className="flex justify-between items-start mb-2">
                           <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">{item.aspect}</span>
                           <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                             item.magnitude === 'large' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                           }`}>
                             {item.magnitude} change
                           </span>
                        </div>
                        <p className="text-sm font-bold text-white">{item.change}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* What Changed in Model */}
                <div className="space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-purple-400" /> 2. The Effect (Model Performance)
                  </h3>
                  <div className="space-y-3">
                    {analysis.what_changed_in_model?.map((item: any, i: number) => (
                      <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-6 hover:bg-white/[0.07] transition-all space-y-3">
                        <div className="flex justify-between items-center">
                           <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">{item.metric}</span>
                           <div className={`flex items-center gap-1 text-xs font-black ${item.change.includes('dropped') || item.change.includes('down') ? 'text-red-400' : 'text-green-400'}`}>
                             {item.change.includes('dropped') || item.change.includes('down') ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                             {item.change}
                           </div>
                        </div>
                        <p className="text-xs text-white/60 leading-relaxed font-medium">
                          {item.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Causal Explanation & Analogy */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-[#111] border border-white/10 rounded-3xl p-8 space-y-6">
                   <h3 className="text-xs font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
                     <Zap className="w-4 h-4 text-yellow-400" /> Causal Explanation
                   </h3>
                   <p className="text-sm text-white/80 leading-relaxed italic border-l-2 border-yellow-500/30 pl-6">
                     {analysis.causal_explanation}
                   </p>
                </div>

                <div className="bg-blue-600/5 border border-blue-500/20 rounded-3xl p-8 space-y-6">
                   <h3 className="text-xs font-black uppercase tracking-widest text-blue-400 flex items-center gap-2">
                     <Lightbulb className="w-4 h-4" /> Real-World Analogy
                   </h3>
                   <p className="text-sm text-white/80 leading-relaxed font-medium">
                     {analysis.real_world_analogy}
                   </p>
                </div>
              </div>

              {/* Student Corner */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-emerald-600/5 border border-emerald-500/20 rounded-2xl p-6 space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5" /> Key Learning Point
                    </h4>
                    <p className="text-xs text-white/80 leading-relaxed font-bold">{analysis.student_insight}</p>
                 </div>
                 <div className="bg-red-600/5 border border-red-500/20 rounded-2xl p-6 space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-red-400 flex items-center gap-2">
                      <HelpCircle className="w-3.5 h-3.5" /> Misconception to Avoid
                    </h4>
                    <p className="text-xs text-white/80 leading-relaxed font-bold italic">"{analysis.misconception_to_avoid}"</p>
                 </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-4 border-t border-white/5 bg-white/[0.02] flex justify-end">
              <button
                onClick={onClose}
                className="px-8 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-black text-white transition-all active:scale-95 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Understood
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
