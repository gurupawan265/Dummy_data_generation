'use client';

import React from 'react';
import { 
  X, 
  BarChart2, 
  Brain, 
  Activity, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowRight,
  TrendingDown,
  Zap,
  BookOpen,
  Link2,
  Minimize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  Cell
} from 'recharts';

interface CorrelationImpactModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
}

export function CorrelationImpactModal({ isOpen, onClose, data }: CorrelationImpactModalProps) {
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
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-6xl max-h-[90vh] bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-blue-600/10 to-emerald-600/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-600">
                  <Link2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight">{data.experiment}</h2>
                  <p className="text-xs text-white/40 font-medium">Analyzing how redundant feature relationships confuse model interpretation.</p>
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
              {/* Top Metrics Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
                  <h3 className="text-xs font-black uppercase tracking-widest text-blue-400 mb-6">Correlated Dataset</h3>
                  <div className="flex items-end gap-6">
                    <div>
                      <span className="text-[10px] text-white/30 uppercase block">Accuracy</span>
                      <p className="text-3xl font-black text-white">{Math.round(data.results.correlated_dataset.accuracy * 100)}%</p>
                    </div>
                    <div className="h-10 w-[1px] bg-white/10" />
                    <div>
                      <span className="text-[10px] text-white/30 uppercase block">F1 Score</span>
                      <p className="text-3xl font-black text-white">{data.results.correlated_dataset.f1_score.toFixed(2)}</p>
                    </div>
                    <div className="flex-1 text-right">
                       <span className="px-2 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-[10px] font-bold">Redundant</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
                  <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-6">Independent Dataset</h3>
                  <div className="flex items-end gap-6">
                    <div>
                      <span className="text-[10px] text-white/30 uppercase block">Accuracy</span>
                      <p className="text-3xl font-black text-white">{Math.round(data.results.independent_dataset.accuracy * 100)}%</p>
                    </div>
                    <div className="h-10 w-[1px] bg-white/10" />
                    <div>
                      <span className="text-[10px] text-white/30 uppercase block">F1 Score</span>
                      <p className="text-3xl font-black text-white">{data.results.independent_dataset.f1_score.toFixed(2)}</p>
                    </div>
                    <div className="flex-1 text-right">
                       <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-[10px] font-bold">Optimal</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Importance Comparison */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8">
                <h3 className="text-sm font-black uppercase tracking-widest text-white/30 mb-8 flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-purple-400" /> Feature Importance Shift
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                   <div className="space-y-4">
                      <h4 className="text-xs font-bold text-blue-400 flex items-center gap-2">
                        <Minimize2 className="w-4 h-4" /> Diluted Importance (Correlated)
                      </h4>
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={data.results.correlated_dataset.feature_importance} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#222" horizontal={false} />
                            <XAxis type="number" hide />
                            <YAxis dataKey="feature" type="category" stroke="#666" fontSize={10} width={80} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                              itemStyle={{ fontSize: '10px' }}
                            />
                            <Bar dataKey="importance" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <p className="text-[11px] text-white/50 italic leading-relaxed">
                        {data.results.correlated_dataset.interpretation}
                      </p>
                   </div>

                   <div className="space-y-4">
                      <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" /> Clear Signal (Independent)
                      </h4>
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={data.results.independent_dataset.feature_importance} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#222" horizontal={false} />
                            <XAxis type="number" hide />
                            <YAxis dataKey="feature" type="category" stroke="#666" fontSize={10} width={80} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                              itemStyle={{ fontSize: '10px' }}
                            />
                            <Bar dataKey="importance" fill="#10b981" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <p className="text-[11px] text-white/50 italic leading-relaxed">
                        {data.results.independent_dataset.interpretation}
                      </p>
                   </div>
                </div>
              </div>

              {/* Key Findings */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
                     <Activity className="w-3 h-3 text-purple-400" /> Accuracy Trap
                   </h4>
                   <p className="text-xs text-white/80 font-medium leading-relaxed">{data.key_finding.accuracy_difference}</p>
                 </div>
                 <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
                     <TrendingDown className="w-3 h-3 text-red-400" /> Interpretability Cost
                   </h4>
                   <p className="text-xs text-white/80 font-medium leading-relaxed">{data.key_finding.feature_importance_difference}</p>
                 </div>
                 <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
                     <Zap className="w-3 h-3 text-yellow-400" /> Redundancy Cost
                   </h4>
                   <p className="text-xs text-white/80 font-medium leading-relaxed">{data.key_finding.redundancy_cost}</p>
                 </div>
              </div>

              {/* Learning Insights */}
              <div className="bg-blue-600/5 border border-blue-500/20 rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                  <Brain className="w-48 h-48 text-white" />
                </div>
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                   <div className="space-y-6">
                      <h4 className="text-sm font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                        <BookOpen className="w-4 h-4" /> Strategic Advice
                      </h4>
                      <div className="space-y-4">
                        {data.learning_insight.map((insight: string, i: number) => (
                          <div key={i} className="flex gap-4 items-center">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                            <p className="text-xs text-white/70 font-medium">{insight}</p>
                          </div>
                        ))}
                      </div>
                   </div>
                   <div className="flex flex-col justify-center items-center text-center p-6 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                      <ShieldCheck className="w-12 h-12 text-blue-400 mb-4" />
                      <h5 className="text-lg font-black text-white mb-2">Final Recommendation</h5>
                      <p className="text-sm text-blue-200 font-bold uppercase tracking-tight">{data.recommendation}</p>
                   </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-4 border-t border-white/5 bg-white/[0.02] flex justify-end">
              <button
                onClick={onClose}
                className="px-8 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-black text-white transition-all active:scale-95"
              >
                Acknowledge Insight
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
