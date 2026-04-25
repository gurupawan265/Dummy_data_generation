'use client';

import React from 'react';
import { 
  X, 
  GraduationCap, 
  Lightbulb, 
  BookOpen, 
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Info,
  CheckCircle2,
  AlertTriangle,
  Brain,
  Zap,
  ChevronRight,
  Target,
  Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LearningAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
}

export function LearningAssistantModal({ isOpen, onClose, data }: LearningAssistantModalProps) {
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
            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="relative w-full max-w-6xl max-h-[92vh] bg-[#050505] border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-emerald-600/10 via-blue-600/10 to-purple-600/10">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/20 rotate-3">
                  <GraduationCap className="w-8 h-8 text-white -rotate-3" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                    AI Learning Assistant
                    <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full font-bold uppercase tracking-widest">Intuition Engine</span>
                  </h2>
                  <p className="text-sm text-white/40 font-medium">Deep structural understanding of your machine learning experiments.</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-3 hover:bg-white/10 rounded-full transition-all text-white/40 hover:text-white hover:rotate-90"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-12">
              {/* Summary Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                      <Zap className="w-4 h-4" /> Executive Summary
                    </h3>
                    <p className="text-3xl font-black text-white leading-tight tracking-tight">
                      {data.summary.one_liner}
                    </p>
                 </div>
                 <div className="bg-white/5 border border-white/10 p-6 rounded-3xl flex flex-col justify-center items-center text-center space-y-3">
                    <div className="p-3 bg-white/10 rounded-2xl">
                       <Lightbulb className="w-6 h-6 text-yellow-400" />
                    </div>
                    <p className="text-sm text-white/70 italic leading-relaxed">
                       "{data.summary.visual_metaphor}"
                    </p>
                 </div>
              </div>

              {/* Levels of Understanding */}
              <div className="space-y-8">
                 {/* Level 1 */}
                 <div className="bg-[#111] border border-white/10 rounded-[2rem] p-8 space-y-6">
                    <div className="flex items-center justify-between">
                       <h3 className="text-xl font-bold text-white flex items-center gap-3">
                          <span className="w-8 h-8 bg-emerald-600/20 text-emerald-400 rounded-lg flex items-center justify-center text-sm font-black italic">01</span>
                          {data.level_1_key_findings.title}
                       </h3>
                       <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Learning Stage: Beginner</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       {data.level_1_key_findings.points.map((pt: string, i: number) => (
                          <div key={i} className="bg-white/[0.02] p-5 rounded-2xl border border-white/5 flex gap-4 items-start group hover:border-emerald-500/20 transition-all">
                             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0 group-hover:scale-150 transition-transform" />
                             <p className="text-sm text-white/80 leading-relaxed font-medium">{pt}</p>
                          </div>
                       ))}
                    </div>
                 </div>

                 {/* Level 2 */}
                 <div className="bg-[#111] border border-white/10 rounded-[2rem] p-8 space-y-6">
                    <div className="flex items-center justify-between">
                       <h3 className="text-xl font-bold text-white flex items-center gap-3">
                          <span className="w-8 h-8 bg-blue-600/20 text-blue-400 rounded-lg flex items-center justify-center text-sm font-black italic">02</span>
                          {data.level_2_why_it_happened.title}
                       </h3>
                       <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Learning Stage: Intermediate</span>
                    </div>
                    <div className="space-y-4">
                       {data.level_2_why_it_happened.sections.map((sec: any, i: number) => (
                          <div key={i} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center bg-white/[0.02] p-6 rounded-3xl border border-white/5">
                             <div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/20 block mb-2">The Catalyst</span>
                                <p className="text-sm text-white/90 font-bold">{sec.aspect}</p>
                             </div>
                             <div className="flex items-center gap-4">
                                <ArrowRight className="w-5 h-5 text-blue-500 hidden lg:block" />
                                <div>
                                   <span className="text-[9px] font-black uppercase tracking-widest text-white/20 block mb-2">The Impact</span>
                                   <p className="text-sm text-white/90 font-bold">{sec.impact}</p>
                                </div>
                             </div>
                             <div className="bg-blue-600/10 p-4 rounded-2xl border border-blue-500/20">
                                <span className="text-[9px] font-black uppercase tracking-widest text-blue-400 block mb-2">Causal Chain</span>
                                <p className="text-xs text-blue-200/80 leading-relaxed font-mono">{sec.causal_chain}</p>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>

                 {/* Level 3 */}
                 <div className="bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-white/10 rounded-[2rem] p-10 space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.02] -rotate-12">
                       <Brain className="w-64 h-64 text-white" />
                    </div>
                    <div className="relative z-10 space-y-8">
                       <div className="flex items-center justify-between">
                          <h3 className="text-xl font-bold text-white flex items-center gap-3">
                             <span className="w-8 h-8 bg-purple-600/20 text-purple-400 rounded-lg flex items-center justify-center text-sm font-black italic">03</span>
                             {data.level_3_deep_understanding.title}
                          </h3>
                          <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Learning Stage: Advanced</span>
                       </div>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          <div className="space-y-4">
                             <div>
                                <h4 className="text-sm font-black text-white flex items-center gap-2 mb-2">
                                   <BookOpen className="w-4 h-4 text-purple-400" /> The Core Concept
                                </h4>
                                <p className="text-sm text-white/70 leading-relaxed">{data.level_3_deep_understanding.concept}</p>
                             </div>
                             <div>
                                <h4 className="text-sm font-black text-white flex items-center gap-2 mb-2">
                                   <Info className="w-4 h-4 text-blue-400" /> Mathematical Intuition
                                </h4>
                                <p className="text-sm text-white/70 leading-relaxed italic">{data.level_3_deep_understanding.mathematical_intuition}</p>
                             </div>
                          </div>
                          <div className="space-y-4">
                             <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">When This Matters</h4>
                                <p className="text-xs text-white/60 leading-relaxed">{data.level_3_deep_understanding.when_this_matters}</p>
                             </div>
                             <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Systemic Connections</h4>
                                <p className="text-xs text-white/60 leading-relaxed">{data.level_3_deep_understanding.connections}</p>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Metric Breakdown */}
              <div className="space-y-8">
                 <h3 className="text-xs font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-400" /> Structural Metric Breakdown
                 </h3>
                 <div className="grid grid-cols-1 gap-4">
                    {data.metric_breakdown.map((m: any, i: number) => (
                       <div key={i} className="bg-[#111] border border-white/10 rounded-3xl p-6 grid grid-cols-1 lg:grid-cols-4 gap-8 items-center group hover:border-emerald-500/20 transition-all">
                          <div className="space-y-1">
                             <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">{m.metric}</span>
                             <div className="flex items-end gap-2">
                                <span className="text-2xl font-black text-white">{m.value_b}</span>
                                <span className={`text-xs font-bold mb-1 ${m.delta.includes('-') ? 'text-red-400' : 'text-green-400'}`}>
                                   ({m.delta})
                                </span>
                             </div>
                             <span className="text-[10px] text-white/30 font-medium">Baseline: {m.value_a}</span>
                          </div>
                          <div className="lg:col-span-2">
                             <p className="text-sm text-white/80 leading-relaxed font-medium">{m.explanation}</p>
                          </div>
                          <div className={`p-4 rounded-2xl text-center flex flex-col justify-center gap-1 ${
                             m.interpretation.toLowerCase().includes('good') ? 'bg-green-500/5 text-green-400 border border-green-500/20' : 'bg-red-500/5 text-red-400 border border-red-500/20'
                          }`}>
                             <span className="text-[9px] font-black uppercase tracking-widest opacity-50">Interpretation</span>
                             <span className="text-xs font-bold leading-tight">{m.interpretation}</span>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              {/* Misconceptions & Next Steps */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-red-400 flex items-center gap-2">
                       <AlertTriangle className="w-4 h-4" /> Common Misconceptions
                    </h3>
                    <div className="space-y-4">
                       {data.misconceptions.map((mc: any, i: number) => (
                          <div key={i} className="bg-red-500/5 border border-red-500/20 p-6 rounded-3xl space-y-4">
                             <div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-red-400 block mb-1">The Wrong Idea</span>
                                <p className="text-sm text-white/90 font-bold italic">"{mc.wrong_idea}"</p>
                             </div>
                             <div className="flex gap-4 items-start pt-4 border-t border-red-500/10">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                <div>
                                   <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 block mb-1">Correct Understanding</span>
                                   <p className="text-xs text-white/70 leading-relaxed">{mc.correct_understanding}</p>
                                </div>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-blue-400 flex items-center gap-2">
                       <Trophy className="w-4 h-4" /> Learning Roadmap
                    </h3>
                    <div className="space-y-4">
                       {data.actionable_next_steps.map((step: any, i: number) => (
                          <div key={i} className="bg-blue-600/5 border border-blue-500/20 p-6 rounded-3xl space-y-4 relative group">
                             <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                   <h4 className="text-sm font-black text-white">{step.action}</h4>
                                   <p className="text-xs text-white/50">{step.rationale}</p>
                                </div>
                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest ${
                                   step.difficulty === 'easy' ? 'bg-green-500/10 text-green-400' : step.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400'
                                }`}>
                                   {step.difficulty}
                                </span>
                             </div>
                             <div className="flex items-center justify-between pt-4 border-t border-blue-500/10">
                                <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Recommended Experiment: {step.related_experiment}</span>
                                <ChevronRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>

              {/* Final Insight */}
              <div className="bg-gradient-to-r from-emerald-600 to-blue-600 p-1 rounded-3xl shadow-2xl shadow-emerald-500/20">
                 <div className="bg-[#050505] p-10 rounded-[1.4rem] flex flex-col items-center text-center space-y-4">
                    <Trophy className="w-10 h-10 text-emerald-400 mb-2" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Mastery Insight</h4>
                    <p className="text-2xl font-black text-white tracking-tight italic">
                       "{data.student_insight}"
                    </p>
                 </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-10 py-6 border-t border-white/5 bg-white/[0.02] flex justify-between items-center">
              <div className="flex gap-4">
                 <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 border-2 border-[#050505]" />
                    <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-[#050505]" />
                    <div className="w-8 h-8 rounded-full bg-purple-500 border-2 border-[#050505]" />
                 </div>
                 <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest self-center">Structural Mastery Engine Active</p>
              </div>
              <button
                onClick={onClose}
                className="px-12 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-2xl text-sm font-black text-white transition-all active:scale-95 shadow-xl shadow-emerald-500/20"
              >
                Continue Learning
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
