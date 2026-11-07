import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  ClipboardList, 
  ShoppingCart, 
  Package, 
  Users, 
  Stethoscope, 
  Truck, 
  UserCog, 
  Database,
  Flame,
  AlertTriangle,
  Globe,
  ShieldAlert,
  Wallet
} from 'lucide-react';

export type NavTab = 
  | 'showcase'
  | 'overview' 
  | 'visits' 
  | 'pos' 
  | 'products' 
  | 'partners' 
  | 'medical' 
  | 'suppliers' 
  | 'users' 
  | 'database'
  | 'audit';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { currentUser, products, visits, partners } = useApp();

  // Low stock counter
  const lowStockCount = products.filter(
    p => p.category !== 'services' && p.stockQuantity <= p.minStockThreshold
  ).length;


  // Pending visits count
  const pendingVisitsCount = visits.filter(v => v.status === 'en_attente').length;

  // Partners with pending payout
  const unpaidPartnersCount = partners.filter(p => p.remainingEarnings > 0).length;

  const navItems: {
    id: NavTab;
    label: string;
    icon: React.ReactNode;
    allowedRoles: string[];
    badge?: number;
    badgeColor?: string;
  }[] = [
    {
      id: 'showcase',
      label: "Page d'Accueil Vitrine",
      icon: <Globe className="w-4 h-4" />,
      allowedRoles: ['visitor', 'receptionist', 'doctor', 'cashier', 'accountant', 'admin'],
    },
    {
      id: 'products',
      label: 'Catalogue & Produits',
      icon: <Package className="w-4 h-4" />,
      allowedRoles: ['receptionist', 'doctor', 'cashier', 'accountant', 'admin'],
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      badgeColor: 'bg-red-100 text-red-800',
    },
    {
      id: 'visits',
      label: 'Registre des Visites',
      icon: <ClipboardList className="w-4 h-4" />,
      allowedRoles: ['receptionist', 'admin'],
      badge: pendingVisitsCount > 0 ? pendingVisitsCount : undefined,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'medical',
      label: 'Espace Médecin & Bilans',
      icon: <Stethoscope className="w-4 h-4" />,
      allowedRoles: ['doctor', 'admin'],
    },
    {
      id: 'pos',
      label: 'Caisse & Factures',
      icon: <ShoppingCart className="w-4 h-4" />,
      allowedRoles: ['cashier', 'accountant', 'admin'],
    },
    {
      id: 'suppliers',
      label: 'Commandes de Stock',
      icon: <Truck className="w-4 h-4" />,
      allowedRoles: ['accountant', 'admin'],
    },
    {
      id: 'overview',
      label: 'Finance, Dépenses & Bilan',
      icon: <Wallet className="w-4 h-4" />,
      allowedRoles: ['accountant', 'admin'],
    },
    {
      id: 'partners',
      label: 'Partenaires & MLM (PV)',
      icon: <Users className="w-4 h-4" />,
      allowedRoles: ['accountant', 'admin'],
      badge: unpaidPartnersCount > 0 ? unpaidPartnersCount : undefined,
      badgeColor: 'bg-orange-100 text-orange-800',
    },
    {
      id: 'users',
      label: 'Personnel & Accès (RBAC)',
      icon: <UserCog className="w-4 h-4" />,
      allowedRoles: ['admin'],
    },
    {
      id: 'audit',
      label: 'Journal d\'Audit (Logs)',
      icon: <ShieldAlert className="w-4 h-4 text-red-500" />,
      allowedRoles: ['admin'],
    },
    {
      id: 'database',
      label: 'Script Supabase & Arch.',
      icon: <Database className="w-4 h-4" />,
      allowedRoles: ['admin'],
    },
  ];

  const visibleItems = navItems.filter(item => item.allowedRoles.includes(currentUser.role));

  return (
    <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] no-print">
      {/* Role Notice */}
      <div className="p-4 border-b border-neutral-100 bg-neutral-50/50">
        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600">
          <Flame className="w-3.5 h-3.5 text-orange-500" />
          <span>Espace {currentUser.role === 'admin' ? 'Administration Globale' : currentUser.role.toUpperCase()}</span>
        </div>
        <p className="text-[11px] text-neutral-400 mt-0.5">
          {currentUser.role === 'admin' && 'Accès complet à tous les modules'}
          {currentUser.role === 'receptionist' && 'Accueil, Visites & Produits'}
          {currentUser.role === 'doctor' && 'Consultations, Bilans & Produits'}
          {currentUser.role === 'cashier' && 'Caisse Enregistreuse & Factures'}
          {currentUser.role === 'accountant' && 'Finances, Stock & Historique Ventes'}
          {currentUser.role === 'visitor' && 'Vitrine Publique de la Structure'}
        </p>
      </div>

      {/* Nav List */}
      <nav className="p-3 flex-1 space-y-1">
        {visibleItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-white' : 'text-neutral-500'}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-neutral-200 text-neutral-700'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Low Stock Quick Warning in Sidebar */}
      {lowStockCount > 0 && (
        <div className="p-3 m-3 bg-amber-50 rounded-xl border border-amber-200 text-xs">
          <div className="flex items-center gap-2 text-amber-800 font-semibold mb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Alerte Stock ({lowStockCount})</span>
          </div>
          <p className="text-[11px] text-amber-700">
            Articles proches de la rupture. Vérifiez les commandes fournisseurs.
          </p>
        </div>
      )}

      {/* Quick Brand Footer */}
      <div className="p-4 border-t border-neutral-100 text-[11px] text-neutral-400 flex items-center justify-between">
        <span>Whieda Meyomessala</span>
        <span className="font-mono">v2.5</span>
      </div>
    </aside>
  );
};
