import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, Phone, Mail, ShieldAlert, ArrowRight, UserCheck, Stethoscope, Calculator, ShieldCheck, Key, Copy, Check } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { loginAs, users } = useApp();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = loginAs(identifier, password);
    if (result.success) {
      onClose();
    } else {
      setError(result.message || 'Identifiant ou mot de passe incorrect.');
    }
  };

  const handleQuickLogin = (userPhoneOrEmail: string, userPassword?: string) => {
    const result = loginAs(userPhoneOrEmail, userPassword);
    if (result.success) {
      onClose();
    } else {
      setError(result.message || 'Connexion échouée.');
    }
  };

  const handleFillCredentials = (phone: string, pass: string) => {
    setIdentifier(phone);
    setPassword(pass);
    setError('');
  };

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-neutral-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 p-5 text-white text-center shrink-0">
          <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center mx-auto mb-2 text-white font-extrabold text-xl shadow-inner">
            W
          </div>
          <h2 className="text-lg font-bold">Connexion Collaborateur Whieda Meyomessala</h2>
          <p className="text-xs text-orange-100 mt-0.5">
            Accès sécurisé par Téléphone & Mot de Passe Alphanumérique · Droits RBAC
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Official Default Credentials Card */}
          <div className="p-4 bg-orange-50/70 border border-orange-200/90 rounded-2xl text-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-orange-950">
                <Key className="w-4 h-4 text-orange-600" />
                <span>Identifiants & Codes Alphanumériques Officiels</span>
              </div>
              <span className="text-[10px] bg-orange-200/60 text-orange-800 px-2 py-0.5 rounded-full font-semibold">
                Par défaut
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              {/* Admin */}
              <div 
                onClick={() => handleFillCredentials('699001122', 'ADMIN2026CYR')}
                className="p-2 bg-white rounded-xl border border-red-200 hover:border-red-400 hover:bg-red-50/40 cursor-pointer transition-all shadow-2xs group"
              >
                <div className="flex items-center justify-between font-bold text-red-900">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-red-600" />
                    Admin : Cyrille OYONO
                  </span>
                  <span className="text-[10px] text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">Remplir</span>
                </div>
                <div className="text-neutral-600 mt-1 flex items-center justify-between">
                  <span>Tél : <strong className="font-mono text-neutral-900">699001122</strong></span>
                  <span className="font-mono bg-red-50 text-red-700 px-1.5 py-0.2 rounded border border-red-200">ADMIN2026CYR</span>
                </div>
              </div>

              {/* Comptable */}
              <div 
                onClick={() => handleFillCredentials('677334455', 'COMPTA2026OYO')}
                className="p-2 bg-white rounded-xl border border-amber-200 hover:border-amber-400 hover:bg-amber-50/40 cursor-pointer transition-all shadow-2xs group"
              >
                <div className="flex items-center justify-between font-bold text-amber-900">
                  <span className="flex items-center gap-1">
                    <Calculator className="w-3.5 h-3.5 text-amber-600" />
                    Comptable : Cyrille OYONO OYONO
                  </span>
                  <span className="text-[10px] text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity">Remplir</span>
                </div>
                <div className="text-neutral-600 mt-1 flex items-center justify-between">
                  <span>Tél : <strong className="font-mono text-neutral-900">677334455</strong></span>
                  <span className="font-mono bg-amber-50 text-amber-700 px-1.5 py-0.2 rounded border border-amber-200">COMPTA2026OYO</span>
                </div>
              </div>

              {/* Médecin */}
              <div 
                onClick={() => handleFillCredentials('690123456', 'MED2026SARAH')}
                className="p-2 bg-white rounded-xl border border-rose-200 hover:border-rose-400 hover:bg-rose-50/40 cursor-pointer transition-all shadow-2xs group"
              >
                <div className="flex items-center justify-between font-bold text-rose-900">
                  <span className="flex items-center gap-1">
                    <Stethoscope className="w-3.5 h-3.5 text-rose-600" />
                    Médecin : Sarah OYONO
                  </span>
                  <span className="text-[10px] text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity">Remplir</span>
                </div>
                <div className="text-neutral-600 mt-1 flex items-center justify-between">
                  <span>Tél : <strong className="font-mono text-neutral-900">690123456</strong></span>
                  <span className="font-mono bg-rose-50 text-rose-700 px-1.5 py-0.2 rounded border border-rose-200">MED2026SARAH</span>
                </div>
              </div>

              {/* Réceptionniste */}
              <div 
                onClick={() => handleFillCredentials('675678901', 'RECEP2026IDRIS')}
                className="p-2 bg-white rounded-xl border border-orange-200 hover:border-orange-400 hover:bg-orange-50/40 cursor-pointer transition-all shadow-2xs group"
              >
                <div className="flex items-center justify-between font-bold text-orange-900">
                  <span className="flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-orange-600" />
                    Réceptionniste : Idris Awoulbe
                  </span>
                  <span className="text-[10px] text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity">Remplir</span>
                </div>
                <div className="text-neutral-600 mt-1 flex items-center justify-between">
                  <span>Tél : <strong className="font-mono text-neutral-900">675678901</strong></span>
                  <span className="font-mono bg-orange-50 text-orange-700 px-1.5 py-0.2 rounded border border-orange-200">RECEP2026IDRIS</span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Identifiant : Numéro de Téléphone (ou Email) *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="ex: 699001122 ou nom@whieda.com"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                />
              </div>
              <span className="text-[10px] text-neutral-500 mt-0.5 block">
                Format téléphone : 9 chiffres (ex: 699001122) ou avec indicatif +237
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Mot de Passe (Code alphanumérique) *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  placeholder="ex: ADMIN2026CYR"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                />
              </div>
            </div>

            {error && (
              <div className="p-2.5 text-xs text-red-700 bg-red-50 rounded-xl border border-red-200 font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <span>Se Connecter à l'Application</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick 1-Click Access */}
          <div className="pt-3 border-t border-neutral-100">
            <span className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Connexion Immédiate en 1 clic :
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('699001122', 'ADMIN2026CYR')}
                className="p-2 text-left border border-red-200 hover:border-red-400 bg-red-50/50 rounded-xl transition-all"
              >
                <div className="flex items-center gap-1 font-bold text-red-900 text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span>Admin</span>
                </div>
                <div className="text-[10px] text-neutral-600 truncate mt-0.5">Cyrille OYONO</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('677334455', 'COMPTA2026OYO')}
                className="p-2 text-left border border-amber-200 hover:border-amber-400 bg-amber-50/50 rounded-xl transition-all"
              >
                <div className="flex items-center gap-1 font-bold text-amber-900 text-[11px]">
                  <Calculator className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Comptable</span>
                </div>
                <div className="text-[10px] text-neutral-600 truncate mt-0.5">Cyrille O. O.</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('690123456', 'MED2026SARAH')}
                className="p-2 text-left border border-rose-200 hover:border-rose-400 bg-rose-50/50 rounded-xl transition-all"
              >
                <div className="flex items-center gap-1 font-bold text-rose-900 text-[11px]">
                  <Stethoscope className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>Médecin</span>
                </div>
                <div className="text-[10px] text-neutral-600 truncate mt-0.5">Sarah OYONO</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('675678901', 'RECEP2026IDRIS')}
                className="p-2 text-left border border-orange-200 hover:border-orange-400 bg-orange-50/50 rounded-xl transition-all"
              >
                <div className="flex items-center gap-1 font-bold text-orange-900 text-[11px]">
                  <UserCheck className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                  <span>Réception</span>
                </div>
                <div className="text-[10px] text-neutral-600 truncate mt-0.5">Idris Awoulbe</div>
              </button>
            </div>
          </div>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-neutral-400 hover:text-neutral-700 font-medium"
            >
              Fermer la fenêtre
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
