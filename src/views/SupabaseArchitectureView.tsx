import React, { useState } from 'react';
import { SUPABASE_SCHEMA_SQL, NEXTJS_PROJECT_TREE } from '../data/schema_sql';
import { 
  Database, 
  FolderTree, 
  Copy, 
  Check, 
  Zap, 
  ShieldCheck, 
  FileCode, 
  Terminal,
  ExternalLink
} from 'lucide-react';

export const SupabaseArchitectureView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sql' | 'tree' | 'triggers' | 'rls'>('sql');
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <Database className="w-5 h-5 text-orange-600" />
            <span>Architecture & Script SQL Supabase</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Schéma relationnel PostgreSQL, fonctions triggers MLM / stock, politiques RLS et arborescence Next.js
          </p>
        </div>

        <button
          onClick={() => handleCopy(SUPABASE_SCHEMA_SQL)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all whitespace-nowrap"
        >
          {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Script Copié dans le Presse-Papier !' : 'Copier Tout le Script SQL'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-neutral-200 shadow-xs">
        <button
          onClick={() => setActiveTab('sql')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'sql'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Script schema.sql Supabase</span>
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
          <span>Arborescence Next.js (App Router)</span>
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
          <span>Triggers & Fonctions de Calcul</span>
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
          <span>Sécurité RLS (RBAC)</span>
        </button>
      </div>

      {/* Content based on Active Tab */}
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
