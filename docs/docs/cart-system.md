# Système de panier BZMarket

Ce document décrit **toute la logique du panier** dans le projet BZMarket (frontend Next.js + Supabase + Zustand) : structure des dossiers, fichiers impliqués, flux de données, et points d’extension pour la maintenance.

---

## 1. Structure des dossiers

Chemins importants liés au panier : [file:245]

- `src/store/cart.ts`  
  Store Zustand du panier (state global côté client).

- `src/types/cart.ts`  
  Types TypeScript des éléments du panier.

- `src/hooks/useCartHydration.ts`  
  Hook pour hydrater le panier (par ex. depuis Supabase ou localStorage).

- `src/hooks/useUserCart.ts`  
  Hook pour récupérer le panier du user depuis l’API / Supabase.

- `src/actions/cart.ts`  
  Actions serveur liées au panier (création, mise à jour côté backend, etc.).

- `src/app/page.tsx`  
  Page d’accueil qui affiche le badge du panier dans le header.

- `src/app/cart/page.tsx`  
  Page Panier (liste des articles, total, etc.).

- `src/components/AddToCartButton.tsx`  
  Bouton “Ajouter au panier” sur les fiches produit.

- `src/components/CartDrawer.tsx`  
  Composant latéral (drawer) affichant le contenu rapide du panier.

- `src/components/ProductCard.tsx`  
  Carte produit qui utilise `AddToCartButton`.

---

## 2. Types du panier (`src/types/cart.ts`)

Le fichier `src/types/cart.ts` définit la forme des données dans le panier : [file:245]

- `CartItem`  
  Représente un article dans le panier (id produit, titre, prix, quantité, image, etc.).
- `CartState`  
  Représente l’état complet du panier (liste d’items, totals, etc. si défini).

L’idée :  
- Utiliser des types stricts pour que tout le code du panier soit bien typé.  
- Faciliter la maintenance en ayant un **point unique** pour modifier la forme d’un item.

---

## 3. Store du panier (`src/store/cart.ts`)

Le store est construit avec Zustand. [file:245]

Responsabilités :
- Stocker la liste des articles.
- Exposer des actions : `addItem`, `removeItem`, `clearCart`, `updateQuantity`, etc.
- Fournir des sélecteurs (calculs dérivés) comme le total des articles.

Exemple de structure (simplifiée) :

