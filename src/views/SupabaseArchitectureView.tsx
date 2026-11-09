import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getSupabaseConfig } from '../lib/supabase';
import { SUPABASE_SCHEMA_SQL, NEXTJS_PROJECT_TREE } from '../data/schema_sql';
import { SUPABASE_OFFICIAL_PRODUCTS_SEED_SQL, OFFICIAL_PRODUCTS_CATALOG } from '../data/officialProducts';
import { formatMoney, formatPV } from '../utils/formatters';
import { 
  Database, 
  FolderTree, 
  Copy, 
  Check, 
  Zap, 
  ShieldCheck, 
  FileCode, 
  Terminal,
  ExternalLink,
  Package,
  Layers,
  Sparkles,
  Radio,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Server,
  Wifi,
  WifiOff,
  ArrowRight,
  ShieldAlert,
  Save
} from 'lucide-react';

export const SupabaseArchitectureView: React.FC = () => {
  const { 
    supabaseStatus, 
    isSupabaseConfigured, 
    isMigrating, 
    migrationReport, 
    runSupabaseMigration, 
    updateSupabaseCredentials,
    refreshDataFromSupabase,
    products,
    partners,
    expenses,
    visits
  } = useApp();

  const [activeTab, setActiveTab] = useState<'sync' | 'seed' | 'sql' | 'tree' | 'triggers' | 'rls'>('sync');
  const [copied, setCopied] = useState(false);

  // Configuration credentials form state
  const initialCfg = getSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(initialCfg.url);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(initialCfg.anonKey);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveAndTestCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingConfig(true);
    setTestResult(null);
    try {
      const res = await updateSupabaseCredentials(supabaseUrl, supabaseAnonKey);
      setTestResult(res);
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Erreur lors du test de connexion' });
    } finally {
      setIsSavingConfig(false);
    }
  };

  const REALTIME_PUBLICATION_SQL = `-- Activer la synchronisation Temps Réel (Supabase Realtime)
-- Exécuter dans l'Éditeur SQL Supabase pour que toutes les modifications faites
-- par l'administrateur soient immédiatement diffusées à tous les utilisateurs :

ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE partners;
ALTER PUBLICATION supabase_realtime ADD TABLE expenses;
ALTER PUBLICATION supabase_realtime ADD TABLE daily_visits;
ALTER PUBLICATION supabase_realtime ADD TABLE company_settings;

-- Vérifier que la réplication est activée :
SELECT tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime';`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <Database className="w-5 h-5 text-orange-600" />
            <span>Synchronisation Supabase & Temps Réel</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Architecture multi-utilisateurs en temps réel, migration des données localStorage et liaison Vercel
          </p>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {supabaseStatus === 'connected' && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <Radio className="w-3.5 h-3.5 text-emerald-600" />
              <span>Supabase Realtime Connecté</span>
            </div>
          )}
          {supabaseStatus === 'connecting' && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold shadow-xs">
              <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
              <span>Connexion en cours...</span>
            </div>
          )}
          {supabaseStatus === 'disconnected' && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-600 text-xs font-semibold shadow-xs">
              <WifiOff className="w-3.5 h-3.5 text-neutral-400" />
              <span>Mode Local / Hors-Ligne</span>
            </div>
          )}
          {supabaseStatus === 'error' && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold shadow-xs">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>Erreur de liaison Supabase</span>
            </div>
          )}

          <button
            onClick={() => handleCopy(SUPABASE_SCHEMA_SQL)}
            className="inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-all whitespace-nowrap"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copié !' : 'Copier SQL'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-neutral-200 shadow-xs flex-wrap">
        <button
          onClick={() => setActiveTab('sync')}
          className={`flex-1 min-w-[190px] py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'sync'
              ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-xs'
              : 'text-neutral-700 hover:text-neutral-900 bg-neutral-50 hover:bg-neutral-100'
          }`}
        >
          <Radio className="w-4 h-4 text-amber-300" />
          <span>Synchronisation & Migration</span>
        </button>

        <button
          onClick={() => setActiveTab('seed')}
          className={`flex-1 min-w-[160px] py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'seed'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Grille 28 Produits (Seed)</span>
        </button>

        <button
          onClick={() => setActiveTab('sql')}
          className={`flex-1 min-w-[150px] py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'sql'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Script schema.sql</span>
        </button>

        <button
          onClick={() => setActiveTab('triggers')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'triggers'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-500" />
          <span>Triggers & Fonctions</span>
        </button>

        <button
          onClick={() => setActiveTab('rls')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'rls'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-red-500" />
          <span>Sécurité RLS</span>
        </button>

        <button
          onClick={() => setActiveTab('tree')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'tree'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          <span>Arborescence App</span>
        </button>
      </div>

      {/* Content based on Active Tab */}
      {activeTab === 'sync' && (
        <div className="space-y-6">
          {/* Card 1: Console de Connexion Supabase */}
          <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <Server className="w-4 h-4 text-orange-600" />
                  <span>Liaison Supabase Cloud & Déploiement Vercel</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Synchronisation globale pour l'instance déployée sur <span className="font-mono text-orange-600">https://whiedameyomessala.vercel.app/</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => refreshDataFromSupabase()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-semibold transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Rafraîchir les Données</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveAndTestCredentials} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Supabase Project URL (VITE_SUPABASE_URL)
                  </label>
                  <input
                    type="url"
                    placeholder="https://xyzcompany.supabase.co"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-mono text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Trouvable dans Supabase Dashboard &gt; Project Settings &gt; API &gt; Project URL.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Supabase Anon Public API Key (VITE_SUPABASE_ANON_KEY)
                  </label>
                  <input
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={supabaseAnonKey}
                    onChange={(e) => setSupabaseAnonKey(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-mono text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Trouvable dans Supabase Dashboard &gt; Project Settings &gt; API &gt; Project API keys (anon public).
                  </p>
                </div>
              </div>

              {testResult && (
                <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                  testResult.success 
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-neutral-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Sauvegardé de manière sécurisée en cache et compatible avec les variables d'environnement Vercel.</span>
                </span>

                <button
                  type="submit"
                  disabled={isSavingConfig}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
                >
                  {isSavingConfig ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{isSavingConfig ? 'Test en cours...' : 'Tester & Enregistrer la Connexion'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Card 2: Migration Sécurisée localStorage -> Supabase */}
          <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <Database className="w-4 h-4 text-orange-600" />
                  <span>Migration Sécurisée et Sauvegarde des Données Existantes</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Injecte les produits, partenaires, finances et paramètres enregistrés dans Supabase avec sauvegarde miroir intégrale.
                </p>
              </div>

              <button
                type="button"
                onClick={() => runSupabaseMigration()}
                disabled={isMigrating || !isSupabaseConfigured}
                className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-all disabled:opacity-50 whitespace-nowrap shrink-0"
              >
                {isMigrating ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-orange-400" />
                ) : (
                  <ArrowRight className="w-4 h-4 text-orange-400" />
                )}
                <span>{isMigrating ? 'Migration en cours...' : 'Lancer la Migration vers Supabase'}</span>
              </button>
            </div>

            {/* Garanties de Sécurité */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-amber-50/60 border border-amber-200/80 rounded-lg p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                  <span>1. Sauvegarde Miroir</span>
                </div>
                <p className="text-[11px] text-amber-800">
                  Un instantané complet indestructible est enregistré dans <code className="font-mono bg-amber-100/70 px-1 py-0.5 rounded">whieda_backup_before_supabase</code>.
                </p>
              </div>

              <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-lg p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>2. Zéro Perte de Données</span>
                </div>
                <p className="text-[11px] text-emerald-800">
                  Les configurations déjà saisies (produits officiels, stock, parrainages MLM) sont conservées et répliquées.
                </p>
              </div>

              <div className="bg-blue-50/60 border border-blue-200/80 rounded-lg p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                  <Radio className="w-3.5 h-3.5 text-blue-600" />
                  <span>3. Synchronisation Temps Réel</span>
                </div>
                <p className="text-[11px] text-blue-800">
                  Dès la migration terminée, toute action admin est diffusée instantanément aux collaborateurs sans recharger la page.
                </p>
              </div>
            </div>

            {/* Rapport de Migration si disponible */}
            {migrationReport && (
              <div className={`p-4 rounded-xl border ${
                migrationReport.success 
                  ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900' 
                  : 'bg-amber-50/50 border-amber-200 text-amber-900'
              } space-y-3`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{migrationReport.message}</span>
                  </span>
                  <span className="text-[11px] font-mono text-neutral-500">
                    {new Date(migrationReport.timestamp).toLocaleTimeString('fr-FR')}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                  <div className="bg-white p-2 rounded-lg border border-neutral-200">
                    <div className="font-bold text-neutral-900">{migrationReport.counts.products}</div>
                    <div className="text-[10px] text-neutral-500">Produits</div>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-neutral-200">
                    <div className="font-bold text-neutral-900">{migrationReport.counts.partners}</div>
                    <div className="text-[10px] text-neutral-500">Partenaires</div>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-neutral-200">
                    <div className="font-bold text-neutral-900">{migrationReport.counts.expenses}</div>
                    <div className="text-[10px] text-neutral-500">Dépenses</div>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-neutral-200">
                    <div className="font-bold text-neutral-900">{migrationReport.counts.visits}</div>
                    <div className="text-[10px] text-neutral-500">Visites</div>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-neutral-200">
                    <div className="font-bold text-neutral-900">{migrationReport.counts.settings ? 'Synchronisé' : 'Standard'}</div>
                    <div className="text-[10px] text-neutral-500">Paramètres</div>
                  </div>
                </div>

                {migrationReport.errors.length > 0 && (
                  <div className="text-[11px] text-rose-700 space-y-1 bg-white p-2.5 rounded-lg border border-rose-200">
                    <span className="font-semibold">Avertissements :</span>
                    <ul className="list-disc list-inside">
                      {migrationReport.errors.map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Card 3: Activation de Supabase Realtime (SQL) */}
          <div className="bg-neutral-950 rounded-xl border border-neutral-800 shadow-lg overflow-hidden text-neutral-100 font-mono text-xs">
            <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-900 border-b border-neutral-800 text-[11px] text-neutral-400">
              <div className="flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
                <span>Activer Supabase Realtime · Commandes PostgreSQL</span>
              </div>
              <button
                onClick={() => handleCopy(REALTIME_PUBLICATION_SQL)}
                className="hover:text-white transition-colors flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copié !' : 'Copier'}</span>
              </button>
            </div>
            <pre className="p-4 overflow-x-auto max-h-[250px] leading-relaxed text-[11px] text-orange-200">
              {REALTIME_PUBLICATION_SQL}
            </pre>
          </div>
        </div>
      )}

      {/* Content based on Active Tab */}
      {activeTab === 'seed' && (
        <div className="space-y-6">
          {/* Card Overview */}
          <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-orange-600" />
                  <span>Script de Migration / Insertion en Masse (Seed) Supabase</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Initialisation des 28 produits certifiés avec colonnes : <code className="font-mono text-orange-600 bg-orange-50 px-1 py-0.5 rounded">code</code>, <code className="font-mono text-orange-600 bg-orange-50 px-1 py-0.5 rounded">name</code>, <code className="font-mono text-orange-600 bg-orange-50 px-1 py-0.5 rounded">partner_price</code>, <code className="font-mono text-orange-600 bg-orange-50 px-1 py-0.5 rounded">public_price</code>, <code className="font-mono text-orange-600 bg-orange-50 px-1 py-0.5 rounded">pv</code>, <code className="font-mono text-orange-600 bg-orange-50 px-1 py-0.5 rounded">category_id</code>
                </p>
              </div>

              <button
                onClick={() => handleCopy(SUPABASE_OFFICIAL_PRODUCTS_SEED_SQL)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all whitespace-nowrap shrink-0"
              >
                {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'SQL Copié !' : 'Copier le Script Seed SQL'}</span>
              </button>
            </div>

            {/* Visual Table of the 28 Products */}
            <div className="border border-neutral-200 rounded-lg overflow-hidden">
              <div className="px-4 py-2 bg-neutral-50 border-b border-neutral-200 text-xs font-bold text-neutral-700 flex items-center justify-between">
                <span>Aperçu des 28 Produits Officiels à Insérer</span>
                <span className="text-[11px] font-mono text-neutral-500">28 références actives</span>
              </div>
              <div className="overflow-x-auto max-h-72">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-100/70 text-neutral-600 font-semibold border-b border-neutral-200 sticky top-0">
                    <tr>
                      <th className="py-2 px-3">#</th>
                      <th className="py-2 px-3">Code</th>
                      <th className="py-2 px-3">Désignation</th>
                      <th className="py-2 px-3">Catégorie assignée</th>
                      <th className="py-2 px-3 text-right">Prix Partenaire</th>
                      <th className="py-2 px-3 text-right">Prix Public</th>
                      <th className="py-2 px-3 text-right">Bénéfice Net</th>
                      <th className="py-2 px-3 text-right">PV</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 text-neutral-700">
                    {OFFICIAL_PRODUCTS_CATALOG.map((item, idx) => (
                      <tr key={item.code + idx} className="hover:bg-neutral-50">
                        <td className="py-2 px-3 font-mono text-neutral-400">{idx + 1}</td>
                        <td className="py-2 px-3 font-mono font-bold text-neutral-900">{item.code}</td>
                        <td className="py-2 px-3 font-semibold text-neutral-900">{item.name}</td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200">
                            {item.category_name} ({item.category_id})
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-neutral-600">{formatMoney(item.partner_price)}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-neutral-900">{formatMoney(item.public_price)}</td>
                        <td className="py-2 px-3 text-right font-mono font-semibold text-emerald-700">+{formatMoney(item.public_price - item.partner_price)}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-amber-700">{formatPV(item.pv)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* SQL Editor Code Block */}
          <div className="bg-neutral-950 rounded-xl border border-neutral-800 shadow-lg overflow-hidden text-neutral-100 font-mono text-xs">
            <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-900 border-b border-neutral-800 text-[11px] text-neutral-400">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-orange-400" />
                <span>seed_official_products.sql · PostgreSQL Supabase Script</span>
              </div>
              <button
                onClick={() => handleCopy(SUPABASE_OFFICIAL_PRODUCTS_SEED_SQL)}
                className="hover:text-white transition-colors flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copié !' : 'Copier'}</span>
              </button>
            </div>
            <pre className="p-4 overflow-x-auto max-h-[500px] leading-relaxed text-[11px] text-orange-100">
              {SUPABASE_OFFICIAL_PRODUCTS_SEED_SQL}
            </pre>
          </div>
        </div>
      )}

      {activeTab === 'sql' && (
        <div className="bg-neutral-950 rounded-xl border border-neutral-800 shadow-lg overflow-hidden text-neutral-100 font-mono text-xs">
          <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-900 border-b border-neutral-800 text-[11px] text-neutral-400">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-orange-400" />
              <span>schema.sql · PostgreSQL Supabase Engine</span>
            </div>
            <button
              onClick={() => handleCopy(SUPABASE_SCHEMA_SQL)}
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copié !' : 'Copier'}</span>
            </button>
          </div>
          <pre className="p-4 overflow-x-auto max-h-[600px] leading-relaxed text-[11px] text-neutral-300">
            {SUPABASE_SCHEMA_SQL}
          </pre>
        </div>
      )}

      {activeTab === 'tree' && (
        <div className="bg-neutral-950 rounded-xl border border-neutral-800 shadow-lg overflow-hidden text-neutral-100 font-mono text-xs">
          <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-900 border-b border-neutral-800 text-[11px] text-neutral-400">
            <div className="flex items-center gap-2">
              <FolderTree className="w-3.5 h-3.5 text-orange-400" />
              <span>Structure Next.js 15+ App Router</span>
            </div>
            <button
              onClick={() => handleCopy(NEXTJS_PROJECT_TREE)}
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copié !' : 'Copier'}</span>
            </button>
          </div>
          <pre className="p-4 overflow-x-auto max-h-[600px] leading-relaxed text-[11px] text-orange-200">
            {NEXTJS_PROJECT_TREE}
          </pre>
        </div>
      )}

      {activeTab === 'triggers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-900">
              <Zap className="w-4 h-4 text-orange-600" />
              <span>1. Sync Automatique MLM & PV (trg_sync_partner_earnings)</span>
            </div>
            <p className="text-xs text-neutral-600">
              Déclenché dès l'insertion d'une vente en caisse (`AFTER INSERT ON sales`). Si un `sponsor_partner_id` est rattaché au patient, la fonction incrémente automatiquement :
            </p>
            <ul className="list-disc list-inside text-xs text-neutral-700 font-mono space-y-1 bg-neutral-50 p-3 rounded-lg border border-neutral-200">
              <li>total_direct_earnings += total_partner_gain</li>
              <li>remaining_earnings += total_partner_gain</li>
              <li>total_pv += total_pv</li>
              <li>remaining_pv += total_pv</li>
            </ul>
          </div>

          <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-900">
              <Zap className="w-4 h-4 text-red-600" />
              <span>2. Déduction Immédiate du Stock (trg_deduct_stock)</span>
            </div>
            <p className="text-xs text-neutral-600">
              Déclenché à chaque ligne de vente insérée (`AFTER INSERT ON sale_items`). Décrémente immédiatement `products_services.stock_quantity` pour les articles physiques (Boutique & Pharmacie) avec protection contre les valeurs négatives :
            </p>
            <div className="text-xs text-neutral-700 font-mono bg-neutral-50 p-3 rounded-lg border border-neutral-200">
              stock_quantity = GREATEST(0, stock_quantity - NEW.quantity)
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-900">
              <Zap className="w-4 h-4 text-emerald-600" />
              <span>3. Réapprovisionnement Automatique Fournisseur</span>
            </div>
            <p className="text-xs text-neutral-600">
              Déclenché lors de la transition d'un bon de commande au statut `recue`. Parcourt le tableau JSONB d'articles et réinjecte automatiquement les quantités dans `stock_quantity`.
            </p>
            <div className="text-xs text-neutral-700 font-mono bg-neutral-50 p-3 rounded-lg border border-neutral-200">
              stock_quantity = stock_quantity + item.quantity
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-900">
              <Zap className="w-4 h-4 text-amber-600" />
              <span>4. Calcul Instantané de la Marge Directe</span>
            </div>
            <p className="text-xs text-neutral-600">
              Colonne générée stockée au niveau du schéma PostgreSQL :
            </p>
            <div className="text-xs text-neutral-700 font-mono bg-neutral-50 p-3 rounded-lg border border-neutral-200">
              direct_margin NUMERIC GENERATED ALWAYS AS (patient_price - partner_price) STORED
            </div>
          </div>
        </div>
      )}

      {activeTab === 'rls' && (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-6 space-y-4">
          <h3 className="text-sm font-bold text-neutral-900">
            Matrice des Privilèges Row Level Security (RLS)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-neutral-200 rounded-lg">
              <thead className="bg-neutral-50 font-semibold text-neutral-600 border-b border-neutral-200">
                <tr>
                  <th className="p-3">Table Supabase</th>
                  <th className="p-3">Admin</th>
                  <th className="p-3">Réceptionniste</th>
                  <th className="p-3">Médecin</th>
                  <th className="p-3">Comptable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 text-neutral-700">
                <tr>
                  <td className="p-3 font-mono font-bold">profiles (Employés)</td>
                  <td className="p-3 font-semibold text-red-600">Lecture / Écriture totale</td>
                  <td className="p-3 text-neutral-400">Aucun accès</td>
                  <td className="p-3 text-neutral-400">Aucun accès</td>
                  <td className="p-3 text-neutral-400">Aucun accès</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono font-bold">daily_visits</td>
                  <td className="p-3 font-semibold text-red-600">Lecture / Écriture totale</td>
                  <td className="p-3 font-semibold text-orange-600">Lecture / Création / Màj</td>
                  <td className="p-3 text-neutral-600">Lecture patientèle</td>
                  <td className="p-3 text-neutral-600">Lecture seule</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono font-bold">partners (MLM)</td>
                  <td className="p-3 font-semibold text-red-600">Lecture / Écriture totale</td>
                  <td className="p-3 text-neutral-600">Lecture pour parrainage</td>
                  <td className="p-3 text-neutral-400">Aucun accès</td>
                  <td className="p-3 font-semibold text-amber-600">Gestion paiements & soldes</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono font-bold">products_services</td>
                  <td className="p-3 font-semibold text-red-600">CRUD complet</td>
                  <td className="p-3 text-neutral-600">Lecture catalogue</td>
                  <td className="p-3 text-neutral-600">Lecture pour ordonnance</td>
                  <td className="p-3 font-semibold text-amber-600">Lecture & Gestion stocks</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono font-bold">sales & sale_items</td>
                  <td className="p-3 font-semibold text-red-600">Lecture / Écriture totale</td>
                  <td className="p-3 text-neutral-400">Aucun accès</td>
                  <td className="p-3 text-neutral-400">Aucun accès</td>
                  <td className="p-3 font-semibold text-amber-600">Encaissement POS complet</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono font-bold">medical_records</td>
                  <td className="p-3 font-semibold text-red-600">Lecture / Audit</td>
                  <td className="p-3 text-neutral-400">Cloisonné (Secret médical)</td>
                  <td className="p-3 font-semibold text-rose-600">Consultations, Bilans, Rx</td>
                  <td className="p-3 text-neutral-400">Cloisonné (Secret médical)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
