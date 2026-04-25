import { create } from 'zustand';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

export type FieldType = string;

export interface FieldConfig {
  id: string;
  name: string;
  type: FieldType;
  required: boolean;
  nullable: boolean;
  unique?: boolean;
  prefix?: string;
  suffix?: string;
  subtype?: string;
  default?: any;
  distribution?: {
    type: string;
    params: Record<string, any>;
  };
  noise?: {
    type: string;
    intensity: number;
  };
  missing_data?: {
    type: string;
    percentage: number;
    block_size_range: [number, number];
    condition?: string;
    target_value_range?: [number, number];
  };
  validation?: {
    rules: any[];
    custom_logic?: string;
  };
  config: Record<string, any>;
}

export interface TableConfig {
  id: string;
  name: string;
  fields: FieldConfig[];
  constraints?: any[];
  correlations?: any[];
}

export interface Relationship {
  id: string;
  parentTableId: string;
  parentPk: string;
  childTableId: string;
  childFk: string;
  type: 'one-to-many';
}

interface ValidationResult {
  is_valid: boolean;
  errors: string[];
}

interface SchemaStore {
  tables: TableConfig[];
  activeTableId: string;
  relationships: Relationship[];
  selectedFieldId: string | null;
  previewData: Record<string, any[]>;
  isLoading: boolean;
  generators: Record<string, any>;
  
  // Table Actions
  addTable: (name?: string) => void;
  removeTable: (id: string) => void;
  updateTable: (id: string, updates: Partial<TableConfig>) => void;
  setActiveTable: (id: string) => void;
  setTables: (tables: TableConfig[]) => void;

  // Field Actions (Scoped to active table)
  fetchGenerators: () => Promise<void>;
  addField: (type: FieldType) => void;
  removeField: (id: string) => void;
  updateField: (id: string, updates: Partial<FieldConfig>) => void;
  reorderFields: (activeId: string, overId: string) => void;
  duplicateField: (id: string) => void;
  selectField: (id: string | null) => void;
  
  // Relationship Actions
  addRelationship: (rel: Omit<Relationship, 'id'>) => void;
  removeRelationship: (id: string) => void;

  // Schema Management
  saveSchema: (name: string) => void;
  loadSavedSchema: (name: string) => void;
  listSavedSchemas: () => string[];
  exportSchema: () => void;
  importSchema: (json: string) => void;
  loadTemplate: (templateId: string) => Promise<void>;