```ts
import { create } from 'zustand';
import { CartItem } from '@/types/cart';

type CartState = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  updateQuantity: (productId: string, quantity: number) => void;
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (item) => {
    const items = get().items;
    const existing = items.find((i) => i.productId === item.productId);
    if (existing) {
      set({
        items: items.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        ),
      });
    } else {
      set({ items: [...items, item] });
    }
  },

  removeItem: (productId) => {
    set({
      items: get().items.filter((i) => i.productId !== productId),
    });
  },

  clearCart: () => {
    set({ items: [] });
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      set({
        items: get().items.filter((i) => i.productId !== productId),
      });
    } else {
      set({
        items: get().items.map((i) =>
          i.productId === productId ? { ...i, quantity } : i
        ),
      });
    }
  },
}));
Remarque importante :

Le nombre total d'articles n'est pas une méthode mais un calcul côté composant, en utilisant state.items.reduce(...).

4. Crochets liés au panier
4.1 useCartHydration( src/hooks/useCartHydration.ts)
Ce hook sert à : [file:245]

Récupérer le panier initial (via API, Supabase, ou localStorage).

Hydrater le magasin Zustand au montage de l'application.

Logique typique :

Vérifiez si l'utilisateur est connecté.

Si connecté, appelez une route API ou Supabase pour récupérer son panier.

Sinon, charger depuis localStorage.

Appeler les actions du magasin ( setItemsou addItem) pour remplir items.

4.2 useUserCart( src/hooks/useUserCart.ts)
Ce hook encapsule la logique pour récupérer / synchroniser le panier avec le backend : [file:245]

Récupérer le panier depuis Supabase ou une route src/app/api/cart/....

Retourner cart, isLoading, error.

Optionnellement, exposer des helpers pour syncCart(envoyer le contenu du magasin côté serveur).

5. Actions serveur ( src/actions/cart.ts)
Ce fichier contient les Server Actions (ou fonctions d'API) liées au panier : [file:245]

Exemples de responsabilités :

createCartou upsertCartpour sauvegarder le panier de l'utilisateur en base.

getUserCart(userId)pour récupérer le panier existant.

clearUserCart(userId)pour vider le panier côté backend (après commande, etc.).

Ces fonctions sont utilisées :

Par les crochets (ex. useUserCart).

Par les pages (ex. checkout).

6. Intégration dans les pages & composants
6.1 Badge panier dans le header ( src/app/page.tsx)
Dans la page d'accueil, on lit le total d'articles depuis le magasin, sans getTotalItems : [file:245]

ts
import { useCartStore } from '@/store/cart';

const totalItems = useCartStore((state) =>
  state.items.reduce((sum, item) => sum + item.quantity, 0)
);
Affichage du badge (on ne montre le numéro que si l'utilisateur est connecté) :

tsx
<button
  onClick={() => {
    if (!user) {
      router.push('/login');
    } else {
      router.push('/cart');
    }
  }}
  className="relative cursor-pointer inline-flex"
  aria-label="Ouvrir le panier"
>
  <ShoppingCart size={20} className="md:w-[22px] md:h-[22px]" />
  {user && totalItems > 0 && (
    <span className="absolute -top-1 -right-2 bg-[#ff7011] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
      {totalItems > 99 ? '99+' : totalItems}
    </span>
  )}
</button>
Points clés :

Le badge utilise useCartStorepour se mettre à jour en temps réel.

La navigation vers /cartest protégée : si pas connecté, on redirige vers /login.

6.2 Page panier ( src/app/cart/page.tsx)
Responsabilités de app/cart/page.tsx: [file:245]

Afficher la liste des itemsmagasins.

Permettre de modifier la quantité ( updateQuantity).

Permettre de supprimer un élément ( removeItem).

Calculer le total (prix × quantités).

Lancer le checkout (vers /checkoutou Server Action).

Exemple de lecture d'état :

ts
const items = useCartStore((state) => state.items);
const updateQuantity = useCartStore((state) => state.updateQuantity);
const removeItem = useCartStore((state) => state.removeItem);

const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
const totalPrice = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
6.3 Bouton "Ajouter au panier" ( src/components/AddToCartButton.tsx)
Utilisation typique : [file:245]

Récupérer addItemdepuis le magasin.

Lorsque l'utilisateur clique, construisez un CartItemà partir du Productet appeler addItem.

Exemple :

ts
const addItem = useCartStore((state) => state.addItem);

const handleAddToCart = () => {
  addItem({
    productId: product.id,
    title: product.name,
    price: product.price,
    quantity: 1,
    imageUrl: product.image_url,
  });
};
6.4 Tiroir de chariot ( src/components/CartDrawer.tsx)
Lit les mêmes itemsdu magasin.

Affiche un résumé rapide.

Proposez un bouton « Voir le panier » (vers /cart) et un bouton « Commander ».

7. Flux complet du panier (de A à Z)
L'utilisateur arrive sur le site.

useCartHydrationhydrater le store ( items) depuis Supabase ou localStorage. [fichier :245]

Dans le header (ex. app/page.tsxou components/Nav.tsx), le badge allumé totalItemsvia useCartStore. [fichier :245]

Sur une page produit ou sur la grille ( ProductGrid+ ProductCard), le bouton « Ajouter au panier » appelle addItemsur le magasin. [fichier :245]

Le magasin Zustand met à jour items.

Tous les composants qui utilisent useCartStorese restituent automatiquement.

La page /cartallumée items, affiche la liste détaillée, permet de modifier/supprimer, et de calculer les totaux.

Au moment du paiement :

Le frontend envoie les données du panier ( items) à une Server Action ou route API (dans src/actions/cart.tsou dans les routes /api). [fichier :245]

Le backend crée la commande, parfois vide le panier côté serveur, et le frontend peut appeler clearCart()sur le magasin.

Si l'utilisateur se déconnecte :

L'état du magasin reste côté client, mais tu peux, si tu veux, appeler clearCart()dans le handler de déconnexion pour remettre le panier à zéro.

8. Bonnes pratiques et entretien
Ne pas utiliser state.getTotalItems() tant que cette méthode n'est pas définie dans le magasin.
Toujours préférer, côté composant :

ts
const totalItems = useCartStore((state) =>
  state.items.reduce((sum, item) => sum + item.quantity, 0)
);
Si tu veux vraiment une méthode getTotalItemsdans le magasin, il faut l'ajouter dans src/store/cart.tset l'utiliser partout de la même façon .

Pour déboguer :

Rechercher globalement getTotalItemsdans le projet. [fichier :245]

Vérifiez que tous les composants qui utilisent le panier important useCartStoredepuis src/store/cart.tset pas un autre chemin.

Pour un nouveau développeur :

Lire ce fichier de docs.

Commencer par src/store/cart.ts, puis src/app/cart/page.tsx, puis src/components/AddToCartButton.tsx.

9. Résumé rapide pour un nouveau développeur
Etat global du panier : src/store/cart.ts. [fichier :245]

Types du panier : src/types/cart.ts.

Récupération / hydratation : src/hooks/useCartHydration.ts, src/hooks/useUserCart.ts.

API / actions : src/actions/cart.ts.

UI : badge dans app/page.tsx(ou Nav), page /cart, composants AddToCartButtonet CartDrawer.

Tout changement de logique (structure de l'élément, calcul des totaux, persistance) doit passer par ces fichiers.