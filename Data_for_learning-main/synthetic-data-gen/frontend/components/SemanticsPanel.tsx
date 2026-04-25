'use client';

import React, { useState } from 'react';
import { useSchemaStore } from '@/store/schema';
import { 
  X, Brain, Zap, ArrowRight, Trash2, Plus, 
  RefreshCw, Link as LinkIcon, Lock, Activity, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const SemanticsPanel = ({ tableId, onClose }: { tableId: string, onClose: () => void }) => {
  const { tables, updateTableSemantics, suggestSemantics, suggestRelationships, validateConstraints, suggestNoise, updateField } = useSchemaStore();
  const table = tables.find(t => t.id === tableId);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isDesigning, setIsDesigning] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isDegrading, setIsDegrading] = useState(false);
  const [isSimulatingMissing, setIsSimulatingMissing] = useState(false);
  const [noiseLevel, setNoiseLevel] = useState(5);
  const [missingPercentage, setMissingPercentage] = useState(10);
  const [validationReport, setValidationReport] = useState<any>(null);

  if (!table) return null;

  const constraints = table.constraints || [];
  const correlations = table.correlations || [];

  const handleSuggest = async () => {
    setIsSuggesting(true);
    await suggestSemantics(tableId);
    setIsSuggesting(false);
  };

  const handleDesign = async () => {
    setIsDesigning(true);
    const res = await suggestRelationships(tableId);
    if (res && res.relationships) {
      const newCorrelations = [...correlations];
      
      res.relationships.forEach((rel: any) => {
        if (rel.type === 'linear' || rel.type === 'inverse') {
          newCorrelations.push({
            feature_1: rel.source,
            feature_2: rel.target,
            type: rel.type === 'linear' ? 'positive' : 'negative',
            strength: rel.strength
          });
        } else if (rel.type === 'derived' || rel.type === 'conditional') {
          // Find the target field and convert to formula
          const field = table.fields.find(f => f.name === rel.target);
          if (field) {
            updateField(field.id, {
              type: 'formula',
              config: { ...field.config, formula: rel.formula }
            });
          }
        }
      });

      updateTableSemantics(tableId, { constraints, correlations: newCorrelations });
    }
    setIsDesigning(false);
  };

  const removeConstraint = (index: number) => {
    const newConstraints = constraints.filter((_, i) => i !== index);
    updateTableSemantics(tableId, { constraints: newConstraints, correlations });
  };

  const removeCorrelation = (index: number) => {
    const newCorrelations = correlations.filter((_, i) => i !== index);
    updateTableSemantics(tableId, { constraints, correlations: newCorrelations });
  };

  const addConstraint = () => {
    const newConstraints = [...constraints, { rule: "field1 > field2", type: "numeric" }];
    updateTableSemantics(tableId, { constraints: newConstraints, correlations });
  };

  const addCorrelation = () => {
    const newCorrelations = [...correlations, { feature_1: "", feature_2: "", type: "positive", strength: "moderate" }];
    updateTableSemantics(tableId, { constraints, correlations: newCorrelations });
  };

  const handleDegrade = async () => {
    setIsDegrading(true);
    const res = await suggestNoise(tableId, noiseLevel);
    if (res && res.noise_strategy) {
      res.noise_strategy.forEach((strat: any) => {
        const field = table.fields.find(f => f.name === strat.column);
        if (field) {
          updateField(field.id, {
            noise: {
              type: strat.type,
              intensity: strat.parameters.magnitude || strat.parameters.percentage_affected
            }
          });
        }
      });
    }
    setIsDegrading(false);
  };
  
  const { suggestMissingStrategy } = useSchemaStore();
  const handleSimulateMissing = async () => {
    setIsSimulatingMissing(true);
    const res = await suggestMissingStrategy(tableId, missingPercentage);
    if (res && res.missing_strategy) {
      res.missing_strategy.forEach((strat: any) => {
        const field = table.fields.find(f => f.name === strat.column);
        if (field) {
          updateField(field.id, {
            missing_data: {
              type: strat.pattern_type.toLowerCase(),
              percentage: strat.missing_percentage / 100,
              block_size_range: [3, 8], // default
              condition: strat.condition,
              target_value_range: strat.target_value_range
            }
          });
        }
      });
    }
    setIsSimulatingMissing(false);
  };

  const handleValidate = async () => {
    setIsValidating(true);
    const report = await validateConstraints(tableId);
    setValidationReport(report);
    setIsValidating(false);
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="fixed inset-y-0 right-0 w-[450px] bg-[#0c0c0e] border-l border-white/10 shadow-2xl z-[100] flex flex-col"
    >
      <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-600/20 rounded-2xl flex items-center justify-center border border-purple-500/30">
            <Brain className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight text-white">Table Semantics</h2>
            <p className="text-[10px] text-white/30 uppercase font-black tracking-widest">{table.name}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
          <X className="w-5 h-5 text-white/40" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* AI Suggestion Header */}
        <div className="bg-gradient-to-br from-purple-600/10 to-blue-600/10 border border-purple-500/20 rounded-2xl p-6 text-center">
          <Zap className="w-8 h-8 text-purple-400 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white mb-2">Build a smarter dataset</h3>
          <p className="text-xs text-white/40 mb-6 leading-relaxed">
            Let Gemini analyze your schema to suggest realistic statistical correlations and logical business rules.
          </p>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={handleSuggest}
              disabled={isSuggesting || isDesigning}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-white/5 disabled:text-white/20 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-500/20"
            >
              {isSuggesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
              {isSuggesting ? 'Analyzing Schema...' : 'Suggest All Semantics'}
            </button>
            <button
              onClick={handleDesign}
              disabled={isDesigning || isSuggesting}
              className="w-full py-3 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all text-blue-400"
            >
              {isDesigning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              {isDesigning ? 'Designing Connections...' : 'AI Relationship Designer'}
            </button>
          </div>
        </div>

        {/* Logical Constraints */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5" /> Logical Rules
            </h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleValidate}
                disabled={isValidating || constraints.length === 0}
                className="text-[9px] px-2 py-1 bg-white/5 hover:bg-white/10 rounded-md text-white/40 hover:text-white transition-all uppercase font-bold disabled:opacity-30"
              >
                {isValidating ? 'Analyzing...' : 'Analyze Conflicts'}
              </button>
              <button onClick={addConstraint} className="p-1 hover:bg-white/5 rounded-md text-white/20 hover:text-white transition-all">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {validationReport && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-yellow-400/10 border border-yellow-400/20 rounded-2xl p-4 mb-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-yellow-400" />
                  <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest">Constraint Analysis</span>
                </div>
                <button onClick={() => setValidationReport(null)}>
                  <X className="w-3 h-3 text-white/20 hover:text-white" />
                </button>
              </div>
              
              {validationReport.conflict_matrix !== "None" && validationReport.conflict_matrix && (
                <div className="text-[10px] text-red-400 font-bold mb-3 p-2 bg-red-400/10 rounded-lg border border-red-400/20">
                  CONFLICT DETECTED: {validationReport.conflict_matrix}
                </div>
              )}
              
              <div className="space-y-2">
                {validationReport.constraints?.slice(0, 3).map((c: any, i: number) => (
                  <div key={i} className="text-[10px] text-white/60 flex items-start gap-2">
                    <span className="w-1 h-1 bg-yellow-400 rounded-full mt-1.5 shrink-0" />
                    <div>
                      <span className="font-bold text-white/80">{c.rule}</span>
                      <span className="ml-2 text-[9px] px-1.5 py-0.5 bg-white/5 rounded-md text-white/30 uppercase">{c.enforcement}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
          
          <div className="space-y-3">
            {constraints.map((c, i) => (
              <div key={i} className="group flex items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-purple-500/30 transition-all">
                <div className="flex-1">
                  <input
                    value={c.rule}
                    onChange={(e) => {
                      const newC = [...constraints];
                      newC[i].rule = e.target.value;
                      updateTableSemantics(tableId, { constraints: newC, correlations });
                    }}
                    className="w-full bg-transparent text-xs font-mono text-purple-300 outline-none"
                  />
                  <div className="flex gap-2 mt-2">
                    {['numeric', 'temporal', 'categorical'].map(t => (
                      <button
                        key={t}
                        onClick={() => {
                          const newC = [...constraints];
                          newC[i].type = t;
                          updateTableSemantics(tableId, { constraints: newC, correlations });
                        }}
                        className={`text-[9px] px-2 py-0.5 rounded-full border transition-all ${
                          c.type === t ? 'bg-purple-600/20 border-purple-500/50 text-purple-400' : 'bg-transparent border-white/10 text-white/20 hover:text-white/40'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={() => removeConstraint(i)} className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-400/10 rounded-xl transition-all">
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Statistical Correlations */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5" /> Statistical Correlations
            </h3>
            <button onClick={addCorrelation} className="p-1 hover:bg-white/5 rounded-md text-white/20 hover:text-white transition-all">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {correlations.map((c, i) => (
              <div key={i} className="group p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-blue-500/30 transition-all space-y-3">
                <div className="flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      placeholder="field_a"
                      value={c.feature_1}
                      onChange={(e) => {
                        const newCorr = [...correlations];
                        newCorr[i].feature_1 = e.target.value;
                        updateTableSemantics(tableId, { constraints, correlations: newCorr });
                      }}
                      className="w-1/3 bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white outline-none"
                    />
                    <ArrowRight className="w-3 h-3 text-white/20" />
                    <input
                      placeholder="field_b"
                      value={c.feature_2}
                      onChange={(e) => {
                        const newCorr = [...correlations];
                        newCorr[i].feature_2 = e.target.value;
                        updateTableSemantics(tableId, { constraints, correlations: newCorr });
                      }}
                      className="w-1/3 bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white outline-none"
                    />
                  </div>
                  <button onClick={() => removeCorrelation(i)} className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-400/10 rounded-lg transition-all">
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between pt-1 border-t border-white/5">
                  <select
                    value={c.type}
                    onChange={(e) => {
                      const newCorr = [...correlations];
                      newCorr[i].type = e.target.value;
                      updateTableSemantics(tableId, { constraints, correlations: newCorr });
                    }}
                    className="bg-transparent text-[10px] text-blue-400 outline-none cursor-pointer"
                  >
                    <option value="positive" className="bg-[#18191f]">Positive Corr</option>
                    <option value="negative" className="bg-[#18191f]">Negative Corr</option>
                  </select>

                  <div className="flex gap-1">
                    {['weak', 'moderate', 'strong'].map(s => (
                      <button
                        key={s}
                        onClick={() => {
                          const newCorr = [...correlations];
                          newCorr[i].strength = s;
                          updateTableSemantics(tableId, { constraints, correlations: newCorr });
                        }}
                        className={`text-[9px] px-2 py-0.5 rounded-full border transition-all ${
                          c.strength === s ? 'bg-blue-600/20 border-blue-500/50 text-blue-400' : 'bg-transparent border-white/10 text-white/20 hover:text-white/40'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Quality Degradation Expert */}
        <div className="pt-8 border-t border-white/5 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5" /> Quality Degradation
            </h3>
          </div>
          
          <div className="bg-yellow-600/5 border border-yellow-500/10 rounded-2xl p-6 space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Global Stress Level</label>
                <span className="text-xs font-black text-yellow-400">{noiseLevel}%</span>
              </div>
              <input 
                type="range"
                min="0"
                max="50"
                value={noiseLevel}
                onChange={(e) => setNoiseLevel(parseInt(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-yellow-500"
              />
            </div>

            <p className="text-[10px] text-white/30 leading-relaxed italic">
              AI will inject Gaussian noise, categorical flips, and outliers to stress-test your ML models.
            </p>

            <button
              onClick={handleDegrade}
              disabled={isDegrading}
              className="w-full py-3 bg-yellow-600/10 hover:bg-yellow-600/20 border border-yellow-500/20 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all text-yellow-400"
            >
              {isDegrading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
              {isDegrading ? 'Injecting Noise...' : 'Run Degradation Expert'}
            </button>
          </div>
        </div>

        {/* Missing Data Simulation Expert */}
        <div className="pt-8 border-t border-white/5 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
              <Brain className="w-3.5 h-3.5" /> Missingness Expert
            </h3>
          </div>
          
          <div className="bg-blue-600/5 border border-blue-500/10 rounded-2xl p-6 space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Global Null Percentage</label>
                <span className="text-xs font-black text-blue-400">{missingPercentage}%</span>
              </div>
              <input 
                type="range"
                min="0"
                max="100"
                value={missingPercentage}
                onChange={(e) => setMissingPercentage(parseInt(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <p className="text-[10px] text-white/30 leading-relaxed italic">
              AI will simulate MCAR, MAR, and MNAR patterns to test your imputation pipelines and model robustness.
            </p>

            <button
              onClick={handleSimulateMissing}
              disabled={isSimulatingMissing}
              className="w-full py-3 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all text-blue-400"
            >
              {isSimulatingMissing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
              {isSimulatingMissing ? 'Calculating Patterns...' : 'Run Missingness Expert'}
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 bg-black/40 border-t border-white/10 text-[10px] text-white/30 text-center italic">
        Semantics are applied after base generation and before noise injection.
      </div>
    </motion.div>
  );
};