  // Validation & Generation
  validateSchema: () => Promise<ValidationResult>;
  aiGenerateSchema: (prompt: string) => Promise<void>;
  generateSampleRow: (count?: number) => Promise<void>;
  exportData: (format: string) => Promise<void>;
  loadScenario: (scenario: any) => void;
  updateTableSemantics: (tableId: string, semantics: { constraints: any[], correlations: any[] }) => void;
  suggestDistribution: (fieldId: string) => Promise<any>;
  suggestRelationships: (tableId: string) => Promise<any>;
  validateConstraints: (tableId: string) => Promise<any>;
  suggestNoise: (tableId: string, level: number) => Promise<any>;
  suggestMissingStrategy: (tableId: string, percentage: number) => Promise<any>;
  suggestImbalanceStrategy: (tableId: string, targetColumn: string, currentDist: any, ratio: number) => Promise<any>;
  resampleData: (tableId: string, targetColumn: string, ratioMap: any) => Promise<void>;
  suggestScenarioSchema: (scenarioName: string) => Promise<any>;
  suggestSemantics: (tableId: string) => Promise<void>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const useSchemaStore = create<SchemaStore>((set, get) => ({
  tables: [{ id: 'default', name: 'Users', fields: [] }],
  activeTableId: 'default',
  relationships: [],
  selectedFieldId: null,
  previewData: {},
  isLoading: false,
  generators: {},

  fetchGenerators: async () => {
    try {
      const response = await axios.get(`${API_URL}/generators`);
      set({ generators: response.data });
    } catch (error) {
      console.error('Failed to fetch generators', error);
    }
  },

  addTable: (name) => {
    const newId = uuidv4();
    set((state) => ({
      tables: [...state.tables, { id: newId, name: name || `Table_${state.tables.length + 1}`, fields: [] }],
      activeTableId: newId
    }));
  },

  removeTable: (id) => set((state) => {
    if (state.tables.length <= 1) return state;
    const newTables = state.tables.filter(t => t.id !== id);
    return {
      tables: newTables,
      activeTableId: state.activeTableId === id ? newTables[0].id : state.activeTableId,
      relationships: state.relationships.filter(r => r.parentTableId !== id && r.childTableId !== id)
    };
  }),

  updateTable: (id, updates) => set((state) => ({
    tables: state.tables.map(t => t.id === id ? { ...t, ...updates } : t)
  })),

  setActiveTable: (id) => set({ activeTableId: id, selectedFieldId: null }),
  setTables: (tables) => set({ tables }),

  addField: (type) => {
    const { generators, activeTableId, tables } = get();
    const gen = generators[type];
    const activeTable = tables.find(t => t.id === activeTableId);
    if (!activeTable) return;

    const newField: FieldConfig = {
      id: uuidv4(),
      name: `${type}_${activeTable.fields.length + 1}`,
      type,
      required: true,
      nullable: false,
      config: Object.keys(gen?.config_schema || {}).reduce((acc, key) => {
        acc[key] = gen.config_schema[key].default;
        return acc;
      }, {} as any),
    };

    set((state) => ({ 
      tables: state.tables.map(t => t.id === activeTableId ? { ...t, fields: [...t.fields, newField] } : t),
      selectedFieldId: newField.id 
    }));
  },

  removeField: (id) => set((state) => ({
    tables: state.tables.map(t => t.id === state.activeTableId ? { ...t, fields: t.fields.filter(f => f.id !== id) } : t),
    selectedFieldId: state.selectedFieldId === id ? null : state.selectedFieldId
  })),

  updateField: (id, updates) => set((state) => ({
    tables: state.tables.map(t => t.id === state.activeTableId ? { ...t, fields: t.fields.map(f => f.id === id ? { ...f, ...updates } : f) } : t)
  })),

  reorderFields: (activeId, overId) => set((state) => {
    const activeTable = state.tables.find(t => t.id === state.activeTableId);
    if (!activeTable) return state;

    const oldIndex = activeTable.fields.findIndex((f) => f.id === activeId);
    const newIndex = activeTable.fields.findIndex((f) => f.id === overId);
    
    if (oldIndex !== -1 && newIndex !== -1) {
      const newFields = [...activeTable.fields];
      const [moved] = newFields.splice(oldIndex, 1);
      newFields.splice(newIndex, 0, moved);
      
      return { 
        tables: state.tables.map(t => t.id === state.activeTableId ? { ...t, fields: newFields } : t)
      };
    }
    return state;
  }),

  duplicateField: (id) => set((state) => {
    const activeTable = state.tables.find(t => t.id === state.activeTableId);
    if (!activeTable) return state;
    const field = activeTable.fields.find((f) => f.id === id);
    if (!field) return state;
    const newField = { ...field, id: uuidv4(), name: `${field.name}_copy` };
    
    return { 
      tables: state.tables.map(t => t.id === state.activeTableId ? { ...t, fields: [...t.fields, newField] } : t)
    };
  }),

  selectField: (id) => set({ selectedFieldId: id }),

  addRelationship: (rel) => set((state) => ({
    relationships: [...state.relationships, { ...rel, id: uuidv4() }]
  })),

  removeRelationship: (id) => set((state) => ({
    relationships: state.relationships.filter(r => r.id !== id)
  })),

  saveSchema: (name) => {
    const { tables, relationships } = get();
    const saved = JSON.parse(localStorage.getItem('synthetic_schemas') || '{}');
    saved[name] = { tables, relationships };
    localStorage.setItem('synthetic_schemas', JSON.stringify(saved));
  },

  loadSavedSchema: (name) => {
    const saved = JSON.parse(localStorage.getItem('synthetic_schemas') || '{}');
    const schema = saved[name];
    if (schema) {
      set({ 
        tables: schema.tables, 
        relationships: schema.relationships,
        activeTableId: schema.tables[0].id,
        selectedFieldId: null 
      });
    }
  },

  listSavedSchemas: () => {
    const saved = JSON.parse(localStorage.getItem('synthetic_schemas') || '{}');
    return Object.keys(saved);
  },

  exportSchema: () => {
    const { tables, relationships } = get();
    const data = JSON.stringify({ tables, relationships }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `schema_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  },

  importSchema: (json) => {
    try {
      const schema = JSON.parse(json);
      if (schema.tables && Array.isArray(schema.tables)) {
        set({ 
          tables: schema.tables, 
          relationships: schema.relationships || [],
          activeTableId: schema.tables[0].id,
          selectedFieldId: null
        });
      }
    } catch (e) {
      console.error('Failed to import schema', e);
    }
  },

  loadTemplate: async (templateId) => {
    try {
      const response = await axios.get(`${API_URL}/templates`);
      const template = response.data.find((t: any) => t.id === templateId);
      if (template) {
        set({ 
          tables: template.schema_data.tables, 
          relationships: template.schema_data.relationships.map((r: any) => ({
            ...r,
            parentTableId: r.parent_table,
            childTableId: r.child_table,
            type: 'one-to-many'
          })),
          activeTableId: template.schema_data.tables[0].id,
          selectedFieldId: null
        });
      }
    } catch (error) {
      console.error('Failed to load template', error);
    }
  },

  validateSchema: async () => {
    try {
      const response = await axios.post(`${API_URL}/schema/validate`, { 
        tables: get().tables,
        relationships: get().relationships
      });
      return response.data;
    } catch (error) {
      return { is_valid: false, errors: ['Network error'] };
    }
  },

  aiGenerateSchema: async (prompt: string) => {
    set({ isLoading: true });
    try {
      const response = await axios.post(`${API_URL}/ai/generate-schema`, { prompt });
      const schema = response.data;
      
      if (schema.tables) {
        set({
          tables: schema.tables,
          relationships: (schema.relationships || []).map((r: any) => ({
            ...r,
            parentTableId: r.parent_table,
            childTableId: r.child_table
          })),
          activeTableId: schema.tables[0].id,
          selectedFieldId: null,
          isLoading: false
        });
      }
    } catch (error) {
      console.error('AI Schema generation failed', error);
      set({ isLoading: false });
    }
  },

  generateSampleRow: async (count: number = 25) => {
    set({ isLoading: true });
    try {
      const response = await axios.post(`${API_URL}/generate/multi`, { 
        tables: get().tables,
        relationships: get().relationships,
        row_counts: get().tables.reduce((acc, t) => ({ ...acc, [t.id]: count }), {})
      });
      set({ previewData: response.data, isLoading: false });
    } catch (error) {
      console.error('Preview failed', error);
      set({ isLoading: false });
    }
  },

  exportData: async (format: string) => {
    try {
      const isMulti = get().tables.length > 1;
      const endpoint = isMulti ? `${API_URL}/export/multi/${format}` : `${API_URL}/export/${format}`;
      
      const payload = isMulti ? {
        tables: get().tables,
        relationships: get().relationships,
        row_counts: get().tables.reduce((acc, t) => ({ ...acc, [t.id]: 100 }), {})
      } : {
        fields: get().tables[0].fields,
        row_count: 100
      };

      const response = await axios.post(endpoint, payload, { responseType: 'blob' });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `generated_data.${isMulti && format === 'csv' ? 'zip' : format}`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Export failed', error);
    }
  },

  loadScenario: (scenario: any) => {
    set({
      tables: scenario.schema.tables,
      relationships: scenario.schema.relationships || [],
      activeTableId: scenario.schema.tables[0]?.id || '',
      previewData: {},
      selectedFieldId: null
    });
  },

  updateTableSemantics: (tableId, semantics) => {
    set((state) => ({
      tables: state.tables.map(t => 
        t.id === tableId 
          ? { ...t, constraints: semantics.constraints, correlations: semantics.correlations }
          : t
      )
    }));
  },

  suggestSemantics: async (tableId) => {
    const table = get().tables.find(t => t.id === tableId);
    if (!table) return;

    try {
      const response = await axios.post(`${API_URL}/ai/suggest-semantics`, {
        schema_def: table
      });
      get().updateTableSemantics(tableId, response.data);
    } catch (error) {
      console.error('Failed to suggest semantics', error);
    }
  },

  suggestDistribution: async (fieldId) => {
    const table = get().tables.find(t => t.id === get().activeTableId);
    if (!table) return;
    const field = table.fields.find(f => f.id === fieldId);
    if (!field) return;

    try {
      const response = await axios.post(`${API_URL}/ai/suggest-distribution`, {
        column_definition: field
      });
      return response.data;
    } catch (error) {
      console.error('Failed to suggest distribution', error);
      return null;
    }
  },

  suggestRelationships: async (tableId) => {
    const table = get().tables.find(t => t.id === tableId);
    if (!table) return;

    try {
      const response = await axios.post(`${API_URL}/ai/suggest-relationships`, {
        columns_list: table.fields
      });
      return response.data;
    } catch (error) {
      console.error('Failed to suggest relationships', error);
      return null;
    }
  },

  validateConstraints: async (tableId) => {
    const table = get().tables.find(t => t.id === tableId);
    if (!table) return;

    try {
      const response = await axios.post(`${API_URL}/ai/validate-constraints`, {
        schema: table.fields,
        constraints: table.constraints || []
      });
      return response.data;
    } catch (error) {
      console.error('Failed to validate constraints', error);
      return null;
    }
  },

  suggestNoise: async (tableId, level) => {
    const table = get().tables.find(t => t.id === tableId);
    if (!table) return;

    try {
      const response = await axios.post(`${API_URL}/ai/suggest-noise`, {
        schema: table.fields,
        global_noise_level: level
      });
      return response.data;
    } catch (error) {
      console.error('Failed to suggest noise', error);
      return null;
    }
  },

  suggestMissingStrategy: async (tableId, percentage) => {
    const table = get().tables.find(t => t.id === tableId);
    if (!table) return;

    try {
      const response = await axios.post(`${API_URL}/ai/suggest-missing-strategy`, {
        schema_def: table.fields,
        missing_percentage: percentage
      });
      return response.data;
    } catch (error) {
      console.error('Failed to suggest missing strategy', error);
      return null;
    }
  },

  suggestImbalanceStrategy: async (tableId, targetColumn, currentDist, ratio) => {
    const table = get().tables.find(t => t.id === tableId);
    if (!table) return;

    try {
      const response = await axios.post(`${API_URL}/ai/suggest-imbalance-strategy`, {
        schema_def: table.fields,
        target_column: targetColumn,
        current_distribution: currentDist,
        desired_ratio: ratio
      });
      return response.data;
    } catch (error) {
      console.error('Failed to suggest imbalance strategy', error);
      return null;
    }
  },

  resampleData: async (tableId, targetColumn, ratioMap) => {
    const { previewData } = get();
    const table = get().tables.find(t => t.id === tableId);
    if (!table || !previewData) return;

    const data = (previewData as any).data[table.name];
    if (!data) return;

    try {
      const response = await axios.post(`${API_URL}/ai/resample`, {
        data: data,
        target_column: targetColumn,
        ratio_map: ratioMap
      });
      
      set((state) => ({
        previewData: {
          ...state.previewData,
          data: {
            ...(state.previewData as any).data,
            [table.name]: response.data.data
          }
        }
      }));
    } catch (error) {
      console.error('Failed to resample data', error);
    }
  },

  suggestScenarioSchema: async (scenarioName) => {
    try {
      const response = await axios.post(`${API_URL}/ai/suggest-scenario-schema`, {
        scenario_name: scenarioName
      });
      return response.data;
    } catch (error) {
      console.error('Failed to suggest scenario schema', error);
      return null;
    }
  }
}));
