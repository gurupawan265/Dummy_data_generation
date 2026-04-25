'use client';

import React, { useState } from 'react';
import { useSchemaStore } from '@/store/schema';
import { Search, User, Hash, Calendar, Type, MapPin, Fingerprint, ListFilter, Plus, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  { id: 'personal', name: 'Personal', icon: User, types: ['name', 'email', 'phone', 'address', 'ssn'] },
  { id: 'numeric', name: 'Numeric', icon: Hash, types: ['integer', 'float', 'currency', 'percentage', 'increment', 'random_choice'] },
  { id: 'datetime', name: 'Date/Time', icon: Calendar, types: ['date', 'datetime', 'timestamp', 'time', 'date_between'] },
  { id: 'text', name: 'Text', icon: Type, types: ['sentence', 'paragraph', 'lorem_ipsum', 'word', 'text_pattern'] },
  { id: 'location', name: 'Location', icon: MapPin, types: ['city', 'state', 'country', 'zip_code', 'coordinates'] },
  { id: 'identifiers', name: 'Identifiers', icon: Fingerprint, types: ['uuid', 'nanoid', 'auto_increment'] },
  { id: 'categorical', name: 'Categorical', icon: ListFilter, types: ['boolean', 'enum'] },
  { id: 'advanced', name: 'Calculated', icon: Plus, types: ['formula'] },
];

export const LibraryPanel = () => {
  const [search, setSearch] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const addField = useSchemaStore((state) => state.addField);
  const generators = useSchemaStore((state) => state.generators);
  const aiGenerateSchema = useSchemaStore((state) => state.aiGenerateSchema);
  const isLoading = useSchemaStore((state) => state.isLoading);

  const filteredCategories = CATEGORIES.map(cat => ({
    ...cat,
    types: cat.types.filter(type => 
      type.toLowerCase().includes(search.toLowerCase()) || 
      cat.name.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(cat => cat.types.length > 0);

  return (
    <div className="h-full flex flex-col bg-white/5 backdrop-blur-xl border-r border-white/10 text-white select-none">
      <div className="p-4 border-b border-white/10">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Fingerprint className="text-blue-400" />
          Field Library
        </h2>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search field types..."
            className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* AI Prompt Section */}
        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            AI Schema Builder
          </div>
          <div className="relative">
            <textarea
              placeholder="Describe your dataset... (e.g. 'E-commerce store with users, orders and products')"
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all resize-none min-h-[80px]"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              disabled={isLoading}
            />
            <button
              onClick={() => {
                if (aiPrompt.trim()) aiGenerateSchema(aiPrompt);
              }}
              disabled={isLoading || !aiPrompt.trim()}
              className="mt-2 w-full flex items-center justify-center gap-2 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-xs font-bold transition-all"
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              {isLoading ? 'Generating...' : 'Generate with AI'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {filteredCategories.map((cat) => (
          <div key={cat.id}>
            <div className="flex items-center gap-2 text-white/40 text-xs font-bold uppercase tracking-wider mb-3">
              <cat.icon className="w-3 h-3" />
              {cat.name}
            </div>
            <div className="grid grid-cols-1 gap-2">
              {cat.types.map((type) => (
                <motion.button
                  key={type}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => addField(type)}
                  className="group flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all text-left"
                >
                  <span className="text-sm font-medium capitalize">{type.replace('_', ' ')}</span>
                  <Plus className="w-4 h-4 text-white/20 group-hover:text-blue-400 transition-colors" />
                </motion.button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
