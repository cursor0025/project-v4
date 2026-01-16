-- ============================================
-- MIGRATION : Ajout ZR Express
-- Date: 15 Janvier 2026
-- Règle: Tarifs pour 0-5kg, puis +50 DA/kg
-- ============================================

-- ÉTAPE 1: Modifier shipping_providers
-- -------------------------------------------------
ALTER TABLE shipping_providers
ADD COLUMN IF NOT EXISTS weight_base_kg DECIMAL(10,2) DEFAULT 5.0,
ADD COLUMN IF NOT EXISTS price_per_extra_kg DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS delivery_time_min INTEGER DEFAULT 2,
ADD COLUMN IF NOT EXISTS delivery_time_max INTEGER DEFAULT 4;

-- ÉTAPE 2: Modifier shipping_rates
-- -------------------------------------------------
ALTER TABLE shipping_rates 
ADD COLUMN IF NOT EXISTS price_return DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS price_desk DECIMAL(10,2);

-- ÉTAPE 3: Ajouter le transporteur ZR Express
-- -------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM shipping_providers WHERE name = 'ZR Express') THEN
    INSERT INTO shipping_providers (
      name,
      slug,
      logo_url,
      tracking_prefix,
      tracking_url_template,
      phone_number,
      rating,
      review_count,
      is_active,
      weight_base_kg,
      price_per_extra_kg,
      delivery_time_min,
      delivery_time_max
    ) VALUES (
      'ZR Express',
      'zr-express',
      '/logos/zr-express.png',
      'ZR',
      'https://zrexpress.dz/tracking?code={tracking_number}',
      '0770 705 007',
      4.5,
      0,
      true,
      5.0,
      50.0,
      2,
      4
    );
  END IF;
END $$;

-- ÉTAPE 4: Insérer les tarifs pour les 54 wilayas
-- -------------------------------------------------
DO $$
DECLARE
  v_provider_id UUID;
