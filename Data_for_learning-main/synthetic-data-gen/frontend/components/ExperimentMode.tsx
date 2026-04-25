'use client';

import React, { useState, useEffect } from 'react';
import { useSchemaStore } from '@/store/schema';
import { 
  Brain, 
  Play, 
  Target, 
  BarChart, 
  Activity, 
  CheckCircle2, 
  AlertCircle,
  Cpu,
  FlaskConical,
  RefreshCw,
  Info,
  Settings2,
  Zap,
  History,
  Fingerprint,
  Link2,
  ShieldCheck,
  TrendingDown,
  Trophy,
  Binary,
  GraduationCap
} from 'lucide-react';
import { ImpactAnalysisModal } from './ImpactAnalysisModal';
import { TuningExpertModal } from './TuningExpertModal';
import { FeatureAnalysisModal } from './FeatureAnalysisModal';
import { SimulationModal } from './SimulationModal';
import { OverfittingModal } from './OverfittingModal';
import { CorrelationImpactModal } from './CorrelationImpactModal';
import { CoachingModal } from './CoachingModal';
import { CausalityModal } from './CausalityModal';
import { LearningAssistantModal } from './LearningAssistantModal';
import axios from 'axios';
import { 
  BarChart as ReBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ReTooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export function ExperimentMode() {
  const { previewData, activeTableId, tables } = useSchemaStore();
  const [recommendation, setRecommendation] = useState<any>(null);
  const [targetColumn, setTargetColumn] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [training, setTraining] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [explanation, setExplanation] = useState<any>(null);
  const [explaining, setExplaining] = useState(false);
  const [isSimulatingImbalance, setIsSimulatingImbalance] = useState(false);
  const [imbalanceRatio, setImbalanceRatio] = useState(0.1);
  const [imbalanceStrategy, setImbalanceStrategy] = useState<any>(null);
  const [comparisonResults, setComparisonResults] = useState<any>(null);
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState('');
  
  // New State for Experts
  const [baselineResults, setBaselineResults] = useState<any>(null);
  const [baselineData, setBaselineData] = useState<any>(null);
  const [impactAnalysis, setImpactAnalysis] = useState<any>(null);
  const [isImpactModalOpen, setIsImpactModalOpen] = useState(false);
  const [analyzingImpact, setAnalyzingImpact] = useState(false);
  
  const [tuningSuggestions, setTuningSuggestions] = useState<any>(null);
  const [isTuningModalOpen, setIsTuningModalOpen] = useState(false);
  const [analyzingTuning, setAnalyzingTuning] = useState(false);
  
  const [featureAnalysis, setFeatureAnalysis] = useState<any>(null);
  const [isFeatureModalOpen, setIsFeatureModalOpen] = useState(false);
  const [analyzingFeatures, setAnalyzingFeatures] = useState(false);

  const [simType, setSimType] = useState<'noise' | 'missing' | 'imbalance'>('noise');
  const [simData, setSimData] = useState<any>(null);
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);
  const [runningSim, setRunningSim] = useState(false);

  const [overfittingData, setOverfittingData] = useState<any>(null);
  const [isOverfittingModalOpen, setIsOverfittingModalOpen] = useState(false);
  const [runningOverfitting, setRunningOverfitting] = useState(false);

  const [correlationData, setCorrelationData] = useState<any>(null);
  const [isCorrelationModalOpen, setIsCorrelationModalOpen] = useState(false);
  const [runningCorrelation, setRunningCorrelation] = useState(false);

  const [coachingData, setCoachingData] = useState<any>(null);
  const [isCoachingModalOpen, setIsCoachingModalOpen] = useState(false);
  const [loadingCoach, setLoadingCoach] = useState(false);

  const [causalityData, setCausalityData] = useState<any>(null);
  const [isCausalityModalOpen, setIsCausalityModalOpen] = useState(false);
  const [loadingCausality, setLoadingCausality] = useState(false);

  const [learningData, setLearningData] = useState<any>(null);
  const [isLearningModalOpen, setIsLearningModalOpen] = useState(false);
  const [loadingLearning, setLoadingLearning] = useState(false);

  const activeTable = tables.find(t => t.id === activeTableId);
  const data = (previewData as any)?.data?.[activeTable?.name || ''] || [];

  useEffect(() => {
    if (activeTable && data.length > 0) {
      getRecommendations();
    }
  }, [activeTable, data.length]);

  const getRecommendations = async () => {
    try {
      const response = await axios.post(`${API_URL}/ai/experiment/recommend`, {
        schema_def: activeTable
      });
      setRecommendation(response.data);
      if (response.data.target_suggestion) {
        setTargetColumn(response.data.target_suggestion);
      }
      if (response.data.recommended_models?.length > 0) {
        setSelectedModel(response.data.recommended_models[0].type);
      }
    } catch (err) {
      console.error('Failed to get experiment recommendations', err);
    }
  };

  const handleTrain = async () => {
    if (!targetColumn || !selectedModel) return;
    
    setTraining(true);
    setResults(null);
    setError('');
    
    try {
      const response = await axios.post(`${API_URL}/ai/experiment/train`, {
        data: data,
        target_column: targetColumn,
        model_type: selectedModel
      });
      setResults(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Training failed. Ensure your target column has valid data.');
    } finally {
      setTraining(false);
    }
  };

  const handleCompare = async () => {
    if (!targetColumn || !recommendation) return;
    
    setComparing(true);
    setComparisonResults(null);
    setError('');
    
    try {
      const response = await axios.post(`${API_URL}/ai/experiment/compare`, {
        data: data,
        target_column: targetColumn,
        problem_type: recommendation.problem_type.toLowerCase()
      });
      
      const sortedResults = response.data.results.sort((a: any, b: any) => {
        const metricA = a.metrics.accuracy || a.metrics.r2 || 0;
        const metricB = b.metrics.accuracy || b.metrics.r2 || 0;
        return metricB - metricA;
      });

      setComparisonResults({ ...response.data, results: sortedResults });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Comparison failed.');
    } finally {
      setComparing(false);
    }
  };

  useEffect(() => {
    if (results && activeTable) {
      getExplanation();
    }
  }, [results]);

  const getExplanation = async () => {
    setExplaining(true);
    setExplanation(null);
    try {
      const response = await axios.post(`${API_URL}/ai/experiment/explain`, {
        metrics: results.metrics,
        model_info: results.model_info,
        schema_def: activeTable
      });
      setExplanation(response.data);
    } catch (err) {
      console.error('Failed to get explanation', err);
    } finally {
      setExplaining(false);
    }
  };

  const handleSetBaseline = () => {
    if (!results || !data) return;
    setBaselineResults(results);
    setBaselineData([...data]);
  };

  const handleImpactAnalysis = async () => {
    if (!baselineResults || !results) return;
    
    setAnalyzingImpact(true);
    try {
      const response = await axios.post(`${API_URL}/ai/impact-analysis`, {
        dataset_a: baselineData,
        dataset_b: data,
        metrics_a: baselineResults.metrics,
        metrics_b: results.metrics,
        schema_def: activeTable
      });
      setImpactAnalysis(response.data);
      setIsImpactModalOpen(true);
    } catch (err) {
      console.error('Impact analysis failed', err);
    } finally {
      setAnalyzingImpact(false);
    }
  };

  const handleTuningAdvice = async () => {
    if (!results) return;
    
    setAnalyzingTuning(true);
    try {
      const response = await axios.post(`${API_URL}/ai/tuning-expert`, {
        model_type: results.model_info.type,
        current_params: results.model_info.parameters,
        current_metrics: results.metrics
      });
      setTuningSuggestions(response.data);
      setIsTuningModalOpen(true);
    } catch (err) {
      console.error('Tuning expert failed', err);
    } finally {
      setAnalyzingTuning(false);
    }
  };

  const handleFeatureAnalysis = async () => {
    if (!results || !results.model_info.importance) return;
    
    setAnalyzingFeatures(true);
    try {
      const response = await axios.post(`${API_URL}/ai/feature-analysis`, {
        model_type: results.model_info.type,
        schema_def: activeTable,
        importance_scores: results.model_info.importance
      });
      setFeatureAnalysis(response.data);
      setIsFeatureModalOpen(true);
    } catch (err) {
      console.error('Feature analysis failed', err);
    } finally {
      setAnalyzingFeatures(false);
    }
  };

  const handleRunSim = async (type: 'noise' | 'missing' | 'imbalance') => {
    if (!results || !data) return;
    
    setRunningSim(true);
    setSimType(type);
    
    const endpoint = type === 'noise' ? 'stress-test' : 
                     type === 'missing' ? 'missing-data-experiment' : 
                     'imbalance-experiment';

    try {
      const response = await axios.post(`${API_URL}/ai/${endpoint}`, {
        data: data,
        target_column: results.model_info.target,
        model_type: results.model_info.type,
        schema_def: activeTable
      });
      setSimData(response.data);
      setIsSimModalOpen(true);
    } catch (err) {
      console.error(`Simulation ${type} failed`, err);
    } finally {
      setRunningSim(false);
    }
  };

  const handleOverfittingExperiment = async () => {
    setRunningOverfitting(true);
    try {
      const response = await axios.post(`${API_URL}/ai/experiment/overfitting`);
      setOverfittingData(response.data);
      setIsOverfittingModalOpen(true);
    } catch (err) {
      console.error('Overfitting experiment failed', err);
    } finally {
      setRunningOverfitting(false);
    }
  };

  const handleCorrelationExperiment = async () => {
    if (!selectedModel) return;
    setRunningCorrelation(true);
    try {
      const response = await axios.post(`${API_URL}/ai/experiment/correlation`, {
        model_type: selectedModel
      });
      setCorrelationData(response.data);
      setIsCorrelationModalOpen(true);
    } catch (err) {
      console.error('Correlation experiment failed', err);
    } finally {
      setRunningCorrelation(false);
    }
  };

  const handleGetCoaching = async () => {
    if (!results) return;
    setLoadingCoach(true);
    try {
      const response = await axios.post(`${API_URL}/ai/coach`, {
        issues_found: explanation?.dataset_comparison?.key_differences || [],
        metrics: results.metrics,
        problem_type: results.type
      });
      setCoachingData(response.data);
      setIsCoachingModalOpen(true);
    } catch (err) {
      console.error('Coaching failed', err);
    } finally {
      setLoadingCoach(false);
    }
  };

  const handleCausalityAnalysis = async () => {
    if (!baselineResults || !results) return;
    setLoadingCausality(true);
    try {
      // Find what changed (simplified for prompt)
      const diffs = explanation?.dataset_comparison?.key_differences || [];
      const characteristic = diffs.map((d: any) => `${d.aspect} in ${d.column}: ${d.dataset_a} -> ${d.dataset_b}`).join(', ');
      
      const metricsText = Object.entries(explanation?.metric_changes || {}).map(([name, m]: any) => 
        `${name} went from ${m.dataset_a_value} to ${m.dataset_b_value} (${m.delta > 0 ? '+' : ''}${Math.round(m.delta * 100)}%)`
      ).join(', ');

      const response = await axios.post(`${API_URL}/ai/causality`, {
        characteristic: characteristic || "Multiple data property shifts",
        metric_changes: metricsText
      });
      setCausalityData(response.data);
      setIsCausalityModalOpen(true);
    } catch (err) {
      console.error('Causality analysis failed', err);
    } finally {
      setLoadingCausality(false);
    }
  };

  const handleLearningAssistant = async () => {
    if (!results) return;
    setLoadingLearning(true);
    try {
      const response = await axios.post(`${API_URL}/ai/learning-assistant`, {
        experiment_type: results.type,
        results_data: {
          metrics: results.metrics,
          baseline_metrics: baselineResults?.metrics,
          model_info: results.model_info
        },
        student_profile: {
          learning_stage: results.metrics.accuracy > 0.9 ? 'advanced' : 'beginner',
          prior_knowledge: ["Basic Metrics", "Synthetic Data"],
          confusion_points: explanation?.diagnosis?.map((d: any) => d.issue) || []
        }
      });
      setLearningData(response.data);
      setIsLearningModalOpen(true);
    } catch (err) {
      console.error('Learning assistant failed', err);
    } finally {
      setLoadingLearning(false);
    }
  };

  const { suggestImbalanceStrategy, resampleData } = useSchemaStore();

  const handleSimulateImbalance = async () => {
    if (!targetColumn || !data.length) return;
    
    setIsSimulatingImbalance(true);
    setImbalanceStrategy(null);
    
    // Calculate current distribution
    const counts: any = {};
    data.forEach((row: any) => {
      const val = row[targetColumn];
      counts[val] = (counts[val] || 0) + 1;
    });
    const total = data.length;
    const dist: any = {};
    Object.keys(counts).forEach(k => dist[k] = counts[k] / total);

    try {
      const strategy = await suggestImbalanceStrategy(activeTableId, targetColumn, dist, imbalanceRatio);
      setImbalanceStrategy(strategy);
      
      if (strategy && strategy.imbalance_strategy?.resampling_map) {
        await resampleData(activeTableId, targetColumn, strategy.imbalance_strategy.resampling_map);
      }
    } catch (err) {
      console.error('Imbalance simulation failed', err);
    } finally {
      setIsSimulatingImbalance(false);
    }
  };

  if (data.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-white/40 p-12 bg-[#050505]">
        <FlaskConical className="w-16 h-16 mb-6 opacity-20" />
        <h2 className="text-2xl font-bold mb-2 text-white">Experiment Mode Locked</h2>
        <p className="max-w-md text-center">You need to generate a dataset first to run experiments. Head back to the Canvas or Playground to generate data.</p>
      </div>
    );
  }

  const metricData = results ? Object.entries(results.metrics).map(([name, value]) => ({
    name: name.toUpperCase(),
    value: value
  })) : [];

  return (
    <div className="h-full overflow-y-auto p-8 space-y-8 bg-[#050505] text-white">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tighter flex items-center gap-3">
            <FlaskConical className="w-8 h-8 text-purple-500" />
            Experiment Mode
          </h2>
          <p className="text-white/50 mt-1">Train models instantly on your synthetic data to validate your schema.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Setup Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 shadow-2xl shadow-purple-500/5">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
              <Target className="w-5 h-5 text-purple-400" /> Experiment Setup
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-white/30 mb-2">Target Variable</label>
                <select 
                  value={targetColumn}
                  onChange={(e) => setTargetColumn(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-purple-500/50 transition-all"
                >
                  <option value="">Select target...</option>
                  {activeTable?.fields.map(f => (
                    <option key={f.id} value={f.name}>{f.name}</option>
                  ))}
                </select>
                {recommendation?.target_suggestion === targetColumn && (
                  <p className="text-[10px] text-purple-400 mt-2 flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-3 h-3" /> AI Recommended Target
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-white/30 mb-2">Model Type</label>
                <div className="space-y-2">
                  {recommendation?.recommended_models?.map((model: any) => (
                    <button
                      key={model.type}
                      onClick={() => setSelectedModel(model.type)}
                      className={`w-full text-left px-4 py-3 rounded-xl border transition-all flex items-center justify-between group ${
                        selectedModel === model.type 
                          ? 'bg-purple-600/20 border-purple-500 text-purple-100' 
                          : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-sm font-bold">{model.name}</span>
                      {selectedModel === model.type && <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleTrain}
                disabled={training || !targetColumn || !selectedModel}
                className="w-full mt-4 py-4 bg-purple-600 text-white rounded-2xl font-black text-lg hover:bg-purple-500 transition-all shadow-xl shadow-purple-500/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {training ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Play className="w-6 h-6" />}
                Run Experiment
              </button>

              <button
                onClick={handleCompare}
                disabled={comparing || !targetColumn || !recommendation}
                className="w-full mt-2 py-3 bg-white/5 text-purple-400 border border-purple-500/20 rounded-2xl font-bold text-sm hover:bg-white/10 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {comparing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <BarChart className="w-4 h-4" />}
                Compare All Models
              </button>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 mt-4">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                  <p className="text-xs text-red-400 leading-relaxed">{error}</p>
                </div>
              )}

              <div className="pt-4 border-t border-white/5 space-y-3">
                <button
                  onClick={handleSetBaseline}
                  disabled={!results}
                  className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-all disabled:opacity-30"
                >
                  <History className="w-3.5 h-3.5" />
                  {baselineResults ? 'Update Baseline' : 'Set as Baseline'}
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleImpactAnalysis}
                    disabled={analyzingImpact || !baselineResults || !results}
                    className="py-3 bg-purple-600/10 border border-purple-500/20 rounded-xl text-[10px] font-black uppercase text-purple-400 flex items-center justify-center gap-2 hover:bg-purple-600/20 transition-all disabled:opacity-30"
                  >
                    {analyzingImpact ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                    Impact
                  </button>
                  <button
                    onClick={handleTuningAdvice}
                    disabled={analyzingTuning || !results}
                    className="py-3 bg-blue-600/10 border border-blue-500/20 rounded-xl text-[10px] font-black uppercase text-blue-400 flex items-center justify-center gap-2 hover:bg-blue-600/20 transition-all disabled:opacity-30"
                  >
                    {analyzingTuning ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Settings2 className="w-3 h-3" />}
                    Tune
                  </button>
                </div>

                <button
                  onClick={handleFeatureAnalysis}
                  disabled={analyzingFeatures || !results?.model_info?.importance}
                  className="w-full py-3 bg-emerald-600/10 border border-emerald-500/20 rounded-xl text-[10px] font-black uppercase text-emerald-400 flex items-center justify-center gap-2 hover:bg-emerald-600/20 transition-all disabled:opacity-30"
                >
                  {analyzingFeatures ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Fingerprint className="w-3.5 h-3.5" />}
                  Feature Analysis
                </button>
              </div>

              <div className="pt-6 border-t border-white/5 space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-orange-400" /> Stress Test Simulations
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => handleRunSim('noise')}
                    disabled={runningSim || !results}
                    className="w-full py-2.5 bg-orange-600/10 border border-orange-500/20 rounded-xl text-[10px] font-bold text-orange-400 flex items-center justify-center gap-2 hover:bg-orange-600/20 transition-all disabled:opacity-30"
                  >
                    {runningSim && simType === 'noise' ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Activity className="w-3 h-3" />}
                    Noise Resistance Test
                  </button>
                  <button
                    onClick={() => handleRunSim('missing')}
                    disabled={runningSim || !results}
                    className="w-full py-2.5 bg-blue-600/10 border border-blue-500/20 rounded-xl text-[10px] font-bold text-blue-400 flex items-center justify-center gap-2 hover:bg-blue-600/20 transition-all disabled:opacity-30"
                  >
                    {runningSim && simType === 'missing' ? <RefreshCw className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3" />}
                    Missing Data Impact
                  </button>
                    <button
                      onClick={() => handleRunSim('imbalance')}
                      disabled={runningSim || !results || results.model_info.problem_type !== 'classification'}
                      className="w-full py-2.5 bg-indigo-600/10 border border-indigo-500/20 rounded-xl text-[10px] font-bold text-indigo-400 flex items-center justify-center gap-2 hover:bg-indigo-600/20 transition-all disabled:opacity-30"
                    >
                      {runningSim && simType === 'imbalance' ? <RefreshCw className="w-3 h-3 animate-spin" /> : <TrendingDown className="w-3 h-3" />}
                      The Accuracy Trap Test
                    </button>

                    <button
                      onClick={handleOverfittingExperiment}
                      disabled={runningOverfitting}
                      className="w-full py-2.5 mt-2 bg-purple-600/20 border border-purple-500/30 rounded-xl text-[10px] font-black uppercase text-purple-400 flex items-center justify-center gap-2 hover:bg-purple-600/30 transition-all shadow-lg shadow-purple-500/10"
                    >
                      {runningOverfitting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <FlaskConical className="w-3 h-3" />}
                      Bias-Variance Experiment
                    </button>

                    <button
                      onClick={handleCorrelationExperiment}
                      disabled={runningCorrelation || !selectedModel}
                      className="w-full py-2.5 mt-2 bg-blue-600/20 border border-blue-500/30 rounded-xl text-[10px] font-black uppercase text-blue-400 flex items-center justify-center gap-2 hover:bg-blue-600/30 transition-all shadow-lg shadow-blue-500/10"
                    >
                      {runningCorrelation ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Link2 className="w-3 h-3" />}
                      Correlation Impact Test
                    </button>
                  </div>
              </div>
            </div>
          </div>

          {recommendation && (
            <div className="bg-[#111111] border border-white/10 rounded-2xl p-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-purple-400 mb-4 flex items-center gap-2">
                <Brain className="w-4 h-4" /> AI Strategy
              </h3>
              <div className="space-y-4">
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-[10px] text-white/30 uppercase">Problem Type</span>
                  <p className="text-sm font-bold text-white">{recommendation.problem_type}</p>
                </div>
                {recommendation.explanations?.map((exp: any, i: number) => (
                  <div key={i} className="text-xs text-white/60 leading-relaxed bg-white/5 p-3 rounded-xl">
                    <span className="font-bold text-white block mb-1">{exp.model}</span>
                    {exp.text}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Imbalance Simulator */}
          {targetColumn && (
            <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-blue-400 flex items-center gap-2">
                <Activity className="w-4 h-4" /> Imbalance Simulator
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Minority Ratio</label>
                  <span className="text-xs font-black text-blue-400">{Math.round(imbalanceRatio * 100)}%</span>
                </div>
                <input 
                  type="range"
                  min="0.01"
                  max="0.5"
                  step="0.01"
                  value={imbalanceRatio}
                  onChange={(e) => setImbalanceRatio(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                
                <p className="text-[10px] text-white/30 leading-relaxed italic">
                  Stress-test your model by simulating class imbalance. This will resample your data to meet the target ratio.
                </p>

                <button
                  onClick={handleSimulateImbalance}
                  disabled={isSimulatingImbalance || !targetColumn}
                  className="w-full py-3 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all text-blue-400"
                >
                  {isSimulatingImbalance ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FlaskConical className="w-4 h-4" />}
                  {isSimulatingImbalance ? 'Simulating...' : 'Apply Imbalance'}
                </button>

                {imbalanceStrategy && (
                  <div className="p-4 bg-blue-600/5 border border-blue-500/10 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-blue-400 uppercase">AI Assessment</span>
                      {imbalanceStrategy.warnings?.length > 0 && (
                        <div className="px-1.5 py-0.5 bg-red-500/20 border border-red-500/30 rounded text-[8px] text-red-400 font-bold uppercase">Extreme</div>
                      )}
                    </div>
                    <p className="text-[11px] text-white/70 leading-relaxed">{imbalanceStrategy.imbalance_report}</p>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(imbalanceStrategy.expected_metric_impact).map(([m, desc]: any) => (
                        <div key={m} className="p-2 bg-black/40 rounded-lg border border-white/5">
                          <span className="text-[8px] text-white/30 uppercase block">{m}</span>
                          <span className="text-[9px] text-white/60 leading-tight block">{desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-6">
          {!results && !training && (
            <div className="h-full min-h-[400px] bg-[#111111] border border-white/5 border-dashed rounded-3xl flex flex-col items-center justify-center text-white/20 p-12">
              <Activity className="w-12 h-12 mb-4 opacity-10" />
              <p className="text-center font-medium">Select a model and click "Run Experiment" to see real-time training results on your synthetic data.</p>
            </div>
          )}

          {training && (
            <div className="h-full min-h-[400px] bg-[#111111] border border-white/10 rounded-3xl flex flex-col items-center justify-center p-12">
              <div className="relative w-24 h-24 mb-8">
                <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <Cpu className="absolute inset-0 m-auto w-10 h-10 text-purple-500 animate-pulse" />
              </div>
              <h3 className="text-2xl font-black tracking-tight mb-2">Training in Progress...</h3>
              <p className="text-white/40 text-center max-w-sm">
                Encoding categorical variables, scaling features, and performing an 80/20 train-test split.
              </p>
            </div>
          )}

          {comparisonResults && (
            <div className="bg-[#111111] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
              <div className="bg-purple-600/10 px-8 py-6 border-b border-purple-500/20 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <BarChart className="w-5 h-5 text-purple-400" /> Model Comparison Rankings
                  </h3>
                  <p className="text-xs text-white/40 mt-1">Benchmarking performance across all selected architectures.</p>
                </div>
              </div>
              <div className="p-8">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-white/30">Model Name</th>
                        <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-white/30">Time (s)</th>
                        {Object.keys(comparisonResults.results[0]?.metrics || {}).map(m => (
                          <th key={m} className="pb-4 text-[10px] font-black uppercase tracking-widest text-white/30 text-right">{m}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {comparisonResults.results.map((res: any, idx: number) => (
                        <tr key={idx} className="group hover:bg-white/[0.02] transition-colors">
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white uppercase">{res.model_info.type.replace(/_/g, ' ')}</span>
                              {idx === 0 && (
                                <span className="px-1.5 py-0.5 bg-yellow-400/10 border border-yellow-400/20 rounded text-[8px] text-yellow-400 font-bold uppercase">Best</span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 text-xs font-mono text-white/40">{res.model_info.training_time.toFixed(3)}</td>
                          {Object.entries(res.metrics).map(([m, val]: any) => (
                            <td key={m} className={`py-4 text-sm font-bold text-right ${val > 0.8 ? 'text-green-400' : 'text-white'}`}>
                              {typeof val === 'number' ? val.toFixed(3) : val}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {results && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#111111] border border-white/10 rounded-2xl p-6">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <BarChart className="w-5 h-5 text-blue-400" /> Performance Metrics
                  </h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ReBarChart data={metricData} layout="vertical" margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" horizontal={false} />
                        <XAxis type="number" domain={[0, 1]} stroke="#ffffff30" fontSize={10} />
                        <YAxis dataKey="name" type="category" stroke="#ffffff30" fontSize={10} />
                        <ReTooltip 
                          contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#ffffff10', borderRadius: '12px' }}
                          itemStyle={{ color: '#8b5cf6' }}
                        />
                        <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]}>
                          {metricData.map((entry: { name: string, value: any }, index: number) => {
                            const isErrorMetric = entry.name.includes('RMSE') || entry.name.includes('MSE') || entry.name.includes('MAE');
                            const val = Number(entry.value);
                            const fill = isErrorMetric 
                              ? (val <= 0.1 ? '#10b981' : val <= 0.5 ? '#8b5cf6' : '#ef4444')
                              : (val >= 0.8 ? '#10b981' : val >= 0.6 ? '#8b5cf6' : '#ef4444');
                            return <Cell key={`cell-${index}`} fill={fill} />;
                          })}
                        </Bar>
                      </ReBarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-[#111111] border border-white/10 rounded-2xl p-6">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <Info className="w-5 h-5 text-purple-400" /> Model Summary
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-xs text-white/40">Model</span>
                      <span className="text-sm font-bold text-white uppercase">{results.model_info.type.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-xs text-white/40">Target</span>
                      <span className="text-sm font-bold text-purple-400">{results.model_info.target}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-xs text-white/40">Features</span>
                      <span className="text-sm font-bold text-white">{results.model_info.features.length} columns</span>
                    </div>
                    {results.model_info.target_names && (
                      <div className="pt-2">
                        <span className="text-[10px] text-white/30 uppercase block mb-2">Class Labels</span>
                        <div className="flex flex-wrap gap-2">
                          {results.model_info.target_names.map((name: string) => (
                            <span key={name} className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold">{name}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* AI Instructor Section */}
              {(explaining || explanation) && (
                <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden">
                  <div className="bg-purple-600/10 px-6 py-4 border-b border-purple-500/20 flex items-center justify-between">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-400" /> AI ML Instructor
                    </h3>
                    {explaining && <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />}
                  </div>
                  
                  <div className="p-6 space-y-8">
                    {explaining ? (
                      <div className="py-12 flex flex-col items-center justify-center space-y-4">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
                        </div>
                        <p className="text-xs text-white/40 font-mono uppercase tracking-widest">Instructor is reviewing your results...</p>
                      </div>
                    ) : (
                      <>
                        <div className="prose prose-invert max-w-none">
                          <p className="text-white/80 leading-relaxed italic border-l-2 border-purple-500/30 pl-4">
                            {explanation.summary}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {(explanation.metrics_evaluation || explanation.metric_explanations)?.map((m: any, i: number) => (
                            <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">{m.metric}</span>
                                {m.interpretation && (
                                  <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase ${
                                    m.interpretation.toLowerCase().includes('good') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                                  }`}>
                                    {m.interpretation}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-white/80 leading-relaxed">{m.explanation}</p>
                              {m.when_to_use && (
                                <div className="pt-2 border-t border-white/5 text-[9px] text-white/40 italic">
                                  Use case: {m.when_to_use}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="space-y-4">
                          <h4 className="text-xs font-black uppercase tracking-widest text-white/30">System Diagnosis</h4>
                          <div className="grid grid-cols-1 gap-3">
                            {explanation.diagnosis?.map((d: any, i: number) => (
                              <div key={i} className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/5 group hover:border-purple-500/20 transition-colors">
                                <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                                  d.severity === 'high' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 
                                  d.severity === 'medium' ? 'bg-orange-500' : 'bg-blue-500'
                                }`} />
                                <div>
                                  <span className="text-xs font-bold text-white block mb-1">{d.issue}</span>
                                  <p className="text-xs text-white/50 leading-relaxed">{d.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="bg-blue-600/5 border border-blue-500/20 p-6 rounded-2xl">
                          <h4 className="text-xs font-black uppercase tracking-widest text-blue-400 mb-4 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" /> Strategic Improvement Plan
                          </h4>
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                            {(explanation.improvement_plan || explanation.improvements)?.map((imp: string, i: number) => (
                              <li key={i} className="text-xs text-white/70 flex items-start gap-3">
                                <span className="w-5 h-5 bg-blue-500/20 text-blue-400 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0">{i+1}</span>
                                {imp}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {explanation.metric_recommendations && (
                          <div className="bg-purple-600/5 border border-purple-500/20 p-6 rounded-2xl">
                            <h4 className="text-xs font-black uppercase tracking-widest text-purple-400 mb-4 flex items-center gap-2">
                              <Target className="w-4 h-4" /> Monitoring Recommendations
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {explanation.metric_recommendations.map((rec: string, i: number) => (
                                <span key={i} className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-[10px] text-purple-300 font-medium">
                                  {rec}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="pt-6 border-t border-white/5 grid grid-cols-2 gap-4">
                          <button
                            onClick={handleLearningAssistant}
                            disabled={loadingLearning || !results}
                            className="col-span-2 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-900/50 rounded-2xl text-sm font-black text-white transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20 active:scale-95"
                          >
                            {loadingLearning ? <RefreshCw className="w-5 h-5 animate-spin" /> : <GraduationCap className="w-5 h-5" />}
                            Open AI Learning Guide
                          </button>

                          <button
                            onClick={handleImpactAnalysis}
                            disabled={analyzingImpact || !baselineResults || !results}
                            className="py-3 bg-purple-600/10 border border-purple-500/20 rounded-xl text-[10px] font-black uppercase text-purple-400 transition-all flex items-center justify-center gap-2 hover:bg-purple-600/20 active:scale-95"
                          >
                            {analyzingImpact ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                            Impact Analysis
                          </button>

                          <button
                            onClick={handleCausalityAnalysis}
                            disabled={loadingCausality || !baselineResults || !results}
                            className="py-3 bg-blue-600/10 border border-blue-500/20 rounded-xl text-[10px] font-black uppercase text-blue-400 transition-all flex items-center justify-center gap-2 hover:bg-blue-600/20 active:scale-95"
                          >
                            {loadingCausality ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Binary className="w-4 h-4" />}
                            Causal Dive
                          </button>

                          <button
                            onClick={handleGetCoaching}
                            disabled={loadingCoach || !results}
                            className="col-span-2 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase text-white/40 transition-all flex items-center justify-center gap-2 hover:bg-white/10 active:scale-95"
                          >
                            {loadingCoach ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trophy className="w-4 h-4" />}
                            Get Expert Coaching Strategy
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Data Quality Feedback (Old fallback, keeping as secondary if no explanation) */}
              {!explanation && !explaining && (
                <div className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 border border-purple-500/20 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-600 rounded-2xl">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-1">Experiment Insight</h4>
                    <p className="text-sm text-white/70 leading-relaxed">
                      {results.metrics.accuracy > 0.9 || results.metrics.r2 > 0.9 
                        ? "The model is performing exceptionally well. This might suggest the synthetic data patterns are very strong or potentially too linear. Try adding more noise to see if the model can still generalize."
                        : results.metrics.accuracy < 0.6 || results.metrics.r2 < 0.3
                        ? "Performance is low. This suggests the relationships in your synthetic schema might be too complex for a simple baseline, or the data is too noisy. Consider refining your generator configurations."
                        : "Balanced performance. Your synthetic data provides a realistic challenge for baseline models."}
                    </p>
                  </div>
                </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <ImpactAnalysisModal 
        isOpen={isImpactModalOpen} 
        onClose={() => setIsImpactModalOpen(false)} 
        analysis={impactAnalysis} 
      />
      
      <TuningExpertModal 
        isOpen={isTuningModalOpen} 
        onClose={() => setIsTuningModalOpen(false)} 
        suggestions={tuningSuggestions} 
      />

      <FeatureAnalysisModal
        isOpen={isFeatureModalOpen}
        onClose={() => setIsFeatureModalOpen(false)}
        analysis={featureAnalysis}
      />

      <SimulationModal
        isOpen={isSimModalOpen}
        onClose={() => setIsSimModalOpen(false)}
        type={simType}
        data={simData}
      />

      <OverfittingModal
        isOpen={isOverfittingModalOpen}
        onClose={() => setIsOverfittingModalOpen(false)}
        data={overfittingData}
      />

      <CorrelationImpactModal
        isOpen={isCorrelationModalOpen}
        onClose={() => setIsCorrelationModalOpen(false)}
        data={correlationData}
      />

      <CoachingModal
        isOpen={isCoachingModalOpen}
        onClose={() => setIsCoachingModalOpen(false)}
        data={coachingData}
      />

      <CausalityModal
        isOpen={isCausalityModalOpen}
        onClose={() => setIsCausalityModalOpen(false)}
        data={causalityData}
      />

      <LearningAssistantModal
        isOpen={isLearningModalOpen}
        onClose={() => setIsLearningModalOpen(false)}
        data={learningData}
      />
    </div>
  );
}
