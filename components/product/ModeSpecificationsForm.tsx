'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Tag, Package, Globe } from 'lucide-react'

interface ModeSpecificationsFormProps {
  attributesConfig?: any[]
  initialValues?: Record<string, any>
  onChange?: (values: Record<string, any>) => void
}

export default function ModeSpecificationsForm({
  attributesConfig = [],
  initialValues = {},
  onChange
}: ModeSpecificationsFormProps) {
  const [selectedMode, setSelectedMode] = useState<string>('')
  const [formValues, setFormValues] = useState<Record<string, any>>(initialValues)

  // 🔍 LOG DE DÉBOGAGE
  useEffect(() => {
    console.log('=== DEBUG ModeSpecificationsForm ===')
    console.log('attributesConfig reçu:', attributesConfig)
    console.log('Nombre de champs:', attributesConfig?.length)
    console.log('Mode sélectionné:', selectedMode)
  }, [attributesConfig, selectedMode])

  const modes = [
    {
      id: 'occasion',
      label: 'Occasion',
      icon: <Tag className="w-5 h-5" />,
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'neuf',
      label: 'Neuf',
      icon: <Package className="w-5 h-5" />,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'importation',
      label: 'Importation',
      icon: <Globe className="w-5 h-5" />,
      color: 'from-blue-500 to-purple-500'
    }
  ]

  const handleModeChange = (modeId: string) => {
    console.log('Mode changé vers:', modeId)
    setSelectedMode(modeId)
    const newValues = { ...formValues, mode: modeId }
    setFormValues(newValues)
    onChange?.(newValues)
  }

  const handleFieldChange = (fieldName: string, value: any) => {
    const newValues = { ...formValues, [fieldName]: value }
    setFormValues(newValues)
    onChange?.(newValues)
  }

  const getFieldsForMode = () => {
    if (!selectedMode || !attributesConfig || attributesConfig.length === 0) {
      console.log('⚠️ Pas de champs car:', {
        selectedMode,
        hasConfig: !!attributesConfig,
        configLength: attributesConfig?.length
      })
      return []
    }
    
    const filtered = attributesConfig.filter(field => {
      if (!field.modes || field.modes.length === 0) {
        console.log(`✅ Champ "${field.label}" visible partout`)
        return true
      }
      const isVisible = field.modes.includes(selectedMode)
      console.log(`${isVisible ? '✅' : '❌'} Champ "${field.label}" pour mode "${selectedMode}":`, field.modes)
      return isVisible
    })

    console.log('Champs filtrés pour', selectedMode, ':', filtered)
    return filtered
  }

  const fieldsToDisplay = getFieldsForMode()

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-3">
          Mode <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-3 gap-4">
          {modes.map(mode => (
            <button
              key={mode.id}
              type="button"
              onClick={() => handleModeChange(mode.id)}
              className={`relative p-4 rounded-xl border-2 transition-all duration-200 
                       flex flex-col items-center justify-center gap-2 font-semibold
                       ${selectedMode === mode.id 
                         ? `bg-gradient-to-br ${mode.color} border-transparent text-white shadow-lg` 
                         : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'}`}
            >
              {mode.icon}
              <span className="text-sm">{mode.label}</span>
            </button>
          ))}
        </div>
      </div>

      {selectedMode && fieldsToDisplay.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/10"
        >
          {fieldsToDisplay.map(field => (
            <div key={field.label} className="space-y-2">
              <label className="block text-sm font-semibold text-gray-300">
                {field.label}
                {field.required && <span className="text-red-400 ml-1">*</span>}
              </label>

              {field.type === 'select' ? (
                <select
                  value={formValues[field.label] || ''}
                  onChange={(e) => handleFieldChange(field.label, e.target.value)}
                  required={field.required}
                  className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white 
                           hover:border-white/20 focus:outline-none focus:border-blue-500 focus:ring-2 
                           focus:ring-blue-500/20 transition-all duration-200 appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23ffffff'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    backgroundSize: '1.25rem'
                  }}
                >
                  <option value="" className="bg-[#1a1a1a]">
                    Sélectionner...
                  </option>
                  {field.options?.map((option: any) => (
                    <option key={typeof option === 'string' ? option : option.label} value={typeof option === 'string' ? option : option.value} className="bg-[#1a1a1a]">
                      {typeof option === 'string' ? option : option.label}
                    </option>
                  ))}
                </select>
              ) : field.type === 'color' ? (
                <select
                  value={formValues[field.label] || ''}
                  onChange={(e) => handleFieldChange(field.label, e.target.value)}
                  required={field.required}
                  className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white 
                           hover:border-white/20 focus:outline-none focus:border-blue-500 focus:ring-2 
                           focus:ring-blue-500/20 transition-all duration-200 appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23ffffff'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    backgroundSize: '1.25rem'
                  }}
                >
                  <option value="" className="bg-[#1a1a1a]">
                    Sélectionner...
                  </option>
                  {field.options?.map((option: any) => (
                    <option key={option.label} value={option.value} className="bg-[#1a1a1a]">
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  value={formValues[field.label] || ''}
                  onChange={(e) => handleFieldChange(field.label, e.target.value)}
                  placeholder={field.placeholder}
                  required={field.required}
                  rows={3}
                  className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white 
                           placeholder:text-gray-500 hover:border-white/20 focus:outline-none 
                           focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all 
                           duration-200 resize-none"
                />
              ) : (
                <input
                  type={field.type || 'text'}
                  value={formValues[field.label] || ''}
                  onChange={(e) => handleFieldChange(field.label, e.target.value)}
                  placeholder={field.placeholder}
                  required={field.required}
                  className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white 
                           placeholder:text-gray-500 hover:border-white/20 focus:outline-none 
                           focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                />
              )}
            </div>
          ))}
        </motion.div>
      )}

      {selectedMode && fieldsToDisplay.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8 text-gray-400"
        >
          Aucun champ spécifique requis pour ce mode
        </motion.div>
      )}
    </div>
  )
}
