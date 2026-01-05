'use client'

import './styles.css'
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import imageCompression from 'browser-image-compression'
import { 
  Upload, X, ChevronRight, ChevronLeft, Save, AlertCircle, 
  Percent, Image as ImageIcon, Tag, DollarSign, Package,
  Sparkles, CheckCircle2, Loader2
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

// ==================== TYPES ====================
interface ProductImage {
  id: string
  file: File
  preview: string
  compressed: boolean
  size: number
}

interface CategoryField {
  label: string
  type: 'text' | 'select' | 'number' | 'textarea'
  options?: string[]
  placeholder?: string
  required?: boolean
  unit?: string
}

interface CategoryConfig {
  [key: string]: CategoryField
}

// ==================== 44 CATÉGORIES AVEC SOUS-CATÉGORIES ====================
const CATEGORIES = [
  { 
    value: 'telephones_accessoires', 
    label: '📱 Téléphones & Accessoires', 
    icon: '📱',
    subcategories: ['Smartphones', 'Téléphones basiques', 'Écouteurs & Casques', 'Chargeurs & Câbles', 'Batteries', 'Coques & Protection', 'Accessoires divers', 'Montres connectées', 'Autres']
  },
  { 
    value: 'accessoires_auto_moto', 
    label: '🏍️ Accessoires Auto & Moto', 
    icon: '🏍️',
    subcategories: ['Accessoires voiture', 'Accessoires moto', 'Sécurité', 'Entretien', 'Casques & Gants', 'Éclairage', 'Autres']
  },
  { 
    value: 'vehicules', 
    label: '🚗 Véhicules', 
    icon: '🚗',
    subcategories: ['Voitures', 'Motos', 'Camions', 'Utilitaires', 'Camping-cars', 'Autres']
  },
  { 
    value: 'immobilier', 
    label: '🏢 Immobilier', 
    icon: '🏢',
    subcategories: ['À vendre', 'À louer', 'Appartements', 'Villas', 'Terrains', 'Locaux commerciaux', 'Promotion immobilière', 'Colocation', 'Autres']
  },
  { 
    value: 'informatique_it', 
    label: '💻 Informatique & IT', 
    icon: '💻',
    subcategories: ['PC portables', 'PC de bureau', 'Composants', 'Stockage', 'Imprimantes & Scanners', 'Accessoires PC', 'Réseau', 'Écrans', 'Mobilier informatique', 'Autres']
  },
  { 
    value: 'electronique', 
    label: '📷 Électronique', 
    icon: '📷',
    subcategories: ['Appareils photo', 'Caméscopes', 'Home cinéma', 'Audio & Enceintes', 'Accessoires électroniques', 'Autres']
  },
  { 
    value: 'electromenager', 
    label: '🏠 Électroménager', 
    icon: '🏠',
    subcategories: ['Machines à laver', 'Réfrigérateurs', 'Télévisions', 'Fours', 'Micro-ondes', 'Lave-vaisselle', 'Cuisinières & Plaques', 'Climatisation & Chauffage', 'Aspirateurs', 'Congélateurs', 'Mixeurs / Blenders', 'Bouilloires', 'Grille-pain', 'Fers à repasser', 'Purificateurs d\'air', 'Ventilateurs', 'Autres']
  },
  { 
    value: 'gaming', 
    label: '🎮 Gaming', 
    icon: '🎮',
    subcategories: ['Consoles', 'Jeux vidéo', 'Manettes', 'Casques gaming', 'Souris & Claviers gaming', 'Tapis de souris', 'Chaises gaming', 'Matériel de streaming', 'PC Gaming', 'Autres']
  },
  { 
    value: 'vetements_femme', 
    label: '👗 Vêtements Femme', 
    icon: '👗',
    subcategories: ['Robes', 'Tops & Chemisiers', 'Pantalons', 'Jupes', 'Abayas', 'Chaussures', 'Sacs & Accessoires', 'Lingerie', 'Sportswear femme', 'Bijoux', 'Autres']
  },
  { 
    value: 'vetements_homme', 
    label: '👔 Vêtements Homme', 
    icon: '👔',
    subcategories: ['T-shirts', 'Chemises', 'Pantalons', 'Jeans', 'Pulls', 'Vestes & Manteaux', 'Chaussures', 'Accessoires', 'Sportswear homme', 'Tenues traditionnelles', 'Autres']
  },
  { 
    value: 'vetements_homme_classique', 
    label: '🤵 Vêtements Homme Classique', 
    icon: '🤵',
    subcategories: ['Costumes', 'Chemises classiques', 'Pantalons classiques', 'Vestes & Blazers', 'Chaussures habillées', 'Cravates', 'Ceintures', 'Accessoires élégants', 'Autres']
  },
  { 
    value: 'sportswear', 
    label: '🏃 Sportswear', 
    icon: '🏃',
    subcategories: ['T-shirts', 'Survêtements', 'Shorts', 'Leggings', 'Brassières', 'Vestes', 'Chaussures', 'Accessoires', 'Tenues sport', 'Autres']
  },
  { 
    value: 'vetements_bebe', 
    label: '👶 Vêtements Bébé', 
    icon: '👶',
    subcategories: ['Bodies', 'Pyjamas', 'Ensembles', 'Pulls & Gilets', 'Chaussures bébé', 'Bonnets & Gants', 'Tenues nouveau-né', 'Couvertures', 'Autres']
  },
  { 
    value: 'sante_beaute', 
    label: '💄 Santé & Beauté', 
    icon: '💄',
    subcategories: ['Parfums', 'Maquillage', 'Soin visage', 'Soin cheveux', 'Hygiène', 'Bien-être', 'Appareils beauté', 'Autres']
  },
  { 
    value: 'cosmetiques', 
    label: '💅 Cosmétiques', 
    icon: '💅',
    subcategories: ['Fond de teint', 'Rouge à lèvres', 'Mascara', 'Eyeliner', 'Correcteurs', 'Poudres', 'Palettes', 'Soin visage', 'Soin cheveux', 'Soin corps', 'Parfums', 'Accessoires beauté', 'Autres']
  },
  { 
    value: 'salon_coiffure_homme', 
    label: '💈 Salon de Coiffure – Homme', 
    icon: '💈',
    subcategories: ['Coupe homme', 'Dégradé / Fade', 'Rasage & Taille de barbe', 'Coloration homme', 'Lissage / Soin cheveux', 'Coiffure événementielle homme', 'Produits capillaires homme', 'Autres']
  },
  { 
    value: 'salon_coiffure_esthetique_femme', 
    label: '💇 Salon de Coiffure & Esthétique – Femme', 
    icon: '💇',
    subcategories: ['Coupe femme', 'Brushing', 'Coloration / Mèches', 'Balayage / Ombré', 'Lissage (Botox, Kératine, Protéine)', 'Soin cheveux', 'Maquillage', 'Manucure & Pédicure', 'Épilation', 'Coiffure événementielle / Mariage', 'Extensions', 'Produits beauté femme', 'Autres']
  },
  { 
    value: 'produits_naturels_herboristerie', 
    label: '🌿 Produits Naturels & Herboristerie', 
    icon: '🌿',
    subcategories: ['Plantes médicinales', 'Tisanes', 'Huiles essentielles', 'Savons naturels', 'Produits de la ruche', 'Compléments naturels', 'Épices naturelles', 'Autres']
  },
  { 
    value: 'meubles_maison', 
    label: '🛋️ Meubles & Maison', 
    icon: '🛋️',
    subcategories: ['Salon', 'Chambre', 'Bureau', 'Cuisine', 'Salle de bain', 'Déco intérieure', 'Déco extérieure', 'Jardin', 'Textiles maison', 'Éclairage', 'Autres']
  },
  { 
    value: 'textiles_maison', 
    label: '🛏️ Textiles Maison', 
    icon: '🛏️',
    subcategories: ['Parures', 'Couvertures', 'Protège-matelas', 'Serviettes', 'Rideaux', 'Nappes', 'Stores', 'Tapis', 'Coussins', 'Plaids', 'Autres']
  },
  { 
    value: 'decoration_maison', 
    label: '🎨 Décoration Maison', 
    icon: '🎨',
    subcategories: ['Objets déco', 'Tableaux', 'Bougies', 'Décoration saisonnière', 'Plantes & pots', 'Tapis', 'Accessoires design', 'Autres']
  },
  { 
    value: 'ustensiles_cuisine', 
    label: '🍳 Ustensiles de Cuisine', 
    icon: '🍳',
    subcategories: ['Poêles', 'Casseroles', 'Cocottes', 'Couteaux', 'Ustensiles', 'Bols / Saladiers', 'Plats & Plateaux', 'Boîtes alimentaires', 'Moules', 'Passoires', 'Grills BBQ', 'Autres']
  },
  { 
    value: 'services_alimentaires', 
    label: '🍽️ Services Alimentaires', 
    icon: '🍽️',
    subcategories: ['Restaurants', 'Fast-food', 'Cafés', 'Pâtisseries', 'Boulangeries', 'Traiteurs', 'Livraison repas', 'Grillades', 'Cuisine traditionnelle', 'Healthy food', 'Autres']
  },
  { 
    value: 'equipement_magasin_pro', 
    label: '🏪 Équipement Magasin & Pro', 
    icon: '🏪',
    subcategories: ['Frigos professionnels', 'Chambres froides', 'Tables inox', 'Vitrines & Comptoirs', 'Matériel boulangerie', 'Matériel pâtisserie', 'Cuisine pro', 'Matériel pizzeria', 'Grills & Friteuses', 'Sécurité pro', 'Rayonnages', 'Caisse & POS', 'Équipements mini-market', 'Boucherie', 'Autres']
  },
  { 
    value: 'cuisinistes_cuisines_completes', 
    label: '🔧 Cuisinistes & Cuisines Complètes', 
    icon: '🔧',
    subcategories: ['Cuisines équipées', 'Cuisines sur mesure', 'Plans de travail', 'Rangements', 'Installation', 'Électroménagers intégrés', 'Styles de cuisine', 'Plans / Conception 3D', 'Autres']
  },
  { 
    value: 'sport_materiel_sportif', 
    label: '⚽ Sport & Matériel Sportif', 
    icon: '⚽',
    subcategories: ['Musculation', 'Cardio', 'Yoga', 'Boxe', 'Natation', 'Accessoires fitness', 'Sports individuels', 'Sports collectifs', 'Autres']
  },
  { 
    value: 'bricolage', 
    label: '🔨 Bricolage', 
    icon: '🔨',
    subcategories: ['Outils manuels', 'Outils électriques', 'Visserie', 'Serrurerie', 'Colles', 'Peinture', 'Éclairage technique', 'Matériel professionnel', 'Autres']
  },
  { 
    value: 'materiaux_equipements_construction', 
    label: '🏗️ Matériaux & Équipements Construction', 
    icon: '🏗️',
    subcategories: ['Matériaux', 'Outils', 'Équipement industriel', 'Plomberie', 'Électricité', 'Peinture', 'Sécurité', 'Autres']
  },
  { 
    value: 'pieces_detachees', 
    label: '🔩 Pièces Détachées', 
    icon: '🔩',
    subcategories: ['Pièces moteur', 'Carrosserie', 'Batteries', 'Pneus & Jantes', 'Pièces moto', 'Accessoires auto', 'Autres']
  },
  { 
    value: 'equipement_bebe', 
    label: '🍼 Équipement Bébé', 
    icon: '🍼',
    subcategories: ['Poussettes', 'Sièges auto', 'Lits bébé', 'Biberons', 'Jouets bébé', 'Hygiène bébé', 'Accessoires repas', 'Autres']
  },
  { 
    value: 'artisanat', 
    label: '🎭 Artisanat', 
    icon: '🎭',
    subcategories: ['Produits faits main', 'Broderie', 'Bijoux artisanaux', 'Poterie', 'Tapis', 'Décoration traditionnelle', 'Autres']
  },
  { 
    value: 'loisirs_divertissement', 
    label: '🎪 Loisirs & Divertissement', 
    icon: '🎪',
    subcategories: ['Livres', 'Jouets', 'Musique', 'Films', 'Arts créatifs', 'Jeux vidéo', 'Consoles', 'Autres']
  },
  { 
    value: 'alimentation_epicerie', 
    label: '🛒 Alimentation & Épicerie', 
    icon: '🛒',
    subcategories: ['Épicerie', 'Produits frais', 'Boissons', 'Produits artisanaux', 'Produits importés', 'Produits bio', 'Autres']
  },
  { 
    value: 'agences_voyage', 
    label: '✈️ Agences de Voyage', 
    icon: '✈️',
    subcategories: ['Voyages', 'Hajj & Omra', 'Hôtels', 'Circuits', 'Locations voitures', 'Assurance voyage', 'Autres']
  },
  { 
    value: 'education', 
    label: '📚 Éducation', 
    icon: '📚',
    subcategories: ['Cours particuliers', 'Écoles privées', 'Garderies', 'Soutien scolaire', 'Cours en ligne', 'Cours de langues', 'Cours de musique', 'Préparation concours', 'Formations professionnelles', 'Autres']
  },
  { 
    value: 'bijoux', 
    label: '💎 Bijoux', 
    icon: '💎',
    subcategories: ['Colliers', 'Bracelets', 'Bagues', 'Boucles d\'oreilles', 'Argent', 'Or', 'Parures', 'Piercings', 'Bijoux fantaisie', 'Autres']
  },
  { 
    value: 'montres_lunettes', 
    label: '⌚ Montres & Lunettes', 
    icon: '⌚',
    subcategories: ['Montres homme', 'Montres femme', 'Smartwatches', 'Bracelets', 'Lunettes de soleil', 'Lunettes mode', 'Étuis', 'Accessoires', 'Autres']
  },
  { 
    value: 'vape_cigarettes_electroniques', 
    label: '💨 Vape & Cigarettes Électroniques', 
    icon: '💨',
    subcategories: ['E-cigarettes', 'Pods', 'Clearomiseurs', 'Résistances', 'Batteries', 'Chargeurs', 'Étuis', 'DIY', 'Accessoires', 'Autres']
  },
  { 
    value: 'materiel_medical', 
    label: '⚕️ Matériel Médical', 
    icon: '⚕️',
    subcategories: ['Fauteuils roulants', 'Déambulateurs', 'Orthèses', 'Tensiomètres', 'Thermomètres', 'Matelas médicaux', 'Rééducation', 'Béquilles', 'Ceintures lombaires', 'Autres']
  },
  { 
    value: 'promoteurs_immobiliers', 
    label: '🏘️ Promoteurs Immobiliers', 
    icon: '🏘️',
    subcategories: ['Projets immobiliers', 'Programmes neufs', 'Résidences en construction', 'Appartements promo', 'Villas promo', 'Terrains promo', 'Plans', 'Offres promoteur', 'Autres']
  },
  { 
    value: 'engins_travaux_publics', 
    label: '🚜 Engins de Travaux Publics', 
    icon: '🚜',
    subcategories: ['Rétrochargeuses', 'Grues', 'Excavatrices', 'Bulldozers', 'Camions', 'Chargeurs', 'Compacteurs', 'Pelles mini', 'Pièces & accessoires', 'Autres']
  },
  { 
    value: 'fete_mariage', 
    label: '💒 Fête & Mariage', 
    icon: '💒',
    subcategories: ['Robes de soirée', 'Robes de mariage', 'Tenues traditionnelles', 'Accessoires mariage', 'Décoration', 'Salles', 'Traiteurs', 'Photographes', 'DJ & Animation', 'Location matériel', 'Coiffure & Maquillage', 'Cadeaux personnalisés', 'Autres']
  },
  { 
    value: 'kaba', 
    label: '🕋 Kaba', 
    icon: '🕋',
    subcategories: []
  },
  { 
    value: 'divers', 
    label: '📦 Divers', 
    icon: '📦',
    subcategories: ['Articles variés', 'Objets insolites', 'Accessoires divers', 'Produits généraux', 'Autres']
  }
]

// ==================== TEMPLATES DE CHAMPS PAR TYPE ====================
const getTemplateFields = (category: string, subcategory: string): CategoryConfig => {
  // Template High-Tech (Smartphones, PC, Électronique)
  const techTemplate: CategoryConfig = {
    marque: { 
      label: 'Marque', 
      type: 'text', 
      placeholder: 'Ex: Samsung, Apple, Dell...', 
      required: false 
    },
    modele: { 
      label: 'Modèle', 
      type: 'text', 
      placeholder: 'Ex: Galaxy S23, iPhone 15, XPS 15...', 
      required: false 
    },
    etat: { 
      label: 'État', 
      type: 'select', 
      options: ['Neuf scellé', 'Neuf déballé', 'Reconditionné', 'Occasion excellent', 'Occasion bon'],
      required: false 
    }
  }

  // Template Smartphones/Tablettes
  if (category === 'telephones_accessoires' && ['Smartphones', 'Téléphones basiques'].includes(subcategory)) {
    return {
      ...techTemplate,
      stockage: { 
        label: 'Stockage', 
        type: 'select', 
        options: ['32Go', '64Go', '128Go', '256Go', '512Go', '1To'],
        required: false 
      },
      ram: { 
        label: 'RAM', 
        type: 'select', 
        options: ['2Go', '3Go', '4Go', '6Go', '8Go', '12Go', '16Go', '18Go'],
        required: false 
      },
      couleur: { 
        label: 'Couleur', 
        type: 'text', 
        placeholder: 'Ex: Noir, Blanc, Bleu...',
        required: false 
      },
      batterie: { 
        label: 'Batterie', 
        type: 'text', 
        placeholder: 'Ex: 5000 mAh',
        unit: 'mAh',
        required: false 
      }
    }
  }

  // Template PC/Informatique
  if (category === 'informatique_it' && ['PC portables', 'PC de bureau', 'PC Gaming'].includes(subcategory)) {
    return {
      ...techTemplate,
      processeur: { 
        label: 'Processeur', 
        type: 'text', 
        placeholder: 'Ex: Intel Core i7-12700H, AMD Ryzen 5...',
        required: false 
      },
      ram: { 
        label: 'RAM', 
        type: 'select', 
        options: ['4Go', '8Go', '16Go', '32Go', '64Go'],
        required: false 
      },
      stockage: { 
        label: 'Stockage', 
        type: 'select', 
        options: ['128Go', '256Go', '512Go', '1To', '2To'],
        required: false 
      },
      carte_graphique: { 
        label: 'Carte Graphique', 
        type: 'text', 
        placeholder: 'Ex: NVIDIA RTX 3060, AMD RX 6700...',
        required: false 
      }
    }
  }

  // Template Gaming
  if (category === 'gaming' && ['Consoles', 'PC Gaming', 'Chaises gaming'].includes(subcategory)) {
    return {
      ...techTemplate,
      plateforme: { 
        label: 'Plateforme', 
        type: 'select', 
        options: ['PlayStation 5', 'PlayStation 4', 'Xbox Series X/S', 'Xbox One', 'Nintendo Switch', 'PC'],
        required: false 
      }
    }
  }

  // Template Véhicules
  if (category === 'vehicules') {
    return {
      marque: { 
        label: 'Marque', 
        type: 'text', 
        placeholder: 'Ex: Renault, Peugeot, Mercedes...', 
        required: false 
      },
      modele: { 
        label: 'Modèle', 
        type: 'text', 
        placeholder: 'Ex: Clio, 208, Classe A...', 
        required: false 
      },
      annee: { 
        label: 'Année', 
        type: 'number', 
        placeholder: '2020', 
        required: false 
      },
      kilometrage: { 
        label: 'Kilométrage', 
        type: 'number', 
        placeholder: '50000', 
        unit: 'km',
        required: false 
      },
      energie: { 
        label: 'Énergie', 
        type: 'select', 
        options: ['Essence', 'Diesel', 'GPL', 'Hybride', 'Électrique'],
        required: false 
      },
      boite: { 
        label: 'Boîte de vitesse', 
        type: 'select', 
        options: ['Manuelle', 'Automatique', 'Semi-automatique'],
        required: false 
      },
      couleur: { 
        label: 'Couleur', 
        type: 'text', 
        placeholder: 'Ex: Blanc, Noir, Gris...',
        required: false 
      },
      etat: { 
        label: 'État', 
        type: 'select', 
        options: ['Neuf', 'Excellent', 'Très bon', 'Bon', 'Correct'],
        required: false 
      }
    }
  }

  // Template Immobilier
  if (category === 'immobilier' || category === 'promoteurs_immobiliers') {
    return {
      type_bien: { 
        label: 'Type de bien', 
        type: 'select', 
        options: ['Appartement', 'Villa', 'Studio', 'Duplex', 'Local Commercial', 'Bureau', 'Terrain', 'Ferme'],
        required: false 
      },
      surface: { 
        label: 'Surface', 
        type: 'number', 
        placeholder: '120', 
        unit: 'm²',
        required: false 
      },
      pieces: { 
        label: 'Nombre de pièces', 
        type: 'number', 
        placeholder: '4', 
        required: false 
      },
      chambres: { 
        label: 'Chambres', 
        type: 'number', 
        placeholder: '3',
        required: false 
      },
      wilaya: { 
        label: 'Wilaya', 
        type: 'text', 
        placeholder: 'Ex: Alger, Oran...',
        required: false 
      },
      commune: { 
        label: 'Commune', 
        type: 'text', 
        placeholder: 'Ex: Hydra, Bir Mourad Raïs...',
        required: false 
      },
      papiers: { 
        label: 'Documents', 
        type: 'select', 
        options: ['Acte notarié', 'Livret foncier', 'Décision de justice', 'Promesse de vente', 'Autre'],
        required: false 
      }
    }
  }

  // Template Électroménager
  if (category === 'electromenager') {
    return {
      marque: { 
        label: 'Marque', 
        type: 'text', 
        placeholder: 'Ex: Samsung, LG, Condor, Bosch...', 
        required: false 
      },
      modele: { 
        label: 'Modèle', 
        type: 'text', 
        placeholder: 'Ex: WW90T554DAN...',
        required: false 
      },
      classe_energetique: { 
        label: 'Classe énergétique', 
        type: 'select', 
        options: ['A+++', 'A++', 'A+', 'A', 'B', 'C', 'D'],
        required: false 
      },
      etat: { 
        label: 'État', 
        type: 'select', 
        options: ['Neuf scellé', 'Neuf déballé', 'Occasion excellent', 'Occasion bon'],
        required: false 
      },
      garantie: { 
        label: 'Garantie', 
        type: 'text', 
        placeholder: 'Ex: 2 ans, 5 ans...',
        required: false 
      }
    }
  }

  // Template Vêtements
  if (category.includes('vetements') || category === 'sportswear') {
    return {
      genre: { 
        label: 'Genre', 
        type: 'select', 
        options: ['Homme', 'Femme', 'Enfant', 'Bébé', 'Unisexe'],
        required: false 
      },
      taille: { 
        label: 'Taille', 
        type: 'select', 
        options: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'],
        required: false 
      },
      couleur: { 
        label: 'Couleur', 
        type: 'text', 
        placeholder: 'Ex: Noir, Blanc, Bleu...',
        required: false 
      },
      matiere: { 
        label: 'Matière', 
        type: 'select', 
        options: ['Coton', 'Polyester', 'Lin', 'Laine', 'Soie', 'Jean', 'Cuir', 'Synthétique'],
        required: false 
      },
      marque: { 
        label: 'Marque', 
        type: 'text', 
        placeholder: 'Ex: Zara, H&M, Nike...',
        required: false 
      },
      etat: { 
        label: 'État', 
        type: 'select', 
        options: ['Neuf avec étiquette', 'Neuf sans étiquette', 'Très bon état', 'Bon état'],
        required: false 
      }
    }
  }

  // Template Meubles
  if (category === 'meubles_maison' || category === 'decoration_maison') {
    return {
      type_meuble: { 
        label: 'Type', 
        type: 'text', 
        placeholder: 'Ex: Canapé, Table, Armoire...',
        required: false 
      },
      matiere: { 
        label: 'Matière', 
        type: 'select', 
        options: ['Bois massif', 'MDF', 'Métal', 'Verre', 'Tissu', 'Cuir', 'Mixte'],
        required: false 
      },
      couleur: { 
        label: 'Couleur', 
        type: 'text', 
        placeholder: 'Ex: Blanc, Noir, Marron...',
        required: false 
      },
      dimensions: { 
        label: 'Dimensions (L x l x H)', 
        type: 'text', 
        placeholder: 'Ex: 200 x 90 x 80 cm',
        required: false 
      },
      etat: { 
        label: 'État', 
        type: 'select', 
        options: ['Neuf', 'Très bon état', 'Bon état'],
        required: false 
      }
    }
  }

  // Template Services (Salons, Restaurants, etc.)
  if (category.includes('salon') || category === 'services_alimentaires') {
    return {
      adresse: { 
        label: 'Adresse', 
        type: 'text', 
        placeholder: 'Ex: 12 Rue Didouche Mourad, Alger',
        required: false 
      },
      horaires: { 
        label: 'Horaires', 
        type: 'text', 
        placeholder: 'Ex: 9h-18h du lundi au samedi',
        required: false 
      },
      telephone: { 
        label: 'Téléphone', 
        type: 'text', 
        placeholder: 'Ex: 0550123456',
        required: false 
      }
    }
  }

  // Template Accessoires / Divers (Minimal)
  return {
    marque: { 
      label: 'Marque', 
      type: 'text', 
      placeholder: 'Ex: Nike, Apple, Sony...',
      required: false 
    },
    etat: { 
      label: 'État', 
      type: 'select', 
      options: ['Neuf', 'Très bon état', 'Bon état', 'Correct'],
      required: false 
    },
    couleur: { 
      label: 'Couleur', 
      type: 'text', 
      placeholder: 'Ex: Noir, Blanc...',
      required: false 
    }
  }
}

// ==================== COMPOSANT PRINCIPAL ====================
export default function CreateProductPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [category, setCategory] = useState('')
  const [subcategory, setSubcategory] = useState('')
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: '',
    old_price: '',
    stock: '1'
  })
  const [metadata, setMetadata] = useState<Record<string, string>>({})
  const [images, setImages] = useState<ProductImage[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isCompressing, setIsCompressing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const discountPercent = productData.price && productData.old_price
    ? Math.round(((parseFloat(productData.old_price) - parseFloat(productData.price)) / parseFloat(productData.old_price)) * 100)
    : 0

  // Sous-catégories de la catégorie sélectionnée
  const currentSubcategories = CATEGORIES.find(c => c.value === category)?.subcategories || []

  // ==================== COMPRESSION D'IMAGES ====================
  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 0.29,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      initialQuality: 0.85,
      fileType: 'image/jpeg'
    }
    
    try {
      const compressedFile = await imageCompression(file, options)
      console.log(`Image compressée: ${(file.size / 1024).toFixed(0)}KB → ${(compressedFile.size / 1024).toFixed(0)}KB`)
      return compressedFile
    } catch (error) {
      console.error('Erreur de compression:', error)
      toast.error('Erreur lors de la compression de l\'image')
      return file
    }
  }

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    
    const remainingSlots = 5 - images.length
    if (remainingSlots === 0) {
      toast.error('Maximum 5 photos atteint')
      return
    }

    const fileArray = Array.from(files).slice(0, remainingSlots)
    setIsCompressing(true)
    toast.loading(`Compression de ${fileArray.length} image(s)...`, { id: 'compressing' })

    try {
      const newImages: ProductImage[] = []

      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i]
        
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} n'est pas une image valide`)
          continue
        }

        const compressedFile = await compressImage(file)
        const preview = URL.createObjectURL(compressedFile)

        newImages.push({
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          file: compressedFile,
          preview,
          compressed: true,
          size: compressedFile.size
        })
      }

      setImages(prev => [...prev, ...newImages])
      toast.success(
        `${newImages.length} image(s) compressée(s) avec succès ! 🎉`, 
        { id: 'compressing', duration: 3000 }
      )
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du traitement des images', { id: 'compressing' })
    } finally {
      setIsCompressing(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleImageUpload(e.dataTransfer.files)
  }

  const removeImage = (id: string) => {
    const imgToRemove = images.find(img => img.id === id)
    if (imgToRemove) {
      URL.revokeObjectURL(imgToRemove.preview)
    }
    setImages(prev => prev.filter(img => img.id !== id))
    toast.success('Image supprimée', { duration: 2000 })
  }

  // ==================== VALIDATION ====================
  const validateStep1 = (): boolean => {
    if (!category) {
      toast.error('Veuillez sélectionner une catégorie')
      return false
    }
    if (!productData.name.trim()) {
      toast.error('Le nom du produit est obligatoire')
      return false
    }
    if (!productData.price || parseFloat(productData.price) <= 0) {
      toast.error('Le prix de vente doit être supérieur à 0')
      return false
    }
    if (productData.old_price && parseFloat(productData.old_price) <= parseFloat(productData.price)) {
      toast.error('L\'ancien prix doit être supérieur au prix de vente')
      return false
    }
    return true
  }

  // Étape 2 : TOUS LES CHAMPS SONT OPTIONNELS
  const validateStep2 = (): boolean => {
    return true // Toujours valide, aucun champ n'est requis
  }

  // ==================== SOUMISSION ====================
  const handleSubmit = async () => {
    if (!validateStep1() || !validateStep2()) {
      return
    }

    if (images.length === 0) {
      toast.error('Veuillez ajouter au moins une photo')
      return
    }

    setIsSubmitting(true)
    setUploadProgress(0)
    toast.loading('Création du produit en cours...', { id: 'submit' })

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        throw new Error('Vous devez être connecté pour créer un produit')
      }

      const imageUrls: string[] = []
      const totalImages = images.length

      for (let i = 0; i < images.length; i++) {
        const img = images[i]
        const fileName = `${user.id}/${Date.now()}-${img.id}.jpg`
        
        setUploadProgress(Math.round(((i + 0.5) / totalImages) * 100))

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('products')
          .upload(fileName, img.file, {
            contentType: 'image/jpeg',
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          console.error('Erreur upload:', uploadError)
          throw new Error(`Erreur lors de l'upload de l'image ${i + 1}`)
        }

        const { data: { publicUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(fileName)

        imageUrls.push(publicUrl)
        setUploadProgress(Math.round(((i + 1) / totalImages) * 100))
      }

      const { data: product, error: insertError } = await supabase
        .from('products')
        .insert({
          vendor_id: user.id,
          name: productData.name.trim(),
          description: productData.description.trim() || null,
          price: parseFloat(productData.price),
          old_price: productData.old_price ? parseFloat(productData.old_price) : null,
          category: category,
          subcategory: subcategory || null, // ← AJOUT DE LA SOUS-CATÉGORIE
          stock: parseInt(productData.stock) || 1,
          images: imageUrls,
          metadata: metadata,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (insertError) {
        console.error('Erreur insertion:', insertError)
        throw new Error('Erreur lors de la création du produit')
      }

      toast.success('🎉 Produit créé avec succès !', { 
        id: 'submit',
        duration: 4000
      })

      setTimeout(() => {
        images.forEach(img => URL.revokeObjectURL(img.preview))
        window.location.href = '/dashboard/vendor/products'
      }, 2000)

    } catch (error: any) {
      console.error('Erreur complète:', error)
      toast.error(error.message || 'Une erreur est survenue lors de la création', { 
        id: 'submit',
        duration: 5000
      })
      setIsSubmitting(false)
      setUploadProgress(0)
    }
  }

  // ==================== RENDU DES CHAMPS DYNAMIQUES ====================
  const renderDynamicFields = () => {
    if (!category) {
      return (
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400 text-lg">
            Sélectionnez d'abord une catégorie à l'étape 1
          </p>
        </div>
      )
    }

    const attributes = getTemplateFields(category, subcategory)
    const attributeEntries = Object.entries(attributes)

    if (attributeEntries.length === 0) {
      return (
        <div className="text-center py-12">
          <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-4" />
          <p className="text-white text-lg font-semibold mb-2">
            Aucune fiche technique requise
          </p>
          <p className="text-gray-400">
            Vous pouvez passer directement à l'étape suivante
          </p>
        </div>
      )
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 
                        flex items-center justify-center border border-white/10">
            <Tag className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Fiche technique du produit</h3>
            <p className="text-sm text-gray-400">
              Tous les champs sont optionnels • Remplissez selon vos besoins
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {attributeEntries.map(([key, config], index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={config.type === 'textarea' ? 'md:col-span-2' : ''}
            >
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                {config.label}
                {config.unit && <span className="text-gray-500 ml-1.5 font-normal">({config.unit})</span>}
              </label>

              {config.type === 'select' ? (
                <select
                  value={metadata[key] || ''}
                  onChange={(e) => setMetadata({ ...metadata, [key]: e.target.value })}
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
                  <option value="" className="bg-[#1a1a1a]">Sélectionner...</option>
                  {config.options?.map(option => (
                    <option key={option} value={option} className="bg-[#1a1a1a] py-2">
                      {option}
                    </option>
                  ))}
                </select>
              ) : config.type === 'textarea' ? (
                <textarea
                  value={metadata[key] || ''}
                  onChange={(e) => setMetadata({ ...metadata, [key]: e.target.value })}
                  placeholder={config.placeholder}
                  rows={4}
                  className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white 
                           placeholder:text-gray-500 hover:border-white/20 focus:outline-none 
                           focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all 
                           duration-200 resize-none"
                />
              ) : (
                <input
                  type={config.type}
                  value={metadata[key] || ''}
                  onChange={(e) => setMetadata({ ...metadata, [key]: e.target.value })}
                  placeholder={config.placeholder}
                  className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white 
                           placeholder:text-gray-500 hover:border-white/20 focus:outline-none 
                           focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                />
              )}
            </motion.div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-300">
              Progression de la fiche technique
            </span>
            <span className="text-sm font-semibold text-blue-400">
              {Object.values(metadata).filter(v => v && v.trim()).length} / {attributeEntries.length} champs remplis
            </span>
          </div>
          <div className="mt-2 h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ 
                width: attributeEntries.length > 0 
                  ? `${(Object.values(metadata).filter(v => v && v.trim()).length / attributeEntries.length) * 100}%` 
                  : '0%'
              }}
              className="h-full bg-gradient-to-r from-blue-500 to-blue-400"
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </motion.div>
    )
  }

  // ==================== RENDU PRINCIPAL ====================
  return (
    <div className="min-h-screen bg-[#0c0c0c] px-4 py-8 md:px-6 lg:px-8">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a1a',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px'
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff'
            }
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff'
            }
          }
        }}
      />

      <div className="max-w-6xl mx-auto mb-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 
                          flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white tracking-tight">
                Créer un produit
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Ajoutez un nouveau produit à votre boutique BZMarket
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex items-center gap-3 mt-8 bg-white/5 backdrop-blur-xl border border-white/10 
                   rounded-3xl p-6"
        >
          {[
            { num: 1, label: 'Informations de base' },
            { num: 2, label: 'Fiche technique' },
            { num: 3, label: 'Photos du produit' }
          ].map((step, index) => (
            <div key={step.num} className="flex items-center flex-1">
              <div className="flex items-center gap-3 flex-1">
                <motion.div 
                  animate={{ 
                    scale: currentStep === step.num ? 1.1 : 1,
                    backgroundColor: currentStep >= step.num ? '#3b82f6' : 'rgba(255, 255, 255, 0.05)'
                  }}
                  transition={{ duration: 0.3 }}
                  className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-2xl 
                           border-2 font-bold text-lg transition-all ${
                    currentStep >= step.num 
                      ? 'border-blue-500 text-white shadow-lg shadow-blue-500/30' 
                      : 'border-white/20 text-gray-500'
                  }`}
                >
                  {currentStep > step.num ? (
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  ) : (
                    step.num
                  )}
                </motion.div>
                <div className="hidden md:block">
                  <p className={`font-semibold text-sm transition-colors ${
                    currentStep >= step.num ? 'text-white' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </p>
                </div>
              </div>
              
              {index < 2 && (
                <motion.div 
                  animate={{ 
                    backgroundColor: currentStep > step.num ? '#3b82f6' : 'rgba(255, 255, 255, 0.1)'
                  }}
                  className="flex-1 h-1 mx-4 rounded-full transition-all"
                />
              )}
            </div>
          ))}
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.4 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] p-8 md:p-10 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/10">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 
                              flex items-center justify-center border border-white/10">
                  <Package className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Informations de base</h2>
                  <p className="text-sm text-gray-400">Commencez par les informations principales</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-3">
                      Catégorie du produit <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => {
                        setCategory(e.target.value)
                        setSubcategory('')
                        setMetadata({})
                        toast.success(`Catégorie sélectionnée`)
                      }}
                      className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white 
                               text-lg hover:border-white/20 focus:outline-none focus:border-blue-500 
                               focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 
                               appearance-none cursor-pointer"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23ffffff'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 1.25rem center',
                        backgroundSize: '1.5rem'
                      }}
                    >
                      <option value="" className="bg-[#1a1a1a]">Choisissez une catégorie...</option>
                      {CATEGORIES.map(cat => (
                        <option key={cat.value} value={cat.value} className="bg-[#1a1a1a] py-3">
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* SOUS-CATÉGORIE (Apparaît dynamiquement) */}
                  {category && currentSubcategories.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <label className="block text-sm font-semibold text-gray-300 mb-3">
                        Sous-catégorie
                      </label>
                      <select
                        value={subcategory}
                        onChange={(e) => {
                          setSubcategory(e.target.value)
                          setMetadata({})
                        }}
                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white 
                                 text-lg hover:border-white/20 focus:outline-none focus:border-blue-500 
                                 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 
                                 appearance-none cursor-pointer"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23ffffff'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 1.25rem center',
                          backgroundSize: '1.5rem'
                        }}
                      >
                        <option value="" className="bg-[#1a1a1a]">Sélectionnez...</option>
                        {currentSubcategories.map(sub => (
                          <option key={sub} value={sub} className="bg-[#1a1a1a] py-3">
                            {sub}
                          </option>
                        ))}
                      </select>
                    </motion.div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Nom du produit <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={productData.name}
                    onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                    placeholder="Ex: iPhone 15 Pro Max 256Go Noir"
                    maxLength={120}
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white 
                             text-lg placeholder:text-gray-500 hover:border-white/20 focus:outline-none 
                             focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {productData.name.length}/120 caractères
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Description du produit
                  </label>
                  <textarea
                    value={productData.description}
                    onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                    placeholder="Décrivez votre produit en détail : état, caractéristiques, avantages..."
                    rows={6}
                    maxLength={2000}
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white 
                             placeholder:text-gray-500 hover:border-white/20 focus:outline-none 
                             focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all 
                             duration-200 resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {productData.description.length}/2000 caractères
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                  <div className="md:col-span-5">
                    <label className="block text-sm font-semibold text-gray-300 mb-3">
                      Prix de vente (DA) <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={productData.price}
                        onChange={(e) => setProductData({ ...productData, price: e.target.value })}
                        placeholder="0"
                        min="0"
                        step="1"
                        className="w-full pl-12 pr-5 py-4 bg-white/5 border border-white/10 rounded-2xl 
                                 text-white text-lg placeholder:text-gray-500 hover:border-white/20 
                                 focus:outline-none focus:border-blue-500 focus:ring-2 
                                 focus:ring-blue-500/20 transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-5">
                    <label className="block text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                      Ancien prix (DA)
                      <span className="text-xs text-gray-500 font-normal">(optionnel pour promo)</span>
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={productData.old_price}
                        onChange={(e) => setProductData({ ...productData, old_price: e.target.value })}
                        placeholder="0"
                        min="0"
                        step="1"
                        className="w-full pl-12 pr-5 py-4 bg-white/5 border border-white/10 rounded-2xl 
                                 text-white text-lg placeholder:text-gray-500 hover:border-white/20 
                                 focus:outline-none focus:border-blue-500 focus:ring-2 
                                 focus:ring-blue-500/20 transition-all duration-200"
                      />
                    </div>
                  </div>

                  {discountPercent > 0 && (
                    <div className="md:col-span-2 flex items-end">
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="w-full h-[56px] bg-gradient-to-br from-green-500/30 to-emerald-500/30 
                                 border-2 border-green-500/50 rounded-2xl flex items-center justify-center 
                                 gap-2 shadow-lg shadow-green-500/20"
                      >
                        <Percent className="w-5 h-5 text-green-400" />
                        <span className="text-2xl font-black text-green-400">
                          -{discountPercent}%
                        </span>
                      </motion.div>
                    </div>
                  )}
                </div>

                <div className="md:w-1/3">
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Quantité en stock
                  </label>
                  <input
                    type="number"
                    value={productData.stock}
                    onChange={(e) => setProductData({ ...productData, stock: e.target.value })}
                    min="1"
                    step="1"
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white 
                             text-lg hover:border-white/20 focus:outline-none focus:border-blue-500 
                             focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-10 pt-6 border-t border-white/10">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (validateStep1()) {
                      setCurrentStep(2)
                    }
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 
                           hover:to-blue-700 text-white font-bold rounded-2xl flex items-center gap-3 
                           shadow-lg shadow-blue-500/30 transition-all duration-200"
                >
                  Suivant
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.4 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] p-8 md:p-10 shadow-2xl"
            >
              {renderDynamicFields()}

              <div className="flex justify-between mt-10 pt-6 border-t border-white/10">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCurrentStep(1)}
                  className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl 
                           flex items-center gap-3 border border-white/10 transition-all duration-200"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Retour
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCurrentStep(3)}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 
                           hover:to-blue-700 text-white font-bold rounded-2xl flex items-center gap-3 
                           shadow-lg shadow-blue-500/30 transition-all duration-200"
                >
                  Suivant
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.4 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] p-8 md:p-10 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 
                                flex items-center justify-center border border-white/10">
                    <ImageIcon className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Photos du produit</h2>
                    <p className="text-sm text-gray-400">
                      Ajoutez jusqu'à 5 photos de haute qualité ({images.length}/5)
                    </p>
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-500/10 border 
                              border-blue-500/20 rounded-xl">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-semibold text-blue-400">Compression automatique &lt; 300Ko</span>
                </div>
              </div>

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => images.length < 5 && !isCompressing && fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-[32px] p-16 text-center cursor-pointer 
                         transition-all duration-300 ${
                  isDragging 
                    ? 'border-blue-500 bg-blue-500/10 scale-[1.02]' 
                    : images.length >= 5
                      ? 'border-white/10 bg-white/5 opacity-50 cursor-not-allowed'
                      : 'border-white/20 hover:border-blue-500/50 bg-white/5 hover:bg-blue-500/5'
                }`}
              >
                {isCompressing ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
                    <div>
                      <p className="text-white font-bold text-lg mb-1">Compression en cours...</p>
                      <p className="text-gray-400 text-sm">Optimisation des images pour le web</p>
                    </div>
                  </motion.div>
                ) : (
                  <>
                    <Upload className="w-20 h-20 mx-auto text-gray-400 mb-4" />
                    <p className="text-white font-bold text-xl mb-2">
                      {images.length >= 5 
                        ? 'Maximum de 5 photos atteint' 
                        : 'Glissez vos images ici ou cliquez'}
                    </p>
                    <p className="text-gray-400 text-sm max-w-md mx-auto">
                      Formats acceptés: JPG, PNG, WebP • Poids max par image: 10 Mo
                      <br />
                      <span className="text-blue-400 font-semibold">
                        Compression automatique activée pour des performances optimales
                      </span>
                    </p>
                  </>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => handleImageUpload(e.target.files)}
                  className="hidden"
                  disabled={images.length >= 5 || isCompressing}
                />
              </div>

              {images.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-8"
                >
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    Images ajoutées ({images.length})
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {images.map((img, index) => (
                      <motion.div
                        key={img.id}
                        initial={{ scale: 0, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative group aspect-square rounded-2xl overflow-hidden border-2 
                                 border-white/10 bg-white/5 hover:border-blue-500/50 transition-all duration-300"
                      >
                        <img
                          src={img.preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent 
                                      to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          {index === 0 && (
                            <motion.div
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              className="px-2.5 py-1 bg-blue-500 rounded-lg text-xs font-bold text-white shadow-lg"
                            >
                              Principal
                            </motion.div>
                          )}
                          {img.compressed && (
                            <motion.div
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: 0.1 }}
                              className="px-2.5 py-1 bg-green-500 rounded-lg text-xs font-bold text-white shadow-lg"
                            >
                              {(img.size / 1024).toFixed(0)}Ko
                            </motion.div>
                          )}
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeImage(img.id)
                          }}
                          className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-xl 
                                   flex items-center justify-center opacity-0 group-hover:opacity-100 
                                   transition-all duration-200 shadow-lg"
                        >
                          <X className="w-5 h-5 text-white" />
                        </button>

                        <div className="absolute bottom-2 right-2 w-7 h-7 bg-black/60 backdrop-blur-sm 
                                      rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 
                                      transition-opacity">
                          <span className="text-xs font-bold text-white">{index + 1}</span>
                        </div>
                      </motion.div>
                    ))}

                    {Array.from({ length: 5 - images.length }).map((_, index) => (
                      <div
                        key={`placeholder-${index}`}
                        className="aspect-square rounded-2xl border-2 border-dashed border-white/10 
                                 bg-white/5 flex items-center justify-center"
                      >
                        <ImageIcon className="w-8 h-8 text-gray-600" />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              <AnimatePresence>
                {images.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-6 p-5 bg-orange-500/10 border border-orange-500/30 rounded-2xl 
                             flex items-start gap-4"
                  >
                    <AlertCircle className="w-6 h-6 text-orange-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-orange-200 font-semibold mb-1">
                        Aucune image ajoutée
                      </p>
                      <p className="text-orange-200/80 text-sm">
                        Vous devez ajouter au moins une photo pour publier votre produit. 
                        Les produits avec plusieurs photos de qualité attirent plus d'acheteurs.
                      </p>
                    </div>
                  </motion.div>
                )}

                {images.length > 0 && images.length < 3 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-5 bg-blue-500/10 border border-blue-500/30 rounded-2xl 
                             flex items-start gap-4"
                  >
                    <Sparkles className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-blue-200 font-semibold mb-1">
                        💡 Conseil: Ajoutez plus de photos
                      </p>
                      <p className="text-blue-200/80 text-sm">
                        Les produits avec 4-5 photos génèrent en moyenne 3x plus de vues et se vendent 
                        2x plus rapidement.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-between mt-10 pt-6 border-t border-white/10">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCurrentStep(2)}
                  disabled={isSubmitting}
                  className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl 
                           flex items-center gap-3 border border-white/10 transition-all duration-200
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Retour
                </motion.button>

                <motion.button
                  whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  onClick={handleSubmit}
                  disabled={isSubmitting || images.length === 0}
                  className="px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-600 
                           hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-2xl 
                           flex items-center gap-3 shadow-lg shadow-green-500/30 transition-all duration-200
                           disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {uploadProgress > 0 && uploadProgress < 100 
                        ? `Upload ${uploadProgress}%` 
                        : 'Publication...'}
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Publier le produit
                    </>
                  )}
                </motion.button>
              </div>

              {isSubmitting && uploadProgress > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-blue-300 font-semibold">
                      Upload des images en cours...
                    </span>
                    <span className="text-sm font-bold text-blue-400">
                      {uploadProgress}%
                    </span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-400"
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
