import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { NavTab } from '../components/Sidebar';
import { formatMoney, formatPV } from '../utils/formatters';
import { 
  Users, 
  ShoppingCart, 
  Award, 
  Stethoscope, 
  ArrowUpRight, 
  AlertCircle,
  Package,
  Calendar,
  Sparkles,
  Bell,
  BellRing,
  AlertTriangle,
  X,
  Truck,
  Printer
} from 'lucide-react';
import { generateGlobalAdminReportPDF } from '../utils/pdfGenerator';

interface DashboardViewProps {
  onNavigate: (tab: NavTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { visits, sales, partners, products, medicalRecords, currentUser, companySettings } = useApp();
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayVisits = visits.filter(v => v.date === todayStr);
  const patientVisitsCount = todayVisits.filter(v => v.visitorType === 'patient' || v.visitorType === 'client').length;
  const staffVisitsCount = todayVisits.filter(v => v.visitorType === 'staff').length;

  const todaySales = sales.filter(s => s.date === todayStr);
  const totalRevenueToday = todaySales.reduce((acc, s) => acc + s.netAmount, 0);
  const totalPvToday = todaySales.reduce((acc, s) => acc + s.totalPv, 0);

  // Critical stock products across physical categories (Régulateur, Nettoyage, Entretien, Alimentation, Soins)
  const lowStockProducts = products.filter(
    p => p.category !== 'services' && p.stockQuantity <= p.minStockThreshold
  );


  const activeAlerts = lowStockProducts.filter(p => !dismissedAlerts.includes(p.id));

  const totalCommissionsPending = partners.reduce((acc, p) => acc + p.remainingEarnings, 0);

  const handleDismissAlert = (id: string) => {
    setDismissedAlerts(prev => [...prev, id]);
  };


  return (
    <div className="space-y-6">
      {/* Automatic Critical Stock Notification Banner */}
      {activeAlerts.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl shadow-xs transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <AlertCircle className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-red-950 uppercase tracking-wide">
                    Alerte Automatique : Stock Critique Détecté ({activeAlerts.length} article{activeAlerts.length > 1 ? 's' : ''})
                  </h3>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-red-200 text-red-900">
                    Urgent
                  </span>
                </div>
                <p className="text-xs text-red-800 mt-0.5">
                  Des produits de la pharmacie ou boutique ont atteint ou franchi leur seuil d'alerte minimal. Réapprovisionnement recommandé.
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {activeAlerts.slice(0, 3).map(p => (
                    <div key={p.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-red-200 rounded-lg text-[11px] text-red-900 shadow-2xs">
                      <span className="font-semibold">{p.name}</span>
                      <span className="font-mono text-red-600 font-bold">({p.stockQuantity} / seuil {p.minStockThreshold})</span>
                      <button
                        onClick={() => handleDismissAlert(p.id)}
                        className="text-neutral-400 hover:text-red-700 ml-0.5"
                        title="Masquer cette alerte"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {activeAlerts.length > 3 && (
                    <span className="text-[11px] text-red-700 self-center">
                      +{activeAlerts.length - 3} autre(s)
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                onClick={() => onNavigate('suppliers')}
                className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Passer Commande Fournisseur</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 p-6 lg:p-8 text-white shadow-sm">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-orange-100">
              <Sparkles className="w-4 h-4" />
              <span>Plateforme Intégrée Whieda Smart</span>
            </div>

            {/* Notification Bell Button */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationDrawer(!showNotificationDrawer)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-medium backdrop-blur-xs transition-colors"
                title="Centre de notifications"
              >
                {lowStockProducts.length > 0 ? (
                  <BellRing className="w-4 h-4 text-amber-200 animate-bounce" />
                ) : (
                  <Bell className="w-4 h-4 text-white" />
                )}
                <span>Alertes ({lowStockProducts.length})</span>
              </button>

              {/* Notification Popover */}
              {showNotificationDrawer && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-neutral-200 text-neutral-900 p-4 z-50 animate-in fade-in zoom-in duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                    <div className="flex items-center gap-2">
                      <BellRing className="w-4 h-4 text-red-600" />
                      <span className="text-xs font-bold text-neutral-900">Notifications de Stock Critique</span>
                    </div>
                    <button
                      onClick={() => setShowNotificationDrawer(false)}
                      className="text-neutral-400 hover:text-neutral-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="py-2 space-y-2 max-h-72 overflow-y-auto">
                    {lowStockProducts.length === 0 ? (
                      <p className="text-xs text-neutral-500 py-4 text-center">
                        Aucun stock critique. Tout est approvisionné.
                      </p>
                    ) : (
                      lowStockProducts.map(p => (
                        <div key={p.id} className="p-2.5 bg-red-50/60 rounded-xl border border-red-100 text-xs flex items-center justify-between gap-2">
                          <div>
                            <div className="font-semibold text-neutral-900">{p.name}</div>
                            <div className="text-[11px] text-neutral-500 font-mono">
                              {p.sku} · Catégorie: {p.category}
                            </div>
                            <div className="text-[11px] text-red-700 font-bold mt-0.5">
                              Stock: {p.stockQuantity} unité{p.stockQuantity > 1 ? 's' : ''} (Seuil critique : {p.minStockThreshold})
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setShowNotificationDrawer(false);
                              onNavigate('suppliers');
                            }}
                            className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[11px] font-semibold shrink-0"
                          >
                            Commander
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {lowStockProducts.length > 0 && (
                    <div className="pt-2 border-t border-neutral-100 flex justify-between items-center text-[11px]">
                      <button
                        onClick={() => setDismissedAlerts(lowStockProducts.map(p => p.id))}
                        className="text-neutral-500 hover:text-neutral-800"
                      >
                        Tout masquer
                      </button>
                      <button
                        onClick={() => {
                          setShowNotificationDrawer(false);
                          onNavigate('suppliers');
                        }}
                        className="text-orange-600 font-bold hover:underline"
                      >
                        Ouvrir Commandes Fournisseurs →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
            Bonjour, {currentUser.fullName}
          </h1>
          <p className="mt-2 text-sm text-orange-50 leading-relaxed">
            Bienvenue sur le portail unifié Whieda Smart. Suivi des visites clients et parrainages, gestion des stocks boutique & pharmacie, caisse POS et dossiers de consultations médicales.
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            {(currentUser.role === 'admin' || currentUser.role === 'receptionist') && (
              <button
                onClick={() => onNavigate('visits')}
                className="px-4 py-2 bg-white text-orange-800 rounded-lg text-xs font-bold hover:bg-orange-50 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <span>Nouvelle Entrée Visiteur</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
            {(currentUser.role === 'admin' || currentUser.role === 'accountant') && (
              <button
                onClick={() => onNavigate('pos')}
                className="px-4 py-2 bg-neutral-900/40 hover:bg-neutral-900/60 backdrop-blur-xs text-white rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Ouvrir la Caisse POS</span>
              </button>
            )}
            {(currentUser.role === 'admin' || currentUser.role === 'accountant') && (
              <button
                onClick={() => generateGlobalAdminReportPDF(partners, companySettings)}
                className="px-4 py-2 bg-neutral-900/80 hover:bg-black text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                title="Imprimer ou exporter l'état consolidé administratif et financier"
              >
                <Printer className="w-3.5 h-3.5 text-orange-400" />
                <span>Imprimer l'État Global (Admin & Financier)</span>
              </button>
            )}
            {(currentUser.role === 'admin' || currentUser.role === 'doctor') && (
              <button
                onClick={() => onNavigate('medical')}
                className="px-4 py-2 bg-neutral-900/40 hover:bg-neutral-900/60 backdrop-blur-xs text-white rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Espace Consultations</span>
              </button>
            )}
          </div>
        </div>

        {/* Ambient watermark/image highlight */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 opacity-15 pointer-events-none rounded-full bg-white blur-2xl" />
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Entrées */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold">Visites Journalières</span>
            <Users className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 tabular-nums">
            {todayVisits.length}
          </div>
          <div className="mt-2 text-xs text-neutral-500 flex items-center gap-2">
            <span className="text-orange-600 font-medium">{patientVisitsCount} Patients</span>
            <span className="text-neutral-300">·</span>
            <span>{staffVisitsCount} Employés</span>
          </div>
        </div>

        {/* Caisse POS */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold">Ventes POS (Aujourd'hui)</span>
            <ShoppingCart className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 tabular-nums">
            {formatMoney(totalRevenueToday)}
          </div>
          <div className="mt-2 text-xs text-neutral-500 flex items-center gap-2">
            <span className="font-medium text-emerald-600">{todaySales.length} tickets émis</span>
            <span className="text-neutral-300">·</span>
            <span>Encaissé</span>
          </div>
        </div>

        {/* PV & MLM Network */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold">Points de Valeur (PV)</span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 tabular-nums">
            {formatPV(totalPvToday)}
          </div>
          <div className="mt-2 text-xs text-neutral-500 flex items-center gap-1.5">
            <span className="text-amber-700 font-medium">{formatMoney(totalCommissionsPending)}</span>
            <span className="text-neutral-400">à régler réseau</span>
          </div>
        </div>

        {/* Cabinet Médical */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold">Bilans & Consultations</span>
            <Stethoscope className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 tabular-nums">
            {medicalRecords.length}
          </div>
          <div className="mt-2 text-xs text-neutral-500 flex items-center gap-2">
            <span className="text-rose-600 font-medium">Cabinet actif</span>
            <span className="text-neutral-300">·</span>
            <span>Dr. Eric Kamga</span>
          </div>
        </div>
      </div>

      {/* Main Content Split: Today's Registre vs Low Stock & Partners */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Registre du jour */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                Registre des Visites Récentes
              </h2>
              <p className="text-xs text-neutral-500">
                Traçabilité des patients et rattachement systématique au partenaire parrain
              </p>
            </div>
            <button
              onClick={() => onNavigate('visits')}
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              <span>Voir tout ({visits.length})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-500 font-semibold border-y border-neutral-200">
                <tr>
                  <th className="py-2.5 px-3">Heure</th>
                  <th className="py-2.5 px-3">Visiteur</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Partenaire Parrain</th>
                  <th className="py-2.5 px-3">Motif</th>
                  <th className="py-2.5 px-3 text-right">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-700">
                {todayVisits.slice(0, 5).map(v => (
                  <tr key={v.id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-medium text-neutral-500">
                      {v.time}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-neutral-900">
                      {v.visitorName}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                        v.visitorType === 'staff'
                          ? 'bg-neutral-100 text-neutral-700'
                          : 'bg-orange-50 text-orange-800'
                      }`}>
                        {v.visitorType === 'staff' ? 'Personnel' : 'Patient/Client'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      {v.sponsorPartnerName ? (
                        <div className="flex flex-col">
                          <span className="font-medium text-neutral-900">{v.sponsorPartnerName}</span>
                          <span className="text-[10px] text-neutral-400 font-mono">{v.sponsorPartnerCode}</span>
                        </div>
                      ) : (
                        <span className="text-neutral-400 italic">Interne</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 max-w-[150px] truncate text-neutral-600">
                      {v.purpose}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="font-medium text-neutral-600">
                        {v.status === 'termine' && 'Terminé'}
                        {v.status === 'en_consultation' && 'En consultation'}
                        {v.status === 'en_attente' && 'En attente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Alerts & Top Partners */}
        <div className="space-y-6">
          {/* Low Stock Warning Card */}
          <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>Alertes de Réapprovisionnement</span>
              </div>
              <button
                onClick={() => onNavigate('suppliers')}
                className="text-[11px] font-semibold text-red-700 hover:underline"
              >
                Bon de commande
              </button>
            </div>

            {lowStockProducts.length === 0 ? (
              <p className="text-xs text-neutral-500 py-3 text-center">
                Tous les stocks sont à niveau optimal.
              </p>
            ) : (
              <div className="space-y-2.5">
                {lowStockProducts.map(p => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2.5 bg-red-50/50 rounded-lg border border-red-100 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-neutral-800 truncate max-w-[160px]">
                        {p.name}
                      </div>
                      <div className="text-[11px] text-neutral-500 font-mono">
                        {p.sku} · Seuil: {p.minStockThreshold}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-red-600 font-mono">
                        {p.stockQuantity} restant{p.stockQuantity > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Partners Network Card */}
          <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-neutral-900">
                <Award className="w-4 h-4 text-orange-600" />
                <span>Top Partenaires Réseau</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => generateGlobalAdminReportPDF(partners, companySettings)}
                  className="text-[11px] font-semibold text-red-600 hover:underline flex items-center gap-1"
                  title="Télécharger l'état consolidé"
                >
                  <Printer className="w-3 h-3" />
                  <span>État Global</span>
                </button>
                <button
                  onClick={() => onNavigate('partners')}
                  className="text-[11px] font-semibold text-orange-600 hover:underline"
                >
                  Voir MLM
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {partners.slice(0, 3).map(ptn => (
                <div
                  key={ptn.id}
                  className="flex items-center justify-between p-2 hover:bg-neutral-50 rounded-lg transition-colors text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-800 flex items-center justify-center font-bold text-[11px]">
                      {ptn.firstName[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-neutral-900">
                        {ptn.firstName} {ptn.lastName}
                      </div>
                      <div className="text-[10px] text-neutral-400 font-mono">
                        {ptn.code} · {ptn.level}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-neutral-900 tabular-nums">
                      {formatMoney(ptn.totalDirectEarnings)}
                    </div>
                    <div className="text-[10px] text-amber-700 font-medium">
                      {formatPV(ptn.totalPv)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
