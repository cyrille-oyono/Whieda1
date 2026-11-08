import React from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { 
  ShieldCheck, 
  UserCheck, 
  Stethoscope, 
  Calculator, 
  LogOut, 
  Globe, 
  ShoppingCart,
  Lock,
  User
} from 'lucide-react';
import { getRoleLabel } from '../utils/formatters';

interface NavbarProps {
  onOpenLoginModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenLoginModal }) => {
  const { currentUser, logout, companySettings, roles: appRoles } = useApp();

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
  const isVisitor = currentUser.role === 'visitor';

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
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold tracking-wide uppercase ${
              isVisitor ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'
            }`}>
              {isVisitor ? 'Vitrine' : 'Pro'}
            </span>
          </div>
          <span className="text-[11px] text-neutral-500 leading-none">
            {isVisitor ? 'Espace Découverte & Soins' : 'Santé · Pharmacie · MLM Partenaires'}
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation contextual info */}
      <div className="hidden lg:flex items-center gap-4 text-xs text-neutral-500">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-50 rounded-lg border border-neutral-200">
          <span className="text-neutral-400 font-medium">Session :</span>
          <span className="font-semibold text-neutral-800">{currentUser.fullName}</span>
          <span className="text-neutral-300">·</span>
          <span className="text-neutral-600">{currentUser.department || (isVisitor ? 'Accès Public' : 'Collaborateur')}</span>
        </div>

        <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-semibold ${currentRoleConfig.color}`}>
          {currentRoleConfig.icon}
          <span>{currentRoleConfig.label}</span>
        </div>
      </div>

      {/* Zone 3: Actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {isVisitor ? (
          /* Visitor View: Button to switch to Employee Login */
          <button
            onClick={onOpenLoginModal}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 rounded-lg shadow-xs transition-all whitespace-nowrap"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Espace Collaborateur</span>
          </button>
        ) : (
          /* Employee View: Change Account */
          <button
            onClick={onOpenLoginModal}
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors whitespace-nowrap"
          >
            <UserCheck className="w-4 h-4 text-neutral-600" />
            <span>Changer de compte</span>
          </button>
        )}

        <button
          onClick={logout}
          title={isVisitor ? 'Quitter la vitrine' : 'Se déconnecter'}
          className="inline-flex items-center gap-1.5 p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-xs font-medium"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden md:inline">{isVisitor ? 'Quitter' : 'Déconnexion'}</span>
        </button>
      </div>
    </header>
  );
};
