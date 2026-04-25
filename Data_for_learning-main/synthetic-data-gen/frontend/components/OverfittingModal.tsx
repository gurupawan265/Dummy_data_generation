'use client';

import React from 'react';
import { 
  X, 
  LineChart as LineChartIcon,
  Brain, 
  Activity, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowRight,
  TrendingDown,
  Zap,
  BookOpen,
  Info,
  Layers,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area
} from 'recharts';

interface OverfittingModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
}

export function OverfittingModal({ isOpen, onClose, data }: OverfittingModalProps) {
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
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-purple-600/10 to-indigo-600/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-600">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight">{data.experiment}</h2>
                  <p className="text-xs text-white/40 font-medium italic">Simulating the battle between model complexity and data volume.</p>
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
              {/* Setups Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {data.setups.map((setup: any, i: number) => (
                  <div key={i} className={`bg-[#111] border rounded-2xl p-6 transition-all hover:scale-[1.02] ${
                    setup.status === 'overfitting' ? 'border-red-500/20 bg-red-500/5' : 
                    setup.status === 'good generalization' ? 'border-green-500/20 bg-green-500/5' : 
                    'border-white/10'
                  }`}>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-sm font-black text-white leading-tight pr-4">{setup.name}</h3>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                        setup.status === 'overfitting' ? 'bg-red-500/20 text-red-400' : 
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {setup.status}
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                          <span className="text-[8px] text-white/30 uppercase block mb-1">Dataset Size</span>
                          <div className="flex items-center gap-1.5">
                            <Database className="w-3 h-3 text-purple-400" />
                            <span className="text-xs font-bold text-white">{setup.dataset_size}</span>
                          </div>
                        </div>
                        <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                          <span className="text-[8px] text-white/30 uppercase block mb-1">Complexity</span>
                          <div className="flex items-center gap-1.5">
                            <Layers className="w-3 h-3 text-indigo-400" />
                            <span className="text-xs font-bold text-white uppercase">{setup.model_complexity}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                         <div className="flex justify-between text-[10px]">
                           <span className="text-white/40">Train Accuracy</span>
                           <span className="font-bold text-white">{Math.round(setup.train_accuracy * 100)}%</span>
                         </div>
                         <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                           <div className="h-full bg-blue-500" style={{ width: `${setup.train_accuracy * 100}%` }} />
                         </div>
                         <div className="flex justify-between text-[10px]">
                           <span className="text-white/40">Test Accuracy</span>
                           <span className={`font-bold ${setup.gap > 0.1 ? 'text-red-400' : 'text-green-400'}`}>
                             {Math.round(setup.test_accuracy * 100)}%
                           </span>
                         </div>
                         <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                           <div className={`h-full ${setup.gap > 0.1 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${setup.test_accuracy * 100}%` }} />
                         </div>
                      </div>

                      {setup.gap > 0.1 && (
                        <div className="pt-2 flex items-center gap-2 text-[10px] text-red-400 font-bold">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Gap: {Math.round(setup.gap * 100)}% (Warning)</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Visualizing the Tradeoff */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 min-h-[400px]">
                  <h3 className="text-xs font-black uppercase tracking-widest text-white/30 mb-6 flex items-center gap-2">
                    <LineChartIcon className="w-4 h-4 text-purple-400" /> Complexity vs. Generalization Curve
                  </h3>
                  <p className="text-[10px] text-white/40 mb-6 -mt-4">Visualizing how increasing Decision Tree depth affects Train vs Test scores for Setup 1 (Small Data).</p>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data.setups[0].curve}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                        <XAxis dataKey="depth" stroke="#666" fontSize={10} label={{ value: 'Tree Depth', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#666' }} />
                        <YAxis stroke="#666" fontSize={10} domain={[0.5, 1.0]} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                          itemStyle={{ fontSize: '10px' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '10px' }} />
                        <Line type="monotone" dataKey="train" name="Train Accuracy" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="test" name="Test Accuracy" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
                    <p className="text-[10px] text-red-400 leading-relaxed font-medium">
                      Notice the "Yawning Gap": As depth increases, Train Acc hits 100% while Test Acc drops or plateaus. This is the hallmark of overfitting.
                    </p>
                  </div>
                </div>

                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 min-h-[400px]">
                  <h3 className="text-xs font-black uppercase tracking-widest text-white/30 mb-6 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" /> Bias-Variance Tradeoff Explained
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                      <h4 className="text-xs font-black text-white uppercase tracking-widest mb-2 flex items-center gap-2">
                        <ArrowRight className="w-3 h-3 text-purple-400" /> The Overfitting Signal
                      </h4>
                      <p className="text-xs text-white/60 leading-relaxed italic">
                        {data.critical_observation.overfitting_signal}
                      </p>
                    </div>

                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                      <h4 className="text-xs font-black text-white uppercase tracking-widest mb-2 flex items-center gap-2">
                        <TrendingDown className="w-3 h-3 text-blue-400" /> Complexity Control
                      </h4>
                      <p className="text-xs text-white/60 leading-relaxed">
                        {data.critical_observation.bias_variance_tradeoff}
                      </p>
                    </div>

                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl">
                      <h4 className="text-xs font-black text-green-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <ShieldCheck className="w-3 h-3" /> The Sweet Spot
                      </h4>
                      <p className="text-xs text-white/80 leading-relaxed font-bold">
                        {data.critical_observation.sweet_spot}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lessons & Fixes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-blue-600/5 border border-blue-500/20 rounded-2xl p-8 space-y-6">
                  <h4 className="text-sm font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> Core Lessons
                  </h4>
                  <div className="space-y-4">
                    {data.lessons.map((lesson: string, i: number) => (
                      <div key={i} className="flex gap-4 group">
                        <div className="w-6 h-6 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 group-hover:scale-110 transition-transform">{i+1}</div>
                        <p className="text-xs text-white/70 leading-relaxed font-medium">{lesson}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-emerald-600/5 border border-emerald-500/20 rounded-2xl p-8 space-y-6">
                  <h4 className="text-sm font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                    <Zap className="w-4 h-4" /> How to Fix Overfitting
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {data.how_to_fix_overfitting.map((fix: string, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-xl">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                        <span className="text-xs font-bold text-white uppercase tracking-tight">{fix}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-white/30 italic">
                    Pro-tip: Regularization (like min_samples_leaf or max_depth) is your primary weapon when you can't get more data.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-4 border-t border-white/5 bg-white/[0.02] flex justify-end">
              <button
                onClick={onClose}
                className="px-8 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-black text-white transition-all active:scale-95"
              >
                Close Experiment
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
