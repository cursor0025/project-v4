-- ================================================================
-- BZMARKET - MIGRATION 3/4 : INJECTION DES 16 TEMPLATES D'ATTRIBUTS
-- Version CORRIGÉE avec codes hexadécimaux pour les couleurs
-- ================================================================

-- ================================================================
-- TEMPLATE 1 : TEXTILE (Vêtements)
-- ================================================================
UPDATE public.subcategories
SET attributes_config = '[
  {
    "label": "Taille",
    "type": "select",
    "options": ["XS", "S", "M", "L", "XL", "XXL", "3XL"],
    "is_variant": true,
    "required": true
  },
  {
    "label": "Couleur",
    "type": "color",
    "options": [
      { "label": "Noir", "value": "#000000" },
      { "label": "Blanc", "value": "#FFFFFF" },
      { "label": "Rouge", "value": "#FF0000" },
      { "label": "Bleu", "value": "#0000FF" },
      { "label": "Vert", "value": "#00FF00" },
      { "label": "Jaune", "value": "#FFFF00" },
      { "label": "Rose", "value": "#FFC0CB" },
      { "label": "Gris", "value": "#808080" },
      { "label": "Beige", "value": "#F5F5DC" },
      { "label": "Orange", "value": "#FFA500" },
      { "label": "Violet", "value": "#800080" },
      { "label": "Marron", "value": "#8B4513" }
    ],
    "is_variant": true,
    "required": true
  },
  {
    "label": "Matière",
    "type": "select",
    "options": ["Coton", "Polyester", "Soie", "Lin", "Jeans", "Cuir", "Laine", "Velours"],
    "is_variant": false,
    "required": false
  },
  {
    "label": "Marque",
    "type": "text",
    "is_variant": false,
    "required": false
  }
]'::jsonb
WHERE slug IN (
    -- Vêtements Femme
    'robes', 'tops-chemisiers', 'pantalons', 'jupes', 'abayas', 
    'lingerie', 'sportswear-femme', 'autres-vetements-femme',
    -- Vêtements Homme
    't-shirts', 'chemises', 'pantalons-homme', 'jeans', 'pulls', 
    'vestes-manteaux', 'sportswear-homme', 'tenues-traditionnelles', 'autres-vetements-homme',
    -- Vêtements Homme Classique
    'costumes', 'chemises-classiques', 'pantalons-classiques', 
    'vestes-blazers', 'cravates', 'ceintures', 'accessoires-elegants',
    -- Sportswear
    't-shirts-sport', 'survetements', 'shorts', 'leggings', 
    'brassieres', 'vestes-sport', 'tenues-sport'
);

-- ================================================================
-- TEMPLATE 2 : TEXTILE BÉBÉ (Tailles spécifiques)
-- ================================================================
UPDATE public.subcategories
SET attributes_config = '[
  {
    "label": "Taille",
    "type": "select",
    "options": ["0-3 mois", "3-6 mois", "6-9 mois", "9-12 mois", "12-18 mois", "18-24 mois", "2 ans", "3 ans", "4 ans"],
    "is_variant": true,
    "required": true
  },
  {
    "label": "Couleur",
    "type": "color",
    "options": [
      { "label": "Rose", "value": "#FFC0CB" },
      { "label": "Bleu Ciel", "value": "#87CEEB" },
      { "label": "Blanc", "value": "#FFFFFF" },
      { "label": "Jaune Pastel", "value": "#FFFACD" },
      { "label": "Vert Menthe", "value": "#98FF98" },
      { "label": "Beige", "value": "#F5F5DC" },
      { "label": "Multicolore", "value": "#RAINBOW" }
    ],
    "is_variant": true,
    "required": true
  },
  {
    "label": "Matière",
    "type": "select",
    "options": ["Coton 100%", "Coton Bio", "Velours", "Polaire"],
    "is_variant": false,
    "required": false
  }
]'::jsonb
WHERE slug IN (
    'bodies', 'pyjamas', 'ensembles-bebe', 'pulls-gilets', 
    'chaussures-bebe', 'bonnets-gants', 'tenues-nouveau-ne', 'couvertures'
);

