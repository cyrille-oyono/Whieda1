import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, Mail, ShieldAlert, ArrowRight, UserCheck, Stethoscope, Calculator, ShieldCheck } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { loginAs, users } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = loginAs(email);
    if (success) {
      onClose();
    } else {
      setError('Identifiant introuvable ou compte désactivé. Veuillez contacter l’administrateur.');
    }
  };

  const handleQuickLogin = (demoEmail: string) => {
    loginAs(demoEmail);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-neutral-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 p-6 text-white text-center">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center mx-auto mb-3 text-white font-extrabold text-2xl shadow-inner">
            W
          </div>
          <h2 className="text-xl font-bold">Connexion Sécurisée Whieda Smart</h2>
          <p className="text-xs text-orange-100 mt-1">
            Système d’authentification par Rôles (RBAC) · Sans inscription publique libre
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-5 p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Politique d’accès restreint :</span>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Les comptes sont exclusivement créés et habilités par l’Administrateur. Aucun formulaire d’inscription public n’est accessible.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Identifiant / Email Employé
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="nom@whieda.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Mot de Passe Initial
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            {error && (
              <div className="p-2.5 text-xs text-red-600 bg-red-50 rounded-lg border border-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <span>Se Connecter au Poste</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Logins for Evaluation */}
          <div className="mt-6 pt-5 border-t border-neutral-100">
            <span className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Comptes Démonstration pré-configurés (1 clic) :
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('visiteur@whieda.com')}
                className="p-2.5 text-left border border-emerald-100 hover:border-emerald-300 bg-emerald-50/40 rounded-xl transition-colors flex items-center gap-2"
              >
                <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">V</div>
                <div>
                  <div className="font-semibold text-neutral-800">Visiteur</div>
                  <div className="text-[10px] text-neutral-500">Vitrine Publique</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('reception@whieda.com')}
                className="p-2.5 text-left border border-orange-100 hover:border-orange-300 bg-orange-50/40 rounded-xl transition-colors flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4 text-orange-600 shrink-0" />
                <div>
                  <div className="font-semibold text-neutral-800">Réception</div>
                  <div className="text-[10px] text-neutral-500">Visites & Parrains</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('dr.kamga@whieda.com')}
                className="p-2.5 text-left border border-rose-100 hover:border-rose-300 bg-rose-50/40 rounded-xl transition-colors flex items-center gap-2"
              >
                <Stethoscope className="w-4 h-4 text-rose-600 shrink-0" />
                <div>
                  <div className="font-semibold text-neutral-800">Médecin</div>
                  <div className="text-[10px] text-neutral-500">Bilans & PDF</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('caisse@whieda.com')}
                className="p-2.5 text-left border border-purple-100 hover:border-purple-300 bg-purple-50/40 rounded-xl transition-colors flex items-center gap-2"
              >
                <div className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">C</div>
                <div>
                  <div className="font-semibold text-neutral-800">Caissière</div>
                  <div className="text-[10px] text-neutral-500">Caisse & Factures</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('comptable@whieda.com')}
                className="p-2.5 text-left border border-amber-100 hover:border-amber-300 bg-amber-50/40 rounded-xl transition-colors flex items-center gap-2"
              >
                <Calculator className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <div className="font-semibold text-neutral-800">Comptable</div>
                  <div className="text-[10px] text-neutral-500">Finances & Stocks</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin@whieda.com')}
                className="p-2.5 text-left border border-red-100 hover:border-red-300 bg-red-50/40 rounded-xl transition-colors flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-red-600 shrink-0" />
                <div>
                  <div className="font-semibold text-neutral-800">Admin</div>
                  <div className="text-[10px] text-neutral-500">Toutes les pages</div>
                </div>
              </button>
            </div>
          </div>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-neutral-400 hover:text-neutral-700"
            >
              Fermer la fenêtre
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