BEGIN
  -- Récupérer l'ID de ZR Express
  SELECT id INTO v_provider_id FROM shipping_providers WHERE name = 'ZR Express';
  
  -- Supprimer les anciens tarifs ZR Express s'ils existent
  DELETE FROM shipping_rates WHERE provider_id = v_provider_id;
  
  -- Insérer les nouveaux tarifs pour les 54 wilayas
  INSERT INTO shipping_rates (
    provider_id, 
    origin_wilaya,
    destination_wilaya, 
    price_home, 
    price_office,
    price_desk,
    price_return,
    delivery_days_min,
    delivery_days_max,
    is_available
  ) VALUES
    -- 01. Adrar
    (v_provider_id, 'Alger', 'Adrar', 1400.00, 970.00, 970.00, 200.00, 2, 4, true),
    
    -- 02. Chlef
    (v_provider_id, 'Alger', 'Chlef', 750.00, 520.00, 520.00, 200.00, 2, 4, true),
    
    -- 03. Laghouat
    (v_provider_id, 'Alger', 'Laghouat', 950.00, 670.00, 670.00, 200.00, 2, 4, true),
    
    -- 04. Oum El Bouaghi
    (v_provider_id, 'Alger', 'Oum El Bouaghi', 700.00, 520.00, 520.00, 200.00, 2, 4, true),
    
    -- 05. Batna
    (v_provider_id, 'Alger', 'Batna', 700.00, 520.00, 520.00, 200.00, 2, 4, true),
    
    -- 06. Bejaia
    (v_provider_id, 'Alger', 'Bejaia', 750.00, 520.00, 520.00, 200.00, 2, 4, true),
    
    -- 07. Biskra
    (v_provider_id, 'Alger', 'Biskra', 900.00, 620.00, 620.00, 200.00, 2, 4, true),
    
    -- 08. Bechar
    (v_provider_id, 'Alger', 'Bechar', 1100.00, 720.00, 720.00, 200.00, 2, 4, true),
    
    -- 09. Blida
    (v_provider_id, 'Alger', 'Blida', 750.00, 520.00, 520.00, 200.00, 2, 4, true),
    
    -- 10. Bouira
    (v_provider_id, 'Alger', 'Bouira', 700.00, 520.00, 520.00, 200.00, 2, 4, true),
    
    -- 11. Tamanrasset
    (v_provider_id, 'Alger', 'Tamanrasset', 1600.00, 1120.00, 1120.00, 250.00, 2, 4, true),
    
    -- 12. Tebessa
    (v_provider_id, 'Alger', 'Tebessa', 800.00, 520.00, 520.00, 200.00, 2, 4, true),
    
    -- 13. Tlemcen
    (v_provider_id, 'Alger', 'Tlemcen', 900.00, 570.00, 570.00, 200.00, 2, 4, true),
    
    -- 14. Tiaret
    (v_provider_id, 'Alger', 'Tiaret', 800.00, 520.00, 520.00, 200.00, 2, 4, true),
    
    -- 15. Tizi Ouzou
    (v_provider_id, 'Alger', 'Tizi Ouzou', 700.00, 520.00, 520.00, 200.00, 2, 4, true),
    
    -- 16. Alger
    (v_provider_id, 'Alger', 'Alger', 600.00, 470.00, 470.00, 200.00, 2, 4, true),
    
    -- 17. Djelfa
    (v_provider_id, 'Alger', 'Djelfa', 950.00, 670.00, 670.00, 200.00, 2, 4, true),
    
    -- 18. Jijel
    (v_provider_id, 'Alger', 'Jijel', 750.00, 520.00, 520.00, 200.00, 2, 4, true),
    
    -- 19. Setif
    (v_provider_id, 'Alger', 'Setif', 750.00, 520.00, 520.00, 200.00, 2, 4, true),
    
    -- 20. Saida
    (v_provider_id, 'Alger', 'Saida', 800.00, 570.00, 570.00, 200.00, 2, 4, true),
    
    -- 21. Skikda
    (v_provider_id, 'Alger', 'Skikda', 700.00, 520.00, 520.00, 200.00, 2, 4, true),
    
    -- 22. Sidi Bel Abbes
    (v_provider_id, 'Alger', 'Sidi Bel Abbes', 800.00, 520.00, 520.00, 200.00, 2, 4, true),
    
    -- 23. Annaba
    (v_provider_id, 'Alger', 'Annaba', 750.00, 520.00, 520.00, 200.00, 2, 4, true),
    
    -- 24. Guelma
    (v_provider_id, 'Alger', 'Guelma', 700.00, 520.00, 520.00, 200.00, 2, 4, true),
    
    -- 25. Constantine
    (v_provider_id, 'Alger', 'Constantine', 500.00, 370.00, 370.00, 200.00, 2, 4, true),
    
    -- 26. Medea
    (v_provider_id, 'Alger', 'Medea', 800.00, 520.00, 520.00, 200.00, 2, 4, true),
    
    -- 27. Mostaganem
    (v_provider_id, 'Alger', 'Mostaganem', 800.00, 520.00, 520.00, 200.00, 2, 4, true),
    
    -- 28. M'Sila
    (v_provider_id, 'Alger', 'M''Sila', 800.00, 570.00, 570.00, 200.00, 2, 4, true),
    
    -- 29. Mascara
    (v_provider_id, 'Alger', 'Mascara', 800.00, 520.00, 520.00, 200.00, 2, 4, true),
    
    -- 30. Ouargla
    (v_provider_id, 'Alger', 'Ouargla', 900.00, 670.00, 670.00, 200.00, 2, 4, true),
    
    -- 31. Oran
    (v_provider_id, 'Alger', 'Oran', 750.00, 520.00, 520.00, 200.00, 2, 4, true),
    
    -- 32. El Bayadh
    (v_provider_id, 'Alger', 'El Bayadh', 1050.00, 670.00, 670.00, 200.00, 2, 4, true),
    
    -- 33. Illizi - NON DESSERVIE
    
    -- 34. Bordj Bou Arreridj
    (v_provider_id, 'Alger', 'Bordj Bou Arreridj', 700.00, 520.00, 520.00, 200.00, 2, 4, true),
    
    -- 35. Boumerdes
    (v_provider_id, 'Alger', 'Boumerdes', 750.00, 520.00, 520.00, 200.00, 2, 4, true),
    
    -- 36. El Tarf
    (v_provider_id, 'Alger', 'El Tarf', 800.00, 520.00, 520.00, 200.00, 2, 4, true),
    
    -- 37. Tindouf - NON DESSERVIE
    
    -- 38. Tissemsilt (PAS DE STOP DESK)
    (v_provider_id, 'Alger', 'Tissemsilt', 800.00, 0, 0, 200.00, 2, 4, true),
    
    -- 39. El Oued
    (v_provider_id, 'Alger', 'El Oued', 950.00, 670.00, 670.00, 200.00, 2, 4, true),
    
    -- 40. Khenchela (PAS DE STOP DESK)
    (v_provider_id, 'Alger', 'Khenchela', 700.00, 0, 0, 200.00, 2, 4, true),
    
    -- 41. Souk Ahras
    (v_provider_id, 'Alger', 'Souk Ahras', 750.00, 520.00, 520.00, 200.00, 2, 4, true),
    
    -- 42. Tipaza
    (v_provider_id, 'Alger', 'Tipaza', 800.00, 520.00, 520.00, 200.00, 2, 4, true),
    
    -- 43. Mila
    (v_provider_id, 'Alger', 'Mila', 750.00, 520.00, 520.00, 200.00, 2, 4, true),
    
    -- 44. Ain Defla
    (v_provider_id, 'Alger', 'Ain Defla', 750.00, 520.00, 520.00, 200.00, 2, 4, true),
    
    -- 45. Naama
    (v_provider_id, 'Alger', 'Naama', 1100.00, 670.00, 670.00, 200.00, 2, 4, true),
    
    -- 46. Ain Temouchent
    (v_provider_id, 'Alger', 'Ain Temouchent', 800.00, 520.00, 520.00, 200.00, 2, 4, true),
    
    -- 47. Ghardaia
    (v_provider_id, 'Alger', 'Ghardaia', 950.00, 670.00, 670.00, 200.00, 2, 4, true),
    
    -- 48. Relizane
    (v_provider_id, 'Alger', 'Relizane', 800.00, 520.00, 520.00, 200.00, 2, 4, true),
    
    -- 49. Timimoun (PAS DE STOP DESK)
    (v_provider_id, 'Alger', 'Timimoun', 1400.00, 0, 0, 200.00, 2, 4, true),
    
    -- 50. Bordj Badji Mokhtar - NON DESSERVIE
    
    -- 51. Ouled Djellal
    (v_provider_id, 'Alger', 'Ouled Djellal', 900.00, 620.00, 620.00, 200.00, 2, 4, true),
    
    -- 52. Beni Abbes
    (v_provider_id, 'Alger', 'Beni Abbes', 1000.00, 970.00, 970.00, 200.00, 2, 4, true),
    
    -- 53. In Salah (PAS DE STOP DESK)
    (v_provider_id, 'Alger', 'In Salah', 1600.00, 0, 0, 250.00, 2, 4, true),
    
    -- 54. In Guezzam (PAS DE STOP DESK)
    (v_provider_id, 'Alger', 'In Guezzam', 1600.00, 0, 0, 250.00, 2, 4, true),
    
    -- 55. Touggourt
    (v_provider_id, 'Alger', 'Touggourt', 950.00, 670.00, 670.00, 200.00, 2, 4, true),
    
    -- 56. Djanet - NON DESSERVIE
    
    -- 57. M'Ghair (PAS DE STOP DESK)
    (v_provider_id, 'Alger', 'M''Ghair', 950.00, 0, 0, 200.00, 2, 4, true),
    
    -- 58. El Menia (PAS DE STOP DESK)
    (v_provider_id, 'Alger', 'El Menia', 1000.00, 0, 0, 200.00, 2, 4, true);
    
