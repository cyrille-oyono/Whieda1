import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Lock, 
  Phone, 
  ArrowRight, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Globe, 
  X, 
  AlertCircle,
  Building2
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { loginAs, loginAsVisitor } = useApp();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim()) {
      setError('Veuillez saisir votre numéro de téléphone ou votre email.');
      return;
    }

    if (!password.trim()) {
      setError('Veuillez saisir votre mot de passe alphanumérique.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const result = loginAs(identifier, password);
      setIsLoading(false);
      if (result.success) {
        setIdentifier('');
        setPassword('');
        setError('');
        onClose();
      } else {
        setError(result.message || 'Identifiant ou mot de passe incorrect.');
      }
    }, 200);
  };

  const handleVisitor = () => {
    loginAsVisitor();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full border border-neutral-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 p-5 text-white text-center relative shrink-0">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-white/80 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center mx-auto mb-2 text-white font-extrabold text-lg shadow-inner">
            W
          </div>
          <h2 className="text-base font-bold">Connexion Collaborateur</h2>
          <p className="text-xs text-orange-100 mt-0.5">
            Espace d'authentification sécurisé · Droits d'accès RBAC
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-xs text-red-700 bg-red-50 rounded-xl border border-red-200 font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Identifiant : Téléphone ou Email *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="ex: 699001122 ou nom@whieda.com"
                  value={identifier}
                  onChange={e => {
                    setIdentifier(e.target.value);
                    setError('');
                  }}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                />
              </div>
              <span className="text-[10px] text-neutral-400 mt-1 block">
                Numéro de téléphone à 9 chiffres enregistré par la structure
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Mot de Passe (Code alphanumérique) *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Code d'accès alphanumérique"
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  className="w-full pl-9 pr-9 py-2 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>{isLoading ? 'Vérification...' : 'Se Connecter'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Alternative: Continuer comme visiteur */}
          <div className="pt-3 border-t border-neutral-100 space-y-2">
            <span className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider text-center">
              Accès Public
            </span>
            <button
              type="button"
              onClick={handleVisitor}
              className="w-full py-2 px-3 border border-neutral-200 hover:border-emerald-500 hover:bg-emerald-50/50 rounded-xl text-xs font-semibold text-neutral-700 transition-all flex items-center justify-center gap-2"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>Je suis un simple visiteur (Vitrine)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
