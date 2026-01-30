'use client';

import React, { useState, useEffect } from 'react';
import { AttributeConfig, ColorOption, ProductAttributes } from '@/types/product-attributes';
import ColorSwatchSelector from './ColorSwatchSelector';

interface DynamicAttributesFormProps {
  attributesConfig: AttributeConfig[];
  initialValues?: ProductAttributes;
  onChange: (attributes: ProductAttributes) => void;
}

export default function DynamicAttributesForm({
  attributesConfig,
  initialValues = {},
  onChange,
}: DynamicAttributesFormProps) {
  const [attributes, setAttributes] = useState<ProductAttributes>(initialValues);

  useEffect(() => {
    onChange(attributes);
  }, [attributes, onChange]);

  const handleChange = (label: string, value: string | number | boolean) => {
    setAttributes((prev) => ({ ...prev, [label]: value }));
  };

  const isColorOptions = (options: any[]): options is ColorOption[] => {
    return options.length > 0 && typeof options[0] === 'object' && 'value' in options[0];
  };

  return (
    <div className="space-y-6">
      {attributesConfig.map((config) => {
        const value = attributes[config.label];

        // Type TEXT
        if (config.type === 'text') {
          return (
            <div key={config.label}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {config.label} {config.required && <span className="text-red-500">*</span>}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  required={config.required}
                  placeholder={config.placeholder}
                  value={(value as string) || ''}
                  onChange={(e) => handleChange(config.label, e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {config.suffix && (
                  <span className="text-sm text-gray-500 font-medium">{config.suffix}</span>
                )}
              </div>
            </div>
          );
        }

        // Type NUMBER
        if (config.type === 'number') {
          return (
            <div key={config.label}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {config.label} {config.required && <span className="text-red-500">*</span>}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  required={config.required}
                  placeholder={config.placeholder}
                  value={(value as number) || ''}
                  onChange={(e) => handleChange(config.label, Number(e.target.value))}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {config.suffix && (
                  <span className="text-sm text-gray-500 font-medium">{config.suffix}</span>
                )}
              </div>
            </div>
          );
        }

        // Type SELECT
        if (config.type === 'select' && config.options) {
          return (
            <div key={config.label}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {config.label} {config.required && <span className="text-red-500">*</span>}
              </label>
              <select
                required={config.required}
                value={(value as string) || ''}
                onChange={(e) => handleChange(config.label, e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- Sélectionner --</option>
                {(config.options as string[]).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          );
        }

        // Type COLOR
        if (config.type === 'color' && config.options && isColorOptions(config.options)) {
          return (
            <ColorSwatchSelector
              key={config.label}
              label={config.label}
              options={config.options}
              value={(value as string) || null}
              onChange={(hexValue) => handleChange(config.label, hexValue)}
              required={config.required}
            />
          );
        }

        // Type CHECKBOX
        if (config.type === 'checkbox') {
          return (
            <div key={config.label} className="flex items-center gap-3">
              <input
                type="checkbox"
                id={config.label}
                checked={(value as boolean) || false}
                onChange={(e) => handleChange(config.label, e.target.checked)}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor={config.label} className="text-sm font-medium text-gray-700">
                {config.label}
              </label>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
