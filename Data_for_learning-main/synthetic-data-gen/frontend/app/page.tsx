'use client';

import React, { useState, useEffect } from 'react';
import { useSchemaStore } from '@/store/schema';
import { CanvasPanel } from '@/components/CanvasPanel';
import { ConfigPanel } from '@/components/ConfigPanel';
import { RelationshipView } from '@/components/RelationshipView';
import { ExportModal } from '@/components/ExportModal';
import { TemplateSelector } from '@/components/TemplateSelector';
import { DatasetPlayground } from '@/components/DatasetPlayground';
import { ExperimentMode } from '@/components/ExperimentMode';
import {
  Settings,
  Download,
  Share2,
  LayoutDashboard,
  Boxes,
  Zap,
  BarChart2,
  FlaskConical,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardPage() {
  const [view, setView] = useState<'schema' | 'relationships' | 'playground' | 'experiment'>('schema');
  const [showTemplates, setShowTemplates] = useState(true);
  const [showExport, setShowExport] = useState(false);
  const { fetchGenerators } = useSchemaStore();

  useEffect(() => {
    fetchGenerators();
  }, [fetchGenerators]);

  if (showTemplates) {
    return (
      <main className="min-h-screen bg-[#050505] text-white">
        <nav className="p-6 flex justify-between items-center border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter">SyntheticEngine</span>
          </div>
          <button className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40">
            <Share2 className="w-5 h-5" />
          </button>
        </nav>
        <TemplateSelector onSelect={() => setShowTemplates(false)} />
      </main>
    );
  }

  return (
    <main className="h-screen bg-[#050505] text-white flex flex-col overflow-hidden">
      {/* ── Top Header ── */}
      <nav className="h-16 px-6 border-b border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-xl z-50">
        <div className="flex items-center gap-8">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setShowTemplates(true)}
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-black tracking-tighter text-lg">SyntheticEngine</span>
          </div>

          <div className="flex items-center bg-white/5 rounded-xl p-1 border border-white/10">
            <button
              onClick={() => setView('schema')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                view === 'schema'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Canvas
            </button>
            <button
              onClick={() => setView('relationships')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                view === 'relationships'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              <Boxes className="w-3.5 h-3.5" />
              Graph View
            </button>
            <button
              onClick={() => setView('playground')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                view === 'playground'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              Playground
            </button>
            <button
              onClick={() => setView('experiment')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                view === 'experiment'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              Experiment
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <SaveLoadMenu />
          <button
            onClick={() => setShowExport(true)}
            className="flex items-center gap-2 px-6 py-2 bg-white text-black rounded-full text-xs font-black hover:bg-white/90 transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            Export Dataset
          </button>
          <div className="w-px h-4 bg-white/10 mx-2" />
          <button className="p-2 hover:bg-white/5 rounded-xl transition-colors text-white/40">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* ── Main Workspace ── */}
      <div className="flex-1 flex overflow-hidden">
        <AnimatePresence mode="wait">
          {view === 'schema' ? (
            <motion.div
              key="schema"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex-1 flex overflow-hidden"
            >
              <section className="flex-1 overflow-hidden">
                <CanvasPanel />
              </section>
              <AdvancedConfigPanel />
            </motion.div>
          ) : view === 'relationships' ? (
            <motion.div
              key="relationships"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex-1"
            >
              <RelationshipView />
            </motion.div>
          ) : view === 'playground' ? (
            <motion.div
              key="playground"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex-1 overflow-hidden"
            >
              <DatasetPlayground />
            </motion.div>
          ) : (
            <motion.div
              key="experiment"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 overflow-hidden"
            >
              <ExperimentMode />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ExportModal isOpen={showExport} onClose={() => setShowExport(false)} />
    </main>
  );
}

import { Save, FolderOpen } from 'lucide-react';

function SaveLoadMenu() {
  const { saveSchema, loadSavedSchema, listSavedSchemas } = useSchemaStore();
  const [open, setOpen] = useState(false);
  const [schemas, setSchemas] = useState<string[]>([]);
  const [saveName, setSaveName] = useState('');
  const menuRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => {
    setSchemas(listSavedSchemas());
    setOpen(!open);
  };

  const handleSave = () => {
    if (saveName.trim()) {
      saveSchema(saveName);
      setSchemas(listSavedSchemas());
      setSaveName('');
    }
  };

  return (
    <div ref={menuRef} className="relative z-50">
      <button onClick={handleOpen} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-full text-xs font-bold transition-all border border-white/10">
        <Save className="w-3.5 h-3.5" />
        Save / Load
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full right-0 mt-2 w-64 bg-[#18191f] border border-white/10 rounded-xl shadow-2xl p-4"
          >
            <div className="mb-4">
              <label className="text-[10px] font-bold text-white/40 uppercase mb-2 block">Save Current Schema</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={saveName}
                  onChange={e => setSaveName(e.target.value)}
                  placeholder="e.g. E-commerce v1"
                  className="flex-1 bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-blue-500/50"
                  onKeyDown={e => e.key === 'Enter' && handleSave()}
                />
                <button 
                  onClick={handleSave} 
                  disabled={!saveName.trim()}
                  className="bg-blue-600 px-3 rounded-lg text-xs font-bold text-white hover:bg-blue-500 disabled:opacity-50 transition-all"
                >
                  Save
                </button>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase mb-2 block">Load Saved Schema</label>
              {schemas.length === 0 ? (
                <div className="text-xs text-white/30 italic py-2">No saved schemas yet</div>
              ) : (
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {schemas.map(s => (
                    <button 
                      key={s} 
                      onClick={() => { loadSavedSchema(s); setOpen(false); }}
                      className="w-full text-left px-3 py-2 hover:bg-white/5 rounded-lg text-xs text-white transition-all flex items-center gap-2"
                    >
                      <FolderOpen className="w-3 h-3 text-blue-400" />
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Slide-in advanced config panel.
 * Appears from the right only when a field is selected (via the ⚙ "All options →" in the row).
 */
function AdvancedConfigPanel() {
  const { selectedFieldId } = useSchemaStore();
  const isOpen = !!selectedFieldId;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          key="config-panel"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 380, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          className="flex-shrink-0 overflow-hidden border-l border-white/10"
        >
          <div className="w-[380px] h-full">
            <ConfigPanel />
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
