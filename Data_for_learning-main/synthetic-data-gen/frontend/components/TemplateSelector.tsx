'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSchemaStore } from '@/store/schema';
import { ShoppingCart, GraduationCap, Cpu, Plus, Check, Search, FlaskConical, BookOpen, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const iconMap: any = {
  'shopping-cart': ShoppingCart,
  'graduation-cap': GraduationCap,
  'cpu': Cpu,
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const TemplateSelector = ({ onSelect }: { onSelect: () => void }) => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'templates' | 'scenarios'>('templates');
  const [searchTerm, setSearchTerm] = useState('');
  const loadTemplate = useSchemaStore((state) => state.loadTemplate);
  const loadScenario = useSchemaStore((state) => state.loadScenario);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [templatesRes, scenariosRes] = await Promise.all([
          axios.get(`${API_URL}/templates`),
          axios.get(`${API_URL}/scenarios`)
        ]);
        setTemplates(templatesRes.data);
        setScenarios(scenariosRes.data);
      } catch (error) {
        console.error('Failed to fetch templates or scenarios', error);
      }
    };
    fetchData();
  }, []);

  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredScenarios = scenarios.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-12 text-center">
        <h2 className="text-5xl font-black bg-gradient-to-r from-white via-white to-white/20 bg-clip-text text-transparent mb-4 tracking-tighter">
          Choose your starting point
        </h2>
        <p className="text-white/40 max-w-xl mx-auto text-lg">
          Bootstrap with industry templates or dive into interactive learning scenarios to master data engineering.
        </p>
      </div>

      <div className="flex justify-center mb-12">
        <div className="bg-white/5 p-1.5 rounded-2xl border border-white/10 flex gap-2">
          <button 
            onClick={() => setActiveTab('templates')}
            className={`px-8 py-3 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${
              activeTab === 'templates' ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'text-white/40 hover:text-white/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            Industry Templates
          </button>
          <button 
            onClick={() => setActiveTab('scenarios')}
            className={`px-8 py-3 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${
              activeTab === 'scenarios' ? 'bg-purple-600 text-white shadow-xl shadow-purple-500/20' : 'text-white/40 hover:text-white/60'
            }`}
          >
            <FlaskConical className="w-4 h-4" />
            Learning Scenarios
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-12 max-w-md mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <input 
            type="text" 
            placeholder="Search scenarios..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white"
          />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {activeTab === 'templates' && (
            <>
              {/* Blank Slate Card */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group relative h-72 rounded-[2.5rem] bg-blue-600 p-8 cursor-pointer overflow-hidden shadow-2xl shadow-blue-500/20"
                onClick={() => onSelect()}
              >
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Plus className="w-32 h-32" />
                </div>
                <div className="relative h-full flex flex-col justify-between">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Blank Canvas</h3>
                    <p className="text-white/60 text-sm leading-relaxed">Start from scratch and build your custom data schema with precision.</p>
                  </div>
                </div>
              </motion.div>

              {filteredTemplates.map((template) => {
                const Icon = iconMap[template.icon] || ShoppingCart;
                return (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="group relative h-72 rounded-[2.5rem] bg-white/[0.03] border border-white/10 p-8 cursor-pointer overflow-hidden backdrop-blur-xl hover:border-blue-500/50 transition-all"
                    onClick={async () => {
                      await loadTemplate(template.id);
                      onSelect();
                    }}
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Icon className="w-32 h-32" />
                    </div>
                    <div className="relative h-full flex flex-col justify-between">
                      <div className="w-12 h-12 bg-white/5 group-hover:bg-blue-600/20 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-blue-500/50 transition-all">
                        <Icon className="w-6 h-6 text-white/40 group-hover:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-2">{template.name}</h3>
                        <p className="text-white/40 text-sm leading-relaxed">{template.description}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </>
          )}

          {activeTab === 'scenarios' && (
            <>
              {filteredScenarios.map((scenario) => (
                <motion.div
                  key={scenario.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="group relative h-72 rounded-[2.5rem] bg-purple-600/5 border border-purple-500/20 p-8 cursor-pointer overflow-hidden backdrop-blur-xl hover:border-purple-500/50 transition-all"
                  onClick={() => {
                    loadScenario(scenario);
                    onSelect();
                  }}
                >
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <FlaskConical className="w-32 h-32 text-purple-500" />
                  </div>
                  <div className="relative h-full flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div className="w-12 h-12 bg-purple-600/20 rounded-2xl flex items-center justify-center border border-purple-500/30">
                        <FlaskConical className="w-6 h-6 text-purple-400" />
                      </div>
                      <span className="px-3 py-1 bg-purple-600/20 border border-purple-500/30 rounded-full text-[10px] font-black uppercase tracking-widest text-purple-400">
                        {scenario.difficulty}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1 block">{scenario.subtitle}</span>
                      <h3 className="text-2xl font-bold text-white mb-2">{scenario.title}</h3>
                      <p className="text-white/40 text-sm leading-relaxed line-clamp-2">{scenario.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