END $$;

-- ============================================
-- VÉRIFICATIONS
-- ============================================

-- 1. Lister tous les transporteurs
SELECT 
  id, 
  name, 
  slug,
  is_active, 
  COALESCE(delivery_time_min::text || '-' || delivery_time_max::text || ' jours', 'N/A') as delai,
  COALESCE(weight_base_kg::text || ' kg', 'N/A') as poids_base,
  COALESCE(price_per_extra_kg::text || ' DA/kg', 'N/A') as supplement
FROM shipping_providers 
ORDER BY created_at;

-- 2. Compter les wilayas pour ZR Express
SELECT 
  COUNT(*) as total_wilayas
FROM shipping_rates sr
JOIN shipping_providers sp ON sr.provider_id = sp.id
WHERE sp.name = 'ZR Express';

-- 3. Afficher toutes les wilayas ZR Express
SELECT 
  sr.destination_wilaya as wilaya,
  sr.price_home || ' DA' as domicile,
  CASE 
    WHEN sr.price_office > 0 THEN sr.price_office::text || ' DA' 
    ELSE 'Indisponible' 
  END as stop_desk,
  sr.price_return || ' DA' as retour
FROM shipping_rates sr
JOIN shipping_providers sp ON sr.provider_id = sp.id
WHERE sp.name = 'ZR Express'
ORDER BY sr.destination_wilaya;

-- 4. Afficher les wilayas SANS Stop Desk
SELECT 
  sr.destination_wilaya as wilaya,
  sr.price_home || ' DA' as domicile_uniquement
FROM shipping_rates sr
JOIN shipping_providers sp ON sr.provider_id = sp.id
WHERE sp.name = 'ZR Express' AND sr.price_office = 0
ORDER BY sr.destination_wilaya;