-- ================================================================
-- TEMPLATE 3 : CHAUSSANT (Pointures)
-- ================================================================
UPDATE public.subcategories
SET attributes_config = '[
  {
    "label": "Pointure",
    "type": "select",
    "options": ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46"],
    "is_variant": true,
    "required": true
  },
  {
    "label": "Couleur",
    "type": "color",
    "options": [
      { "label": "Noir", "value": "#000000" },
      { "label": "Blanc", "value": "#FFFFFF" },
      { "label": "Marron", "value": "#8B4513" },
      { "label": "Beige", "value": "#F5F5DC" },
      { "label": "Gris", "value": "#808080" },
      { "label": "Rouge", "value": "#FF0000" },
      { "label": "Bleu Marine", "value": "#000080" },
      { "label": "Kaki", "value": "#C3B091" },
      { "label": "Bordeaux", "value": "#800020" }
    ],
    "is_variant": true,
    "required": true
  },
  {
    "label": "Matière",
    "type": "select",
    "options": ["Cuir", "Daim", "Tissu", "Synthétique", "Caoutchouc"],
    "is_variant": false,
    "required": false
  },
  {
    "label": "Marque",
    "type": "text",
    "is_variant": false,
    "required": false
  }
]'::jsonb
WHERE slug IN (
    'chaussures', 'chaussures-femme', 'chaussures-homme', 
    'chaussures-habillees', 'chaussures-sport', 'chaussures-enfant'
);

-- ================================================================
-- TEMPLATE 4 : MOBILE (Smartphones/Tablettes)
-- ================================================================
UPDATE public.subcategories
SET attributes_config = '[
  {
    "label": "Marque",
    "type": "select",
    "options": ["Samsung", "iPhone", "Xiaomi", "Huawei", "Oppo", "Realme", "OnePlus", "Google Pixel", "Autres"],
    "is_variant": false,
    "required": true
  },
  {
    "label": "Stockage",
    "type": "select",
    "options": ["64 Go", "128 Go", "256 Go", "512 Go", "1 To"],
    "is_variant": true,
    "required": true,
    "suffix": "Go"
  },
  {
    "label": "RAM",
    "type": "select",
    "options": ["4 Go", "6 Go", "8 Go", "12 Go", "16 Go"],
    "is_variant": false,
    "required": false,
    "suffix": "Go"
  },
  {
    "label": "Couleur",
    "type": "color",
    "options": [
      { "label": "Noir", "value": "#000000" },
      { "label": "Blanc", "value": "#FFFFFF" },
      { "label": "Bleu", "value": "#0000FF" },
      { "label": "Vert", "value": "#00FF00" },
      { "label": "Rouge", "value": "#FF0000" },
      { "label": "Or", "value": "#FFD700" },
      { "label": "Argent", "value": "#C0C0C0" },
      { "label": "Violet", "value": "#800080" },
      { "label": "Rose Gold", "value": "#B76E79" },
      { "label": "Titane", "value": "#878681" }
    ],
    "is_variant": true,
    "required": true
  },
  {
    "label": "État",
    "type": "select",
    "options": ["Neuf (Sous blister)", "Caba (Neuf sans boite)", "Occasion 10/10", "Occasion 9/10", "Reconditionné"],
    "is_variant": false,
    "required": true
  }
]'::jsonb
WHERE slug IN ('smartphones', 'tablettes');

-- ================================================================
-- TEMPLATE 5 : COMPUTING (PC/Laptops)
-- ================================================================
UPDATE public.subcategories
SET attributes_config = '[
  {
    "label": "Processeur (CPU)",
    "type": "select",
    "options": ["Intel Core i3", "Intel Core i5", "Intel Core i7", "Intel Core i9", "AMD Ryzen 3", "AMD Ryzen 5", "AMD Ryzen 7", "AMD Ryzen 9"],
    "is_variant": false,
    "required": true
  },
  {
    "label": "Carte Graphique (GPU)",
    "type": "select",
    "options": ["Intégrée", "NVIDIA GTX 1650", "NVIDIA RTX 3050", "NVIDIA RTX 3060", "NVIDIA RTX 4060", "AMD Radeon"],
    "is_variant": false,
    "required": false
  },
  {
    "label": "Disque Dur",
    "type": "select",
    "options": ["SSD 256 Go", "SSD 512 Go", "SSD 1 To", "HDD 1 To", "HDD 2 To"],
    "is_variant": false,
    "required": true
  },
  {
    "label": "RAM",
    "type": "select",
    "options": ["8 Go", "16 Go", "32 Go", "64 Go"],
    "is_variant": false,
    "required": true,
    "suffix": "Go"
  },
  {
    "label": "État",
    "type": "select",
    "options": ["Neuf", "Occasion", "Reconditionné"],
    "is_variant": false,
    "required": true
  }
]'::jsonb
WHERE slug IN ('pc-portables', 'pc-bureau', 'pc-gaming');

