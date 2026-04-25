'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSchemaStore } from '@/store/schema';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical, Trash2, Copy, Eye, CheckCircle2, Plus, RefreshCw,
  Layers, Zap, Ghost, Settings2, ChevronDown, Search, Brain, FlaskConical, Stethoscope, ShieldCheck, UserMinus, Star, CreditCard, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SemanticsPanel } from './SemanticsPanel';

// ─── Type Selector Dropdown ────────────────────────────────────────────────
const TypeSelector = ({ value, generators, onChange }: {
  value: string;
  generators: Record<string, any>;
  onChange: (type: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const allTypes = Object.keys(generators);
  const filtered = allTypes.filter(t => t.toLowerCase().includes(search.toLowerCase()));

  // Group by category
  const categories: Record<string, string[]> = {};
  filtered.forEach(t => {
    const cat = generators[t]?.category || 'Other';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(t);
  });

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => { setOpen(o => !o); setSearch(''); }}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/50 rounded-lg text-xs font-mono text-blue-300 transition-all min-w-[120px] justify-between group"
      >
        <span className="truncate max-w-[100px]">{value}</span>
        <ChevronDown className={`w-3 h-3 text-white/30 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className="absolute top-full mt-1 left-0 z-50 w-56 bg-[#18191f] border border-white/10 rounded-xl shadow-2xl shadow-black/60 overflow-hidden"
          >
            {/* Search */}
            <div className="p-2 border-b border-white/5">
              <div className="flex items-center gap-2 px-2 py-1.5 bg-white/5 rounded-lg">
                <Search className="w-3 h-3 text-white/30" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search types..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="bg-transparent text-xs text-white outline-none w-full placeholder:text-white/20"
                />
              </div>
            </div>

            {/* Options */}
            <div className="max-h-64 overflow-y-auto p-1">
              {Object.entries(categories).map(([cat, types]) => (
                <div key={cat}>
                  <div className="px-2 py-1 text-[9px] font-black uppercase tracking-widest text-white/20 mt-1">
                    {cat}
                  </div>
                  {types.map(t => (
                    <button
                      key={t}
                      onClick={() => { onChange(t); setOpen(false); }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                        t === value
                          ? 'bg-blue-600/30 text-blue-300'
                          : 'text-white/60 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="px-3 py-4 text-xs text-white/20 text-center">No matches</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Scenario Selector ─────────────────────────────────────────────────────
const ScenarioSelector = () => {
  const [open, setOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { suggestScenarioSchema, setTables } = useSchemaStore();

  const scenarios = [
    { name: 'Fraud Detection', icon: <ShieldCheck className="w-3.5 h-3.5" />, color: 'text-red-400' },
    { name: 'Customer Churn', icon: <UserMinus className="w-3.5 h-3.5" />, color: 'text-orange-400' },
    { name: 'Credit Scoring', icon: <CreditCard className="w-3.5 h-3.5" />, color: 'text-emerald-400' },
    { name: 'Recommendation System', icon: <Star className="w-3.5 h-3.5" />, color: 'text-yellow-400' },
    { name: 'Medical Diagnosis', icon: <Stethoscope className="w-3.5 h-3.5" />, color: 'text-blue-400' },
    { name: 'Sentiment Analysis', icon: <Activity className="w-3.5 h-3.5" />, color: 'text-pink-400' },
  ];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = async (scenario: string) => {
    setIsGenerating(true);
    setOpen(false);
    try {
      const result = await suggestScenarioSchema(scenario);
      if (result && result.schema) {
        setTables(result.schema.tables);
      }
    } catch (err) {
      console.error('Scenario generation failed', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-4 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 rounded-xl text-xs font-black text-blue-400 transition-all shadow-lg shadow-blue-500/5 active:scale-95"
      >
        {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FlaskConical className="w-3.5 h-3.5" />}
        {isGenerating ? 'Designing...' : 'Scenario Expert'}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            className="absolute top-full mt-2 right-0 z-[60] w-64 bg-[#18191f] border border-white/10 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden p-2"
          >
            <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">
              Select ML Scenario
            </div>
            {scenarios.map(s => (
              <button
                key={s.name}
                onClick={() => handleSelect(s.name)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all group text-left"
              >
                <div className={`p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors ${s.color}`}>
                  {s.icon}
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">{s.name}</div>
                  <div className="text-[9px] text-white/30 uppercase tracking-tighter">Domain Template</div>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Blank % Input ─────────────────────────────────────────────────────────
const BlankInput = ({ field, onUpdate }: { field: any; onUpdate: (u: any) => void }) => {
  const pct = field.missing_data ? Math.round(field.missing_data.percentage * 100) : 0;

  const handleChange = (val: number) => {
    const clamped = Math.max(0, Math.min(100, val));
    if (clamped === 0) {
      onUpdate({ missing_data: undefined });
    } else {
      onUpdate({
        missing_data: {
          type: field.missing_data?.type || 'random',
          percentage: clamped / 100,
          block_size_range: field.missing_data?.block_size_range || [3, 8],
        },
      });
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      <input
        type="number"
        min={0}
        max={100}
        value={pct}
        onChange={e => handleChange(parseInt(e.target.value) || 0)}
        className="w-14 bg-white/5 border border-white/10 rounded-lg py-1.5 px-2 text-xs font-mono text-center text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
      />
      <span className="text-white/30 text-xs">%</span>
    </div>
  );
};

// ─── Quick Options Popover ─────────────────────────────────────────────────
const QuickOptions = ({ field, generators, onUpdate, onOpenFull }: {
  field: any;
  generators: Record<string, any>;
  onUpdate: (u: any) => void;
  onOpenFull: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const schema = generators[field.type]?.config_schema || {};
  const hasConfig = Object.keys(schema).length > 0;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Show a compact set of the most important config options inline
  const topKeys = Object.keys(schema).slice(0, 3);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        title="Quick options"
        className={`p-1.5 rounded-lg border transition-all text-xs ${
          hasConfig
            ? 'bg-white/5 border-white/10 hover:border-blue-500/40 text-white/40 hover:text-blue-300'
            : 'bg-transparent border-transparent text-white/15 cursor-default'
        }`}
        disabled={!hasConfig}
      >
        <Settings2 className="w-3.5 h-3.5" />
      </button>

      <AnimatePresence>
        {open && hasConfig && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className="absolute top-full mt-1 right-0 z-50 w-64 bg-[#18191f] border border-white/10 rounded-xl shadow-2xl shadow-black/60 p-4"
          >
            <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">
              Quick Config — {field.type}
            </div>

            <div className="space-y-3">
              {topKeys.map(key => {
                const s = schema[key];
                const val = field.config[key] ?? s.default;

                if (s.enum) {
                  return (
                    <div key={key}>
                      <label className="block text-[10px] text-white/40 uppercase mb-1">{key.replace(/_/g, ' ')}</label>
                      <select
                        value={val}
                        onChange={e => onUpdate({ config: { ...field.config, [key]: e.target.value } })}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white outline-none"
                      >
                        {s.enum.map((opt: string) => (
                          <option key={opt} value={opt} className="bg-[#18191f]">{opt}</option>
                        ))}
                      </select>
                    </div>
                  );
                }

                if (s.type === 'integer' || s.type === 'number') {
                  return (
                    <div key={key}>
                      <label className="block text-[10px] text-white/40 uppercase mb-1">{key.replace(/_/g, ' ')}</label>
                      <input
                        type="number"
                        step={s.type === 'number' ? '0.1' : '1'}
                        value={val}
                        onChange={e => onUpdate({ config: { ...field.config, [key]: s.type === 'number' ? parseFloat(e.target.value) : parseInt(e.target.value) } })}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white font-mono outline-none"
                      />
                    </div>
                  );
                }

                if (s.type === 'boolean') {
                  return (
                    <div key={key} className="flex items-center justify-between">
                      <label className="text-[10px] text-white/40 uppercase">{key.replace(/_/g, ' ')}</label>
                      <button
                        onClick={() => onUpdate({ config: { ...field.config, [key]: !val } })}
                        className={`w-9 h-5 rounded-full transition-all relative ${val ? 'bg-blue-600' : 'bg-white/10'}`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${val ? 'left-4' : 'left-0.5'}`} />
                      </button>
                    </div>
                  );
                }

                return (
                  <div key={key}>
                    <label className="block text-[10px] text-white/40 uppercase mb-1">{key.replace(/_/g, ' ')}</label>
                    <input
                      type="text"
                      value={val ?? ''}
                      onChange={e => onUpdate({ config: { ...field.config, [key]: e.target.value } })}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white outline-none"
                    />
                  </div>
                );
              })}
            </div>

            {Object.keys(schema).length > 3 && (
              <button
                onClick={() => { setOpen(false); onOpenFull(); }}
                className="mt-3 w-full text-[10px] text-blue-400 hover:text-blue-300 font-bold uppercase tracking-widest py-1.5 border border-blue-500/20 hover:border-blue-500/40 rounded-lg transition-all"
              >
                All options →
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Sortable Field Row ────────────────────────────────────────────────────
const SortableFieldRow = ({
  field,
  index,
  generators,
  onSelect,
}: {
  field: any;
  index: number;
  generators: Record<string, any>;
  onSelect: () => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const { updateField, removeField, duplicateField } = useSchemaStore();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
    opacity: isDragging ? 0.4 : 1,
  };

  const handleTypeChange = (newType: string) => {
    const gen = generators[newType];
    const newConfig = Object.keys(gen?.config_schema || {}).reduce((acc: any, key) => {
      acc[key] = gen.config_schema[key].default;
      return acc;
    }, {});
    updateField(field.id, { type: newType, config: newConfig });
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div className={`group flex items-center gap-0 border-b border-white/5 transition-all hover:bg-white/[0.03] ${isDragging ? 'bg-blue-500/5' : ''}`}>

        {/* # + drag handle */}
        <div className="flex items-center gap-1 w-14 px-3 flex-shrink-0">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 text-white/10 hover:text-white/30 transition-colors"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-mono text-white/20">{index + 1}</span>
        </div>

        {/* Field Name */}
        <div className="flex-1 px-3 py-3 min-w-0">
          <input
            type="text"
            value={field.name}
            onChange={e => updateField(field.id, { name: e.target.value })}
            className="w-full bg-transparent text-sm font-medium text-white outline-none border-b border-transparent focus:border-blue-500/50 pb-0.5 transition-all placeholder:text-white/20"
            placeholder="field_name"
          />
        </div>

        {/* Type */}
        <div className="px-3 py-2.5 flex-shrink-0">
          <TypeSelector
            value={field.type}
            generators={generators}
            onChange={handleTypeChange}
          />
        </div>

        {/* Blank % */}
        <div className="px-3 py-2.5 flex-shrink-0 w-28">
          <BlankInput
            field={field}
            onUpdate={u => updateField(field.id, u)}
          />
        </div>

        {/* Required toggle */}
        <div className="px-3 py-2.5 flex-shrink-0 w-20 flex justify-center">
          <button
            onClick={() => updateField(field.id, { required: !field.required })}
            title={field.required ? 'Required' : 'Optional'}
            className={`w-9 h-5 rounded-full transition-all relative ${field.required ? 'bg-blue-600' : 'bg-white/10'}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${field.required ? 'left-4' : 'left-0.5'}`} />
          </button>
        </div>

        {/* Badges (noise/missing indicators) */}
        <div className="px-2 py-2.5 flex-shrink-0 flex items-center gap-1.5 w-24">
          {field.noise && (
            <span className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full bg-yellow-400/10 text-yellow-400 font-bold border border-yellow-400/20">
              <Zap className="w-2.5 h-2.5" />N
            </span>
          )}
          {field.missing_data && (
            <span className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full bg-purple-400/10 text-purple-400 font-bold border border-purple-400/20">
              <Ghost className="w-2.5 h-2.5" />
              {Math.round(field.missing_data.percentage * 100)}%
            </span>
          )}
        </div>

        {/* Quick Options + Actions */}
        <div className="px-3 py-2.5 flex-shrink-0 flex items-center gap-1">
          <QuickOptions
            field={field}
            generators={generators}
            onUpdate={u => updateField(field.id, u)}
            onOpenFull={onSelect}
          />
          <button
            onClick={() => duplicateField(field.id)}
            title="Duplicate"
            className="p-1.5 rounded-lg text-white/20 hover:text-white/60 hover:bg-white/5 transition-all opacity-0 group-hover:opacity-100"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => removeField(field.id)}
            title="Delete"
            className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-400/5 transition-all opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Canvas ───────────────────────────────────────────────────────────
export const CanvasPanel = () => {
  const {
    tables,
    activeTableId,
    setActiveTable,
    addTable,
    removeTable,
    updateTable,
    reorderFields,
    addField,
    generateSampleRow,
    isLoading,
    previewData,
    generators,
    selectField,
  } = useSchemaStore();

  const [semanticsTableId, setSemanticsTableId] = useState<string | null>(null);

  const activeTable = tables.find(t => t.id === activeTableId) || tables[0];
  const fields = activeTable.fields;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderFields(active.id as string, over.id as string);
    }
  };

  const handleAddField = () => {
    const firstType = Object.keys(generators)[0] || 'word';
    addField(firstType);
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0c] text-white">

      {/* ── Header ── */}
      <div className="px-6 py-4 border-b border-white/10 bg-[#0a0a0c]/90 backdrop-blur-xl sticky top-0 z-10">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-black tracking-tight bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">
              Schema Canvas
            </h2>
          </div>
          <button
            onClick={() => generateSampleRow(25)}
            disabled={fields.length === 0 || isLoading}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-white/10 disabled:text-white/20 rounded-full font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-95 text-sm"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
            Preview
          </button>
        </div>

        {/* Table Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {tables.map(table => (
            <div
              key={table.id}
              className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
                activeTableId === table.id
                  ? 'bg-white/10 border-white/20 text-white'
                  : 'bg-transparent border-transparent text-white/40 hover:text-white/60'
              }`}
              onClick={() => setActiveTable(table.id)}
            >
              <Layers className={`w-3 h-3 ${activeTableId === table.id ? 'text-blue-400' : 'text-white/20'}`} />
              <input
                type="text"
                value={table.name}
                onChange={e => updateTable(table.id, { name: e.target.value })}
                onClick={e => e.stopPropagation()}
                className="bg-transparent border-none outline-none font-bold text-xs w-20 p-0 text-white"
                placeholder="Table Name"
              />
              {tables.length > 1 && (
                <button
                  onClick={e => { e.stopPropagation(); removeTable(table.id); }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-white/10 rounded-full transition-all"
                >
                  <Trash2 className="w-3 h-3 text-red-400" />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={() => addTable()}
            className="p-1.5 border border-dashed border-white/20 rounded-xl text-white/20 hover:text-blue-400 hover:border-blue-400/50 transition-all flex items-center gap-1.5 px-3"
          >
            <Plus className="w-3 h-3" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Add Table</span>
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <ScenarioSelector />
            <button
              onClick={() => setSemanticsTableId(activeTableId)}
              className="flex items-center gap-2 px-4 py-1.5 bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/20 rounded-xl text-xs font-black text-purple-400 transition-all shadow-lg shadow-purple-500/5 active:scale-95"
            >
              <Brain className="w-3.5 h-3.5" />
              Advanced Semantics
            </button>
          </div>
        </div>
      </div>

      {/* ── Column Header Row ── */}
      {fields.length > 0 && (
        <div className="flex items-center gap-0 border-b border-white/10 bg-white/[0.02] sticky top-0 z-[5] text-[10px] font-black uppercase tracking-widest text-white/25">
          <div className="w-14 px-3 py-2">##</div>
          <div className="flex-1 px-3 py-2">Field Name</div>
          <div className="px-3 py-2 w-[156px]">Type</div>
          <div className="px-3 py-2 w-28">Blank %</div>
          <div className="px-3 py-2 w-20 text-center">Required</div>
          <div className="px-2 py-2 w-24">Flags</div>
          <div className="px-3 py-2 w-28">Options</div>
        </div>
      )}

      {/* ── Field Rows ── */}
      <div className="flex-1 overflow-y-auto min-h-0 flex flex-col">
        {fields.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center select-none py-20 px-6">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-24 h-24 rounded-3xl bg-white/5 border-2 border-dashed border-white/10 flex items-center justify-center mb-6 group-hover:border-blue-500/50 transition-colors"
            >
              <Plus className="w-10 h-10 text-white/20" />
            </motion.div>
            <h3 className="text-xl font-bold text-white/80">Canvas is empty</h3>
            <p className="text-sm text-white/40 mt-2 max-w-[280px]">
              Start building your schema by adding your first field or dragging from the library.
            </p>
            <button
              onClick={handleAddField}
              className="mt-8 px-6 py-2.5 bg-white/5 hover:bg-blue-600 border border-white/10 hover:border-blue-500 rounded-xl text-sm font-bold transition-all active:scale-95 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add First Field
            </button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={fields.map(f => f.id)}
              strategy={verticalListSortingStrategy}
            >
              {fields.map((field, index) => (
                <SortableFieldRow
                  key={field.id}
                  field={field}
                  index={index}
                  generators={generators}
                  onSelect={() => selectField(field.id)}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}

        {/* Add field row button at the bottom */}
        {fields.length > 0 && (
          <button
            onClick={handleAddField}
            className="w-full flex items-center gap-3 px-6 py-4 text-white/30 hover:text-white/60 hover:bg-white/[0.03] transition-all border-b border-white/5 text-xs font-semibold group sticky bottom-0 bg-[#0a0a0c]/80 backdrop-blur-md"
          >
            <div className="w-8 flex justify-center">
              <Plus className="w-4 h-4 text-blue-500/50 group-hover:text-blue-500 transition-colors" />
            </div>
            Add another field
          </button>
        )}
      </div>

      {/* ── Preview Data (collapsed table) ── */}
      <AnimatePresence>
        {Object.keys(previewData).length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/10 bg-white/[0.02] overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-3">
              <div className="flex items-center gap-2 text-xs font-bold text-white/40 uppercase tracking-widest">
                <CheckCircle2 className="w-3 h-3 text-green-400" />
                Live Preview
              </div>
              <div className="flex gap-2">
                {Object.keys(previewData).map(name => (
                  <span key={name} className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-blue-400 border border-white/5">{name}</span>
                ))}
              </div>
            </div>
            <div className="mx-6 mb-4 bg-black/50 rounded-xl font-mono text-[10px] overflow-x-auto border border-white/5 max-h-48">
              <pre className="text-blue-300 p-4">{JSON.stringify(previewData, null, 2)}</pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {semanticsTableId && (
          <SemanticsPanel 
            tableId={semanticsTableId} 
            onClose={() => setSemanticsTableId(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};
