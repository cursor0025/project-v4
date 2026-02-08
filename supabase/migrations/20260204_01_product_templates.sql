-- ============================================================
-- MIGRATION : Système de templates pour produits dynamiques
-- Date : 2026-02-04
-- Description : Ajoute les tables pour gérer 15 templates et 44 catégories
-- ============================================================

-- 1. Table des templates (les 15 modèles)
CREATE TABLE IF NOT EXISTS product_templates (
    code VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    has_variants BOOLEAN DEFAULT FALSE,
    variant_config JSONB DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table des attributs (les champs du formulaire)
CREATE TABLE IF NOT EXISTS template_attributes (
    id SERIAL PRIMARY KEY,
    template_code VARCHAR(50) NOT NULL REFERENCES product_templates(code) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    label VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL,
    level INT NOT NULL CHECK (level IN (1, 2, 3)),
    required BOOLEAN DEFAULT FALSE,
    options JSONB DEFAULT NULL,
    conditional_logic JSONB DEFAULT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(template_code, code)
);

-- 3. Table mapping catégories → templates
CREATE TABLE IF NOT EXISTS category_templates (
    category_id INT PRIMARY KEY,
    template_code VARCHAR(50) NOT NULL REFERENCES product_templates(code) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Table des variantes (taille, couleur, prix/stock par combinaison)
CREATE TABLE IF NOT EXISTS product_variants (
    id SERIAL PRIMARY KEY,
    product_id UUID NOT NULL,
    sku VARCHAR(100),
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    stock INT DEFAULT 0 CHECK (stock >= 0),
    attributes JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Table des images par variante
CREATE TABLE IF NOT EXISTS product_variant_images (
    id SERIAL PRIMARY KEY,
    variant_id INT NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    position INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Ajouter template_code à la table products existante (si elle existe)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'template_code') THEN
            ALTER TABLE products ADD COLUMN template_code VARCHAR(50);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'attributes') THEN
            ALTER TABLE products ADD COLUMN attributes JSONB;
        END IF;
    END IF;
END $$;

-- 7. Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_template_attributes_template ON template_attributes(template_code);
CREATE INDEX IF NOT EXISTS idx_template_attributes_level ON template_attributes(level);
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_category_templates_category ON category_templates(category_id);

-- 8. Commentaires pour la documentation
COMMENT ON TABLE product_templates IS 'Définit les 15 templates de produits (fashion_adult, tech_products, etc.)';
COMMENT ON TABLE template_attributes IS 'Champs dynamiques de chaque template (Marque, Matière, etc.) avec niveaux 🔴🟡🟢';
COMMENT ON TABLE category_templates IS 'Mappe chaque catégorie (1-44) vers un template';
COMMENT ON TABLE product_variants IS 'Variantes de produits (Taille M + Couleur Rouge = 1 variante)';
COMMENT ON TABLE product_variant_images IS 'Images spécifiques à chaque variante';

-- ============================================================
-- FIN DE LA MIGRATION
-- ============================================================
