'use client';

import React from 'react';
import { ColorOption } from '@/types/product-attributes';

interface ColorSwatchSelectorProps {
  options: ColorOption[];
  value: string | null;
  onChange: (value: string, label: string) => void;
  required?: boolean;
  label: string;
}

export default function ColorSwatchSelector({
  options,
  value,
  onChange,
  required,
  label,
}: ColorSwatchSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex flex-wrap gap-3">
        {options.map((option) => {
          const isSelected = value === option.value;
          const isRainbow = option.value === '#RAINBOW';
          const isTransparent = option.value === '#TRANSPARENT';

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value, option.label)}
              className={`
                relative flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all
                ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-400'}
              `}
              title={option.label}
            >
              {/* Pastille de couleur */}
              <div
                className={`
                  w-10 h-10 rounded-full border-2 border-gray-300 
                  ${isRainbow || isTransparent ? 'flex items-center justify-center' : ''}
                `}
                style={{
                  backgroundColor: isRainbow || isTransparent ? '#f3f4f6' : option.value,
                  background: isRainbow
                    ? 'linear-gradient(135deg, #FF0000 0%, #FF7F00 14%, #FFFF00 28%, #00FF00 42%, #0000FF 57%, #4B0082 71%, #9400D3 100%)'
                    : undefined,
                }}
              >
                {isTransparent && (
                  <span className="text-gray-500 text-2xl font-light">/</span>
                )}
              </div>

              {/* Label */}
              <span className="text-xs text-gray-700 text-center max-w-[60px]">
                {option.label}
              </span>

              {/* Checkmark si sélectionné */}
              {isSelected && (
                <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
