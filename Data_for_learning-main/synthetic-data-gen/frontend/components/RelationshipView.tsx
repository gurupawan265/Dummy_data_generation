'use client';

import React from 'react';
import { useSchemaStore } from '@/store/schema';
import { Link2, Trash2, GitPullRequest, Plus, ChevronRight, Database } from 'lucide-react';

export const RelationshipView = () => {
  const { tables, relationships, removeRelationship, addRelationship } = useSchemaStore();

  if (tables.length < 2) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
        <GitPullRequest className="w-12 h-12 mb-4" />
        <p className="text-lg font-medium">Relationships</p>
        <p className="text-sm">Add at least two tables to define relationships.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#0a0a0c] text-white p-6 overflow-y-auto">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent flex items-center gap-2">
            <Database className="w-6 h-6 text-blue-500" />
            Data Relationships
          </h2>
          <p className="text-sm text-white/40 mt-1">Define and visualize how your tables connect.</p>
        </div>
      </div>

      {/* Relationship Builder */}
      <div className="mb-12 p-6 rounded-3xl bg-white/[0.03] border border-white/10 shadow-xl shadow-black/50">
        <h3 className="text-xs font-black text-white/40 uppercase tracking-widest mb-6 flex items-center gap-2">
          <Plus className="w-3.5 h-3.5" />
          Create New Relationship
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-white/40 uppercase">Parent Table</label>
            <select id="parent-table" className="w-full bg-[#18191f] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:ring-2 focus:ring-blue-500/50 outline-none">
                {tables.map(t => <option key={t.id} value={t.id} className="bg-[#18191f] text-white py-2">{t.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-white/40 uppercase">Child Table</label>
            <select id="child-table" className="w-full bg-[#18191f] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:ring-2 focus:ring-blue-500/50 outline-none">
                {tables.map(t => <option key={t.id} value={t.id} className="bg-[#18191f] text-white py-2">{t.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-white/40 uppercase">Relationship</label>
            <div className="h-10 flex items-center justify-center text-white/20">
                <ChevronRight className="w-5 h-5" />
            </div>
          </div>
          <button 
            onClick={() => {
                const parentId = (document.getElementById('parent-table') as HTMLSelectElement).value;
                const childId = (document.getElementById('child-table') as HTMLSelectElement).value;
                if (parentId === childId) return;
                
                const parent = tables.find(t => t.id === parentId);
                const child = tables.find(t => t.id === childId);
                
                // For now, assume common pattern: parent.id -> child.parent_name_id
                addRelationship({
                    parentTableId: parentId,
                    parentPk: 'id',
                    childTableId: childId,
                    childFk: `${parent?.name.toLowerCase()}_id`,
                    type: 'one-to-many'
                });
            }}
            className="h-10 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2"
          >
            <Link2 className="w-4 h-4" />
            Connect
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Relationship List */}
        <div className="space-y-4 lg:col-span-2">
          <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-4">Active Connections</h3>
          {relationships.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white/5 border border-dashed border-white/10 text-center text-white/20 text-sm flex flex-col items-center gap-3">
              <Link2 className="w-8 h-8 opacity-50" />
              No relationships defined yet.
            </div>
          ) : (
            relationships.map(rel => {
              const parent = tables.find(t => t.id === rel.parentTableId);
              const child = tables.find(t => t.id === rel.childTableId);
              return (
                <div key={rel.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl group hover:border-blue-500/30 hover:bg-white/10 transition-all shadow-lg shadow-black/20">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl">
                      <Link2 className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-sm font-bold">
                        <span className="text-white">{parent?.name || 'Unknown'}</span>
                        <ChevronRight className="w-4 h-4 text-white/20" />
                        <span className="text-white">{child?.name || 'Unknown'}</span>
                      </div>
                      <div className="text-xs text-white/40 font-mono mt-1 bg-black/40 inline-block px-2 py-0.5 rounded-md">
                        {rel.parentPk} → {rel.childFk}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeRelationship(rel.id)}
                    className="p-2 hover:bg-red-500/20 rounded-xl text-white/20 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Visual Diagram */}
        <div className="relative lg:col-span-3 min-h-[500px] bg-gradient-to-b from-white/[0.02] to-transparent border border-white/5 rounded-3xl overflow-hidden p-8 flex items-center justify-center shadow-2xl shadow-black/40">
            <svg className="w-full h-full" viewBox="0 0 500 500">
                <defs>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <linearGradient id="boxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#1e1b4b" />
                        <stop offset="100%" stopColor="#0f172a" />
                    </linearGradient>
                    <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8" />
                    </linearGradient>
                </defs>
                
                {relationships.map((rel, i) => {
                    const parentIdx = tables.findIndex(t => t.id === rel.parentTableId);
                    const childIdx = tables.findIndex(t => t.id === rel.childTableId);
                    if (parentIdx === -1 || childIdx === -1) return null;

                    const px = 50 + (parentIdx % 2) * 250 + 140; // Right edge of parent
                    const py = 50 + Math.floor(parentIdx / 2) * 120 + 40; // Center Y of parent
                    const cx = 50 + (childIdx % 2) * 250; // Left edge of child
                    const cy = 50 + Math.floor(childIdx / 2) * 120 + 40; // Center Y of child

                    // Draw smooth bezier curve
                    return (
                        <g key={rel.id}>
                            <path 
                                d={`M ${px} ${py} C ${px + 40} ${py}, ${cx - 40} ${cy}, ${cx} ${cy}`} 
                                stroke="url(#lineGrad)" 
                                strokeWidth="3" 
                                fill="none"
                                filter="url(#glow)"
                            />
                            <circle cx={px} cy={py} r="4" fill="#3b82f6" filter="url(#glow)" />
                            <circle cx={cx} cy={cy} r="4" fill="#8b5cf6" filter="url(#glow)" />
                        </g>
                    );
                })}

                {tables.map((table, i) => {
                    const x = 50 + (i % 2) * 250;
                    const y = 50 + Math.floor(i / 2) * 120;
                    return (
                        <g key={table.id} className="transition-all hover:opacity-90 cursor-pointer">
                            {/* Card Background */}
                            <rect x={x} y={y} width="140" height="80" rx="16" fill="url(#boxGrad)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                            {/* Card Header Background */}
                            <path d={`M ${x} ${y+16} a 16 16 0 0 1 16 -16 h 108 a 16 16 0 0 1 16 16 v 16 h -140 v -16 z`} fill="rgba(59,130,246,0.15)" />
                            <path d={`M ${x} ${y+32} h 140`} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                            {/* Table Name */}
                            <text x={x + 70} y={y + 21} textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold" className="drop-shadow-lg">{table.name}</text>
                            {/* Fields Count */}
                            <text x={x + 70} y={y + 55} textAnchor="middle" fill="#9ca3af" fontSize="10">{table.fields.length} Field{table.fields.length !== 1 ? 's' : ''}</text>
                        </g>
                    );
                })}
            </svg>
        </div>
      </div>
    </div>
  );
};
