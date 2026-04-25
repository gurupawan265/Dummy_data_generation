'use client';

import React from 'react';
import { 
  X, 
  BarChart2, 
  Activity, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowRight,
  TrendingDown,
  Zap,
  BookOpen
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
  BarChart,
  Bar,
  Legend
} from 'recharts';

interface SimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'noise' | 'missing' | 'imbalance';
  data: any;
}

export function SimulationModal({ isOpen, onClose, type, data }: SimulationModalProps) {
  if (!data) return null;

  const isNoise = type === 'noise';

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
            <div className={`px-8 py-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r ${isNoise ? 'from-orange-600/10 to-red-600/10' : 'from-blue-600/10 to-indigo-600/10'}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${isNoise ? 'bg-orange-600' : 'bg-blue-600'}`}>
                  {isNoise ? <Activity className="w-5 h-5 text-white" /> : <ShieldCheck className="w-5 h-5 text-white" />}
                </div>
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight">{data.experiment}</h2>
                  <p className="text-xs text-white/40 font-medium">{data.hypothesis}</p>
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
              {/* Visualization Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-2xl p-6 min-h-[400px]">
                  <h3 className="text-xs font-black uppercase tracking-widest text-white/30 mb-6 flex items-center gap-2">
                    <BarChart2 className="w-4 h-4" /> Performance Degradation Curve
                  </h3>
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      {isNoise ? (
                        <LineChart data={data.results}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                          <XAxis dataKey="noise_level" stroke="#666" fontSize={12} />
                          <YAxis stroke="#666" fontSize={12} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                            itemStyle={{ fontSize: '12px' }}
                          />
                          <Line type="monotone" dataKey="accuracy" stroke="#f97316" strokeWidth={3} dot={{ r: 6, fill: '#f97316' }} />
                        </LineChart>
                      ) : type === 'missing' ? (
                        <BarChart data={data.results}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                          <XAxis dataKey="missing_percent" stroke="#666" fontSize={12} />
                          <YAxis stroke="#666" fontSize={12} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                          />
                          <Legend />
                          <Bar dataKey="without_imputation.accuracy" name="No Imputation" fill="#ef4444" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="with_mean_imputation.accuracy" name="With Mean Imputation" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      ) : (
                        <LineChart data={data.results}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                          <XAxis dataKey="ratio" stroke="#666" fontSize={12} />
                          <YAxis stroke="#666" fontSize={12} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                          />
                          <Legend />
                          <Line type="monotone" dataKey="accuracy" stroke="#3b82f6" strokeWidth={3} />
                          <Line type="monotone" dataKey="f1_score" stroke="#ef4444" strokeWidth={3} strokeDasharray="5 5" />
                        </LineChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Insight Card */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center gap-2 text-orange-400">
                      <Zap className="w-4 h-4" />
                      <span className="text-xs font-black uppercase tracking-widest">Expert Analysis</span>
                    </div>
                    {isNoise ? (
                      <div className="space-y-4">
                        <div>
                          <span className="text-[10px] text-white/30 uppercase block">Degradation Rate</span>
                          <p className="text-sm font-bold text-white">{data.trend_analysis?.degradation_rate}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-white/30 uppercase block">Breaking Threshold</span>
                          <p className="text-sm font-bold text-red-400">{data.trend_analysis?.threshold}</p>
                        </div>
                      </div>
                    ) : type === 'missing' ? (
                      <div className="space-y-4">
                        <p className="text-sm font-bold text-white leading-relaxed">
                          {data.comparison}
                        </p>
                        <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-xl">
                          <span className="text-[10px] text-green-400 font-black uppercase block mb-1">Key Observation</span>
                          <p className="text-xs text-white/70 italic">Imputation recovers significant signal even at 30% missingness.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
                          <span className="text-[10px] text-red-400 font-black uppercase block mb-1">The Accuracy Trap</span>
                          <p className="text-xs text-white/80 leading-relaxed font-bold">
                            Naive Accuracy: {data.critical_observation?.accuracy_of_naive}
                          </p>
                          <p className="text-[10px] text-white/50 mt-1 italic">{data.critical_observation?.why_accuracy_fails}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] text-white/30 uppercase block">Expert Tip</span>
                          <p className="text-xs text-blue-400 font-black">{data.metric_recommendation}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Lessons */}
                  <div className="bg-blue-600/5 border border-blue-500/20 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center gap-2 text-blue-400">
                      <BookOpen className="w-4 h-4" />
                      <span className="text-xs font-black uppercase tracking-widest">Learning Path</span>
                    </div>
                    <div className="space-y-3">
                      {Array.isArray(data.learning_insight) ? data.learning_insight.map((insight: string, i: number) => (
                        <div key={i} className="flex gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                          <p className="text-xs text-white/60 leading-relaxed">{insight}</p>
                        </div>
                      )) : (
                        <p className="text-xs text-white/60 leading-relaxed">{data.learning_insight}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Section */}
              <div className="bg-[#111] border border-white/5 rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Activity className="w-32 h-32 text-white" />
                </div>
                <div className="relative z-10 max-w-3xl">
                  <h4 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-red-500" />
                    Final Narrative
                  </h4>
                  <p className="text-white/70 leading-relaxed italic">
                    {isNoise ? 
                      "Notice how accuracy sharply drops after the threshold? This simulation proves that even robust models have a breaking point where noise overrides signal. For students, this emphasizes why data cleaning isn't just 'good practice'—it's foundational for model viability." :
                      data.preprocessing_lesson
                    }
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
                End Simulation
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
