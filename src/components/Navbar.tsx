import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { 
  ShieldCheck, 
  UserCheck, 
  Stethoscope, 
  Calculator, 
  LogOut, 
  ChevronDown,
  Sparkles,
  Globe,
  ShoppingCart
} from 'lucide-react';
import { getRoleLabel } from '../utils/formatters';

interface NavbarProps {
  onOpenLoginModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenLoginModal }) => {
  const { currentUser, switchRole, logout, companySettings, roles: appRoles } = useApp();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const predefinedRoles: { role: UserRole; label: string; icon: React.ReactNode; color: string }[] = [
    { role: 'visitor', label: 'Visiteur (Vitrine)', icon: <Globe className="w-4 h-4 text-emerald-600" />, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { role: 'receptionist', label: 'Réceptionniste (Accueil)', icon: <UserCheck className="w-4 h-4 text-orange-600" />, color: 'bg-orange-50 text-orange-700 border-orange-200' },
    { role: 'doctor', label: 'Médecin (Consultations)', icon: <Stethoscope className="w-4 h-4 text-rose-600" />, color: 'bg-rose-50 text-rose-700 border-rose-200' },
    { role: 'cashier', label: 'Caissière (Caisse & Factures)', icon: <ShoppingCart className="w-4 h-4 text-purple-600" />, color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { role: 'accountant', label: 'Comptable (Finances & Stocks)', icon: <Calculator className="w-4 h-4 text-amber-600" />, color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { role: 'admin', label: 'Admin (Direction Générale)', icon: <ShieldCheck className="w-4 h-4 text-red-600" />, color: 'bg-red-50 text-red-700 border-red-200' },
  ];

  const getRoleBadge = (roleId: string) => {
    const predefined = predefinedRoles.find(r => r.role === roleId);
    if (predefined) return predefined;
    const dynamicDef = appRoles.find(r => r.id === roleId);
    return {
      role: roleId as UserRole,
      label: dynamicDef ? dynamicDef.name : roleId,
      icon: <UserCheck className="w-4 h-4 text-blue-600" />,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    };
  };

  const currentRoleConfig = getRoleBadge(currentUser.role);

  // Combine roles for quick switch
  const allRolesList = appRoles.map(r => {
    const pre = predefinedRoles.find(pr => pr.role === r.id);
    return {
      role: r.id as UserRole,
      label: r.name,
      icon: pre?.icon || <UserCheck className="w-4 h-4 text-blue-600" />,
    };
  });

  return (
    <header className="h-16 bg-white border-b border-neutral-200 px-6 flex items-center justify-between gap-8 z-30 sticky top-0 no-print">
      {/* Zone 1: Brand title & Emblem */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-red-600 via-orange-600 to-amber-500 flex items-center justify-center text-white shadow-sm font-bold text-lg tracking-tight">
          W
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent whitespace-nowrap">
              {companySettings?.name || 'Whieda Meyomessala'}
            </span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-orange-100 text-orange-800 font-semibold tracking-wide uppercase">
              Pro
            </span>
          </div>
          <span className="text-[11px] text-neutral-500 leading-none">
            Santé · Pharmacie · MLM Partenaires
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation contextual info & quick role badge */}
      <div className="hidden lg:flex items-center gap-4 text-xs text-neutral-500">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-50 rounded-lg border border-neutral-200">
          <span className="text-neutral-400 font-medium">Session active :</span>
          <span className="font-semibold text-neutral-800">{currentUser.fullName}</span>
          <span className="text-neutral-300">·</span>
          <span className="text-neutral-600">{currentUser.department || 'Poste opérationnel'}</span>
        </div>

        <div className="relative">
          <button
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${currentRoleConfig.color} hover:shadow-xs`}
            title="Changer de rôle pour tester les permissions RBAC"
          >
            {currentRoleConfig.icon}
            <span>Rôle : {currentRoleConfig.label}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-70" />
          </button>

          {roleMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-neutral-200 py-1.5 z-50">
              <div className="px-3 py-1.5 border-b border-neutral-100 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
                <span>Tester un autre profil (RBAC)</span>
                <Sparkles className="w-3 h-3 text-orange-500" />
              </div>
              {allRolesList.map(r => (
                <button
                  key={r.role}
                  onClick={() => {
                    switchRole(r.role);
                    setRoleMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-neutral-50 transition-colors ${
                    currentUser.role === r.role ? 'font-semibold text-orange-600 bg-orange-50/50' : 'text-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {r.icon}
                    <span>{r.label}</span>
                  </div>
                  {currentUser.role === r.role && (
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-600"></span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Zone 3: Primary Action / User Account */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenLoginModal}
          className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors whitespace-nowrap"
        >
          <UserCheck className="w-4 h-4 text-neutral-600" />
          <span>Changer de compte</span>
        </button>

        <button
          onClick={logout}
          title="Déconnexion"
          className="p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
