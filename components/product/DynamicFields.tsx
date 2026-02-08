'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Tag, AlertCircle, Loader2, Box } from 'lucide-react';
import { Template } from '@/hooks/useTemplate'; // ✅ CORRIGÉ

interface DynamicFieldsProps {
  template: Template | null;
  values: Record<string, any>;
  onChange: (field: string, value: any) => void;
  onVariantsChange: (variants: any[]) => void;
  loading?: boolean;
}

export default function DynamicFields({ 
  template, 
  values, 
  onChange,
  onVariantsChange,
  loading 
}: DynamicFieldsProps) {
  
  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-10 h-10 mx-auto text-blue-500 animate-spin mb-3" />
        <p className="text-gray-400 text-sm">Chargement du formulaire...</p>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="text-center py-12 border border-dashed border-gray-700 rounded-xl bg-gray-900/50">
        <AlertCircle className="w-12 h-12 mx-auto text-gray-600 mb-3" />
        <p className="text-gray-400">Sélectionnez une catégorie à l'étape 1</p>
      </div>
    );
  }

  const requiredFields = template.attributes.filter(f => f.level === 1);
  const otherFields = template.attributes.filter(f => f.level > 1);
  
  const commonClasses = 'w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder:text-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all';

  const renderField = (field: any) => (
    <div key={field.code} className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-300">
        {field.label} {field.required && <span className="text-red-400">*</span>}
      </label>
      
      {field.type === 'select' ? (
        <select
          value={values[field.code] || ''}
          onChange={(e) => onChange(field.code, e.target.value)}
          className={commonClasses}
        >
          <option value="">Sélectionner...</option>
          {field.options?.map((opt: string) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      ) : field.type === 'radio' ? (
        <div className="flex gap-4 pt-1">
          {field.options?.map((opt: string) => (
            <label key={opt} className="flex items-center gap-2 text-gray-300 cursor-pointer">
              <input 
                type="radio" 
                name={field.code} 
                value={opt}
                checked={values[field.code] === opt}
                onChange={(e) => onChange(field.code, e.target.value)}
                className="text-blue-600 focus:ring-blue-500"
              />
              {opt}
            </label>
          ))}
        </div>
      ) : (
        <input
          type={field.type === 'number' ? 'number' : 'text'}
          value={values[field.code] || ''}
          onChange={(e) => onChange(field.code, e.target.value)}
          placeholder={`Ex: ${field.label}`}
          className={commonClasses}
        />
      )}
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-8"
    >
      
      <div className="flex items-center gap-3 pb-4 border-b border-gray-800">
        <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <Tag className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Fiche : {template.name}</h3>
          <p className="text-xs text-gray-400">Caractéristiques spécifiques</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {requiredFields.map(renderField)}
      </div>

      {template.has_variants && (
        <div className="bg-gray-800/40 p-5 rounded-xl border border-gray-700 space-y-4">
          <div className="flex items-center gap-2 text-white font-semibold">
            <Box className="w-5 h-5 text-purple-400" />
            <span>Gestion des Stocks & Variantes</span>
          </div>
          <p className="text-xs text-gray-500">
            Ajoutez les tailles et couleurs disponibles avec leurs stocks.
          </p>
          
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <p className="text-yellow-400 text-sm">
              ⚠️ VariantManager à implémenter - Pour l'instant, les variantes ne sont pas gérées
            </p>
          </div>
        </div>
      )}

      {otherFields.length > 0 && (
        <div className="pt-4 border-t border-gray-800">
          <details className="group">
            <summary className="flex cursor-pointer items-center text-sm text-gray-400 hover:text-white transition-colors">
              <span>Afficher les champs optionnels ({otherFields.length})</span>
              <span className="ml-2 transition-transform group-open:rotate-180">▼</span>
            </summary>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-5">
              {otherFields.map(renderField)}
            </div>
          </details>
        </div>
      )}

    </motion.div>
  );
}