-- ================================================================
-- TEMPLATE 6 : GAMING (Consoles)
-- ================================================================
UPDATE public.subcategories
SET attributes_config = '[
  {
    "label": "Plateforme",
    "type": "select",
    "options": ["PlayStation 5", "PlayStation 4", "Xbox Series X", "Xbox Series S", "Nintendo Switch", "Nintendo Switch OLED"],
    "is_variant": false,
    "required": true
  },
  {
    "label": "Stockage",
    "type": "select",
    "options": ["500 Go", "1 To", "2 To"],
    "is_variant": false,
    "required": false,
    "suffix": "Go"
  },
  {
    "label": "État",
    "type": "select",
    "options": ["Neuf (Scellé)", "Neuf (Ouvert)", "Occasion", "Flashé"],
    "is_variant": false,
    "required": true
  },
  {
    "label": "Contenu",
    "type": "select",
    "options": ["Console seule", "Avec 1 manette", "Avec 2 manettes", "Pack avec jeux"],
    "is_variant": false,
    "required": false
  }
]'::jsonb
WHERE slug = 'consoles';

-- ================================================================
-- TEMPLATE 7 : ÉLECTROMÉNAGER
-- ================================================================
UPDATE public.subcategories
SET attributes_config = '[
  {
    "label": "Marque",
    "type": "select",
    "options": ["Condor", "Iris", "Samsung", "LG", "Midea", "Hisense", "Bosch", "Autres"],
    "is_variant": false,
    "required": false
  },
  {
    "label": "Capacité",
    "type": "text",
    "is_variant": false,
    "required": true,
    "placeholder": "Ex: 7 kg, 500 L, 12000 BTU"
  },
  {
    "label": "Classe Énergétique",
    "type": "select",
    "options": ["A+++", "A++", "A+", "A", "B"],
    "is_variant": false,
    "required": false
  },
  {
    "label": "État",
    "type": "select",
    "options": ["Neuf (Carton scellé)", "Neuf (Rayé)", "Occasion"],
    "is_variant": false,
    "required": true
  },
  {
    "label": "Garantie",
    "type": "select",
    "options": ["1 an", "2 ans", "Sans garantie"],
    "is_variant": false,
    "required": false
  }
]'::jsonb
WHERE slug IN (
    'machines-a-laver', 'refrigerateurs', 'televisions', 
    'fours', 'micro-ondes', 'lave-vaisselle', 
    'cuisinieres-plaques', 'climatisation-chauffage', 
    'aspirateurs', 'congelateurs'
);

-- ================================================================
-- TEMPLATE 8 : MEUBLES (Dimensions)
-- ================================================================
UPDATE public.subcategories
SET attributes_config = '[
  {
    "label": "Dimensions (L x l x H)",
    "type": "text",
    "is_variant": false,
    "required": true,
    "placeholder": "Ex: 200 x 90 x 75 cm",
    "suffix": "cm"
  },
  {
    "label": "Matière",
    "type": "select",
    "options": ["Bois Massif", "Bois MDF", "Métal", "Verre", "Plastique", "Tissu", "Cuir"],
    "is_variant": false,
    "required": false
  },
  {
    "label": "Couleur",
    "type": "select",
    "options": ["Blanc", "Noir", "Bois Naturel", "Gris", "Beige", "Marron"],
    "is_variant": false,
    "required": false
  }
]'::jsonb
WHERE slug IN (
    'salon-meubles', 'chambre-meubles', 'bureau-meubles', 
    'cuisine-meubles', 'salle-bain', 'jardin'
);

-- ================================================================
-- TEMPLATE 9 : AUTOMOBILE
-- ================================================================
UPDATE public.subcategories
SET attributes_config = '[
  {
    "label": "Année",
    "type": "number",
    "is_variant": false,
    "required": true,
    "placeholder": "Ex: 2020"
  },
  {
    "label": "Kilométrage",
    "type": "number",
    "is_variant": false,
    "required": true,
    "suffix": "km"
  },
  {
    "label": "Carburant",
    "type": "select",
    "options": ["Essence", "Diesel", "GPL", "Hybride", "Électrique"],
    "is_variant": false,
    "required": true
  },
  {
    "label": "Boîte de Vitesse",
    "type": "select",
    "options": ["Manuelle", "Automatique", "Séquentielle"],
    "is_variant": false,
    "required": true
  },
  {
    "label": "Moteur",
    "type": "text",
    "is_variant": false,
    "required": false,
    "placeholder": "Ex: 1.6 HDI, 2.0 TDI"
  },
  {
    "label": "Papiers",
    "type": "select",
    "options": ["Carte Grise", "Moudjahid", "Carte Jaune", "Sans papiers"],
    "is_variant": false,
    "required": true
  }
]'::jsonb
WHERE slug IN ('voitures', 'motos', 'camions', 'utilitaires');

