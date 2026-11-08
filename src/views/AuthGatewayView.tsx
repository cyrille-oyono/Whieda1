import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Globe, 
  Lock, 
  Phone, 
  ArrowRight, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Building2, 
  HeartHandshake, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';

interface AuthGatewayViewProps {
  onOpenEmployeeModal?: () => void;
}

export const AuthGatewayView: React.FC<AuthGatewayViewProps> = () => {
  const { loginAs, loginAsVisitor, companySettings } = useApp();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleVisitorAccess = () => {
    loginAsVisitor();
  };

  const handleEmployeeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim()) {
      setError('Veuillez renseigner votre identifiant (numéro de téléphone ou email).');
      return;
    }

    if (!password.trim()) {
      setError('Veuillez renseigner votre mot de passe alphanumérique.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const res = loginAs(identifier, password);
      setIsLoading(false);
      if (!res.success) {
        setError(res.message || 'Identifiant ou mot de passe incorrect.');
      }
    }, 250);
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-between selection:bg-orange-500 selection:text-white relative overflow-hidden">
      {/* Background Ambience Gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-orange-600/15 via-red-600/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-red-700/10 blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 via-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md font-black text-xl">
            W
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-white flex items-center gap-2">
              <span>{companySettings?.name || 'Whieda Meyomessala'}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30 font-semibold uppercase">
                Sécurisé
              </span>
            </h1>
            <p className="text-[11px] text-neutral-400">
              Santé Holistique · Pharmacie Naturelle · Système Coopératif
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-neutral-400 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Accès Contrôlé & Chiffré</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-5xl mx-auto px-6 py-8 relative z-10 flex-1 flex flex-col justify-center">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20 mb-3">
            <Lock className="w-3.5 h-3.5" />
            <span>Portail de Connexion Officiel</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Bienvenue sur l'application Whieda Meyomessala
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-2">
            Veuillez choisir votre mode d'accès pour continuer. Les visiteurs découvrent la vitrine publique, tandis que les collaborateurs accèdent à leur espace de travail sécurisé.
          </p>
        </div>

        {/* Dual Gate Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Card 1: Simple Visiteur (Public) */}
          <div className="lg:col-span-5 bg-gradient-to-b from-neutral-900/90 to-neutral-900/60 rounded-3xl border border-neutral-800 p-6 sm:p-8 flex flex-col justify-between shadow-xl relative overflow-hidden group hover:border-emerald-500/40 transition-all">
            <div className="absolute top-0 right-0 p-6 pointer-events-none opacity-20 group-hover:opacity-30 transition-opacity">
              <Globe className="w-32 h-32 text-emerald-500 -mr-6 -mt-6" />
            </div>

            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                <Globe className="w-3.5 h-3.5" />
                <span>Accès Public Libre</span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Pour les simples visiteurs
                </h3>
                <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
                  Consultez librement la vitrine officielle de notre établissement, découvrez nos bilans de santé, nos 28 produits certifiés et nos centres associés.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-xs text-neutral-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Consultation de la page vitrine & soins</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Catalogue des 28 produits certifiés Whieda</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Prise de rendez-vous & demande partenaire</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <Lock className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                  <span>Modules internes protégés (Caisse, Stock, RBAC)</span>
                </div>
              </div>
            </div>

            {/* Big Button: Je suis simple visiteur */}
            <div className="pt-6 relative z-10">
              <button
                type="button"
                onClick={handleVisitorAccess}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/50 hover:shadow-emerald-900/50 transition-all flex items-center justify-center gap-3 active:scale-98 group-hover:scale-[1.01]"
              >
                <Globe className="w-4 h-4" />
                <span>Je suis un simple visiteur</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[11px] text-center text-neutral-500 mt-2">
                Accès direct sans mot de passe requis
              </p>
            </div>
          </div>

          {/* Card 2: Espace Employés & Collaborateurs (Formulaire sécurisé) */}
          <div className="lg:col-span-7 bg-neutral-900 rounded-3xl border border-neutral-800 p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Espace Collaborateurs</span>
                </div>
                <span className="text-[11px] text-neutral-500">
                  Personnel habilité
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Connexion Collaborateurs
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Connectez-vous à l'aide de votre identifiant (téléphone ou email) et de votre mot de passe alphanumérique.
                </p>
              </div>

              {/* Secure Form */}
              <form onSubmit={handleEmployeeLogin} className="mt-6 space-y-4">
                {error && (
                  <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-300 flex items-start gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Identifiant : Numéro de téléphone ou Email *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      autoComplete="username"
                      placeholder="ex: 699001122 ou nom@whieda.com"
                      value={identifier}
                      onChange={e => {
                        setIdentifier(e.target.value);
                        setError('');
                      }}
                      className="w-full pl-10 pr-4 py-2.5 bg-neutral-950 border border-neutral-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-xs font-mono placeholder:text-neutral-600"
                    />
                  </div>
                  <span className="text-[10px] text-neutral-500 mt-1 block">
                    Numéro à 9 chiffres enregistré par la direction (ex: 699001122)
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Mot de passe (Code alphanumérique) *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      placeholder="Code d'accès alphanumérique"
                      value={password}
                      onChange={e => {
                        setPassword(e.target.value);
                        setError('');
                      }}
                      className="w-full pl-10 pr-10 py-2.5 bg-neutral-950 border border-neutral-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-xs font-mono placeholder:text-neutral-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-neutral-500 hover:text-neutral-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:via-orange-500 hover:to-amber-500 text-white font-bold text-sm shadow-lg shadow-orange-950/60 hover:shadow-orange-900/50 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                  >
                    <Lock className="w-4 h-4" />
                    <span>{isLoading ? 'Vérification des accès...' : 'Se Connecter à mon Espace'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-800 text-[11px] text-neutral-500 flex items-center justify-between">
              <span>Authentification stricte RBAC</span>
              <span>Direction · Compta · Médical · Accueil</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-6 border-t border-neutral-900 text-neutral-500 text-xs flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
        <div>
          <span>© 2026 {companySettings?.name || 'Whieda Meyomessala'}. Tous droits réservés.</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span>Protection des Données & Secret Médical</span>
          <span>·</span>
          <span>Version 2.5 Sécurisée</span>
        </div>
      </footer>
    </div>
  );
};
