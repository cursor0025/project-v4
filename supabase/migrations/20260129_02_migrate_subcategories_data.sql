-- ================================================================
-- BZMARKET - MIGRATION 2/4 : MIGRATION DES SOUS-CATÉGORIES
-- Déplace les enfants de categories vers subcategories
-- ================================================================

-- 1. Insérer toutes les sous-catégories (parent_id NOT NULL) dans subcategories
INSERT INTO public.subcategories (
    id,
    name,
    slug,
    category_id,
    description,
    icon,
    is_active,
    display_order,
    created_at
)
SELECT 
    id,
    name,
    slug,
    parent_id AS category_id,
    description,
    icon,
    is_active,
    display_order,
    created_at
FROM public.categories
WHERE parent_id IS NOT NULL
ON CONFLICT (id) DO NOTHING;

-- 2. Mettre à jour la séquence d'auto-incrémentation
SELECT setval(
    'subcategories_id_seq', 
    (SELECT MAX(id) FROM public.subcategories), 
    true
);

-- 3. MISE À JOUR INTELLIGENTE DES PRODUITS (Version BZMarket)
-- Comme tes produits utilisent actuellement du TEXTE (ex: "Voitures"),
-- on cherche l'ID correspondant dans la nouvelle table subcategories.
UPDATE public.products p
SET subcategory_id = s.id
FROM public.subcategories s
WHERE (p.subcategory = s.name) OR (p.category = s.slug);

-- 4. Supprimer les sous-catégories de la table categories
-- Maintenant qu'elles sont dans subcategories, on nettoie la table d'origine.
DELETE FROM public.categories
WHERE parent_id IS NOT NULL;

-- 5. Supprimer la colonne parent_id de categories (plus nécessaire)
ALTER TABLE public.categories
DROP COLUMN IF EXISTS parent_id;

-- ================================================================
-- FIN MIGRATION 2/4
-- ================================================================