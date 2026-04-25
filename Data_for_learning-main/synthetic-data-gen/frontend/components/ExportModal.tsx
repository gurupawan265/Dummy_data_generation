'use client';

import React, { useState } from 'react';
import { useSchemaStore } from '@/store/schema';
import { Download, X, FileType, FileJson, FileSpreadsheet, Terminal, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ExportModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [format, setFormat] = useState<'csv' | 'json' | 'excel' | 'sql'>('csv');
  const [options, setOptions] = useState({
    delimiter: ',',
    quoteChar: '"',
    includeHeaders: true,
  });
  
  const { exportData, tables, isLoading } = useSchemaStore();
  const hasFields = tables.some(t => t.fields.length > 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-zinc-900 border border-white/10 rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl"
      >
        <div className="p-8 border-b border-white/5 flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold">Export your data</h3>
            <p className="text-sm text-white/40">Select your preferred format and configuration.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X className="w-6 h-6 text-white/40" />
          </button>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { id: 'csv', icon: FileType, label: 'CSV' },
              { id: 'json', icon: FileJson, label: 'JSON' },
              { id: 'excel', icon: FileSpreadsheet, label: 'Excel' },
              { id: 'sql', icon: Terminal, label: 'SQL' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFormat(f.id as any)}
                className={`flex flex-col items-center gap-3 p-6 rounded-3xl border transition-all ${
                  format === f.id 
                  ? 'bg-blue-600 border-blue-500 shadow-lg shadow-blue-500/20' 
                  : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <f.icon className={`w-8 h-8 ${format === f.id ? 'text-white' : 'text-white/40'}`} />
                <span className={`text-xs font-bold uppercase tracking-widest ${format === f.id ? 'text-white' : 'text-white/40'}`}>
                  {f.label}
                </span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div 
              key={format}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-6">
                <div className="flex items-center gap-2 mb-2">
                    <Settings2 className="w-4 h-4 text-blue-400" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-white/60">Format Options</h4>
                </div>

                {format === 'csv' && (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/40 uppercase">Delimiter</label>
                      <select 
                        value={options.delimiter}
                        onChange={(e) => setOptions({...options, delimiter: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none appearance-none"
                      >
                        <option value=",">Comma (,)</option>
                        <option value=";">Semicolon (;)</option>
                        <option value="\t">Tab (\t)</option>
                        <option value="|">Pipe (|)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/40 uppercase">Quote Character</label>
                      <select 
                        value={options.quoteChar}
                        onChange={(e) => setOptions({...options, quoteChar: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none appearance-none"
                      >
                        <option value='"'>Double Quote (")</option>
                        <option value="'">Single Quote (')</option>
                        <option value="">None</option>
                      </select>
                    </div>
                  </div>
                )}

                {format === 'excel' && (
                  <p className="text-xs text-white/40">Multi-table schemas will be exported as separate sheets in a single .xlsx file.</p>
                )}

                {format === 'sql' && (
                  <p className="text-xs text-white/40">Generates standard INSERT statements for all rows across all tables.</p>
                )}

                {format === 'json' && (
                  <p className="text-xs text-white/40">Pretty-printed nested JSON object with keys as table names.</p>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="p-8 bg-black/40 flex justify-end gap-4">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-full text-xs font-bold text-white/40 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              exportData(format);
              onClose();
            }}
            disabled={!hasFields || isLoading}
            className="px-10 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-20 rounded-full text-xs font-bold text-white flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-500/20"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Download Data
          </button>
        </div>
      </motion.div>
    </div>
  );
};
