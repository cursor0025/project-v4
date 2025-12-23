'use client';

import { useEffect, useState } from 'react';
import {
  Eye,
  MousePointerClick,
  Users,
  Clock,
} from 'lucide-react';
import KYBAlert from '@/components/KYBAlert';
import { useAuth } from '@/lib/auth-context';

interface OverviewStats {
  dailyVisits: number;
  productClicks: number;
  shopSubscribers: number;
  subscriptionDaysLeft: number;
}

interface SimpleOrder {
  id: string;
  reference: string;
  customerName: string;
  total: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  createdAt: string;
}

interface SimpleMessage {
  id: string;
  customerName: string;
  preview: string;
  createdAt: string;
  isRead: boolean;
}

export default function OverviewPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [validatedVsRefused, setValidatedVsRefused] = useState<{ validated: number; refused: number }>({ validated: 0, refused: 0 });
  const [ordersByCategory, setOrdersByCategory] = useState<Array<{ category: string; count: number }>>([]);
  const [statusDistribution, setStatusDistribution] = useState<Array<{ status: string; count: number }>>([]);
  const [confirmedOrders, setConfirmedOrders] = useState<number>(0);
  const [recentOrders, setRecentOrders] = useState<SimpleOrder[]>([]);
  const [recentMessages, setRecentMessages] = useState<SimpleMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodOrders, setPeriodOrders] = useState<'day' | 'week' | 'month'>('day');
  const [periodCategory, setPeriodCategory] = useState<'day' | 'week' | 'month'>('week');
  const [periodConfirmed, setPeriodConfirmed] = useState<'day' | 'week' | 'month'>('week');

  useEffect(() => {
    loadData();
  }, [periodOrders, periodCategory, periodConfirmed]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [
        statsRes,
        validatedRes,
        categoryRes,
        statusRes,
        confirmedRes,
        recentOrdersRes,
        recentMessagesRes,
      ] = await Promise.all([
        fetch('/api/dashboard/overview'),
        fetch(`/api/dashboard/orders/validated-vs-refused?period=${periodOrders}`),
        fetch(`/api/dashboard/orders/by-category?period=${periodCategory}`),
        fetch(`/api/dashboard/orders/status-distribution?period=${periodOrders}`),
        fetch(`/api/dashboard/orders/confirmed-count?period=${periodConfirmed}`),
        fetch('/api/orders?limit=5'),
        fetch('/api/messages/recent?limit=5'),
      ]);

      const statsJson = await statsRes.json();
      const validatedJson = await validatedRes.json();
      const categoryJson = await categoryRes.json();
      const statusJson = await statusRes.json();
      const confirmedJson = await confirmedRes.json();
      const recentOrdersJson = await recentOrdersRes.json();
      const recentMessagesJson = await recentMessagesRes.json();

      setStats(statsJson);
      setValidatedVsRefused(validatedJson);
      setOrdersByCategory(categoryJson);
      setStatusDistribution(statusJson);
      setConfirmedOrders(confirmedJson.count);
      setRecentOrders(recentOrdersJson.orders);
      setRecentMessages(recentMessagesJson.messages);
    } catch (e) {
      // tu peux ajouter un toast ici
    } finally {
      setLoading(false);
    }
  };

  const totalValidatedRefused = validatedVsRefused.validated + validatedVsRefused.refused;
  const validatedPercent = totalValidatedRefused
    ? Math.round((validatedVsRefused.validated / totalValidatedRefused) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Titre + breadcrumb simple */}
      <div>
        <h1 className="text-3xl font-bold text-white">Aperçu de la Boutique</h1>
        <p className="text-sm text-gray-400 mt-1">
          Bon retour ! Voici un aperçu de votre boutique.
        </p>
      </div>

      {/* Alerte KYB */}
      <KYBAlert />

      {/* Cartes KPI hautes (visites, clics, abonnés, bouton ajouter produit) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-pink-500 to-red-500 rounded-xl p-5 text-white">
          <p className="text-xs uppercase tracking-wide opacity-80">Visites quotidiennes de la boutique</p>
          <p className="text-3xl font-bold mt-2">
            {stats ? stats.dailyVisits.toLocaleString() : (loading ? '...' : '0')}
          </p>
        </div>

        <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl p-5 text-white">
          <p className="text-xs uppercase tracking-wide opacity-80">Clics sur les produits</p>
          <p className="text-3xl font-bold mt-2">
            {stats ? stats.productClicks.toLocaleString() : (loading ? '...' : '0')}
          </p>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-5 text-white">
          <p className="text-xs uppercase tracking-wide opacity-80">Abonnés de la boutique</p>
          <p className="text-3xl font-bold mt-2">
            {stats ? stats.shopSubscribers.toLocaleString() : (loading ? '...' : '0')}
          </p>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="text-purple-400" />
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">Statut d'abonnement</p>
                <p className="text-lg font-semibold text-white">
                  {stats ? `${stats.subscriptionDaysLeft} jours restants` : (loading ? '...' : '--')}
                </p>
              </div>
            </div>
          </div>
          {/* barre de progression simple */}
          {stats && (
            <div className="mt-4">
              <div className="w-full h-2 rounded-full bg-dark-hover overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                  style={{ width: `${Math.min(100, (stats.subscriptionDaysLeft / 90) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bloc : commandes validées vs refusées */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-white">Commandes validées vs refusées</p>
          <select
            value={periodOrders}
            onChange={(e) => setPeriodOrders(e.target.value as any)}
            className="bg-dark-bg border border-dark-border text-gray-300 text-xs rounded-lg px-3 py-1"
          >
            <option value="day">Jour</option>
            <option value="week">Semaine</option>
            <option value="month">Mois</option>
          </select>
        </div>

        {totalValidatedRefused === 0 ? (
          <p className="text-gray-500 text-sm">Aucune commande pour cette période.</p>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Taux de validation</span>
              <span className="text-white font-semibold text-sm">{validatedPercent}%</span>
            </div>
            <div className="w-full h-3 rounded-full bg-dark-bg overflow-hidden">
              <div
                className="h-full bg-emerald-500"
                style={{ width: `${validatedPercent}%` }}
              />
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                {validatedVsRefused.validated} validées
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                {validatedVsRefused.refused} refusées
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Ligne : commandes par catégorie + distribution statut + commandes confirmées */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Commandes par catégorie */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-white">Commandes par catégorie</p>
            <select
              value={periodCategory}
              onChange={(e) => setPeriodCategory(e.target.value as any)}
              className="bg-dark-bg border border-dark-border text-gray-300 text-xs rounded-lg px-3 py-1"
            >
              <option value="day">Jour</option>
              <option value="week">Semaine</option>
              <option value="month">Mois</option>
            </select>
          </div>

          {ordersByCategory.length === 0 ? (
            <p className="text-gray-500 text-sm">Aucune donnée disponible.</p>
          ) : (
            <div className="space-y-2">
              {ordersByCategory.map((c) => (
                <div key={c.category} className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">{c.category}</span>
                  <span className="text-white font-semibold text-sm">{c.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Distribution statut commandes */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-white">Distribution du statut des commandes</p>
            <select
              value={periodOrders}
              onChange={(e) => setPeriodOrders(e.target.value as any)}
              className="bg-dark-bg border border-dark-border text-gray-300 text-xs rounded-lg px-3 py-1"
            >
              <option value="day">Jour</option>
              <option value="week">Semaine</option>
              <option value="month">Mois</option>
            </select>
          </div>

          {statusDistribution.length === 0 ? (
            <p className="text-gray-500 text-sm">Aucune donnée disponible.</p>
          ) : (
            <div className="space-y-2">
              {statusDistribution.map((s) => (
                <div key={s.status} className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm capitalize">{s.status}</span>
                  <span className="text-white font-semibold text-sm">{s.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Commandes confirmées */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-white">Commandes confirmées</p>
          <select
            value={periodConfirmed}
            onChange={(e) => setPeriodConfirmed(e.target.value as any)}
            className="bg-dark-bg border border-dark-border text-gray-300 text-xs rounded-lg px-3 py-1"
          >
            <option value="day">Jour</option>
            <option value="week">Semaine</option>
            <option value="month">Mois</option>
          </select>
        </div>
        <p className="text-3xl font-bold text-emerald-400">
          {confirmedOrders.toLocaleString()}
        </p>
      </div>

      {/* Bas de page : commandes récentes + messages récents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Commandes récentes */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-white">Commandes récentes</p>
            <button className="text-xs text-cyan-400 hover:underline">
              Voir tout
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-gray-500 text-sm">Aucune nouvelle commande.</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between bg-dark-hover rounded-lg px-4 py-3">
                  <div>
                    <p className="text-white text-sm font-semibold">{order.reference}</p>
                    <p className="text-xs text-gray-400">{order.customerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white font-semibold">
                      {order.total.toLocaleString()} DA
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('fr-DZ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Messages récents */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-white">Messages récents</p>
            <button className="text-xs text-cyan-400 hover:underline">
              Voir tout
            </button>
          </div>

          {recentMessages.length === 0 ? (
            <p className="text-gray-500 text-sm">Aucun nouveau message.</p>
          ) : (
            <div className="space-y-3">
              {recentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-center justify-between rounded-lg px-4 py-3 ${
                    msg.isRead ? 'bg-dark-hover' : 'bg-cyan-500/10 border border-cyan-500/40'
                  }`}
                >
                  <div>
                    <p className="text-white text-sm font-semibold">{msg.customerName}</p>
                    <p className="text-xs text-gray-400 truncate max-w-xs">
                      {msg.preview}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(msg.createdAt).toLocaleTimeString('fr-DZ', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
