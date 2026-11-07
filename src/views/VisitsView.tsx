import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { VisitorType, VisitStatus, RequestedService, REQUESTED_SERVICES, Visit } from '../types';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  Users, 
  Link as LinkIcon, 
  CheckCircle2, 
  Clock3, 
  X, 
  UserPlus, 
  AlertCircle,
  Printer,
  FileDown,
  Building,
  MapPin,
  Activity,
  Check,
  FileSpreadsheet,
  Phone,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { getVisitStatusLabel } from '../utils/formatters';
import { generatePatientsVisitsReportPDF } from '../utils/pdfGenerator';

export const VisitsView: React.FC = () => {
  const { visits, addVisit, updateVisitStatus, partners, patients, addPatient, companySettings, currentUser } = useApp();

  // Sub-tabs: 'daily' (Registre journalier direct) or 'summary' (Fichier récapitulatif filtré par mois/année)
  const [activeTab, setActiveTab] = useState<'daily' | 'summary'>('daily');

  // Daily View Filters
  const [dailyFilterType, setDailyFilterType] = useState<'all' | 'patient_client' | 'staff'>('all');
  const [dailySearchTerm, setDailySearchTerm] = useState('');
  const [dailyDateFilter, setDailyDateFilter] = useState(new Date().toISOString().split('T')[0]);

  // Fichier Récapitulatif Filters
  const currentMonthNum = String(new Date().getMonth() + 1).padStart(2, '0');
  const [summaryMonth, setSummaryMonth] = useState<string>(currentMonthNum);
  const [summaryYear, setSummaryYear] = useState<string>('2026');
  const [summaryService, setSummaryService] = useState<string>('all');
  const [summarySearch, setSummarySearch] = useState('');

  // Modals & Feedback
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  // New Visit Form State
  const [visitorType, setVisitorType] = useState<VisitorType>('patient');
  const [visitorName, setVisitorName] = useState('');
  const [visitorAddress, setVisitorAddress] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [requestedService, setRequestedService] = useState<RequestedService>('Bilan de santé');
  const [sponsorPartnerId, setSponsorPartnerId] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  // Months list for dropdown
  const MONTHS = [
    { value: 'all', label: 'Tous les mois' },
    { value: '01', label: '01 - Janvier' },
    { value: '02', label: '02 - Février' },
    { value: '03', label: '03 - Mars' },
    { value: '04', label: '04 - Avril' },
    { value: '05', label: '05 - Mai' },
    { value: '06', label: '06 - Juin' },
    { value: '07', label: '07 - Juillet' },
    { value: '08', label: '08 - Août' },
    { value: '09', label: '09 - Septembre' },
    { value: '10', label: '10 - Octobre' },
    { value: '11', label: '11 - Novembre' },
    { value: '12', label: '12 - Décembre' },
  ];

  const YEARS = ['2026', '2025', '2024', 'all'];

  // Filtered visits for Daily View
  const filteredDailyVisits = visits.filter(v => {
    const matchesSearch = v.visitorName.toLowerCase().includes(dailySearchTerm.toLowerCase()) ||
      (v.sponsorPartnerName && v.sponsorPartnerName.toLowerCase().includes(dailySearchTerm.toLowerCase())) ||
      v.purpose.toLowerCase().includes(dailySearchTerm.toLowerCase()) ||
      (v.visitorAddress && v.visitorAddress.toLowerCase().includes(dailySearchTerm.toLowerCase()));

    const matchesDate = !dailyDateFilter || v.date === dailyDateFilter;

    let matchesType = true;
    if (dailyFilterType === 'patient_client') {
      matchesType = v.visitorType === 'patient' || v.visitorType === 'client';
    } else if (dailyFilterType === 'staff') {
      matchesType = v.visitorType === 'staff';
    }

    return matchesSearch && matchesDate && matchesType;
  });

  // Filtered visits for Summary Ledger View
  const filteredSummaryVisits = visits.filter(v => {
    // Year filter
    if (summaryYear !== 'all') {
      const vYear = v.date.split('-')[0];
      if (vYear !== summaryYear) return false;
    }
    // Month filter
    if (summaryMonth !== 'all') {
      const vMonth = v.date.split('-')[1];
      if (vMonth !== summaryMonth.padStart(2, '0')) return false;
    }
    // Service filter
    if (summaryService !== 'all') {
      const s = v.requestedService || v.purpose;
      if (s !== summaryService) return false;
    }
    // Search filter
    if (summarySearch.trim()) {
      const q = summarySearch.toLowerCase();
      const matchName = v.visitorName.toLowerCase().includes(q);
      const matchPhone = v.visitorPhone?.toLowerCase().includes(q);
      const matchAddress = v.visitorAddress?.toLowerCase().includes(q);
      const matchSponsor = v.sponsorPartnerName?.toLowerCase().includes(q) || v.sponsorPartnerCode?.toLowerCase().includes(q);
      const matchService = (v.requestedService || v.purpose).toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchAddress && !matchSponsor && !matchService) return false;
    }
    return true;
  });

  // Summary statistics
  const countTotalSummary = filteredSummaryVisits.length;
  const countBilans = filteredSummaryVisits.filter(v => (v.requestedService || v.purpose) === 'Bilan de santé').length;
  const countMassages = filteredSummaryVisits.filter(v => (v.requestedService || v.purpose) === 'Massage').length;
  const countAchats = filteredSummaryVisits.filter(v => (v.requestedService || v.purpose) === 'Achat produit').length;
  const countFormations = filteredSummaryVisits.filter(v => (v.requestedService || v.purpose) === 'Formation').length;
  const countVisites = filteredSummaryVisits.filter(v => (v.requestedService || v.purpose) === 'Simple visite').length;

  const handleOpenModal = () => {
    setVisitorName('');
    setVisitorAddress('');
    setVisitorPhone('');
    setRequestedService('Bilan de santé');
    setSponsorPartnerId('');
    setNotes('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSelectExistingPatient = (patientId: string) => {
    const p = patients.find(pat => pat.id === patientId);
    if (p) {
      setVisitorName(p.fullName);
      setVisitorPhone(p.phone);
      if (p.address) setVisitorAddress(p.address);
      setVisitorType(p.type);
      if (p.sponsorPartnerId) {
        setSponsorPartnerId(p.sponsorPartnerId);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!visitorName.trim()) {
      setFormError('Veuillez renseigner le nom du visiteur.');
      return;
    }

    // Crucial rule: Patients and Clients must be linked to a sponsor partner
    if ((visitorType === 'patient' || visitorType === 'client') && !sponsorPartnerId) {
      setFormError('Traçabilité Partenaire Obligatoire : Chaque patient ou client doit être rattaché à son parrain up.');
      return;
    }

    const selectedPartner = partners.find(p => p.id === sponsorPartnerId);

    // Save visit with full information
    addVisit({
      visitorName,
      visitorAddress: visitorAddress || undefined,
      visitorPhone: visitorPhone || undefined,
      visitorType,
      sponsorPartnerId: selectedPartner?.id,
      sponsorPartnerName: selectedPartner ? `${selectedPartner.firstName} ${selectedPartner.lastName}` : undefined,
      sponsorPartnerCode: selectedPartner?.code,
      purpose: requestedService,
      requestedService,
      notes: notes || undefined,
      status: 'en_attente',
    });

    // Also register to patients list if new
    const alreadyExists = patients.some(pat => pat.fullName.toLowerCase() === visitorName.toLowerCase());
    if (!alreadyExists && (visitorType === 'patient' || visitorType === 'client')) {
      addPatient({
        fullName: visitorName,
        address: visitorAddress || undefined,
        phone: visitorPhone || '+237 ...',
        type: visitorType,
        sponsorPartnerId: selectedPartner?.id,
        sponsorPartnerName: selectedPartner ? `${selectedPartner.firstName} ${selectedPartner.lastName}` : undefined,
        sponsorPartnerCode: selectedPartner?.code,
      });
    }

    setIsModalOpen(false);
    setNotificationToast(`Patient / Visiteur ${visitorName} enregistré avec succès.`);
    setTimeout(() => setNotificationToast(null), 4000);
  };

  const handleDownloadPDF = () => {
    generatePatientsVisitsReportPDF(
      filteredSummaryVisits,
      summaryMonth,
      summaryYear === 'all' ? '2026' : summaryYear,
      companySettings
    );
    setNotificationToast('Fichier récapitulatif des patients/clients téléchargé avec succès (format PDF paysage).');
    setTimeout(() => setNotificationToast(null), 4000);
  };

  const handlePrint = () => {
    setIsPrintModalOpen(true);
  };

  const triggerWindowPrint = () => {
    window.print();
  };

  const getServiceBadge = (srv?: string) => {
    const val = srv || 'Bilan de santé';
    switch (val) {
      case 'Bilan de santé':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Massage':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Achat produit':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Formation':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Simple visite':
        return 'bg-neutral-100 text-neutral-800 border-neutral-200';
      default:
        return 'bg-orange-100 text-orange-800 border-orange-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notificationToast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-700 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-in fade-in slide-in-from-top-4 duration-200">
          <Check className="w-4 h-4 text-emerald-200" />
          <span>{notificationToast}</span>
        </div>
      )}

      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <span>Enregistrement des Visites & Patients</span>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-orange-100 text-orange-800">
              Accueil & Réception
            </span>
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Gestion des arrivées physiques, traçabilité parrain up, enregistrement des motifs et archivage officiel
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Patient / Visiteur</span>
          </button>
        </div>
      </div>

      {/* Sub-Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-2">
        <button
          onClick={() => setActiveTab('daily')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'daily'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Registre du Jour & Flux Direct</span>
          <span className={`px-1.5 py-0.2 rounded text-[10px] ${activeTab === 'daily' ? 'bg-neutral-800 text-neutral-200' : 'bg-neutral-200 text-neutral-700'}`}>
            {visits.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('summary')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'summary'
              ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-xs'
              : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Fichier Récapitulatif Patients / Clients Reçus</span>
          <span className={`px-1.5 py-0.2 rounded text-[10px] ${activeTab === 'summary' ? 'bg-orange-800 text-white' : 'bg-orange-100 text-orange-800'}`}>
            Mois & Année
          </span>
        </button>
      </div>

      {/* Traçabilité Alert banner */}
      <div className="p-3.5 bg-orange-50/70 border border-orange-200 rounded-xl flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-orange-950">
          <LinkIcon className="w-4 h-4 text-orange-600 shrink-0" />
          <span>
            <strong className="font-semibold text-orange-900">Règle de Traçabilité Parrain Up :</strong> Pour chaque patient ou client reçu (Achat produit, Massage, Bilan de santé, Formation, Simple visite), le rattachement à son parrain up assure la distribution exacte des commissions et des points de valeur (PV).
          </span>
        </div>
        <span className="hidden md:inline-block text-[11px] font-mono font-bold text-orange-700 shrink-0 bg-white px-2 py-0.5 rounded border border-orange-200">
          Sync MLM Active
        </span>
      </div>

      {/* ===================================================================== */}
      {/* VUE 1 : REGISTRE JOURNALIER DU FLUX                                   */}
      {/* ===================================================================== */}
      {activeTab === 'daily' && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Rechercher par nom de visiteur, téléphone, adresse ou parrain..."
                value={dailySearchTerm}
                onChange={e => setDailySearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Segmented Filter */}
              <div className="flex items-center bg-neutral-100 p-1 rounded-lg">
                <button
                  onClick={() => setDailyFilterType('all')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    dailyFilterType === 'all' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Tous ({visits.length})
                </button>
                <button
                  onClick={() => setDailyFilterType('patient_client')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    dailyFilterType === 'patient_client' ? 'bg-white text-orange-800 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Patients & Clients
                </button>
                <button
                  onClick={() => setDailyFilterType('staff')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    dailyFilterType === 'staff' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Personnel
                </button>
              </div>

              {/* Date Picker */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-600">
                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                <input
                  type="date"
                  value={dailyDateFilter}
                  onChange={e => setDailyDateFilter(e.target.value)}
                  className="bg-transparent border-none p-0 text-xs focus:outline-none text-neutral-700"
                />
              </div>
            </div>
          </div>

          {/* Daily Table */}
          <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200">
                  <tr>
                    <th className="py-3 px-4">Date & Heure</th>
                    <th className="py-3 px-4">Visiteur / Patient</th>
                    <th className="py-3 px-4">Adresse</th>
                    <th className="py-3 px-4">Service Sollicité</th>
                    <th className="py-3 px-4">Parrain Up (MLM)</th>
                    <th className="py-3 px-4">Enregistré par</th>
                    <th className="py-3 px-4">Statut</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-700">
                  {filteredDailyVisits.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-neutral-400">
                        Aucune entrée trouvée pour cette sélection.
                      </td>
                    </tr>
                  ) : (
                    filteredDailyVisits.map(v => {
                      const statusConfig = getVisitStatusLabel(v.status);
                      const srv = v.requestedService || v.purpose;
                      return (
                        <tr key={v.id} className="hover:bg-neutral-50/60 transition-colors">
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="font-mono font-medium text-neutral-900">{v.time}</div>
                            <div className="text-[11px] text-neutral-400">{v.date}</div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-semibold text-neutral-900">{v.visitorName}</div>
                            {v.visitorPhone && (
                              <div className="text-[11px] text-neutral-500 flex items-center gap-1">
                                <Phone className="w-3 h-3 text-neutral-400" />
                                <span>{v.visitorPhone}</span>
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            {v.visitorAddress ? (
                              <div className="text-neutral-700 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                                <span>{v.visitorAddress}</span>
                              </div>
                            ) : (
                              <span className="text-neutral-400 italic">Non renseignée</span>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getServiceBadge(srv)}`}>
                              {srv}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            {v.sponsorPartnerName ? (
                              <div>
                                <div className="font-medium text-neutral-900 flex items-center gap-1">
                                  <LinkIcon className="w-3 h-3 text-orange-600 shrink-0" />
                                  <span>{v.sponsorPartnerName}</span>
                                </div>
                                <span className="text-[10px] text-neutral-400 font-mono">
                                  Code : {v.sponsorPartnerCode}
                                </span>
                              </div>
                            ) : (
                              <span className="text-neutral-400 italic">Non applicable (Staff)</span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-neutral-500">
                            {v.registeredBy}
                          </td>

                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                              {statusConfig.label}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <select
                              value={v.status}
                              onChange={e => updateVisitStatus(v.id, e.target.value as VisitStatus)}
                              className="text-xs bg-white border border-neutral-200 rounded px-2 py-1 text-neutral-700 focus:outline-none focus:ring-1 focus:ring-orange-500"
                            >
                              <option value="en_attente">En attente</option>
                              <option value="en_consultation">En consultation</option>
                              <option value="termine">Terminé</option>
                              <option value="annule">Annulé</option>
                            </select>
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
      )}

      {/* ===================================================================== */}
      {/* VUE 2 : FICHIER RÉCAPITULATIF PATIENTS / CLIENTS (MOIS & ANNÉE)       */}
      {/* ===================================================================== */}
      {activeTab === 'summary' && (
        <div className="space-y-5">
          {/* Action Header Card with Download PDF and Print */}
          <div className="bg-gradient-to-r from-orange-50 via-white to-amber-50 p-5 rounded-2xl border border-orange-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-orange-600" />
                <h2 className="text-base font-bold text-neutral-900">
                  Fichier Récapitulatif Officiel des Patients & Clients Reçus
                </h2>
              </div>
              <p className="text-xs text-neutral-600 mt-1">
                Filtrez par mois et année pour extraire le registre complet des consultations, bilans et achats avec traçabilité Parrain Up.
              </p>
            </div>

            {/* Print & PDF Buttons */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={handlePrint}
                className="px-4 py-2.5 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
                title="Imprimer le fichier récapitulatif filtré"
              >
                <Printer className="w-4 h-4 text-orange-600" />
                <span>Imprimer</span>
              </button>

              <button
                onClick={handleDownloadPDF}
                className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all"
                title="Générer et télécharger le document PDF Paysage A4"
              >
                <FileDown className="w-4 h-4" />
                <span>Télécharger PDF</span>
              </button>
            </div>
          </div>

          {/* Filters Bar: Month, Year, Service, Search */}
          <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Mois */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-orange-600" />
                <span>Mois :</span>
              </label>
              <select
                value={summaryMonth}
                onChange={e => setSummaryMonth(e.target.value)}
                className="w-full text-xs p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
              >
                {MONTHS.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            {/* Année */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-orange-600" />
                <span>Année :</span>
              </label>
              <select
                value={summaryYear}
                onChange={e => setSummaryYear(e.target.value)}
                className="w-full text-xs p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
              >
                {YEARS.map(y => (
                  <option key={y} value={y}>{y === 'all' ? 'Toutes les années' : y}</option>
                ))}
              </select>
            </div>

            {/* Service Sollicité */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-orange-600" />
                <span>Service Sollicité :</span>
              </label>
              <select
                value={summaryService}
                onChange={e => setSummaryService(e.target.value)}
                className="w-full text-xs p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
              >
                <option value="all">Tous les services</option>
                {REQUESTED_SERVICES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-orange-600" />
                <span>Recherche :</span>
              </label>
              <input
                type="text"
                placeholder="Nom, tél, adresse, parrain..."
                value={summarySearch}
                onChange={e => setSummarySearch(e.target.value)}
                className="w-full text-xs p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Quick Statistics Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white p-3 rounded-xl border border-neutral-200 shadow-2xs">
              <span className="text-[10px] text-neutral-500 block uppercase font-bold tracking-wider">Total Reçus</span>
              <span className="text-lg font-black text-neutral-900 font-mono mt-0.5 block">{countTotalSummary}</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-blue-200 shadow-2xs">
              <span className="text-[10px] text-blue-700 block uppercase font-bold tracking-wider">Bilans Santé</span>
              <span className="text-lg font-black text-blue-800 font-mono mt-0.5 block">{countBilans}</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-purple-200 shadow-2xs">
              <span className="text-[10px] text-purple-700 block uppercase font-bold tracking-wider">Massages</span>
              <span className="text-lg font-black text-purple-800 font-mono mt-0.5 block">{countMassages}</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-emerald-200 shadow-2xs">
              <span className="text-[10px] text-emerald-700 block uppercase font-bold tracking-wider">Achats Boutique</span>
              <span className="text-lg font-black text-emerald-800 font-mono mt-0.5 block">{countAchats}</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-2xs">
              <span className="text-[10px] text-amber-700 block uppercase font-bold tracking-wider">Formations</span>
              <span className="text-lg font-black text-amber-800 font-mono mt-0.5 block">{countFormations}</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-neutral-200 shadow-2xs">
              <span className="text-[10px] text-neutral-600 block uppercase font-bold tracking-wider">Simples Visites</span>
              <span className="text-lg font-black text-neutral-800 font-mono mt-0.5 block">{countVisites}</span>
            </div>
          </div>

          {/* Full Summary Table */}
          <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-800 text-white font-semibold">
                  <tr>
                    <th className="py-3 px-3 w-10 text-center">N°</th>
                    <th className="py-3 px-3">Date & Heure</th>
                    <th className="py-3 px-3">Nom & Prénom</th>
                    <th className="py-3 px-3">Téléphone</th>
                    <th className="py-3 px-3">Adresse (Quartier/Ville)</th>
                    <th className="py-3 px-3">Service Sollicité</th>
                    <th className="py-3 px-3">Parrain Up (MLM)</th>
                    <th className="py-3 px-3">Statut</th>
                    <th className="py-3 px-3">Agent Accueil</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-700">
                  {filteredSummaryVisits.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-neutral-400">
                        Aucun patient ou client enregistré pour les critères sélectionnés.
                      </td>
                    </tr>
                  ) : (
                    filteredSummaryVisits.map((v, idx) => {
                      const statusConfig = getVisitStatusLabel(v.status);
                      const srv = v.requestedService || v.purpose;
                      return (
                        <tr key={v.id} className="hover:bg-orange-50/30 transition-colors">
                          <td className="py-3 px-3 text-center font-mono text-neutral-400">
                            {idx + 1}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="font-mono font-bold text-neutral-900">{v.date}</span>
                            <span className="text-neutral-400 text-[11px] block">{v.time}</span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-neutral-900">{v.visitorName}</div>
                            {v.notes && (
                              <div className="text-[10px] text-neutral-400 truncate max-w-[180px]">{v.notes}</div>
                            )}
                          </td>
                          <td className="py-3 px-3 font-mono text-neutral-700">
                            {v.visitorPhone || '---'}
                          </td>
                          <td className="py-3 px-3">
                            {v.visitorAddress ? (
                              <div className="flex items-center gap-1 text-neutral-800">
                                <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                                <span>{v.visitorAddress}</span>
                              </div>
                            ) : (
                              <span className="text-neutral-400 italic">Non précisée</span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getServiceBadge(srv)}`}>
                              {srv}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            {v.sponsorPartnerName ? (
                              <div>
                                <div className="font-bold text-neutral-900 flex items-center gap-1">
                                  <LinkIcon className="w-3 h-3 text-orange-600 shrink-0" />
                                  <span>{v.sponsorPartnerName}</span>
                                </div>
                                <span className="text-[10px] text-neutral-400 font-mono">
                                  ID: {v.sponsorPartnerCode}
                                </span>
                              </div>
                            ) : (
                              <span className="text-neutral-400 italic">Non applicable (Staff)</span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusConfig.bg} ${statusConfig.text}`}>
                              {statusConfig.label}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-neutral-500 font-medium">
                            {v.registeredBy}
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
      )}

      {/* ===================================================================== */}
      {/* MODAL : ENREGISTRER UNE ENTRÉE (PATIENT / VISITEUR)                   */}
      {/* ===================================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-neutral-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-orange-600" />
                <h3 className="text-sm font-bold text-neutral-900">
                  Enregistrer un Nouveau Patient / Visiteur
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-neutral-400 hover:text-neutral-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
              {formError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs border border-red-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Type distinction */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Type de Personne Reçue
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setVisitorType('patient')}
                    className={`py-2 px-3 rounded-lg border font-medium text-center transition-all ${
                      visitorType === 'patient'
                        ? 'border-orange-500 bg-orange-50 text-orange-800 font-bold'
                        : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    Patient
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisitorType('client')}
                    className={`py-2 px-3 rounded-lg border font-medium text-center transition-all ${
                      visitorType === 'client'
                        ? 'border-orange-500 bg-orange-50 text-orange-800 font-bold'
                        : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    Client Boutique
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setVisitorType('staff');
                      setSponsorPartnerId('');
                    }}
                    className={`py-2 px-3 rounded-lg border font-medium text-center transition-all ${
                      visitorType === 'staff'
                        ? 'border-neutral-800 bg-neutral-900 text-white font-bold'
                        : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    Personnel (Staff)
                  </button>
                </div>
              </div>

              {/* Quick autofill from registered patients */}
              {visitorType !== 'staff' && patients.length > 0 && (
                <div>
                  <label className="block text-[11px] font-medium text-neutral-500 mb-1">
                    Sélectionner un patient déjà enregistré (Optionnel) :
                  </label>
                  <select
                    onChange={e => handleSelectExistingPatient(e.target.value)}
                    className="w-full text-xs p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 bg-neutral-50"
                  >
                    <option value="">-- Nouveau patient / saisie manuelle --</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.fullName} ({p.phone}) · {p.address || 'Douala'} · Parrain: {p.sponsorPartnerName || 'N/A'}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Visitor Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Nom & Prénom *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Christine Bella"
                    value={visitorName}
                    onChange={e => setVisitorName(e.target.value)}
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Numéro de Téléphone *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+237 6..."
                    value={visitorPhone}
                    onChange={e => setVisitorPhone(e.target.value)}
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                  />
                </div>
              </div>

              {/* Visitor Address */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Adresse (Quartier, Ville, Résidence) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Akwa, Douala ou Bastos, Yaoundé"
                  value={visitorAddress}
                  onChange={e => setVisitorAddress(e.target.value)}
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Service Sollicite (Required dropdown: Achat produit, Massage, Bilan de santé, Formation, Simple visite) */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Service Sollicité *
                </label>
                <select
                  value={requestedService}
                  onChange={e => setRequestedService(e.target.value as RequestedService)}
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-bold text-neutral-800"
                >
                  {REQUESTED_SERVICES.map(srv => (
                    <option key={srv} value={srv}>{srv}</option>
                  ))}
                </select>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Sélectionnez le motif principal : Bilan de santé, Massage, Achat produit, Formation ou Simple visite.
                </p>
              </div>

              {/* Parrain Up (MLM) */}
              {visitorType !== 'staff' && (
                <div className="p-3 bg-orange-50/60 border border-orange-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-orange-900">
                      Parrain Up Obligatoire (Traçabilité MLM) *
                    </label>
                    <span className="text-[10px] text-orange-700 font-mono font-bold">Bénéficiaire PV</span>
                  </div>
                  <select
                    value={sponsorPartnerId}
                    onChange={e => setSponsorPartnerId(e.target.value)}
                    required
                    className="w-full text-xs p-2.5 border border-orange-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-neutral-900 font-medium"
                  >
                    <option value="">-- Choisir le Parrain Up --</option>
                    {partners.map(ptn => (
                      <option key={ptn.id} value={ptn.id}>
                        {ptn.firstName} {ptn.lastName} ({ptn.code}) - {ptn.level} [{ptn.cardStatus || 'Start'}]
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-orange-800">
                    Tous les actes médicaux, bilans ou achats produits généreront automatiquement ses points de valeur (PV) et commissions.
                  </p>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Observations / Remarques de Réception
                </label>
                <textarea
                  rows={2}
                  placeholder="Notes cliniques préliminaires ou détails sur la visite..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full text-xs p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 rounded-lg shadow-sm"
                >
                  Valider l'Enregistrement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL : APERÇU ET IMPRESSION DU RÉCAPITULATIF (FORMAT IMPRESSION)     */}
      {/* ===================================================================== */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full border border-neutral-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50 print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-orange-600" />
                <h3 className="text-sm font-bold text-neutral-900">
                  Impression du Fichier Récapitulatif des Patients & Clients Reçus
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={triggerWindowPrint}
                  className="px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimer Maintenant</span>
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-1 text-neutral-400 hover:text-neutral-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Container */}
            <div id="recap-patients-print-area" className="p-8 space-y-6 max-h-[80vh] overflow-y-auto print:max-h-none print:p-0">
              {/* Header */}
              <div className="flex justify-between items-start border-b-2 border-orange-600 pb-4">
                <div>
                  <h1 className="text-xl font-black text-red-600 tracking-tight">
                    {companySettings?.name || 'WHIEDA SMART'}
                  </h1>
                  <p className="text-xs text-neutral-500 font-medium">
                    {companySettings?.tagline || 'Cabinet de Santé, Pharmacie Naturelle & Prospérité Partagée'}
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    {companySettings?.address || 'Akwa - Douala, Cameroun'} · Tél : {companySettings?.phone || '(+237) 699 00 11 22'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="px-3 py-1 bg-neutral-900 text-white rounded text-xs font-bold inline-block">
                    REGISTRE OFFICIEL D'ACCUEIL
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">
                    Période : {summaryMonth === 'all' ? 'Année Complète' : `Mois ${summaryMonth}`} / {summaryYear}
                  </div>
                  <div className="text-[10px] text-neutral-400 font-mono">
                    Édité le {new Date().toLocaleDateString('fr-FR')} par {currentUser.fullName}
                  </div>
                </div>
              </div>

              {/* Period & Stats Banner */}
              <div className="grid grid-cols-4 gap-3 bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-xs text-center">
                <div>
                  <span className="text-neutral-500 text-[10px] block">Total Reçus</span>
                  <span className="font-bold text-neutral-900 font-mono">{countTotalSummary}</span>
                </div>
                <div>
                  <span className="text-neutral-500 text-[10px] block">Bilans de Santé</span>
                  <span className="font-bold text-blue-700 font-mono">{countBilans}</span>
                </div>
                <div>
                  <span className="text-neutral-500 text-[10px] block">Massages & Soins</span>
                  <span className="font-bold text-purple-700 font-mono">{countMassages}</span>
                </div>
                <div>
                  <span className="text-neutral-500 text-[10px] block">Achats Produits</span>
                  <span className="font-bold text-emerald-700 font-mono">{countAchats}</span>
                </div>
              </div>

              {/* Table */}
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="bg-neutral-800 text-white font-semibold">
                    <th className="py-2 px-2 border border-neutral-700 w-8 text-center">N°</th>
                    <th className="py-2 px-2 border border-neutral-700">Date & Heure</th>
                    <th className="py-2 px-2 border border-neutral-700">Nom & Prénom</th>
                    <th className="py-2 px-2 border border-neutral-700">Téléphone</th>
                    <th className="py-2 px-2 border border-neutral-700">Adresse / Quartier</th>
                    <th className="py-2 px-2 border border-neutral-700">Service Sollicité</th>
                    <th className="py-2 px-2 border border-neutral-700">Parrain Up</th>
                    <th className="py-2 px-2 border border-neutral-700">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {filteredSummaryVisits.map((v, i) => (
                    <tr key={v.id} className="border-b border-neutral-200">
                      <td className="py-1.5 px-2 border-r border-neutral-200 text-center font-mono">{i + 1}</td>
                      <td className="py-1.5 px-2 border-r border-neutral-200 font-mono">{v.date} {v.time}</td>
                      <td className="py-1.5 px-2 border-r border-neutral-200 font-bold">{v.visitorName}</td>
                      <td className="py-1.5 px-2 border-r border-neutral-200 font-mono">{v.visitorPhone || '---'}</td>
                      <td className="py-1.5 px-2 border-r border-neutral-200">{v.visitorAddress || 'Douala'}</td>
                      <td className="py-1.5 px-2 border-r border-neutral-200 font-semibold text-orange-700">{v.requestedService || v.purpose}</td>
                      <td className="py-1.5 px-2 border-r border-neutral-200">
                        {v.sponsorPartnerName ? `${v.sponsorPartnerName} (${v.sponsorPartnerCode})` : 'Interne'}
                      </td>
                      <td className="py-1.5 px-2 font-medium capitalize">
                        {v.status === 'termine' ? 'Terminé' : v.status === 'en_consultation' ? 'En cours' : 'En attente'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Signatures */}
              <div className="pt-8 border-t border-neutral-200 grid grid-cols-2 text-center text-xs">
                <div>
                  <div className="font-bold text-neutral-800">Le Responsable Accueil & Réception</div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">[Visa & Signature du Guichet]</div>
                  <div className="h-16"></div>
                </div>
                <div>
                  <div className="font-bold text-neutral-800">La Direction Whieda Smart</div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">[Visa & Cachet Officiel]</div>
                  <div className="h-16"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
