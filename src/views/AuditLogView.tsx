import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { AuditSeverity, UserRole } from '../types';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  Search, 
  Filter, 
  AlertTriangle, 
  Info, 
  Clock, 
  User, 
  Download, 
  Printer, 
  RefreshCw,
  FileSpreadsheet,
  CheckCircle2,
  Trash2
} from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const { currentUser, auditLogs, clearAuditLogs } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // STRICT ACCESS RESTRICTION: Admin Only
  if (currentUser.role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white border border-red-200 rounded-2xl shadow-sm text-center space-y-4">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <span className="inline-block px-3 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full uppercase tracking-wider">
            Accès Strictement Restreint
          </span>
          <h2 className="text-xl font-bold text-neutral-900 mt-2">
            Journal d'Audit Réservé à l'Administrateur
          </h2>
          <p className="text-sm text-neutral-600 max-w-lg mx-auto">
            Vous êtes actuellement connecté avec le rôle <strong className="text-neutral-900 capitalize">{currentUser.role}</strong>. 
            Le journal d'audit enregistre l'ensemble des opérations financières, modifications et suppressions sensibles 
            et n'est consultable que par l'Administrateur Général.
          </p>
        </div>
        <div className="pt-4 border-t border-neutral-100 text-xs text-neutral-400">
          Tentative d'accès enregistrée sous le compte : {currentUser.fullName} ({currentUser.email})
        </div>
      </div>
    );
  }

  // Filter logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      // Search
      const matchSearch = 
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.module.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchSearch) return false;

      // Module
      if (selectedModule !== 'all' && log.module !== selectedModule) {
        return false;
      }

      // Severity
      if (selectedSeverity !== 'all' && log.severity !== selectedSeverity) {
        return false;
      }

      // Date
      if (selectedDateFilter !== 'all') {
        const logDate = new Date(log.timestamp);
        const now = new Date();
        if (selectedDateFilter === 'today') {
          if (logDate.toDateString() !== now.toDateString()) return false;
        } else if (selectedDateFilter === 'week') {
          const diffTime = Math.abs(now.getTime() - logDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays > 7) return false;
        } else if (selectedDateFilter === 'month') {
          if (logDate.getMonth() !== now.getMonth() || logDate.getFullYear() !== now.getFullYear()) return false;
        }
      }

      return true;
    });
  }, [auditLogs, searchTerm, selectedModule, selectedSeverity, selectedDateFilter]);

  // Statistics
  const totalLogs = auditLogs.length;
  const dangerLogs = auditLogs.filter(l => l.severity === 'danger').length;
  const warningLogs = auditLogs.filter(l => l.severity === 'warning').length;
  const infoLogs = auditLogs.filter(l => l.severity === 'info').length;

  const handleExportCSV = () => {
    const headers = ['ID', 'Date_Heure', 'Utilisateur', 'Role', 'Module', 'Action', 'Gravite', 'Details'];
    const rows = filteredLogs.map(l => [
      l.id,
      new Date(l.timestamp).toLocaleString('fr-FR'),
      `"${l.userName.replace(/"/g, '""')}"`,
      l.userRole,
      l.module,
      `"${l.action.replace(/"/g, '""')}"`,
      l.severity,
      `"${l.details.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `journal_audit_whieda_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-red-100 text-red-700 rounded-lg">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
              Journal d'Audit & Sécurité Système (Audit Log)
            </h1>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Traçabilité intégrale des suppressions de dépenses, modifications financières, validations de paiements et actions sensibles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 rounded-xl text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-all"
            title="Exporter en CSV"
          >
            <Download className="w-3.5 h-3.5 text-neutral-500" />
            <span>Exporter CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-neutral-900 hover:bg-black text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimer le Journal</span>
          </button>
        </div>
      </div>

      {/* Security Status Card */}
      <div className="p-4 bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 text-white rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">
                Contrôle d'Intégrité Actif — Profil Administrateur
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/20 text-green-300 border border-green-500/30">
                Audité en Temps Réel
              </span>
            </div>
            <p className="text-xs text-neutral-300 mt-0.5">
              Chaque suppression de dépense, modification de données financières, règlement de commission ou ajustement de stock génère un log immuable.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <User className="w-4 h-4 text-orange-400" />
          <span>Session : <strong className="text-white">{currentUser.fullName}</strong></span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 no-print">
        <div className="p-4 bg-white border border-neutral-200/80 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Total Événements</span>
            <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-neutral-900 mt-2 tracking-tight">
            {totalLogs}
          </p>
          <span className="text-[11px] text-neutral-400">Toutes actions confondues</span>
        </div>

        <div className="p-4 bg-white border border-red-200 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-700">Actions Critiques (Danger)</span>
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-red-600 mt-2 tracking-tight">
            {dangerLogs}
          </p>
          <span className="text-[11px] text-red-500">Suppressions & suppressions de dépenses</span>
        </div>

        <div className="p-4 bg-white border border-amber-200 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700">Modifications (Warning)</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 mt-2 tracking-tight">
            {warningLogs}
          </p>
          <span className="text-[11px] text-amber-600">Ajustements financiers & montants</span>
        </div>

        <div className="p-4 bg-white border border-blue-200 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-700">Opérations Standards</span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-blue-600 mt-2 tracking-tight">
            {infoLogs}
          </p>
          <span className="text-[11px] text-blue-600">Validations de paiements & saisies</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 border border-neutral-200 rounded-2xl shadow-2xs space-y-3 no-print">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Rechercher par action, utilisateur, montant ou détail..."
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-neutral-50 hover:bg-neutral-100/80 focus:bg-white border border-neutral-200 focus:border-red-500 rounded-xl focus:outline-hidden transition-colors"
            />
          </div>

          {/* Module Filter */}
          <div className="flex items-center gap-2">
            <select
              value={selectedModule}
              onChange={e => setSelectedModule(e.target.value)}
              className="px-3 py-2 text-xs bg-white border border-neutral-200 rounded-xl text-neutral-700 font-medium focus:outline-hidden focus:border-red-500"
            >
              <option value="all">Tous les Modules</option>
              <option value="Dépenses">Dépenses</option>
              <option value="Paiements Partenaires">Paiements Partenaires</option>
              <option value="Partenaires">Partenaires</option>
              <option value="Ventes">Ventes</option>
              <option value="Examens">Examens</option>
              <option value="Paramètres">Paramètres</option>
              <option value="Sécurité">Sécurité</option>
            </select>

            {/* Severity Filter */}
            <select
              value={selectedSeverity}
              onChange={e => setSelectedSeverity(e.target.value)}
              className="px-3 py-2 text-xs bg-white border border-neutral-200 rounded-xl text-neutral-700 font-medium focus:outline-hidden focus:border-red-500"
            >
              <option value="all">Toutes Gravités</option>
              <option value="danger">Danger (Critique / Suppression)</option>
              <option value="warning">Warning (Modification)</option>
              <option value="info">Info (Standard / Validation)</option>
            </select>

            {/* Date Filter */}
            <select
              value={selectedDateFilter}
              onChange={e => setSelectedDateFilter(e.target.value as any)}
              className="px-3 py-2 text-xs bg-white border border-neutral-200 rounded-xl text-neutral-700 font-medium focus:outline-hidden focus:border-red-500"
            >
              <option value="all">Toute la Période</option>
              <option value="today">Aujourd'hui</option>
              <option value="week">7 derniers jours</option>
              <option value="month">Ce mois</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-neutral-200 rounded-2xl shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-neutral-900">
              Registre Chronologique des Événements
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-100 text-neutral-600">
              {filteredLogs.length} entrée{filteredLogs.length > 1 ? 's' : ''}
            </span>
          </div>

          {filteredLogs.length > 0 && (
            <span className="text-[11px] text-neutral-400">
              Classé du plus récent au plus ancien
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-50/80 border-b border-neutral-200 text-neutral-600 font-semibold">
                <th className="py-3 px-4 w-40">Date & Heure</th>
                <th className="py-3 px-4 w-44">Utilisateur & Rôle</th>
                <th className="py-3 px-4 w-40">Module & Action</th>
                <th className="py-3 px-4">Détails & Modifications Constatées</th>
                <th className="py-3 px-4 w-28 text-center">Niveau</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-neutral-400">
                    <ShieldCheck className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                    <p className="font-medium text-neutral-600">Aucun événement ne correspond à vos critères de recherche.</p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">Ajustez vos filtres de module ou de gravité.</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => {
                  const logDate = new Date(log.timestamp);
                  const formattedDate = logDate.toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  });
                  const formattedTime = logDate.toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  });

                  return (
                    <tr 
                      key={log.id} 
                      className={`hover:bg-neutral-50/80 transition-colors ${
                        log.severity === 'danger' ? 'bg-red-50/30' : log.severity === 'warning' ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      {/* Timestamp */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-semibold text-neutral-900">{formattedDate}</div>
                        <div className="text-[11px] text-neutral-400 font-mono flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-neutral-300" />
                          <span>{formattedTime}</span>
                        </div>
                      </td>

                      {/* User & Role */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-neutral-900">{log.userName}</div>
                        <span className={`inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${
                          log.userRole === 'admin' ? 'bg-red-100 text-red-800' :
                          log.userRole === 'accountant' ? 'bg-purple-100 text-purple-800' :
                          log.userRole === 'doctor' ? 'bg-blue-100 text-blue-800' :
                          'bg-neutral-100 text-neutral-700'
                        }`}>
                          {log.userRole}
                        </span>
                      </td>

                      {/* Module & Action */}
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-neutral-100 text-neutral-700 mb-1">
                          {log.module}
                        </span>
                        <div className="font-bold text-neutral-800">
                          {log.action}
                        </div>
                      </td>

                      {/* Details */}
                      <td className="py-3 px-4">
                        <p className="text-neutral-700 leading-relaxed font-mono text-[11.5px] bg-white/70 p-1.5 rounded-lg border border-neutral-100">
                          {log.details}
                        </p>
                      </td>

                      {/* Severity */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {log.severity === 'danger' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                            <ShieldAlert className="w-3 h-3 text-red-600" />
                            <span>Danger</span>
                          </span>
                        )}
                        {log.severity === 'warning' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            <span>Warning</span>
                          </span>
                        )}
                        {log.severity === 'info' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                            <Info className="w-3 h-3 text-blue-600" />
                            <span>Info</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
