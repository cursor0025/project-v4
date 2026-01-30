# 📚 Documentation Meilisearch - BZMarket

> **Dernière mise à jour:** 28 janvier 2026  
> **Version:** 1.0  
> **Projet:** BZMarket Algeria Marketplace

---

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)  
2. [Architecture système](#architecture-système)  
3. [Configuration Meilisearch](#configuration-meilisearch)  
4. [Fichiers impliqués](#fichiers-impliqués)  
5. [Guide d'utilisation](#guide-dutilisation)  
6. [API de recherche](#api-de-recherche)  
7. [Filtres et facettes](#filtres-et-facettes)  
8. [Indexation des produits](#indexation-des-produits)  
9. [Performance et optimisation](#performance-et-optimisation)  
10. [Troubleshooting](#troubleshooting)  
11. [Maintenance régulière](#maintenance-régulière)

---

## Vue d'ensemble

**Meilisearch** est un moteur de recherche intégré à **BZMarket** pour offrir une recherche rapide et des filtres avancés sur les produits. [web:282][web:288]

### Objectifs

- Recherche rapide sur des milliers de produits. [web:285]  
- Filtrage par catégorie, prix, ville, type de prix. [web:291]  
- Facettes pour voir les comptes par filtre. [web:291]  
- Synchronisation avec la base de données Supabase. [web:277]

### Stack technique

- Backend : Next.js API Routes (`/api/search`). [web:240]  
- Moteur de recherche : Meilisearch. [web:282]  
- Base de données : Supabase PostgreSQL. [web:277]  
- Frontend : React + TypeScript. [web:247]

---

## Architecture système

```txt
Client (Next.js / React)
  - app/page.tsx (Home)
  - app/[id]/products/page.tsx (Liste produits)
  - components/ProductGrid.tsx
  - components/FilterBar.tsx

        │
        ▼

API Next.js
  - app/api/search/route.ts
  - Reçoit : q, category, minPrice, maxPrice, city, etc.
  - Appelle Meilisearch, renvoie JSON

        │
        ▼

Meilisearch
  - Index "products"
  - Recherche full-text
  - Filtres + facettes
  - Résultats paginés

        │
        ▼

Supabase
  - Table products
  - Sync vers Meilisearch (script / cron / webhook)

Configuration Meilisearch
Variables d'environnement
À mettre dans .env.local (ou sur Vercel) :

text
NEXT_PUBLIC_MEILISEARCH_HOST="https://your-meilisearch-instance.com"
MEILISEARCH_API_KEY="your-secret-api-key"
[web:282]

Index products
Nom : products. [web:282]

Clé primaire : id. [web:282]

Langue : FR/AR supportées (full-text générique). [web:288]

Attributs recherchés (searchable) typiques :

name, description, category, subcategory, vendor_name, vendor_city. [web:282]

Attributs filtrables (filterable) typiques :

category, price, city, price_type, delivery_available, stock, rating, created_at. [web:291]

Fichiers impliqués
Meilisearch / Recherche
lib/search/meili-server.ts : client Meilisearch côté serveur. [web:282]

lib/search/configure-products-index.ts : configuration de l’index + sync. [web:282]

app/api/search/route.ts : endpoint HTTP de recherche. [web:240]

Frontend
app/page.tsx : home, barre de recherche, affichage produits.

app/[id]/products/page.tsx : page produits filtrés.

components/ProductGrid.tsx : grille de produits.

components/FilterBar.tsx : filtres (catégorie, prix, ville…).

components/ProductCard.tsx : carte produit.

types/product.ts : type Product.

Guide d'utilisation (côté utilisateur)
Page d’accueil /
L’utilisateur tape un mot-clé dans la barre de recherche.

Il peut filtrer par catégorie, prix, ville, etc. (via FilterBar).

L’URL contient les paramètres (?q=...,&category=...,&minPrice=...). [web:281]

Les produits affichés viennent de Meilisearch via /api/search. [web:282]

Page produits /products
Même logique que la home mais vue plus orientée résultats.

Les filtres se synchronisent avec l’URL (utile pour partager un lien).

API de recherche
Endpoint
text
POST /api/search
Content-Type: application/json
Body possible (JSON)
json
{
  "q": "téléphone",
  "category": "Téléphones & Accessoires",
  "minPrice": 5000,
  "maxPrice": 50000,
  "city": "Alger",
  "priceType": "negociable",
  "deliveryAvailable": true,
  "page": 1,
  "limit": 20
}
[web:291]

Réponse (exemple)
json
{
  "data": [
    {
      "id": "uuid-123",
      "name": "iPhone 15 Pro",
      "description": "...",
      "price": 250000,
      "old_price": 350000,
      "category": "Téléphones & Accessoires",
      "city": "Alger",
      "rating": 4.5,
      "stock": 5,
      "delivery_available": true,
      "images": ["url1", "url2"],
      "vendor_name": "ElectroMarket",
      "created_at": "2026-01-15T10:30:00Z"
    }
  ],
  "facets": {
    "category": [
      { "value": "Téléphones & Accessoires", "count": 1250 },
      { "value": "Informatique & IT", "count": 890 }
    ],
    "city": [
      { "value": "Alger", "count": 2100 },
      { "value": "Oran", "count": 650 }
    ],
    "price_type": [
      { "value": "negociable", "count": 1500 },
      { "value": "fixe", "count": 1200 }
    ]
  },
  "total": 2700,
  "hasMore": true,
  "page": 1,
  "limit": 20
}
[web:291]

Filtres & facettes
Filtres typiques :

category (string exacte).

price via minPrice / maxPrice.

city.

price_type (negociable, facilite, fixe).

delivery_available (booléen). [web:291]

Les facettes permettent d’afficher des compteurs (par catégorie, ville, etc.) dans l’UI. [web:291]

Indexation des produits
Les produits viennent de Supabase (products table). [web:277]

Un script ou une route de sync pousse les produits vers Meilisearch. [web:282]

L’index contient : id, name, description, price, old_price, category, city, vendor_name, stock, rating, price_type, delivery_available, images, created_at, etc.

Performance & optimisation
Limiter à 20 résultats par page et utiliser la pagination. [web:240]

Appliquer les filtres directement dans Meilisearch plutôt que côté API. [web:282]

Ne réindexer que les produits modifiés (sync incrémentale). [web:282]

Troubleshooting (rapide)
Aucun résultat : vérifier que l’index products contient des documents. [web:282]

Filtres qui ne marchent pas : vérifier filterableAttributes dans Meilisearch. [web:291]

401 : vérifier que la clé API est correcte dans .env.local. [web:282]

Lenteur : vérifier la RAM de Meilisearch / taille de l’index. [web:285]

Maintenance
Hebdo : vérifier l’index est accessible, pas d’erreurs API. [web:282]

Mensuel : vérifier cohérence Supabase ↔ Meilisearch (nombre de produits). [web:277]

Trimestriel : revoir mapping, facettes, besoins métiers. [web:291]

text

***

### 2. Où le mettre et comment

1. Ouvre ton projet dans VS Code.  
2. À la racine du projet (là où tu as `package.json`), crée un fichier nommé `MEILISEARCH_DOC.md`.  
3. Colle tout le contenu ci-dessus.  
4. Sauvegarde.

Tu peux aussi créer un dossier `docs/` et le mettre dedans :

```txt
/ton-projet
  /docs
    MEILISEARCH_DOC.md
  /app
  /lib
  ...