-- ================================================================
-- TEMPLATE 10 : PIÈCES AUTO (Compatibilité)
-- ================================================================
UPDATE public.subcategories
SET attributes_config = '[
  {
    "label": "Marque Compatible",
    "type": "select",
    "options": ["Renault", "Peugeot", "Volkswagen", "Hyundai", "Kia", "Mercedes", "BMW", "Autres"],
    "is_variant": false,
    "required": true
  },
  {
    "label": "Modèle Compatible",
    "type": "text",
    "is_variant": false,
    "required": true,
    "placeholder": "Ex: Clio 4, Golf 7, Polo"
  },
  {
    "label": "État",
    "type": "select",
    "options": ["Neuf (Origine)", "Neuf (Adaptable)", "Occasion (Casse)"],
    "is_variant": false,
    "required": true
  }
]'::jsonb
WHERE slug IN ('pieces-moteur', 'carrosserie', 'pneus-jantes', 'pieces-moto', 'accessoires-auto');

-- ================================================================
-- TEMPLATE 11 : COSMÉTIQUE
-- ================================================================
UPDATE public.subcategories
SET attributes_config = '[
  {
    "label": "Marque",
    "type": "text",
    "is_variant": false,
    "required": false
  },
  {
    "label": "Contenance",
    "type": "select",
    "options": ["30 ml", "50 ml", "100 ml", "250 ml", "500 ml", "1 L"],
    "is_variant": true,
    "required": true,
    "suffix": "ml"
  },
  {
    "label": "Teinte",
    "type": "color",
    "options": [
      { "label": "Beige Clair", "value": "#F5F5DC" },
      { "label": "Beige Moyen", "value": "#D2B48C" },
      { "label": "Beige Foncé", "value": "#C19A6B" },
      { "label": "Rose Clair", "value": "#FFB6C1" },
      { "label": "Rose Moyen", "value": "#FFC0CB" },
      { "label": "Brun Clair", "value": "#D2691E" },
      { "label": "Brun Foncé", "value": "#8B4513" },
      { "label": "Sans teinte", "value": "#TRANSPARENT" }
    ],
    "is_variant": true,
    "required": false
  },
  {
    "label": "Type de Peau",
    "type": "select",
    "options": ["Grasse", "Sèche", "Mixte", "Normale", "Tous types"],
    "is_variant": false,
    "required": false
  }
]'::jsonb
WHERE slug IN (
    'parfums', 'maquillage', 'soin-visage', 'soin-cheveux', 
    'hygiene', 'bien-etre', 'appareils-beaute',
    'fond-teint', 'rouge-levres', 'mascara', 'correcteurs', 
    'poudres', 'palettes', 'soin-corps'
);

-- ================================================================
-- TEMPLATE 12 : VAPE
-- ================================================================
UPDATE public.subcategories
SET attributes_config = '[
  {
    "label": "Type",
    "type": "select",
    "options": ["E-cigarette", "Pod", "Clearomiseur", "Résistance", "Batterie"],
    "is_variant": false,
    "required": true
  },
  {
    "label": "Nicotine",
    "type": "select",
    "options": ["0 mg", "3 mg", "6 mg", "12 mg", "18 mg"],
    "is_variant": true,
    "required": false,
    "suffix": "mg"
  },
  {
    "label": "Saveur",
    "type": "text",
    "is_variant": false,
    "required": false,
    "placeholder": "Ex: Menthe, Fraise, Tabac"
  }
]'::jsonb
WHERE slug IN ('e-cigarettes', 'pods', 'clearomiseurs', 'resistances-vape', 'batteries-vape');

-- ================================================================
-- TEMPLATE 13 : IMMOBILIER
-- ================================================================
UPDATE public.subcategories
SET attributes_config = '[
  {
    "label": "Surface",
    "type": "number",
    "is_variant": false,
    "required": true,
    "suffix": "m²"
  },
  {
    "label": "Nombre de Pièces",
    "type": "select",
    "options": ["Studio", "F2", "F3", "F4", "F5", "Villa R+1", "Villa R+2", "Villa R+3"],
    "is_variant": false,
    "required": true
  },
  {
    "label": "Étage",
    "type": "select",
    "options": ["RDC", "1er", "2ème", "3ème", "4ème", "5ème+", "Avec ascenseur"],
    "is_variant": false,
    "required": false
  },
  {
    "label": "Papiers",
    "type": "select",
    "options": ["Acte Notarié", "Livret Foncier", "Papier Timbré", "Promesse de Vente"],
    "is_variant": false,
    "required": true
  }
]'::jsonb
WHERE slug IN ('appartements', 'villas', 'terrains', 'locaux-commerciaux', 'projets-immobiliers');

