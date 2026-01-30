-- ================================================================
-- BZMARKET - MIGRATION 4/4 : NETTOYAGE FINAL
-- Ajustements RLS et contraintes finales
-- ================================================================

-- 1. Rendre subcategory_id obligatoire pour les nouveaux produits
-- (Les anciens produits peuvent encore avoir category_id temporairement)
ALTER TABLE public.products
ALTER COLUMN subcategory_id SET NOT NULL;

-- 2. Créer une vue pour afficher les produits avec leur hiérarchie complète
CREATE OR REPLACE VIEW public.products_with_categories AS
SELECT 
    p.id,
    p.name AS product_name,
    p.price,
    p.stock,
    s.name AS subcategory_name,
    s.slug AS subcategory_slug,
    c.name AS category_name,
    c.slug AS category_slug,
    s.attributes_config,
    p.owner_id,
    p.created_at
FROM public.products p
LEFT JOIN public.subcategories s ON p.subcategory_id = s.id
LEFT JOIN public.categories c ON s.category_id = c.id;

-- 3. Fonction pour valider les attributs dynamiques d'un produit
CREATE OR REPLACE FUNCTION validate_product_attributes(
    p_subcategory_id bigint,
    p_attributes jsonb
) RETURNS boolean AS $$
DECLARE
    required_attrs jsonb;
    attr jsonb;
BEGIN
    -- Récupérer la config d'attributs de la sous-catégorie
    SELECT attributes_config INTO required_attrs
    FROM public.subcategories
    WHERE id = p_subcategory_id;
    
    -- Si pas de config, validation OK
    IF required_attrs IS NULL THEN
        RETURN TRUE;
    END IF;
    
    -- Vérifier que tous les attributs obligatoires sont présents
    FOR attr IN SELECT * FROM jsonb_array_elements(required_attrs)
    LOOP
        IF (attr->>'required')::boolean = TRUE THEN
            IF NOT (p_attributes ? (attr->>'label')) THEN
                RAISE EXCEPTION 'Attribut obligatoire manquant: %', attr->>'label';
            END IF;
        END IF;
    END LOOP;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 4. Ajouter colonne pour stocker les attributs choisis dans products
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS attributes jsonb DEFAULT '{}'::jsonb;

-- Créer index GIN pour recherche rapide dans les attributs
CREATE INDEX IF NOT EXISTS idx_products_attributes ON public.products USING GIN (attributes);

-- 5. Mettre à jour la policy de lecture des products pour inclure subcategory
DROP POLICY IF EXISTS "Utilisateurs peuvent lire tous les produits" ON public.products;
CREATE POLICY "Lecture publique des produits actifs"
    ON public.products
    FOR SELECT
    USING (stock > 0 OR auth.uid() = owner_id);

-- ================================================================
-- FIN MIGRATION 4/4
-- ================================================================
