'use client';

import { useState, useEffect } from 'react';

export interface TemplateAttribute {
  code: string;
  label: string;
  type: 'text' | 'select' | 'number' | 'radio' | 'date';
  level: number;
  required: boolean;
  options?: string[];
}

export interface Template {
  code: string;
  name: string;
  has_variants: boolean;
  variant_config?: string[];
  attributes: TemplateAttribute[];
}

export function useTemplate(categoryId: number | null) {
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!categoryId) {
      setTemplate(null);
      return;
    }

    async function fetchTemplate() {
      setLoading(true);
      setError(null);
      
      try {
        const res = await fetch(`/api/templates?category_id=${categoryId}`);
        
        if (!res.ok) {
          throw new Error('Erreur chargement template');
        }
        
        const data = await res.json();
        setTemplate(data);
      } catch (err) {
        console.error(err);
        setError('Impossible de charger le formulaire.');
        setTemplate(null);
      } finally {
        setLoading(false);
      }
    }

    fetchTemplate();
  }, [categoryId]);

  return { template, loading, error };
}
