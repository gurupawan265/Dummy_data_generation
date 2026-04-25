'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSchemaStore } from '@/store/schema';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend, Cell, AreaChart, Area
} from 'recharts';
import { Loader2, Activity, AlertTriangle, Lightbulb, BarChart2, Zap, Brain, ShieldAlert, CheckCircle2, ChevronRight, Info, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export function DatasetPlayground() {
  const { previewData, activeTableId, tables, isLoading, generateSampleRow } = useSchemaStore();
  const [analysis, setAnalysis] = useState<any>(null);
  const [mentorFeedback, setMentorFeedback] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [mentorLoading, setMentorLoading] = useState(false);
  const [rowCount, setRowCount] = useState(50);
  const [showMentor, setShowMentor] = useState(false);
  
  const activeTable = tables.find(t => t.id === activeTableId);
  const data = (previewData as any)?.data?.[activeTable?.name || ''] || [];

  useEffect(() => {
    if (data.length > 0 && activeTable) {
      analyzeData();
    }
  }, [data, activeTable]);

  const analyzeData = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/ai/analyze`, {
        schema_def: activeTable,
        data: data
      });
      setAnalysis(response.data);
    } catch (error) {
      console.error('Analysis failed', error);
    } finally {
      setLoading(false);
    }
  };

  const getMentorFeedback = async () => {
    setMentorLoading(true);
    setShowMentor(true);
    try {
      const response = await axios.post(`${API_URL}/ai/mentor`, {
        schema_def: activeTable,
        data: data
      });
      setMentorFeedback(response.data);
    } catch (error) {
      console.error('Mentor feedback failed', error);
    } finally {
      setMentorLoading(false);
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-white p-12 bg-[#050505]">
        <div className="w-24 h-24 bg-blue-600/10 rounded-3xl flex items-center justify-center mb-8 border border-blue-500/20">
          <Activity className="w-10 h-10 text-blue-500 animate-pulse" />
        </div>
        <h2 className="text-3xl font-black tracking-tighter mb-2">Ready to explore?</h2>
        <p className="text-white/40 max-w-md text-center mb-8">
          The AI Playground needs data to analyze. Generate a sample dataset to see distributions, correlations, and AI-powered data quality insights.
        </p>
        
        <div className="bg-[#111111] border border-white/5 p-6 rounded-2xl w-full max-w-sm mb-8">
          <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-white/30 mb-4">
            <span>Sample Size</span>
            <span className="text-blue-400">{rowCount} rows</span>
          </div>
          <input 
            type="range" 
            min="10" 
            max="200" 
            step="10" 
            value={rowCount} 
            onChange={(e) => setRowCount(parseInt(e.target.value))}
            className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-blue-600 mb-2"
          />
        </div>

        <button 
          onClick={() => generateSampleRow(rowCount)}
          disabled={isLoading}
          className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20 active:scale-95 disabled:opacity-50 flex items-center gap-3"
        >
          {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6" />}
          Generate Sample Dataset
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-12 h-12 mb-4 animate-spin text-blue-500" />
        <p className="text-xl font-bold animate-pulse">AI is analyzing your dataset...</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <button onClick={analyzeData} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold">
          Run Dataset Analysis
        </button>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-8 space-y-8 bg-[#050505] text-white">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tighter flex items-center gap-3">
            <BarChart2 className="w-8 h-8 text-blue-500" />
            Dataset Playground
          </h2>
          <p className="text-white/50 mt-1">AI-powered insights and visualizations for {activeTable?.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => generateSampleRow(data.length)}
            disabled={isLoading}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5" />}
            Refresh Data
          </button>
          <button 
            onClick={analyzeData}
            disabled={loading}
            className="px-4 py-2 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 text-blue-400 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lightbulb className="w-3.5 h-3.5" />}
            Re-Analyze
          </button>
          <button 
            onClick={getMentorFeedback}
            disabled={mentorLoading}
            className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-purple-500/20"
          >
            {mentorLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Brain className="w-3.5 h-3.5" />}
            Expert Review
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showMentor && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-[#111111] border border-purple-500/20 rounded-[2rem] p-8 mb-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Brain className="w-48 h-48 text-purple-400" />
              </div>

              {mentorLoading ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-4">
                  <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
                  <p className="text-sm text-purple-400 font-black uppercase tracking-widest animate-pulse">Senior Scientist is evaluating your data...</p>
                </div>
              ) : mentorFeedback ? (
                <div className="relative z-10 space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-purple-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/40">
                        <ShieldAlert className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black tracking-tight">Expert Mentor Review</h3>
                        <p className="text-white/40 text-sm">Critical assessment of {activeTable?.name} readiness</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Health Score</div>
                      <div className={`text-4xl font-black ${
                        mentorFeedback.overall_health_score > 80 ? 'text-green-400' : 
                        mentorFeedback.overall_health_score > 50 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {mentorFeedback.overall_health_score}%
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Critical Findings */}
                    <div className="lg:col-span-2 space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-white/30 px-2">Critical Findings</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {mentorFeedback.critical_findings?.map((f: any, i: number) => (
                          <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-2xl group hover:border-purple-500/20 transition-all">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-white">{f.issue}</span>
                              <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${
                                f.severity === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'
                              }`}>
                                {f.severity}
                              </span>
                            </div>
                            <p className="text-xs text-white/50 leading-relaxed mb-3">{f.description}</p>
                            <div className="text-[10px] text-green-400 font-bold flex items-center gap-1.5">
                              <CheckCircle2 className="w-3 h-3" /> Fix: {f.fix}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Redundancy */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-white/30 px-2">Redundancy & Overlap</h4>
                      <div className="space-y-3">
                        {mentorFeedback.feature_redundancy?.map((r: any, i: number) => (
                          <div key={i} className="bg-red-500/5 border border-red-500/10 p-4 rounded-2xl">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">
                              <AlertTriangle className="w-3 h-3" /> Redundancy Detected
                            </div>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {r.features.map((f: string) => (
                                <span key={f} className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] font-mono">{f}</span>
                              ))}
                            </div>
                            <p className="text-[10px] text-white/40 leading-relaxed">{r.reason}</p>
                          </div>
                        ))}
                        {(!mentorFeedback.feature_redundancy || mentorFeedback.feature_redundancy.length === 0) && (
                          <div className="py-8 text-center text-white/10 italic text-xs">No significant redundancy detected.</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Mentor Advice */}
                  <div className="bg-purple-600/10 border border-purple-500/20 p-6 rounded-2xl">
                    <h4 className="text-xs font-black uppercase tracking-widest text-purple-400 mb-2">Strategic Advice from Senior Scientist</h4>
                    <p className="text-sm text-white/80 leading-relaxed italic">
                      "{mentorFeedback.mentor_advice}"
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Issues Panel */}
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-orange-400">
            <AlertTriangle className="w-5 h-5" /> Potential Issues
          </h3>
          {analysis.issues?.length > 0 ? (
            <ul className="space-y-3">
              {analysis.issues.map((issue: any, i: number) => (
                <li key={i} className="flex flex-col bg-orange-500/10 border border-orange-500/20 p-3 rounded-lg">
                  <span className="font-bold text-orange-400">{issue.column} - {issue.type}</span>
                  <span className="text-sm text-white/70">{issue.description}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-green-400 text-sm">No significant issues detected by AI.</p>
          )}
        </div>

        {/* Recommendations Panel */}
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-blue-400">
            <Lightbulb className="w-5 h-5" /> AI Recommendations
          </h3>
          {analysis.recommendations?.length > 0 ? (
            <ul className="space-y-3">
              {analysis.recommendations.map((rec: any, i: number) => (
                <li key={i} className="flex flex-col bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg">
                  <span className="font-bold text-blue-400">{rec.column}: {rec.action}</span>
                  <span className="text-sm text-white/70">{rec.reason}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-white/50 text-sm">No specific recommendations.</p>
          )}
        </div>
      </div>

      <h3 className="text-xl font-bold mt-8 border-b border-white/10 pb-2">Visualizations</h3>
      
      {/* Correlation Heatmap & Missing Values */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 overflow-x-auto">
          <h3 className="text-lg font-bold mb-4">Correlation Heatmap</h3>
          {(() => {
            const numCols = analysis.columns?.filter((c:any) => c.type === 'number' || c.type === 'float' || c.type === 'integer').map((c:any) => c.name) || [];
            if (numCols.length < 2) return <p className="text-white/40 text-sm">Not enough numeric columns for correlation.</p>;
            
            const calcCorrelation = (x: number[], y: number[]) => {
              const n = x.length;
              if(n===0) return 0;
              const sum_x = x.reduce((a,b)=>a+b, 0);
              const sum_y = y.reduce((a,b)=>a+b, 0);
              const sum_xy = x.reduce((a,b,i)=>a+(b*y[i]), 0);
              const sum_x2 = x.reduce((a,b)=>a+(b*b), 0);
              const sum_y2 = y.reduce((a,b)=>a+(b*b), 0);
              const num = (n * sum_xy) - (sum_x * sum_y);
              const den = Math.sqrt(((n * sum_x2) - (sum_x * sum_x)) * ((n * sum_y2) - (sum_y * sum_y)));
              if (den === 0) return 0;
              return num / den;
            };

            return (
              <div className="flex flex-col gap-1">
                <div className="flex">
                  <div className="w-24 shrink-0"></div>
                  {numCols.map((c: string) => <div key={c} className="w-16 text-xs truncate rotate-45 origin-left text-white/50">{c}</div>)}
                </div>
                {numCols.map((rowCol: string) => (
                  <div key={rowCol} className="flex items-center gap-1">
                    <div className="w-24 shrink-0 text-xs truncate text-right pr-2 text-white/50">{rowCol}</div>
                    {numCols.map((colCol: string) => {
                      const corr = calcCorrelation(
                        data.map((d:any)=>Number(d[rowCol])||0), 
                        data.map((d:any)=>Number(d[colCol])||0)
                      );
                      const isNegative = corr < 0;
                      const intensity = Math.abs(corr);
                      const color = isNegative 
                        ? `rgba(239, 68, 68, ${intensity})` 
                        : `rgba(59, 130, 246, ${intensity})`;
                      return (
                        <div key={`${rowCol}-${colCol}`} 
                          className="w-12 h-8 rounded shrink-0 flex items-center justify-center text-[10px] font-mono border border-white/5"
                          style={{ backgroundColor: color }}
                          title={`${rowCol} vs ${colCol}: ${corr.toFixed(2)}`}
                        >
                          {corr.toFixed(2)}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        <div className="bg-[#111111] border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4">Missing Value Map</h3>
          <div className="flex flex-col gap-2">
            {analysis.columns?.map((col: any) => {
              const missingPct = col.missing_percentage || 0;
              return (
                <div key={col.name} className="flex items-center gap-4">
                  <div className="w-32 text-xs truncate text-white/70">{col.name}</div>
                  <div className="flex-1 h-4 bg-white/5 rounded-full overflow-hidden flex">
                    <div className="h-full bg-red-500" style={{ width: `${missingPct}%` }}></div>
                    <div className="h-full bg-green-500/20" style={{ width: `${100 - missingPct}%` }}></div>
                  </div>
                  <div className="w-12 text-xs text-right font-mono">{missingPct.toFixed(1)}%</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <h3 className="text-xl font-bold mt-8 border-b border-white/10 pb-2">Column Statistics & Distributions</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {analysis.columns?.map((col: any) => {
          // Calculate distribution for this column from the raw data
          const values = data.map((row: any) => String(row[col.name as keyof typeof row]));
          const counts: Record<string, number> = {};
          values.forEach((v: string) => counts[v] = (counts[v] || 0) + 1);
          const chartData = Object.keys(counts).map(k => ({ name: k.length > 15 ? k.substring(0, 15)+'...' : k, value: counts[k] })).sort((a,b)=>b.value-a.value).slice(0, 10);
          
          return (
            <div key={col.name} className="bg-[#111111] border border-white/10 rounded-2xl p-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-lg">{col.name}</h4>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider font-mono">
                    {col.type} • {col.distribution}
                  </p>
                </div>
                <div className="text-right text-xs">
                  <div className="text-white/40">Unique: <span className="text-white font-bold">{col.unique_count}</span></div>
                  <div className="text-white/40">Missing: <span className="text-red-400 font-bold">{col.missing_percentage}%</span></div>
                </div>
              </div>

              {col.recommended_viz && (
                <div className="mb-4 p-2 bg-blue-500/5 border border-blue-500/10 rounded-lg">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">
                    <Lightbulb className="w-3 h-3" /> AI Recommendation: {col.recommended_viz.chart}
                  </div>
                  <p className="text-[10px] text-white/60 leading-relaxed italic">
                    "{col.recommended_viz.reason}"
                  </p>
                </div>
              )}

              <div className="h-48 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  {(() => {
                    const vizType = col.recommended_viz?.chart?.toLowerCase() || (col.type === 'number' ? 'line' : 'bar');
                    
                    if (vizType === 'area') {
                      return (
                        <AreaChart data={chartData.sort((a,b)=> Number(a.name)-Number(b.name))}>
                          <defs>
                            <linearGradient id={`color-${col.name}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                          <XAxis dataKey="name" stroke="#ffffff30" fontSize={9} tick={{fill: '#ffffff30'}} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#ffffff10', borderRadius: '12px', fontSize: '12px' }}
                            itemStyle={{ color: '#3b82f6' }}
                          />
                          <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill={`url(#color-${col.name})`} />
                        </AreaChart>
                      );
                    }
                    
                    if (vizType === 'line' || vizType === 'histogram' && (col.type === 'number' || col.type === 'float' || col.type === 'integer')) {
                      return (
                        <LineChart data={chartData.sort((a,b)=> Number(a.name)-Number(b.name))}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                          <XAxis dataKey="name" stroke="#ffffff30" fontSize={9} tick={{fill: '#ffffff30'}} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#ffffff10', borderRadius: '12px', fontSize: '12px' }}
                            itemStyle={{ color: '#3b82f6' }}
                          />
                          <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ r: 2, fill: '#3b82f6' }} activeDot={{ r: 4 }} />
                        </LineChart>
                      );
                    }

                    return (
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis dataKey="name" stroke="#ffffff30" fontSize={9} tick={{fill: '#ffffff30'}} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#ffffff10', borderRadius: '12px', fontSize: '12px' }}
                          itemStyle={{ color: '#3b82f6' }}
                        />
                        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    );
                  })()}
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
