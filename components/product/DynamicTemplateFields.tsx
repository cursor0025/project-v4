'use client'

import { useState, useEffect } from 'react'
import { Settings, Info } from 'lucide-react'

export interface TemplateField {
  name: string
  label: string
  type: 'text' | 'number' | 'select' | 'radio' | 'checkbox' | 'textarea'
  required?: boolean
  options?: string[]
  placeholder?: string
  hint?: string
  dependsOn?: { field: string; value: string }
  unit?: string
}

export interface CategoryTemplate {
  category: string
  subcategories?: string[]
  fields: TemplateField[]
}

interface DynamicTemplateFieldsProps {
  category: string
  subcategory?: string
  values: Record<string, any>
  onChange: (values: Record<string, any>) => void
  disabled?: boolean
}

export default function DynamicTemplateFields({
  category,
  subcategory,
  values,
  onChange,
  disabled = false
}: DynamicTemplateFieldsProps) {
  const [template, setTemplate] = useState<CategoryTemplate | null>(null)

  useEffect(() => {
    const selectedTemplate = getTemplateForCategory(category, subcategory)
    setTemplate(selectedTemplate)
  }, [category, subcategory])

  const handleFieldChange = (fieldName: string, value: any) => {
    onChange({
      ...values,
      [fieldName]: value
    })
  }

  if (!template || template.fields.length === 0) {
    return null
  }

  const shouldShowField = (field: TemplateField): boolean => {
    if (!field.dependsOn) return true
    return values[field.dependsOn.field] === field.dependsOn.value
  }

  return (
    <div className="border-t border-white/10 pt-7">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
          <Settings className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h3 className="text-white font-bold text-lg">Caractéristiques spécifiques</h3>
          <p className="text-sm text-gray-400">Remplissez les informations techniques du produit</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {template.fields.map((field) => {
          if (!shouldShowField(field)) return null

          return (
            <div
              key={field.name}
              className={field.type === 'textarea' || field.type === 'checkbox' ? 'md:col-span-2' : ''}
            >
              <label className="block text-sm font-bold text-gray-300 mb-3">
                {field.label}
                {field.required && <span className="text-red-400 ml-1">*</span>}
              </label>

              {/* TEXT INPUT */}
              {field.type === 'text' && (
                <input
                  type="text"
                  value={values[field.name] || ''}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  disabled={disabled}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white 
                           placeholder:text-gray-500 hover:border-white/20 focus:outline-none 
                           focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all
                           disabled:opacity-50 disabled:cursor-not-allowed"
                />
              )}

              {/* NUMBER INPUT */}
              {field.type === 'number' && (
                <div className="relative">
                  <input
                    type="number"
                    value={values[field.name] || ''}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    disabled={disabled}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white 
                             placeholder:text-gray-500 hover:border-white/20 focus:outline-none 
                             focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  {field.unit && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">
                      {field.unit}
                    </span>
                  )}
                </div>
              )}

              {/* SELECT */}
              {field.type === 'select' && field.options && (
                <select
                  value={values[field.name] || ''}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  disabled={disabled}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white 
                           hover:border-white/20 focus:outline-none focus:border-blue-500 focus:ring-2 
                           focus:ring-blue-500/20 transition-all appearance-none cursor-pointer
                           disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23ffffff'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    backgroundSize: '1.5rem'
                  }}
                >
                  <option value="" className="bg-[#161618]">
                    {field.placeholder || 'Sélectionnez...'}
                  </option>
                  {field.options.map((option) => (
                    <option key={option} value={option} className="bg-[#161618]">
                      {option}
                    </option>
                  ))}
                </select>
              )}

              {/* RADIO */}
              {field.type === 'radio' && field.options && (
                <div className="flex flex-wrap gap-3">
                  {field.options.map((option) => (
                    <label
                      key={option}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 cursor-pointer transition-all ${
                        values[field.name] === option
                          ? 'border-blue-500 bg-blue-500/20 text-white'
                          : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/30'
                      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <input
                        type="radio"
                        name={field.name}
                        value={option}
                        checked={values[field.name] === option}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        disabled={disabled}
                        className="hidden"
                      />
                      <span className="font-semibold text-sm">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* CHECKBOX */}
              {field.type === 'checkbox' && field.options && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {field.options.map((option) => {
                    const isChecked = Array.isArray(values[field.name]) && values[field.name].includes(option)
                    
                    return (
                      <label
                        key={option}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${
                          isChecked
                            ? 'border-green-500 bg-green-500/20 text-white'
                            : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/30'
                        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const currentValues = Array.isArray(values[field.name]) ? values[field.name] : []
                            const newValues = e.target.checked
                              ? [...currentValues, option]
                              : currentValues.filter((v: string) => v !== option)
                            handleFieldChange(field.name, newValues)
                          }}
                          disabled={disabled}
                          className="w-4 h-4 rounded border-white/20 text-green-500 focus:ring-2 focus:ring-green-500/20"
                        />
                        <span className="text-sm font-medium">{option}</span>
                      </label>
                    )
                  })}
                </div>
              )}

              {/* TEXTAREA */}
              {field.type === 'textarea' && (
                <textarea
                  value={values[field.name] || ''}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  rows={3}
                  disabled={disabled}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white 
                           placeholder:text-gray-500 hover:border-white/20 focus:outline-none 
                           focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none
                           disabled:opacity-50 disabled:cursor-not-allowed"
                />
              )}

              {/* HINT */}
              {field.hint && (
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  {field.hint}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ==================== TEMPLATES CONFIGURATION ====================
function getTemplateForCategory(category: string, subcategory?: string): CategoryTemplate | null {
  const templates: Record<string, CategoryTemplate> = {
    // ========== ÉLECTRONIQUE ==========
    'electronique': {
      category: 'electronique',
      fields: [
        {
          name: 'device_type',
          label: 'Type d\'appareil',
          type: 'select',
          required: true,
          options: [
            'Appareil Photo Reflex (DSLR)',
            'Appareil Hybride (Mirrorless)',
            'Appareil Compact / Bridge',
            'Action Cam (type GoPro)',
            'Drone',
            'Caméscope classique',
            'Enceinte Bluetooth',
            'Barre de son',
            'Home Cinéma',
            'Autre'
          ]
        },
        {
          name: 'brand',
          label: 'Marque',
          type: 'select',
          required: true,
          options: [
            'Canon', 'Nikon', 'Sony', 'Fujifilm', 'Panasonic', 'GoPro', 'DJI',
            'JBL', 'Bose', 'Samsung', 'LG', 'Yamaha', 'Autres'
          ]
        },
        {
          name: 'model',
          label: 'Modèle',
          type: 'text',
          placeholder: 'Ex: Canon EOS R6 Mark II'
        },
        {
          name: 'condition',
          label: 'État',
          type: 'radio',
          required: true,
          options: ['Neuf', 'Occasion (Peu utilisé)', 'Occasion (Usage intensif)']
        }
      ]
    },

    // ========== ÉLECTROMÉNAGER ==========
    'electromenager': {
      category: 'electromenager',
      fields: [
        {
          name: 'appliance_type',
          label: 'Type d\'appareil',
          type: 'select',
          required: true,
          options: [
            'Réfrigérateur', 'Congélateur', 'Machine à laver', 'Lave-vaisselle',
            'Cuisinière', 'Four', 'Micro-ondes', 'Climatiseur', 'Télévision', 'Autre'
          ]
        },
        {
          name: 'brand',
          label: 'Marque',
          type: 'select',
          required: true,
          options: [
            'LG', 'Samsung', 'Condor', 'Iris', 'Brandt', 'Beko', 'Whirlpool',
            'Bosch', 'Midea', 'Hisense', 'Autres'
          ]
        },
        {
          name: 'cooling_system',
          label: 'Système de Froid',
          type: 'radio',
          options: ['No Frost (Sans givre)', 'De Frost (Avec givre)', 'Low Frost'],
          dependsOn: { field: 'appliance_type', value: 'Réfrigérateur' }
        },
        {
          name: 'capacity',
          label: 'Capacité',
          type: 'select',
          options: ['6kg', '7kg', '8kg', '9kg', '10.5kg', '12kg+'],
          dependsOn: { field: 'appliance_type', value: 'Machine à laver' }
        },
        {
          name: 'power_btu',
          label: 'Puissance (BTU)',
          type: 'select',
          options: ['9000 BTU', '12000 BTU', '18000 BTU', '24000 BTU', '48000 BTU'],
          dependsOn: { field: 'appliance_type', value: 'Climatiseur' }
        },
        {
          name: 'screen_size',
          label: 'Taille d\'écran',
          type: 'select',
          options: ['32"', '40"', '43"', '50"', '55"', '65"', '75"', '+75"'],
          dependsOn: { field: 'appliance_type', value: 'Télévision' }
        },
        {
          name: 'color',
          label: 'Couleur',
          type: 'radio',
          options: ['Blanc', 'Gris (Inox)', 'Noir', 'Autre']
        },
        {
          name: 'condition',
          label: 'État',
          type: 'radio',
          required: true,
          options: ['Neuf', 'Occasion', 'Cabossé (1er choix)']
        }
      ]
    },

    // ========== GAMING ==========
    'gaming': {
      category: 'gaming',
      fields: [
        {
          name: 'product_type',
          label: 'Type de produit',
          type: 'select',
          required: true,
          options: [
            'Console de jeux', 'Jeux Vidéo', 'Manette / Contrôleur',
            'Clavier Gamer', 'Souris Gamer', 'Casque Gamer', 'Chaise Gaming', 'Autre'
          ]
        },
        {
          name: 'console_brand',
          label: 'Marque / Famille',
          type: 'select',
          options: ['Sony PlayStation', 'Microsoft Xbox', 'Nintendo', 'Steam Deck', 'Autres'],
          dependsOn: { field: 'product_type', value: 'Console de jeux' }
        },
        {
          name: 'console_model',
          label: 'Modèle',
          type: 'select',
          options: [
            'PS5 (Standard)', 'PS5 (Digital)', 'PS4 Pro', 'PS4 Slim',
            'Xbox Series X', 'Xbox Series S', 'Xbox One X',
            'Switch OLED', 'Switch V2', 'Switch Lite'
          ],
          dependsOn: { field: 'product_type', value: 'Console de jeux' }
        },
        {
          name: 'storage',
          label: 'Stockage',
          type: 'select',
          options: ['500 Go', '825 Go', '1 To', '2 To'],
          dependsOn: { field: 'product_type', value: 'Console de jeux' }
        },
        {
          name: 'jailbreak_status',
          label: 'État du système',
          type: 'radio',
          options: ['Système Original (Non flashé)', 'Flashé / Jailbreaké'],
          dependsOn: { field: 'product_type', value: 'Console de jeux' }
        },
        {
          name: 'game_platform',
          label: 'Plateforme',
          type: 'select',
          options: ['PS5', 'PS4', 'Xbox Series', 'Xbox One', 'Nintendo Switch', 'PC'],
          dependsOn: { field: 'product_type', value: 'Jeux Vidéo' }
        },
        {
          name: 'game_name',
          label: 'Nom du jeu',
          type: 'text',
          placeholder: 'Ex: FIFA 24',
          dependsOn: { field: 'product_type', value: 'Jeux Vidéo' }
        },
        {
          name: 'peripheral_brand',
          label: 'Marque',
          type: 'select',
          options: [
            'Razer', 'Logitech', 'HyperX', 'SteelSeries', 'Corsair',
            'Redragon', 'Spirit of Gamer', 'Autres'
          ]
        },
        {
          name: 'connectivity',
          label: 'Connectivité',
          type: 'radio',
          options: ['Filaire (Câble)', 'Sans fil (Wireless)']
        },
        {
          name: 'condition',
          label: 'État',
          type: 'radio',
          required: true,
          options: ['Neuf (Jamais ouvert)', 'Occasion (Comme neuf)', 'Occasion (Bon état)']
        }
      ]
    },

    // ========== INFORMATIQUE ==========
    'informatique_it': {
      category: 'informatique_it',
      fields: [
        {
          name: 'product_type',
          label: 'Type de produit',
          type: 'select',
          required: true,
          options: ['PC Portable', 'PC de Bureau', 'Écran', 'Imprimante', 'Routeur', 'Autre']
        },
        {
          name: 'brand',
          label: 'Marque',
          type: 'select',
          required: true,
          options: [
            'Dell', 'HP', 'Lenovo', 'Asus', 'Acer', 'Apple', 'MSI',
            'Samsung', 'LG', 'Epson', 'Canon', 'TP-Link', 'Autres'
          ]
        },
        {
          name: 'model',
          label: 'Modèle',
          type: 'text',
          placeholder: 'Ex: ThinkPad T480s'
        },
        {
          name: 'processor',
          label: 'Processeur (CPU)',
          type: 'select',
          options: [
            'Intel Core i3', 'Intel Core i5', 'Intel Core i7', 'Intel Core i9',
            'AMD Ryzen 3', 'AMD Ryzen 5', 'AMD Ryzen 7', 'AMD Ryzen 9',
            'Apple M1', 'Apple M2', 'Apple M3'
          ]
        },
        {
          name: 'ram',
          label: 'Mémoire RAM',
          type: 'select',
          options: ['4 Go', '8 Go', '12 Go', '16 Go', '32 Go', '64 Go']
        },
        {
          name: 'storage_type',
          label: 'Type de Stockage',
          type: 'select',
          options: ['SSD (NVMe)', 'SSD (SATA)', 'HDD (Disque Dur)']
        },
        {
          name: 'storage_capacity',
          label: 'Capacité de Stockage',
          type: 'select',
          options: ['128 Go', '256 Go', '512 Go', '1 To', '2 To', 'Autre']
        },
        {
          name: 'gpu',
          label: 'Carte Graphique (GPU)',
          type: 'select',
          options: [
            'NVIDIA RTX 40 Series', 'NVIDIA RTX 30 Series', 'NVIDIA GTX 16 Series',
            'AMD Radeon RX', 'Intel Iris Xe', 'Intégrée'
          ]
        },
        {
          name: 'screen_size',
          label: 'Taille d\'écran',
          type: 'select',
          options: ['13"', '14"', '15.6"', '17.3"', '24"', '27"', '32"'],
          dependsOn: { field: 'product_type', value: 'PC Portable' }
        },
        {
          name: 'condition',
          label: 'État',
          type: 'radio',
          required: true,
          options: ['Neuf sous emballage', 'Neuf déballé', 'Occasion 10/10', 'Bon état']
        }
      ]
    },

    // ========== VÉHICULES ==========
    'vehicules': {
      category: 'vehicules',
      fields: [
        {
          name: 'vehicle_type',
          label: 'Type de véhicule',
          type: 'select',
          required: true,
          options: ['Voiture', 'Moto', 'Scooter', 'Quad', 'Camion', 'Autre']
        },
        {
          name: 'brand',
          label: 'Marque',
          type: 'text',
          required: true,
          placeholder: 'Ex: Renault, Peugeot, Yamaha...'
        },
        {
          name: 'model',
          label: 'Modèle',
          type: 'text',
          required: true,
          placeholder: 'Ex: Clio 4, Symbol, T-Max...'
        },
        {
          name: 'year',
          label: 'Année',
          type: 'number',
          required: true,
          placeholder: '2020'
        },
        {
          name: 'mileage',
          label: 'Kilométrage',
          type: 'number',
          unit: 'km',
          placeholder: '50000'
        },
        {
          name: 'fuel_type',
          label: 'Carburant',
          type: 'radio',
          options: ['Essence', 'Diesel', 'GPL (Sirghaz)', 'Hybride', 'Électrique']
        },
        {
          name: 'transmission',
          label: 'Boîte de vitesse',
          type: 'radio',
          options: ['Manuelle', 'Automatique']
        },
        {
          name: 'papers',
          label: 'Papiers',
          type: 'radio',
          options: ['Carte Grise', 'Carte Jaune', 'Papier de douane', 'Sans papier']
        },
        {
          name: 'options',
          label: 'Options / Équipement',
          type: 'checkbox',
          options: [
            'Climatisation', 'Toit ouvrant', 'Jantes alliage', 'Cuir',
            'Radar de recul', 'Écran tactile', 'Phares LED'
          ]
        }
      ]
    },

    // ========== IMMOBILIER ==========
    'immobilier': {
      category: 'immobilier',
      fields: [
        {
          name: 'transaction_type',
          label: 'Type de Transaction',
          type: 'select',
          required: true,
          options: ['Vente', 'Location (Mensuelle)', 'Location Vacances', 'Échange']
        },
        {
          name: 'property_type',
          label: 'Type de bien',
          type: 'select',
          required: true,
          options: [
            'Studio', 'F1', 'F2', 'F3', 'F4', 'F5', 'Duplex', 'Villa',
            'Terrain', 'Local commercial', 'Bureau'
          ]
        },
        {
          name: 'surface',
          label: 'Surface',
          type: 'number',
          unit: 'm²',
          required: true,
          placeholder: '100'
        },
        {
          name: 'floor',
          label: 'Étage',
          type: 'select',
          options: ['RDC', '1er', '2ème', '3ème', '4ème', '5ème', '6ème+']
        },
        {
          name: 'furnished',
          label: 'Meublé / Équipé',
          type: 'radio',
          options: ['Vide', 'Meublé', 'Semi-équipé']
        },
        {
          name: 'papers',
          label: 'Papiers / Situation Juridique',
          type: 'radio',
          options: ['Acte notarié', 'Livret foncier', 'Décision', 'Papier timbré']
        },
        {
          name: 'features',
          label: 'Spécificités',
          type: 'checkbox',
          options: [
            'Garage / Parking', 'Jardin', 'Piscine', 'Vue sur mer',
            'Chauffage central', 'Climatisation', 'Ascenseur'
          ]
        },
        {
          name: 'location',
          label: 'Quartier / Résidence',
          type: 'text',
          placeholder: 'Ex: Bab Ezzouar, Les Vergers'
        }
      ]
    },

    // ========== TÉLÉPHONES ==========
    'telephones_accessoires': {
      category: 'telephones_accessoires',
      fields: [
        {
          name: 'product_type',
          label: 'Type de produit',
          type: 'select',
          required: true,
          options: [
            'Smartphone', 'Téléphone basique', 'Écouteurs / Casque',
            'Chargeur / Câble', 'Powerbank', 'Coque / Protection',
            'Montre connectée', 'Autre'
          ]
        },
        {
          name: 'brand',
          label: 'Marque',
          type: 'select',
          required: true,
          options: [
            'Apple', 'Samsung', 'Xiaomi', 'Oppo', 'Realme', 'Huawei',
            'Nokia', 'OnePlus', 'Google', 'Autres'
          ]
        },
        {
          name: 'model',
          label: 'Modèle',
          type: 'text',
          placeholder: 'Ex: Galaxy S24 Ultra'
        },
        {
          name: 'storage',
          label: 'Stockage (ROM)',
          type: 'select',
          options: ['64Go', '128Go', '256Go', '512Go', '1To']
        },
        {
          name: 'ram',
          label: 'Mémoire (RAM)',
          type: 'select',
          options: ['4Go', '6Go', '8Go', '12Go', '16Go', '24Go']
        },
        {
          name: 'color',
          label: 'Couleur',
          type: 'text',
          placeholder: 'Ex: Noir, Bleu Titanium...'
        },
        {
          name: 'network',
          label: 'Réseau',
          type: 'radio',
          options: ['4G', '5G']
        },
        {
          name: 'condition',
          label: 'État',
          type: 'radio',
          required: true,
          options: ['Neuf sous blister', 'Neuf déballé', 'Occasion 10/10', 'Bon état']
        }
      ]
    },

    // ========== ACCESSOIRES AUTO-MOTO ==========
    'accessoires_auto_moto': {
      category: 'accessoires_auto_moto',
      fields: [
        {
          name: 'product_category',
          label: 'Catégorie',
          type: 'select',
          required: true,
          options: [
            'Accessoires Voiture', 'Accessoires Moto', 'Casque / Gants',
            'Sécurité & Électronique', 'Éclairage', 'Entretien', 'Autre'
          ]
        },
        {
          name: 'accessory_type',
          label: 'Type d\'accessoire',
          type: 'select',
          required: true,
          options: [
            'Housses de sièges', 'Tapis de sol', 'Support téléphone', 'Enjoliveurs',
            'Désodorisant', 'Bâche de protection', 'Top Case', 'Rétroviseurs',
            'Casque', 'Gants', 'Système d\'Alarme', 'GPS Tracker', 'Dashcam',
            'Ampoules / LED', 'Kit Xénon', 'Huile moteur', 'Nettoyant', 'Autre'
          ]
        },
        {
          name: 'compatibility',
          label: 'Compatibilité Véhicule',
          type: 'radio',
          options: ['Universel', 'Spécifique (Sur mesure)']
        },
        {
          name: 'compatible_model',
          label: 'Modèle compatible (si spécifique)',
          type: 'text',
          placeholder: 'Ex: Pour Golf 7, Pour Toyota Hilux',
          dependsOn: { field: 'compatibility', value: 'Spécifique (Sur mesure)' }
        },
        {
          name: 'material',
          label: 'Matière',
          type: 'select',
          options: ['Cuir', 'Simili-cuir', 'Tissu', 'Caoutchouc', 'Plastique', 'Velours']
        },
        {
          name: 'helmet_type',
          label: 'Type de casque',
          type: 'select',
          options: ['Intégral', 'Jet (Ouvert)', 'Modulable', 'Cross/Enduro'],
          dependsOn: { field: 'accessory_type', value: 'Casque' }
        },
        {
          name: 'size',
          label: 'Taille',
          type: 'select',
          options: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
        },
        {
          name: 'condition',
          label: 'État',
          type: 'radio',
          required: true,
          options: ['Neuf', 'Occasion']
        }
      ]
    }
  }

  return templates[category] || null
}
