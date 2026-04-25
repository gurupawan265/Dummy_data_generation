'use client';

import React from 'react';
import { useSchemaStore } from '@/store/schema';
import { Settings2, X, AlertCircle, Info, Zap, Ghost, Sliders, CheckCircle, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ConfigInput = ({ label, value, onChange, type, description, options }: any) => {
  return (
    <div className="space-y-2 mb-6">
      <div className="flex items-center gap-2">
        <label className="text-xs font-bold text-white/60 uppercase tracking-tighter transition-colors select-none">
          {label}
        </label>
        {description && (
          <div className="group relative">
            <Info className="w-3 h-3 text-white/20 group-hover:text-blue-400 transition-colors" />
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-black/90 border border-white/10 rounded-lg text-[10px] text-white/80 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              {description}
            </div>
          </div>
        )}
      </div>

      {type === 'string' && !options && (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white"
        />
      )}

      {type === 'integer' && (
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white font-mono"
        />
      )}

      {type === 'number' && (
        <input
          type="number"
          step="0.1"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white font-mono"
        />
      )}

      {type === 'boolean' && (
        <button
          onClick={() => onChange(!value)}
          className={`flex items-center w-full rounded-xl p-1 transition-all border ${
            value ? 'bg-blue-600/20 border-blue-500/50' : 'bg-white/5 border-white/10'
          }`}
        >
          <div className={`flex-1 text-center py-1.5 rounded-lg text-xs font-bold transition-all ${value ? 'bg-blue-600 text-white shadow-lg' : 'text-white/40'}`}>
            TRUE
          </div>
          <div className={`flex-1 text-center py-1.5 rounded-lg text-xs font-bold transition-all ${!value ? 'bg-white/10 text-white' : 'text-white/40'}`}>
            FALSE
          </div>
        </button>
      )}

      {Array.isArray(options) && (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white appearance-none cursor-pointer"
        >
          {options.map((opt: string) => (
            <option key={opt} value={opt} className="bg-[#1a1b1e]">
              {opt.charAt(0).toUpperCase() + opt.slice(1)}
            </option>
          ))}
        </select>
      )}

      {type === 'array' && (
        <textarea
          value={Array.isArray(value) ? value.join(', ') : ''}
          onChange={(e) => onChange(e.target.value.split(',').map(s => s.trim()))}
          placeholder="item1, item2, item3"
          className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white font-mono min-h-[100px]"
        />
      )}

      {type === 'range' && (
        <div className="space-y-3">
          <input
            type="range"
            min={options?.min || 0}
            max={options?.max || 100}
            step={options?.step || 0.01}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-[10px] font-mono text-white/40">
            <span>{options?.min || 0}{options?.unit}</span>
            <span className="text-blue-400 font-bold">{Math.round(value * 100)}{options?.unit}</span>
            <span>{options?.max || 100}{options?.unit}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export const ConfigPanel = () => {
  const { tables, activeTableId, selectedFieldId, updateField, selectField, generators, suggestDistribution } = useSchemaStore();
  
  const fields = tables.find(t => t.id === activeTableId)?.fields || [];
  const field = fields.find((f) => f.id === selectedFieldId);
  const generatorMetadata = field ? generators[field.type] : null;
  const [expertSuggestion, setExpertSuggestion] = React.useState<any>(null);
  const [isExpertLoading, setIsExpertLoading] = React.useState(false);

  if (!field) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white/5 backdrop-blur-xl border-l border-white/10">
        <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
          <Settings2 className="w-8 h-8 text-white/20" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">No Field Selected</h3>
        <p className="text-sm text-white/40">Select a field from the canvas to configure its generation logic.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white/5 backdrop-blur-3xl border-l border-white/10 text-white">
      <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600/20 border border-blue-500/50 rounded-xl">
            <Settings2 className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Configure Field</h3>
            <p className="text-xs text-white/40 font-mono">{field.type.toUpperCase()}</p>
          </div>
        </div>
        <button 
          onClick={() => selectField(null)}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-white/40" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-8">
          {/* Common Fields */}
          <div className="grid grid-cols-1 gap-6 pb-6 border-b border-white/5">
            <ConfigInput
              label="Field Name"
              value={field.name}
              type="string"
              onChange={(v: string) => updateField(field.id, { name: v })}
            />
            
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
              <span className="text-sm font-medium">Required Field</span>
              <button
                onClick={() => updateField(field.id, { required: !field.required })}
                className={`w-12 h-6 rounded-full transition-all relative ${
                  field.required ? 'bg-blue-600' : 'bg-white/10'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                  field.required ? 'left-7' : 'left-1'
                }`} />
              </button>
            </div>
          </div>

          {/* Generator Specific Fields */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-[10px] font-black text-blue-400/80 uppercase tracking-[0.2em]">
                Generator Settings
              </h4>
              <button
                onClick={async () => {
                  setIsExpertLoading(true);
                  const res = await suggestDistribution(field.id);
                  setIsExpertLoading(false);
                  if (res) {
                    setExpertSuggestion(res);
                  }
                }}
                disabled={isExpertLoading}
                className="flex items-center gap-1.5 px-3 py-1 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 rounded-lg text-[10px] font-black text-blue-400 uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
              >
                {isExpertLoading ? <div className="w-3 h-3 border-2 border-blue-400/20 border-t-blue-400 rounded-full animate-spin" /> : <Zap className="w-3 h-3" />}
                AI Expert
              </button>
            </div>

            {expertSuggestion && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-4 bg-blue-600/10 border border-blue-500/20 rounded-2xl space-y-4"
              >
                <div className="flex justify-between items-center">
                  <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Expert Recommendation</div>
                  <button onClick={() => setExpertSuggestion(null)}><X className="w-3 h-3 text-white/20 hover:text-white" /></button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-black/20 p-2 rounded-xl">
                    <div className="text-[8px] text-white/40 uppercase">Distribution</div>
                    <div className="text-xs font-bold text-white">{expertSuggestion.distribution_type}</div>
                  </div>
                  <div className="bg-black/20 p-2 rounded-xl">
                    <div className="text-[8px] text-white/40 uppercase">Mean / Median</div>
                    <div className="text-xs font-bold text-white">{expertSuggestion.statistics?.mean || expertSuggestion.statistics?.median || 'N/A'}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-[8px] text-white/40 uppercase">Sample Preview</div>
                  <div className="flex flex-wrap gap-1">
                    {expertSuggestion.sample_preview?.slice(0, 5).map((v: any, i: number) => (
                      <span key={i} className="px-2 py-0.5 bg-white/5 rounded text-[10px] font-mono text-blue-300 border border-white/5">{v}</span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    updateField(field.id, {
                      distribution: {
                        type: expertSuggestion.distribution_type.toLowerCase(),
                        params: expertSuggestion.parameters
                      },
                      config: {
                        ...field.config,
                        ...expertSuggestion.parameters
                      }
                    });
                    setExpertSuggestion(null);
                  }}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-500/20"
                >
                  Apply Recommendation
                </button>
              </motion.div>
            )}
            
            {field.type === 'formula' && (
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em]">Formula Expression</h4>
                  <div className="flex items-center gap-1 text-[9px] text-white/30 uppercase font-bold">
                    <Info className="w-3 h-3" />
                    Pandas/NumPy Syntax
                  </div>
                </div>
                <textarea
                  value={field.config.formula || ''}
                  onChange={(e) => updateField(field.id, { config: { ...field.config, formula: e.target.value } })}
                  placeholder="e.g. price * quantity or (age > 18) ? 'Adult' : 'Minor'"
                  className="w-full bg-black/40 border border-purple-500/20 rounded-2xl p-4 text-sm font-mono text-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 min-h-[120px] transition-all"
                />
                <p className="text-[10px] text-white/40 leading-relaxed italic">
                  Use field names directly in the expression. Supports arithmetic (+, -, *, /) and ternary logic (cond ? true : false).
                </p>
              </div>
            )}
            
            {generatorMetadata?.config_schema && Object.entries(generatorMetadata.config_schema).map(([key, schema]: [string, any]) => (
              <ConfigInput
                key={key}
                label={key.replace('_', ' ')}
                value={field.config[key]}
                type={schema.type}
                options={schema.enum}
                onChange={(v: any) => updateField(field.id, { 
                  config: { ...field.config, [key]: v } 
                })}
              />
            ))}
            
            {(!generatorMetadata?.config_schema || Object.keys(generatorMetadata.config_schema).length === 0) && (
              <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-center gap-4">
                <AlertCircle className="w-5 h-5 text-blue-400 shrink-0" />
                <p className="text-xs text-blue-200/60 leading-relaxed">
                   This generator has no specific configuration options. It will produce values using its default logic.
                </p>
              </div>
            )}
          </div>

          {/* Noise Injection */}
          {(['integer', 'float', 'currency', 'percentage'].includes(field.type)) && (
            <div className="pt-8 border-t border-white/5">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <h4 className="text-[10px] font-black text-white/80 uppercase tracking-[0.2em]">
                    Noise Injection
                  </h4>
                </div>
                <button
                  onClick={() => updateField(field.id, { 
                    noise: field.noise ? undefined : { type: 'gaussian', intensity: 0.1 } 
                  })}
                  className={`w-10 h-5 rounded-full transition-all relative ${
                    field.noise ? 'bg-yellow-500' : 'bg-white/10'
                  }`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${
                    field.noise ? 'left-5.5' : 'left-0.5'
                  }`} />
                </button>
              </div>

              {field.noise && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                  <ConfigInput
                    label="Noise Type"
                    value={field.noise.type}
                    type="select"
                    options={['gaussian', 'uniform', 'outliers']}
                    onChange={(v: string) => updateField(field.id, { 
                      noise: { ...field.noise!, type: v } 
                    })}
                  />
                  <ConfigInput
                    label={field.noise.type === 'outliers' ? 'Outlier Percentage' : 'Noise Intensity'}
                    value={field.noise.intensity}
                    type="range"
                    options={{ 
                      min: 0, 
                      max: field.noise.type === 'outliers' ? 0.1 : 0.2, 
                      step: 0.01,
                      unit: '%' 
                    }}
                    onChange={(v: number) => updateField(field.id, { 
                      noise: { ...field.noise!, intensity: v } 
                    })}
                  />
                </div>
              )}
            </div>
          )}

          {/* Missing Data */}
          <div className="pt-8 border-t border-white/5">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Ghost className="w-4 h-4 text-purple-400" />
                <h4 className="text-[10px] font-black text-white/80 uppercase tracking-[0.2em]">
                  Missing Data
                </h4>
              </div>
              <button
                onClick={() => updateField(field.id, { 
                  missing_data: field.missing_data ? undefined : { type: 'random', percentage: 0.1, block_size_range: [3, 8] } 
                })}
                className={`w-10 h-5 rounded-full transition-all relative ${
                  field.missing_data ? 'bg-purple-500' : 'bg-white/10'
                }`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${
                  field.missing_data ? 'left-5.5' : 'left-0.5'
                }`} />
              </button>
            </div>

            {field.missing_data && (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
                  {['random', 'block'].map((type) => (
                    <button
                      key={type}
                      onClick={() => updateField(field.id, { 
                        missing_data: { ...field.missing_data!, type } 
                      })}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        field.missing_data?.type === type ? 'bg-purple-600 text-white shadow-lg' : 'text-white/40 hover:text-white/60'
                      }`}
                    >
                      {type.toUpperCase()}
                    </button>
                  ))}
                </div>

                <ConfigInput
                  label="Missing Percentage"
                  value={field.missing_data.percentage}
                  type="range"
                  options={{ min: 0, max: 0.5, step: 0.05, unit: '%' }}
                  onChange={(v: number) => updateField(field.id, { 
                    missing_data: { ...field.missing_data!, percentage: v } 
                  })}
                />

                {field.missing_data.type === 'block' && (
                  <div className="grid grid-cols-2 gap-4">
                    <ConfigInput
                      label="Min Block"
                      value={field.missing_data.block_size_range[0]}
                      type="integer"
                      onChange={(v: number) => updateField(field.id, { 
                        missing_data: { 
                          ...field.missing_data!, 
                          block_size_range: [v, field.missing_data!.block_size_range[1]] 
                        } 
                      })}
                    />
                    <ConfigInput
                      label="Max Block"
                      value={field.missing_data.block_size_range[1]}
                      type="integer"
                      onChange={(v: number) => updateField(field.id, { 
                        missing_data: { 
                          ...field.missing_data!, 
                          block_size_range: [field.missing_data!.block_size_range[0], v] 
                        } 
                      })}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Validation Rules */}
          <div className="pt-8 border-t border-white/5 pb-24">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <h4 className="text-[10px] font-black text-white/80 uppercase tracking-[0.2em]">
                  Validation Rules
                </h4>
              </div>
              <button
                onClick={() => {
                  const current = field.validation?.rules || [];
                  updateField(field.id, { 
                    validation: { 
                      ...field.validation, 
                      rules: [...current, { type: 'email', params: {} }] 
                    } 
                  });
                }}
                className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all"
                title="Add Validation Rule"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {field.validation?.rules?.map((rule: any, idx: number) => (
                <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4 relative group">
                  <button 
                    onClick={() => {
                      if (!field.validation?.rules) return;
                      const newRules = [...field.validation.rules];
                      newRules.splice(idx, 1);
                      updateField(field.id, { validation: { ...field.validation, rules: newRules } });
                    }}
                    className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all"
                  >
                    <X className="w-3 h-3" />
                  </button>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase">Rule Type</label>
                    <select 
                      value={rule.type}
                      onChange={(e) => {
                         if (!field.validation?.rules) return;
                         const newRules = [...field.validation.rules];
                         newRules[idx] = { ...newRules[idx], type: e.target.value, params: {} };
                         updateField(field.id, { validation: { ...field.validation, rules: newRules } });
                      }}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                    >
                      <option value="email">Email Format</option>
                      <option value="range">Numeric Range</option>
                      <option value="unique">Unique Constraint</option>
                      <option value="regex">Regex Match</option>
                    </select>
                  </div>

                  {rule.type === 'range' && (
                    <div className="grid grid-cols-2 gap-4">
                      <ConfigInput
                        label="Min"
                        value={rule.params.min || 0}
                        type="number"
                        onChange={(v: number) => {
                          if (!field.validation?.rules) return;
                          const newRules = [...field.validation.rules];
                          newRules[idx].params = { ...newRules[idx].params, min: v };
                          updateField(field.id, { validation: { ...field.validation, rules: newRules } });
                        }}
                      />
                      <ConfigInput
                        label="Max"
                        value={rule.params.max || 100}
                        type="number"
                        onChange={(v: number) => {
                          if (!field.validation?.rules) return;
                          const newRules = [...field.validation.rules];
                          newRules[idx].params = { ...newRules[idx].params, max: v };
                          updateField(field.id, { validation: { ...field.validation, rules: newRules } });
                        }}
                      />
                    </div>
                  )}

                  {rule.type === 'regex' && (
                    <ConfigInput
                      label="Pattern"
                      value={rule.params.pattern || ''}
                      type="string"
                      onChange={(v: string) => {
                        if (!field.validation?.rules) return;
                        const newRules = [...field.validation.rules];
                        newRules[idx].params = { ...newRules[idx].params, pattern: v };
                        updateField(field.id, { validation: { ...field.validation, rules: newRules } });
                      }}
                    />
                  )}
                </div>
              ))}
              
              {(!field.validation?.rules || field.validation.rules.length === 0) && (
                <p className="text-[10px] text-white/20 text-center italic">No validation rules set</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