-- ================================================================
-- TEMPLATE 14 : BIJOUX
-- ================================================================
UPDATE public.subcategories
SET attributes_config = '[
  {
    "label": "Métal",
    "type": "select",
    "options": ["Or 18K", "Or 24K", "Argent 925", "Plaqué Or", "Fantaisie"],
    "is_variant": false,
    "required": true
  },
  {
    "label": "Type de Vente",
    "type": "select",
    "options": ["À la pièce", "Au gramme"],
    "is_variant": false,
    "required": true
  },
  {
    "label": "Poids (si au gramme)",
    "type": "number",
    "is_variant": false,
    "required": false,
    "suffix": "g"
  },
  {
    "label": "Taille (pour bagues)",
    "type": "select",
    "options": ["48", "50", "52", "54", "56", "58", "60", "62"],
    "is_variant": true,
    "required": false
  },
  {
    "label": "Pierre",
    "type": "select",
    "options": ["Diamant", "Émeraude", "Rubis", "Zirconium", "Sans pierre"],
    "is_variant": false,
    "required": false
  }
]'::jsonb
WHERE slug IN ('colliers', 'bracelets', 'bagues', 'boucles-oreilles', 'parures', 'bijoux-argent', 'bijoux-or');

-- ================================================================
-- TEMPLATE 15 : ALIMENTAIRE
-- ================================================================
UPDATE public.subcategories
SET attributes_config = '[
  {
    "label": "Poids/Volume",
    "type": "text",
    "is_variant": false,
    "required": true,
    "placeholder": "Ex: 500g, 1kg, 1L"
  },
  {
    "label": "Date de Péremption",
    "type": "text",
    "is_variant": false,
    "required": true,
    "placeholder": "Ex: 12/2026"
  },
  {
    "label": "Origine",
    "type": "select",
    "options": ["Locale", "Importée"],
    "is_variant": false,
    "required": false
  },
  {
    "label": "Certification",
    "type": "select",
    "options": ["Bio", "Halal", "Standard"],
    "is_variant": false,
    "required": false
  }
]'::jsonb
WHERE slug IN ('epicerie', 'produits-frais', 'boissons', 'produits-artisanaux', 'produits-bio');

-- ================================================================
-- TEMPLATE 16 : SERVICES (Prestations)
-- ================================================================
UPDATE public.subcategories
SET attributes_config = '[
  {
    "label": "Lieu",
    "type": "select",
    "options": ["À domicile", "En salon", "En ligne"],
    "is_variant": false,
    "required": true
  },
  {
    "label": "Disponibilité",
    "type": "select",
    "options": ["Sur RDV", "Immédiat"],
    "is_variant": false,
    "required": true
  },
  {
    "label": "Durée",
    "type": "select",
    "options": ["30 min", "1h", "2h", "Demi-journée", "Journée complète"],
    "is_variant": false,
    "required": false
  }
]'::jsonb
WHERE slug IN (
    'coupe-homme', 'degrade-fade', 'rasage-barbe', 'coloration-homme',
    'coupe-femme', 'brushing', 'coloration-meches', 'balayage-ombre', 
    'lissage-botox', 'manucure-pedicure', 'epilation',
    'restaurants', 'fast-food', 'cafes', 'patisseries', 
    'voyages', 'hajj-omra', 'cours-particuliers', 'soutien-scolaire'
);

-- ================================================================
-- TEMPLATE 17 : UNIVERSEL (Par défaut pour tout le reste)
-- ================================================================
UPDATE public.subcategories
SET attributes_config = '[
  {
    "label": "Marque",
    "type": "text",
    "is_variant": false,
    "required": false
  },
  {
    "label": "Couleur",
    "type": "color",
    "options": [
      { "label": "Noir", "value": "#000000" },
      { "label": "Blanc", "value": "#FFFFFF" },
      { "label": "Rouge", "value": "#FF0000" },
      { "label": "Bleu", "value": "#0000FF" },
      { "label": "Vert", "value": "#00FF00" },
      { "label": "Jaune", "value": "#FFFF00" },
      { "label": "Multicolore", "value": "#RAINBOW" }
    ],
    "is_variant": false,
    "required": false
  },
  {
    "label": "État",
    "type": "select",
    "options": ["Neuf", "Occasion", "Reconditionné"],
    "is_variant": false,
    "required": false
  }
]'::jsonb
WHERE attributes_config IS NULL;

-- ================================================================
-- FIN MIGRATION 3/4
-- ================================================================
