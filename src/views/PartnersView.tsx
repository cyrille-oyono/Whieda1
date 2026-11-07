import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Partner, PartnerCardStatus, PartnerQualification, PartnerGrade, PARTNER_GRADES } from '../types';
import { formatMoney, formatPV } from '../utils/formatters';
import { 
  Users, 
  Plus, 
  Search, 
  DollarSign, 
  Award, 
  CheckCircle, 
  Clock, 
  Share2, 
  ArrowRight,
  TrendingUp,
  X,
  CreditCard,
  Layers,
  Printer,
  FileDown,
  GitFork,
  FileText,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  Crown,
  Sparkles,
  Check,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Network,
  Eye,
  CheckCircle2,
  Pencil,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { 
  generateGlobalAdminReportPDF, 
  generateNetworkTreePDF, 
  generatePartnerSheetPDF 
} from '../utils/pdfGenerator';

export const PartnersView: React.FC = () => {
  const { partners, addPartner, updatePartner, deletePartner, settlePartnerPayout, placePartnerPv, companySettings, currentUser } = useApp();

  // Sub-tabs: 'table' (Tableau 10 colonnes) or 'tree' (Arbre généalogique)
  const [activeTab, setActiveTab] = useState<'table' | 'tree'>('table');
  const [searchTerm, setSearchTerm] = useState('');

  // Tree View Presentation: 'photo-model' (Schéma Graphique Binaire comme sur la photo) or 'hierarchy-list'
  const [treeSubMode, setTreeSubMode] = useState<'photo-model' | 'hierarchy-list'>('photo-model');
  const [treeZoom, setTreeZoom] = useState<number>(1);
  const [inspectedPartnerId, setInspectedPartnerId] = useState<string>('ptn-1');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPartnerForPayout, setSelectedPartnerForPayout] = useState<Partner | null>(null);
  const [selectedPartnerForPlacement, setSelectedPartnerForPlacement] = useState<Partner | null>(null);
  
  // Edit & Delete partner modals
  const [partnerToEdit, setPartnerToEdit] = useState<Partner | null>(null);
  const [partnerToDelete, setPartnerToDelete] = useState<Partner | null>(null);
  
  // Print & PDF Modals
  const [isGlobalReportModalOpen, setIsGlobalReportModalOpen] = useState(false);
  const [selectedPartnerForSheet, setSelectedPartnerForSheet] = useState<Partner | null>(null);
  const [isTreePrintModalOpen, setIsTreePrintModalOpen] = useState(false);

  // Success Feedback Toast
  const [pdfNotification, setPdfNotification] = useState<string | null>(null);

  // Add Partner Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [code, setCode] = useState(`WH-PTN-${Math.floor(100 + Math.random() * 900)}`);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [sponsorId, setSponsorId] = useState('');
  const [level, setLevel] = useState<string>('Sans grade');
  const [initialPv, setInitialPv] = useState<number>(500);
  const [cardStatus, setCardStatus] = useState<PartnerCardStatus>('Start');
  const [qualificationStatus, setQualificationStatus] = useState<PartnerQualification>('Qualifié');

  // Edit Partner Form State
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editSponsorId, setEditSponsorId] = useState('');
  const [editLevel, setEditLevel] = useState<string>('Sans grade');
  const [editCardStatus, setEditCardStatus] = useState<PartnerCardStatus>('Start');
  const [editQualificationStatus, setEditQualificationStatus] = useState<PartnerQualification>('Qualifié');
  const [editTotalPv, setEditTotalPv] = useState<number>(500);
  const [editPlacedPv, setEditPlacedPv] = useState<number>(0);
  const [editRemainingPv, setEditRemainingPv] = useState<number>(500);
  const [editTotalDirectEarnings, setEditTotalDirectEarnings] = useState<number>(0);
  const [editPaidEarnings, setEditPaidEarnings] = useState<number>(0);
  const [editRemainingEarnings, setEditRemainingEarnings] = useState<number>(0);

  // Payout Modal State
  const [payoutAmount, setPayoutAmount] = useState<number>(0);
  const [payoutMethod, setPayoutMethod] = useState('Orange Money');
  const [payoutNotes, setPayoutNotes] = useState('');

  // PV Placement Modal State
  const [pvToPlace, setPvToPlace] = useState<number>(0);

  // Financial & Administrative Totals
  const totalPartners = partners.length;
  const totalGainsGenerated = partners.reduce((acc, p) => acc + p.totalDirectEarnings, 0);
  const totalPaid = partners.reduce((acc, p) => acc + p.paidEarnings, 0);
  const totalRemaining = partners.reduce((acc, p) => acc + p.remainingEarnings, 0);
  const totalPvNetwork = partners.reduce((acc, p) => acc + p.totalPv, 0);
  const totalPvPlaced = partners.reduce((acc, p) => acc + p.placedPv, 0);
  const totalPvRemaining = partners.reduce((acc, p) => acc + p.remainingPv, 0);

  // Card breakdown
  const countStart = partners.filter(p => (p.cardStatus || 'Start') === 'Start').length;
  const countStandard = partners.filter(p => (p.cardStatus || '') === 'Standard' || p.level === 'Argent').length;
  const countPremium = partners.filter(p => (p.cardStatus || '') === 'Premium' || p.level === 'Or').length;
  const countVIP = partners.filter(p => (p.cardStatus || '') === 'VIP' || p.level === 'Diamant').length;

  // Qualification breakdown
  const countQualified = partners.filter(p => (p.qualificationStatus || 'Qualifié') === 'Qualifié').length;
  const countNonQualified = totalPartners - countQualified;

  const handleOpenAdd = () => {
    setFirstName('');
    setLastName('');
    setCode(`WH-PTN-${Math.floor(100 + Math.random() * 900)}`);
    setPhone('');
    setEmail('');
    setSponsorId('');
    setLevel('Sans grade');
    setInitialPv(500);
    setCardStatus('Start');
    setQualificationStatus('Qualifié');
    setIsAddModalOpen(true);
  };

  const handleCreatePartner = (e: React.FormEvent) => {
    e.preventDefault();
    const sponsor = partners.find(p => p.id === sponsorId);
    addPartner({
      code,
      firstName,
      lastName,
      phone,
      email: email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@reseau-whieda.com`,
      sponsorId: sponsor?.id,
      sponsorName: sponsor ? `${sponsor.firstName} ${sponsor.lastName}` : undefined,
      sponsorCode: sponsor?.code,
      level,
      initialPv: Number(initialPv) || 0,
      cardStatus,
      qualificationStatus,
    });
    setIsAddModalOpen(false);
    setPdfNotification(`Nouveau partenaire ${firstName} ${lastName} enregistré avec succès.`);
    setTimeout(() => setPdfNotification(null), 4000);
  };

  const handleOpenEdit = (p: Partner) => {
    setPartnerToEdit(p);
    setEditFirstName(p.firstName);
    setEditLastName(p.lastName);
    setEditCode(p.code);
    setEditPhone(p.phone);
    setEditEmail(p.email || '');
    setEditSponsorId(p.sponsorId || '');
    setEditLevel(p.level || 'Sans grade');
    setEditCardStatus(p.cardStatus || 'Start');
    setEditQualificationStatus(p.qualificationStatus || 'Qualifié');
    setEditTotalPv(p.totalPv);
    setEditPlacedPv(p.placedPv);
    setEditRemainingPv(p.remainingPv);
    setEditTotalDirectEarnings(p.totalDirectEarnings);
    setEditPaidEarnings(p.paidEarnings);
    setEditRemainingEarnings(p.remainingEarnings);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerToEdit) return;
    const sponsor = partners.find(p => p.id === editSponsorId);
    updatePartner(partnerToEdit.id, {
      firstName: editFirstName,
      lastName: editLastName,
      code: editCode,
      phone: editPhone,
      email: editEmail,
      sponsorId: sponsor?.id || undefined,
      sponsorName: sponsor ? `${sponsor.firstName} ${sponsor.lastName}` : undefined,
      sponsorCode: sponsor?.code || undefined,
      level: editLevel,
      cardStatus: editCardStatus,
      qualificationStatus: editQualificationStatus,
      totalPv: Number(editTotalPv) || 0,
      placedPv: Number(editPlacedPv) || 0,
      remainingPv: Number(editRemainingPv) || 0,
      totalDirectEarnings: Number(editTotalDirectEarnings) || 0,
      paidEarnings: Number(editPaidEarnings) || 0,
      remainingEarnings: Number(editRemainingEarnings) || 0,
    });
    setPartnerToEdit(null);
    setPdfNotification(`Informations du partenaire ${editFirstName} ${editLastName} mises à jour avec succès.`);
    setTimeout(() => setPdfNotification(null), 4000);
  };

  const handleConfirmDelete = () => {
    if (!partnerToDelete) return;
    const name = `${partnerToDelete.firstName} ${partnerToDelete.lastName}`;
    deletePartner(partnerToDelete.id);
    if (inspectedPartnerId === partnerToDelete.id) {
      setInspectedPartnerId(partners.find(p => p.id !== partnerToDelete.id)?.id || '');
    }
    setPartnerToDelete(null);
    setPdfNotification(`Partenaire ${name} supprimé avec succès.`);
    setTimeout(() => setPdfNotification(null), 4000);
  };

  const handleOpenPayout = (p: Partner) => {
    setSelectedPartnerForPayout(p);
    setPayoutAmount(p.remainingEarnings);
    setPayoutMethod('Orange Money');
    setPayoutNotes('');
  };

  const handleConfirmPayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPartnerForPayout && payoutAmount > 0) {
      settlePartnerPayout(selectedPartnerForPayout.id, Number(payoutAmount), payoutMethod, payoutNotes);
      setSelectedPartnerForPayout(null);
    }
  };

  const handleOpenPlacement = (p: Partner) => {
    setSelectedPartnerForPlacement(p);
    setPvToPlace(p.remainingPv);
  };

  const handleConfirmPlacement = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPartnerForPlacement && pvToPlace > 0) {
      placePartnerPv(selectedPartnerForPlacement.id, Number(pvToPlace));
      setSelectedPartnerForPlacement(null);
    }
  };

  // Direct PDF Download Handlers
  const handleDownloadGlobalReportPDF = () => {
    generateGlobalAdminReportPDF(partners, companySettings);
    setPdfNotification('État Global Administrateur & Financier téléchargé avec succès !');
    setTimeout(() => setPdfNotification(null), 4000);
  };

  const handleDownloadNetworkTreePDF = () => {
    generateNetworkTreePDF(partners, companySettings);
    setPdfNotification('Arborescence complète du réseau téléchargée en PDF !');
    setTimeout(() => setPdfNotification(null), 4000);
  };

  const handleDownloadPartnerSheetPDF = (p: Partner) => {
    const downlines = partners.filter(child => child.sponsorId === p.id);
    generatePartnerSheetPDF(p, downlines, companySettings);
    setPdfNotification(`Fiche individuelle de ${p.firstName} ${p.lastName} (${p.code}) téléchargée en PDF !`);
    setTimeout(() => setPdfNotification(null), 4000);
  };

  const filteredPartners = partners.filter(p => {
    const full = `${p.firstName} ${p.lastName} ${p.code} ${p.cardStatus || ''} ${p.level}`.toLowerCase();
    return full.includes(searchTerm.toLowerCase());
  });

  // Helper: Get downlines of a partner
  const getDirectDownlines = (partnerId: string) => {
    return partners.filter(p => p.sponsorId === partnerId);
  };

  // Helper: Roots for tree view
  const rootPartners = partners.filter(p => !p.sponsorId || !partners.some(parent => parent.id === p.sponsorId));

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {pdfNotification && (
        <div className="fixed top-20 right-6 z-50 max-w-md bg-neutral-900 text-white p-4 rounded-xl shadow-2xl border border-orange-500/50 flex items-start gap-3 animate-in fade-in slide-in-from-top-4 no-print">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-semibold block text-emerald-300">Impression & Export PDF</span>
            <p className="mt-0.5 text-neutral-200">{pdfNotification}</p>
          </div>
          <button onClick={() => setPdfNotification(null)} className="ml-auto text-neutral-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
            Gestion des Partenaires & Système MLM / PV
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Suivi des gains directs, gestion des Points de Valeur et états administratifs/financiers imprimables
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Button: Imprimer l'État Global (Admin & Financier) */}
          <button
            onClick={() => setIsGlobalReportModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all whitespace-nowrap"
            title="Générer et imprimer le rapport administratif et financier consolidé"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer l'État Global (Admin & Financier)</span>
          </button>

          {/* Button: Imprimer l'Arbre du Réseau */}
          <button
            onClick={() => setIsTreePrintModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-neutral-900 hover:bg-black text-white rounded-lg text-xs font-bold shadow-xs transition-all whitespace-nowrap"
            title="Imprimer l'arbre généalogique complet du réseau"
          >
            <GitFork className="w-4 h-4 text-orange-400" />
            <span>Imprimer l'Arbre du Réseau</span>
          </button>

          {/* Button: Nouveau Partenaire */}
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-300 rounded-lg text-xs font-semibold shadow-xs transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4 text-orange-600" />
            <span>Nouveau Partenaire</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold">Total Gains Directs Réseau</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 tabular-nums font-mono">
            {formatMoney(totalGainsGenerated)}
          </div>
          <div className="mt-2 text-xs text-neutral-500 flex items-center gap-1.5">
            <span className="text-emerald-700 font-semibold font-mono">{formatMoney(totalPaid)}</span>
            <span>déjà réglé aux parrains</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold">Commissions Reste à Payer</span>
            <Clock className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-600 tabular-nums font-mono">
            {formatMoney(totalRemaining)}
          </div>
          <div className="mt-2 text-xs text-neutral-500">
            <span>En attente de versement au réseau</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold">Total Points Valeur (PV)</span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 tabular-nums font-mono">
            {formatPV(totalPvNetwork)}
          </div>
          <div className="mt-2 text-xs text-neutral-500 flex items-center gap-1.5 font-mono">
            <span className="text-emerald-700 font-bold">{totalPvPlaced} placés</span>
            <span>/</span>
            <span className="text-amber-600 font-bold">{totalPvRemaining} restants</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold">Membres Réseau ({totalPartners})</span>
            <Users className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 tabular-nums">
            {countQualified} <span className="text-xs text-emerald-600 font-normal">Qualifiés</span>
          </div>
          <div className="mt-2 text-xs text-neutral-500 flex items-center gap-1.5">
            <span>Cartes : Start ({countStart}) · VIP ({countVIP})</span>
          </div>
        </div>
      </div>

      {/* Tabs & Search Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-neutral-200 shadow-xs">
        {/* Sub-tabs */}
        <div className="flex items-center p-1 bg-neutral-100 rounded-xl">
          <button
            onClick={() => setActiveTab('table')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'table'
                ? 'bg-white text-orange-600 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Tableau Récapitulatif (10 Colonnes)</span>
          </button>

          <button
            onClick={() => setActiveTab('tree')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'tree'
                ? 'bg-white text-orange-600 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <GitFork className="w-3.5 h-3.5" />
            <span>Arborescence du Réseau (Arbre MLM)</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Rechercher par nom, code (WH-PTN-...), statut ou grade..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* ===================================================================== */}
      {/* VUE 1: TABLEAU RÉCAPITULATIF COMPLET EN 10 COLONNES EXIGÉES           */}
      {/* ===================================================================== */}
      {activeTab === 'table' && (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-600 uppercase text-[10px] font-bold border-b border-neutral-200 tracking-wider">
                <tr>
                  <th className="py-3 px-3">1. Date Entrée</th>
                  <th className="py-3 px-3">2. Nom et ID</th>
                  <th className="py-3 px-3">3. Parrain Up</th>
                  <th className="py-3 px-3">4. Statut Carte</th>
                  <th className="py-3 px-3 text-center">5. Qualif.</th>
                  <th className="py-3 px-3 text-right">6. PV Total</th>
                  <th className="py-3 px-3 text-right">7. PV Placés</th>
                  <th className="py-3 px-3 text-right">8. PV Restants</th>
                  <th className="py-3 px-3 text-right">9. Gains Accumulés</th>
                  <th className="py-3 px-3 text-right">10. Gains Payés</th>
                  <th className="py-3 px-3 text-right">11. Reste à Payer</th>
                  <th className="py-3 px-3 text-center">Actions & Fiche</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-700">
                {filteredPartners.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="py-12 text-center text-neutral-400">
                      Aucun partenaire trouvé pour cette recherche.
                    </td>
                  </tr>
                ) : (
                  filteredPartners.map(p => {
                    const isSettled = p.remainingEarnings === 0;
                    const card = p.cardStatus || (p.level === 'Diamant' ? 'VIP' : p.level === 'Or' ? 'Premium' : p.level === 'Argent' ? 'Standard' : 'Start');
                    const qual = p.qualificationStatus || (p.totalPv >= 100 ? 'Qualifié' : 'Non qualifié');

                    return (
                      <tr key={p.id} className="hover:bg-neutral-50/70 transition-colors">
                        {/* 1. Date Entrée */}
                        <td className="py-3 px-3 font-mono text-[11px] text-neutral-500 whitespace-nowrap">
                          {p.registeredAt || '2026-01-10'}
                        </td>

                        {/* 2. Nom et ID */}
                        <td className="py-3 px-3">
                          <div className="font-bold text-neutral-900">
                            {p.firstName} {p.lastName}
                          </div>
                          <span className="font-mono text-[10px] text-red-600 font-bold block">
                            {p.code}
                          </span>
                        </td>

                        {/* 3. Parrain Up */}
                        <td className="py-3 px-3">
                          {p.sponsorName ? (
                            <div>
                              <div className="font-medium text-neutral-800">{p.sponsorName}</div>
                              <span className="text-[10px] text-neutral-400 font-mono">{p.sponsorCode}</span>
                            </div>
                          ) : (
                            <span className="text-neutral-400 italic text-[11px]">Tête de réseau</span>
                          )}
                        </td>

                        {/* 4. Statut Carte */}
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            card === 'VIP' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                            card === 'Premium' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                            card === 'Standard' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                            'bg-neutral-100 text-neutral-700 border border-neutral-200'
                          }`}>
                            {card}
                          </span>
                          <span className="text-[10px] text-neutral-400 block mt-0.5">Grade: {p.level}</span>
                        </td>

                        {/* 5. Statut Qualification */}
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            qual === 'Qualifié' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : 'bg-neutral-100 text-neutral-500'
                          }`}>
                            {qual}
                          </span>
                        </td>

                        {/* 6. PV Total */}
                        <td className="py-3 px-3 text-right font-mono font-bold text-amber-700 tabular-nums">
                          {formatPV(p.totalPv)}
                        </td>

                        {/* 7. PV Placés */}
                        <td className="py-3 px-3 text-right font-mono text-neutral-600 tabular-nums">
                          {p.placedPv} PV
                        </td>

                        {/* 8. PV Restants */}
                        <td className="py-3 px-3 text-right font-mono font-semibold tabular-nums text-orange-600">
                          {p.remainingPv} PV
                        </td>

                        {/* 9. Gains Directs Accumulés */}
                        <td className="py-3 px-3 text-right font-mono font-bold text-neutral-900 tabular-nums">
                          {formatMoney(p.totalDirectEarnings)}
                        </td>

                        {/* 10. Gains Payés */}
                        <td className="py-3 px-3 text-right font-mono text-emerald-700 tabular-nums font-semibold">
                          {formatMoney(p.paidEarnings)}
                        </td>

                        {/* 11. Gains Restants */}
                        <td className="py-3 px-3 text-right font-mono font-bold tabular-nums">
                          <span className={isSettled ? 'text-neutral-400' : 'text-red-600'}>
                            {formatMoney(p.remainingEarnings)}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded block mt-0.5 text-center ${
                            isSettled ? 'bg-emerald-100 text-emerald-800' : 'bg-red-50 text-red-700'
                          }`}>
                            {isSettled ? 'Soldé' : 'Reste à payer'}
                          </span>
                        </td>

                        {/* 12. Actions & Impression Fiche */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Fiche Individuelle print/preview button */}
                            <button
                              onClick={() => setSelectedPartnerForSheet(p)}
                              className="px-2 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 font-semibold transition-colors inline-flex items-center gap-1 border border-orange-200"
                              title="Afficher et imprimer la fiche individuelle complète"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Fiche</span>
                            </button>

                            {/* Payout */}
                            <button
                              onClick={() => handleOpenPayout(p)}
                              disabled={p.remainingEarnings <= 0}
                              className={`px-2 py-1 text-xs font-semibold rounded-lg transition-all ${
                                p.remainingEarnings > 0
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                                  : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                              }`}
                              title="Régler les commissions"
                            >
                              Régler
                            </button>

                            {/* Placer PV */}
                            <button
                              onClick={() => handleOpenPlacement(p)}
                              disabled={p.remainingPv <= 0}
                              className={`px-2 py-1 text-xs font-semibold rounded-lg transition-all ${
                                p.remainingPv > 0
                                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                                  : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                              }`}
                              title="Placer des PV dans l'arbre"
                            >
                              Placer
                            </button>

                            {/* Modifier */}
                            <button
                              onClick={() => handleOpenEdit(p)}
                              className="px-2 py-1 text-xs font-semibold rounded-lg transition-all bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 inline-flex items-center gap-1"
                              title="Modifier les informations du partenaire"
                            >
                              <Pencil className="w-3 h-3" />
                              <span>Modifier</span>
                            </button>

                            {/* Supprimer */}
                            <button
                              onClick={() => setPartnerToDelete(p)}
                              className="px-2 py-1 text-xs font-semibold rounded-lg transition-all bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 inline-flex items-center gap-1"
                              title="Supprimer ce partenaire"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Suppr.</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* VUE 2: ARBORESCENCE & GÉNÉALOGIE DU RÉSEAU (MODÈLE SCHÉMA PHOTO)      */}
      {/* ===================================================================== */}
      {activeTab === 'tree' && (() => {
        // Predefined node coordinates matching user's photo sketch:
        // Top: OYONO UP (Root)
        // Left Branch: IDRIS AWOULE -> Béatrice Manga (-> Sophie, Mireille) + Ibrahim Traoré
        // Right Branch: SARA OYONO -> Jean-Marc Etoa (-> Eric, Alain) + Chantal Bilong (-> David -> Carine)
        const predefinedPositions: Record<string, { x: number; y: number; parentId?: string }> = {
          'ptn-1': { x: 550, y: 75 }, // OYONO UP (Root)
          'ptn-2': { x: 275, y: 200, parentId: 'ptn-1' }, // IDRIS AWOULE (Branche Gauche)
          'ptn-3': { x: 825, y: 200, parentId: 'ptn-1' }, // SARA OYONO (Branche Droite)
          'ptn-4': { x: 140, y: 330, parentId: 'ptn-2' }, // BÉATRICE MANGA
          'ptn-5': { x: 410, y: 330, parentId: 'ptn-2' }, // IBRAHIM TRAORÉ
          'ptn-8': { x: 690, y: 330, parentId: 'ptn-3' }, // JEAN-MARC ETOA
          'ptn-9': { x: 960, y: 330, parentId: 'ptn-3' }, // CHANTAL BILONG
          'ptn-6': { x: 70, y: 470, parentId: 'ptn-4' }, // SOPHIE MBALLA
          'ptn-7': { x: 210, y: 470, parentId: 'ptn-4' }, // MIREILLE FOTSO
          'ptn-10': { x: 620, y: 470, parentId: 'ptn-8' }, // ERIC KOUAM
          'ptn-11': { x: 760, y: 470, parentId: 'ptn-8' }, // ALAIN NGUEMO
          'ptn-12': { x: 960, y: 470, parentId: 'ptn-9' }, // DAVID KENMOGNE
          'ptn-13': { x: 960, y: 600, parentId: 'ptn-12' }, // CARINE ATANGANA
        };

        const getPartnerPos = (p: Partner) => {
          if (predefinedPositions[p.id]) return predefinedPositions[p.id];
          if (p.sponsorId && predefinedPositions[p.sponsorId]) {
            const parentPos = predefinedPositions[p.sponsorId];
            const isLeft = p.binaryPosition === 'left' || (!p.binaryPosition && getDirectDownlines(p.sponsorId).indexOf(p) % 2 === 0);
            return {
              x: Math.max(50, Math.min(1050, parentPos.x + (isLeft ? -75 : 75))),
              y: parentPos.y + 130,
              parentId: p.sponsorId,
            };
          }
          return { x: 550, y: 75 };
        };

        const inspectedPartner = partners.find(p => p.id === inspectedPartnerId) || partners[0];
        const inspectedDownlines = inspectedPartner ? getDirectDownlines(inspectedPartner.id) : [];

        return (
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs p-6 space-y-6">
            {/* Header Toolbar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                    <GitFork className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-neutral-900 text-base">
                      Système Réseau · Modèle d'Arborescence Binaire
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Reproduction fidèle du schéma manuscrit : nœuds circulaires, filiation binaire, statut de carte et Points de Valeur (PV)
                    </p>
                  </div>
                </div>
              </div>

              {/* View Switcher, Zoom & Export Actions */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Switcher: Modèle Photo vs Liste */}
                <div className="flex items-center p-1 bg-neutral-100 rounded-lg text-xs font-semibold">
                  <button
                    onClick={() => setTreeSubMode('photo-model')}
                    className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                      treeSubMode === 'photo-model'
                        ? 'bg-white text-orange-600 shadow-2xs font-bold'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    <Network className="w-3.5 h-3.5" />
                    <span>Modèle Schéma (Photo)</span>
                  </button>
                  <button
                    onClick={() => setTreeSubMode('hierarchy-list')}
                    className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                      treeSubMode === 'hierarchy-list'
                        ? 'bg-white text-orange-600 shadow-2xs font-bold'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Vue Liste Dépliante</span>
                  </button>
                </div>

                {/* Zoom Controls (Active in photo-model mode) */}
                {treeSubMode === 'photo-model' && (
                  <div className="flex items-center bg-neutral-100 p-1 rounded-lg text-xs">
                    <button
                      onClick={() => setTreeZoom(z => Math.max(0.65, Number((z - 0.1).toFixed(1))))}
                      className="p-1 hover:bg-white rounded text-neutral-600 hover:text-neutral-900 transition-colors"
                      title="Zoom arrière"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-2 font-mono text-[11px] text-neutral-600 font-bold">
                      {Math.round(treeZoom * 100)}%
                    </span>
                    <button
                      onClick={() => setTreeZoom(z => Math.min(1.4, Number((z + 0.1).toFixed(1))))}
                      className="p-1 hover:bg-white rounded text-neutral-600 hover:text-neutral-900 transition-colors"
                      title="Zoom avant"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setTreeZoom(1)}
                      className="p-1 hover:bg-white rounded text-neutral-600 hover:text-neutral-900 transition-colors ml-0.5"
                      title="Réinitialiser zoom"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Print & PDF Buttons */}
                <button
                  onClick={() => setIsTreePrintModalOpen(true)}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimer le Schéma</span>
                </button>

                <button
                  onClick={handleDownloadNetworkTreePDF}
                  className="px-3.5 py-1.5 bg-neutral-900 hover:bg-black text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
                >
                  <FileDown className="w-3.5 h-3.5 text-orange-400" />
                  <span>Exporter PDF</span>
                </button>
              </div>
            </div>

            {/* ================================================================= */}
            {/* SOUS-VUE A: MODÈLE GRAPHIQUE SCHÉMA BINAIRE (CONFORME À LA PHOTO)  */}
            {/* ================================================================= */}
            {treeSubMode === 'photo-model' && (
              <div className="space-y-4">
                {/* Visual Canvas Container with Pan/Scroll */}
                <div className="relative border-2 border-orange-200/80 rounded-2xl bg-gradient-to-b from-orange-50/30 via-white to-amber-50/20 shadow-inner overflow-hidden">
                  {/* Top Bar with Handwritten Title & Leg Badges */}
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-orange-100 bg-white/70 backdrop-blur-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-black text-neutral-900 tracking-tight font-serif italic text-orange-950">
                          Système Réseau
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          Modèle Manuscrit MLM
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        Cliquez sur un cercle pour inspecter le partenaire ou imprimer sa fiche individuelle
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="px-3 py-1 rounded-full bg-orange-100/90 text-orange-900 font-bold border border-orange-200 shadow-2xs">
                        ← Branche Gauche (Left Leg)
                      </span>
                      <span className="px-3 py-1 rounded-full bg-orange-100/90 text-orange-900 font-bold border border-orange-200 shadow-2xs">
                        Branche Droite (Right Leg) →
                      </span>
                    </div>
                  </div>

                  {/* Scalable SVG & HTML Diagram Viewport */}
                  <div className="overflow-x-auto overflow-y-auto max-h-[640px] p-6 flex justify-center">
                    <div
                      className="relative transition-transform duration-150 origin-top"
                      style={{
                        width: '1100px',
                        height: '690px',
                        transform: `scale(${treeZoom})`,
                        marginBottom: treeZoom < 1 ? `-${(1 - treeZoom) * 600}px` : `${(treeZoom - 1) * 200}px`,
                      }}
                    >
                      {/* SVG Vector Connecting Lines */}
                      <svg
                        className="absolute inset-0 w-full h-full pointer-events-none"
                        viewBox="0 0 1100 690"
                      >
                        <defs>
                          <linearGradient id="treeBranchGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#ea580c" />
                            <stop offset="100%" stopColor="#f59e0b" />
                          </linearGradient>
                        </defs>

                        {partners.map(p => {
                          const pos = getPartnerPos(p);
                          if (!pos.parentId) return null;
                          const parentPartner = partners.find(par => par.id === pos.parentId);
                          if (!parentPartner) return null;
                          const parentPos = getPartnerPos(parentPartner);

                          return (
                            <g key={`branch-line-${p.id}`}>
                              {/* Connector line */}
                              <line
                                x1={parentPos.x}
                                y1={parentPos.y}
                                x2={pos.x}
                                y2={pos.y}
                                stroke="url(#treeBranchGrad)"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                              />
                              {/* Connector Joint Dot */}
                              <circle
                                cx={pos.x}
                                cy={pos.y}
                                r="3.5"
                                fill="#ea580c"
                              />
                            </g>
                          );
                        })}
                      </svg>

                      {/* HTML Nodes (Circles & Labels matching photo) */}
                      {partners.map(p => {
                        const pos = getPartnerPos(p);
                        const isSelected = inspectedPartnerId === p.id;
                        const isRoot = !pos.parentId || p.id === 'ptn-1';
                        const card = p.cardStatus || 'Start';

                        return (
                          <div
                            key={`node-${p.id}`}
                            onClick={() => setInspectedPartnerId(p.id)}
                            className={`absolute cursor-pointer transition-all duration-200 select-none ${
                              isSelected ? 'z-30' : 'hover:z-20'
                            }`}
                            style={{
                              left: `${pos.x}px`,
                              top: `${pos.y}px`,
                              transform: 'translate(-50%, -50%)',
                            }}
                          >
                            <div className="flex flex-col items-center">
                              {/* The Circle (Nœud circulaire du schéma) */}
                              <div
                                className={`w-14 h-14 rounded-full flex flex-col items-center justify-center transition-all duration-150 ${
                                  isRoot
                                    ? 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white ring-4 ring-amber-300 shadow-md scale-105'
                                    : isSelected
                                    ? 'bg-white text-orange-600 ring-4 ring-orange-500 shadow-lg scale-110'
                                    : 'bg-white text-neutral-800 ring-3 ring-orange-300 hover:ring-orange-500 hover:shadow-md'
                                }`}
                              >
                                {isRoot ? (
                                  <Crown className="w-5 h-5 text-amber-100" />
                                ) : (
                                  <span className="font-extrabold text-xs font-mono">
                                    {p.firstName[0]}{p.lastName[0]}
                                  </span>
                                )}
                              </div>

                              {/* Connected Annotation Card (Nom, Statut Carte, PV) */}
                              <div
                                className={`mt-1.5 w-36 bg-white/95 backdrop-blur-xs rounded-xl p-2 border text-center transition-all ${
                                  isSelected
                                    ? 'border-orange-500 ring-2 ring-orange-400/50 shadow-md'
                                    : 'border-neutral-200 shadow-2xs hover:border-orange-400'
                                }`}
                              >
                                <div className="font-black text-[11px] text-neutral-900 truncate uppercase tracking-tight">
                                  {p.firstName} {p.lastName}
                                </div>
                                <div className="flex items-center justify-center gap-1.5 mt-0.5">
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-orange-100 text-orange-800 border border-orange-200">
                                    {card}
                                  </span>
                                  <span className="font-bold text-[11px] text-amber-700 font-mono">
                                    {p.totalPv} PV
                                  </span>
                                </div>
                                <div className="text-[9px] text-neutral-400 font-mono mt-0.5">
                                  {p.code}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bottom Canvas Footer Guide */}
                  <div className="p-3 bg-neutral-50/80 border-t border-orange-100 flex flex-wrap items-center justify-between text-xs text-neutral-600 gap-2">
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-neutral-800">Légende :</span>
                      <span className="inline-flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                        <span>Tête de réseau</span>
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-white border border-orange-500 inline-block" />
                        <span>Membre / Filleul</span>
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <span className="w-3 h-3 rounded-md bg-orange-100 text-orange-800 font-bold text-[9px] px-1 inline-flex items-center justify-center">START</span>
                        <span>Statut Carte</span>
                      </span>
                      <span className="inline-flex items-center gap-1 font-mono font-bold text-amber-700">
                        ● PV = Points de Valeur
                      </span>
                    </div>

                    <div className="text-neutral-500 text-[11px]">
                      Total : <strong className="text-neutral-900">{partners.length}</strong> membres cartographiés dans l'arbre
                    </div>
                  </div>
                </div>

                {/* Partner Details Inspector Drawer */}
                {inspectedPartner && (
                  <div className="p-5 bg-gradient-to-r from-orange-50/80 via-white to-amber-50/80 rounded-2xl border border-orange-200 shadow-xs animate-in fade-in slide-in-from-bottom-2 duration-150">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Partner identity */}
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-red-600 to-orange-600 text-white flex items-center justify-center font-black text-base shadow-xs">
                          {inspectedPartner.firstName[0]}{inspectedPartner.lastName[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-neutral-900 text-sm">
                              {inspectedPartner.firstName} {inspectedPartner.lastName}
                            </span>
                            <span className="font-mono text-xs font-bold text-red-600">
                              ({inspectedPartner.code})
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-orange-100 text-orange-800 border border-orange-200">
                              Carte : {inspectedPartner.cardStatus || 'Start'}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              {inspectedPartner.qualificationStatus || 'Qualifié'}
                            </span>
                          </div>
                          <div className="text-xs text-neutral-500 mt-1 flex flex-wrap items-center gap-2">
                            <span>Parrain : <strong>{inspectedPartner.sponsorName || 'Tête de Réseau'}</strong></span>
                            <span>·</span>
                            <span>Filleuls directs : <strong className="text-orange-700">{inspectedDownlines.length}</strong></span>
                            <span>·</span>
                            <span>Inscrit le : <span className="font-mono">{inspectedPartner.registeredAt || '2026-01-10'}</span></span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Balance & Action buttons */}
                      <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                        <div className="bg-white p-2.5 rounded-xl border border-neutral-200 shadow-2xs">
                          <span className="text-[10px] text-neutral-400 block font-sans">Points Valeur</span>
                          <span className="font-bold text-amber-700 text-sm">{formatPV(inspectedPartner.totalPv)}</span>
                          <span className="text-[10px] text-neutral-400 block font-sans">
                            {inspectedPartner.placedPv} placés / {inspectedPartner.remainingPv} rest.
                          </span>
                        </div>

                        <div className="bg-white p-2.5 rounded-xl border border-neutral-200 shadow-2xs">
                          <span className="text-[10px] text-neutral-400 block font-sans">Gains Directs</span>
                          <span className="font-bold text-neutral-900 text-sm">{formatMoney(inspectedPartner.totalDirectEarnings)}</span>
                          <span className="text-[10px] text-red-600 font-bold block font-sans">
                            Reste : {formatMoney(inspectedPartner.remainingEarnings)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 font-sans">
                          <button
                            onClick={() => setSelectedPartnerForSheet(inspectedPartner)}
                            className="px-3 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Imprimer Fiche</span>
                          </button>

                          <button
                            onClick={() => handleOpenPayout(inspectedPartner)}
                            disabled={inspectedPartner.remainingEarnings <= 0}
                            className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                              inspectedPartner.remainingEarnings > 0
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                                : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                            }`}
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>Régler</span>
                          </button>

                          <button
                            onClick={() => handleOpenEdit(inspectedPartner)}
                            className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
                            title="Modifier les informations"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Modifier</span>
                          </button>

                          <button
                            onClick={() => setPartnerToDelete(inspectedPartner)}
                            className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
                            title="Supprimer ce partenaire"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Supprimer</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ================================================================= */}
            {/* SOUS-VUE B: VUE LISTE DÉPLIANTE HIÉRARCHIQUE                       */}
            {/* ================================================================= */}
            {treeSubMode === 'hierarchy-list' && (
              <div className="space-y-4">
                {rootPartners.map(root => {
                  const rootDownlines = getDirectDownlines(root.id);
                  const card = root.cardStatus || (root.level === 'Diamant' ? 'VIP' : root.level === 'Or' ? 'Premium' : 'Start');
                  const qual = root.qualificationStatus || (root.totalPv >= 100 ? 'Qualifié' : 'Non qualifié');

                  return (
                    <div key={root.id} className="border border-amber-300 rounded-2xl bg-amber-50/30 p-4 space-y-3">
                      {/* Root Node Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-amber-200 shadow-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-bold shadow-xs">
                            <Crown className="w-5 h-5 text-amber-100" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-neutral-900 text-sm">{root.firstName} {root.lastName}</span>
                              <span className="font-mono text-xs font-bold text-red-600">({root.code})</span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-orange-100 text-orange-800 border border-orange-200">
                                {card}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                qual === 'Qualifié' ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-500'
                              }`}>
                                {qual}
                              </span>
                            </div>
                            <div className="text-[11px] text-neutral-500 mt-0.5 flex items-center gap-2">
                              <span>Tête de réseau principal</span>
                              <span>·</span>
                              <span>Inscrit le : {root.registeredAt || '2025-11-04'}</span>
                              <span>·</span>
                              <span className="text-orange-700 font-bold">{rootDownlines.length} filleul(s) direct(s)</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs font-mono">
                          <div>
                            <span className="text-neutral-400 block text-[10px]">PV Totaux</span>
                            <span className="font-bold text-amber-700 text-sm">{formatPV(root.totalPv)}</span>
                          </div>
                          <div>
                            <span className="text-neutral-400 block text-[10px]">Gains Directs</span>
                            <span className="font-bold text-neutral-900 text-sm">{formatMoney(root.totalDirectEarnings)}</span>
                          </div>
                          <button
                            onClick={() => setSelectedPartnerForSheet(root)}
                            className="px-2.5 py-1 rounded-lg bg-orange-100 hover:bg-orange-200 text-orange-800 font-bold text-xs flex items-center gap-1 transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Fiche</span>
                          </button>
                        </div>
                      </div>

                      {/* Downline Children (Level 1) */}
                      <div className="pl-6 sm:pl-10 space-y-3 border-l-2 border-dashed border-amber-300 ml-4">
                        {rootDownlines.length === 0 ? (
                          <div className="text-xs text-neutral-400 italic py-2">
                            Aucun filleul rattaché pour l'instant.
                          </div>
                        ) : (
                          rootDownlines.map(child => {
                            const childDownlines = getDirectDownlines(child.id);
                            const childCard = child.cardStatus || 'Start';
                            const childQual = child.qualificationStatus || 'Qualifié';

                            return (
                              <div key={child.id} className="space-y-2.5">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-neutral-200 shadow-2xs hover:border-orange-300 transition-colors">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center font-bold text-neutral-700 text-xs font-mono">
                                      1
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-bold text-neutral-900">{child.firstName} {child.lastName}</span>
                                        <span className="font-mono text-xs text-neutral-500">({child.code})</span>
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-orange-100 text-orange-800">
                                          {childCard}
                                        </span>
                                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                                          {childQual}
                                        </span>
                                      </div>
                                      <div className="text-[10px] text-neutral-400 mt-0.5">
                                        Parrain : {root.firstName} {root.lastName} · {childDownlines.length} filleul(s) direct(s)
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3 text-xs font-mono">
                                    <div>
                                      <span className="text-neutral-400 block text-[9px]">PV</span>
                                      <span className="font-bold text-amber-700">{formatPV(child.totalPv)}</span>
                                    </div>
                                    <div>
                                      <span className="text-neutral-400 block text-[9px]">Gains</span>
                                      <span className="font-bold text-neutral-900">{formatMoney(child.totalDirectEarnings)}</span>
                                    </div>
                                    <button
                                      onClick={() => setSelectedPartnerForSheet(child)}
                                      className="px-2 py-1 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold flex items-center gap-1"
                                    >
                                      <FileText className="w-3 h-3" />
                                      <span>Fiche</span>
                                    </button>
                                  </div>
                                </div>

                                {/* Level 2 Children */}
                                {childDownlines.length > 0 && (
                                  <div className="pl-6 sm:pl-8 space-y-2 border-l-2 border-dashed border-orange-200 ml-3">
                                    {childDownlines.map(grandChild => (
                                      <div key={grandChild.id} className="flex items-center justify-between bg-neutral-50/70 p-2.5 rounded-lg border border-neutral-200 text-xs">
                                        <div className="flex items-center gap-2">
                                          <span className="text-neutral-400 font-mono text-[10px]">└── Niv 2:</span>
                                          <span className="font-bold text-neutral-800">{grandChild.firstName} {grandChild.lastName}</span>
                                          <span className="font-mono text-[10px] text-neutral-500">({grandChild.code})</span>
                                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-neutral-200 text-neutral-700">
                                            {grandChild.cardStatus || 'Start'}
                                          </span>
                                        </div>

                                        <div className="flex items-center gap-3 font-mono">
                                          <span className="font-bold text-amber-700">{grandChild.totalPv} PV</span>
                                          <span className="text-neutral-600">{formatMoney(grandChild.totalDirectEarnings)}</span>
                                          <button
                                            onClick={() => setSelectedPartnerForSheet(grandChild)}
                                            className="p-1 text-neutral-400 hover:text-orange-600"
                                            title="Voir fiche"
                                          >
                                            <FileText className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

      {/* ===================================================================== */}
      {/* MODAL 1: ÉTAT ADMINISTRATEUR ET FINANCIER GLOBAL (FORMAT IMPRESSION)  */}
      {/* ===================================================================== */}
      {isGlobalReportModalOpen && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-3 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-5xl w-full border border-neutral-200 shadow-2xl p-6 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Top Toolbar (hidden on print) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 pb-4 no-print">
              <div>
                <span className="text-xs font-bold text-red-600 uppercase tracking-wider block">
                  Rapport Officiel de Direction
                </span>
                <h3 className="text-base font-extrabold text-neutral-900">
                  État Administratif & Financier Global du Réseau Whieda Smart
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadGlobalReportPDF}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Télécharger PDF (Paysage)</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-neutral-900 hover:bg-black text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimer le Rapport</span>
                </button>

                <button
                  onClick={() => setIsGlobalReportModalOpen(false)}
                  className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div className="print-page space-y-6 text-xs text-neutral-900">
              {/* Document Header Letterhead */}
              <div className="flex items-start justify-between border-b-2 border-red-600 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center font-black text-base">
                      W
                    </div>
                    <span className="text-lg font-black tracking-tight text-neutral-900">
                      {companySettings?.name || 'WHIEDA SMART'}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-500 mt-0.5">
                    Direction Générale · Caisse & Administration du Réseau MLM
                  </p>
                  <p className="text-[10px] text-neutral-400">
                    {companySettings?.address || 'Boulevard de la Liberté, Akwa - Douala, Cameroun'}
                  </p>
                </div>

                <div className="text-right">
                  <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 font-bold text-[10px] uppercase tracking-wider border border-red-200">
                    Document de Synthèse ERP
                  </span>
                  <div className="text-xs font-bold text-neutral-800 mt-1">
                    Édité le {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </div>
                  <div className="text-[10px] text-neutral-500 font-mono">
                    Période d'exercice : Année 2026
                  </div>
                </div>
              </div>

              {/* Synthèse 1: Administrative & Synthèse 2: Financière */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Administrative */}
                <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                  <div className="text-xs font-bold text-orange-700 uppercase tracking-wide">
                    1. Synthèse Administrative
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Total Partenaires Enregistrés :</span>
                      <span className="font-bold text-neutral-900">{totalPartners} membres actifs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Membres Qualifiés :</span>
                      <span className="font-bold text-emerald-700">{countQualified} qualifiés ({((countQualified / totalPartners) * 100).toFixed(0)}%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Membres Non Qualifiés :</span>
                      <span className="font-bold text-neutral-600">{countNonQualified}</span>
                    </div>
                    <div className="flex justify-between border-t border-neutral-200 pt-1 text-[11px]">
                      <span className="text-neutral-500">Répartition par Cartes :</span>
                      <span className="font-semibold text-neutral-800">
                        Start ({countStart}) · Standard ({countStandard}) · Premium ({countPremium}) · VIP ({countVIP})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Financière */}
                <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                  <div className="text-xs font-bold text-red-700 uppercase tracking-wide">
                    2. Synthèse Financière & Points de Valeur (PV)
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Cumul PV Réseau :</span>
                      <span className="font-bold text-amber-700 font-mono">{formatPV(totalPvNetwork)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">PV Placés / PV Restants :</span>
                      <span className="font-mono text-neutral-800">{totalPvPlaced} placés / {totalPvRemaining} restants</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Gains Directs Totaux Générés :</span>
                      <span className="font-bold text-neutral-900 font-mono">{formatMoney(totalGainsGenerated)}</span>
                    </div>
                    <div className="flex justify-between border-t border-neutral-200 pt-1">
                      <span className="text-neutral-500">Déjà Réglé : <strong className="text-emerald-700">{formatMoney(totalPaid)}</strong></span>
                      <span className="text-red-600 font-bold font-mono">Reste à payer : {formatMoney(totalRemaining)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Complete 10-Column Table */}
              <div className="border border-neutral-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-100 text-neutral-700 uppercase text-[9px] font-bold border-b border-neutral-200">
                    <tr>
                      <th className="p-2">Date Entrée</th>
                      <th className="p-2">Nom et ID Partenaire</th>
                      <th className="p-2">Parrain Up</th>
                      <th className="p-2">Statut Carte</th>
                      <th className="p-2 text-center">Qualif.</th>
                      <th className="p-2 text-right">PV Total</th>
                      <th className="p-2 text-right">PV Placés</th>
                      <th className="p-2 text-right">PV Rest.</th>
                      <th className="p-2 text-right">Gains Accumulés</th>
                      <th className="p-2 text-right">Gains Payés</th>
                      <th className="p-2 text-right">Reste à Payer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-neutral-800 text-[11px]">
                    {partners.map(p => {
                      const card = p.cardStatus || (p.level === 'Diamant' ? 'VIP' : p.level === 'Or' ? 'Premium' : p.level === 'Argent' ? 'Standard' : 'Start');
                      const qual = p.qualificationStatus || (p.totalPv >= 100 ? 'Qualifié' : 'Non qualifié');

                      return (
                        <tr key={p.id} className="hover:bg-neutral-50/50">
                          <td className="p-2 font-mono text-neutral-500">{p.registeredAt || '2026-01-10'}</td>
                          <td className="p-2 font-bold text-neutral-900">{p.firstName} {p.lastName} <span className="font-mono text-red-600">({p.code})</span></td>
                          <td className="p-2 text-neutral-600">{p.sponsorName ? p.sponsorName : 'Tête de réseau'}</td>
                          <td className="p-2 font-semibold">{card} ({p.level})</td>
                          <td className="p-2 text-center">
                            <span className={qual === 'Qualifié' ? 'text-emerald-700 font-bold' : 'text-neutral-400'}>
                              {qual}
                            </span>
                          </td>
                          <td className="p-2 text-right font-mono font-bold text-amber-700">{p.totalPv}</td>
                          <td className="p-2 text-right font-mono text-neutral-600">{p.placedPv}</td>
                          <td className="p-2 text-right font-mono text-orange-600">{p.remainingPv}</td>
                          <td className="p-2 text-right font-mono font-bold">{formatMoney(p.totalDirectEarnings)}</td>
                          <td className="p-2 text-right font-mono text-emerald-700">{formatMoney(p.paidEarnings)}</td>
                          <td className="p-2 text-right font-mono font-bold text-red-600">{formatMoney(p.remainingEarnings)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-neutral-100 font-bold border-t border-neutral-300 text-xs">
                    <tr>
                      <td colSpan={5} className="p-2 text-neutral-900">
                        TOTAL CONSOLIDÉ ({totalPartners} MEMBRES)
                      </td>
                      <td className="p-2 text-right font-mono text-amber-700">{totalPvNetwork}</td>
                      <td className="p-2 text-right font-mono text-neutral-700">{totalPvPlaced}</td>
                      <td className="p-2 text-right font-mono text-orange-700">{totalPvRemaining}</td>
                      <td className="p-2 text-right font-mono text-neutral-900">{formatMoney(totalGainsGenerated)}</td>
                      <td className="p-2 text-right font-mono text-emerald-700">{formatMoney(totalPaid)}</td>
                      <td className="p-2 text-right font-mono text-red-600">{formatMoney(totalRemaining)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Signatures & Stamp Zone */}
              <div className="pt-6 border-t border-neutral-200 grid grid-cols-2 gap-8">
                <div className="space-y-1">
                  <div className="font-semibold text-neutral-800">Responsable Administratif du Réseau</div>
                  <div className="text-[10px] text-neutral-400">Certifié conforme aux registres d'affiliation MLM</div>
                  <div className="w-32 h-14 border border-dashed border-neutral-300 rounded-lg flex items-center justify-center text-[10px] text-neutral-400 mt-2">
                    Cachet Direction Réseau
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <div className="font-semibold text-neutral-800">Direction Financière & Caisse</div>
                  <div className="text-[10px] text-neutral-400">Arrêté financier certifié régulier</div>
                  <div className="w-32 h-14 border border-dashed border-neutral-300 rounded-lg flex items-center justify-center text-[10px] text-neutral-400 mt-2 ml-auto">
                    Cachet Caisse Centrale
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: FICHE INDIVIDUELLE DU PARTENAIRE (RÉSEAU, ADMIN & FINANCIER) */}
      {/* ===================================================================== */}
      {selectedPartnerForSheet && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-3 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full border border-neutral-200 shadow-2xl p-6 space-y-5 my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Top Toolbar (hidden on print) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 pb-3 no-print">
              <div>
                <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider block">
                  Dossier Partenaire MLM
                </span>
                <h3 className="text-base font-extrabold text-neutral-900">
                  Fiche Individuelle : {selectedPartnerForSheet.firstName} {selectedPartnerForSheet.lastName} ({selectedPartnerForSheet.code})
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadPartnerSheetPDF(selectedPartnerForSheet)}
                  className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Télécharger PDF</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-neutral-900 hover:bg-black text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimer la Fiche</span>
                </button>

                <button
                  onClick={() => setSelectedPartnerForSheet(null)}
                  className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Body */}
            <div className="print-page space-y-5 text-xs text-neutral-900">
              {/* Header Letterhead */}
              <div className="flex items-start justify-between border-b-2 border-orange-600 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center font-black text-base">
                      W
                    </div>
                    <span className="text-base font-black tracking-tight text-neutral-900">
                      {companySettings?.name || 'WHIEDA SMART'}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-500 mt-0.5">
                    Fiche Individuelle du Partenaire MLM · Situation Administrative & Financière
                  </p>
                </div>

                <div className="text-right">
                  <span className="font-mono text-sm font-black text-red-600">
                    ID : {selectedPartnerForSheet.code}
                  </span>
                  <div className="text-[10px] text-neutral-400">
                    Édité le {new Date().toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>

              {/* 1. Informations Administratives */}
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3">
                <span className="font-bold text-orange-700 uppercase tracking-wide text-xs block">
                  1. Informations Administratives
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-neutral-400 block text-[10px]">Nom complet</span>
                    <span className="font-bold text-neutral-900">{selectedPartnerForSheet.firstName} {selectedPartnerForSheet.lastName}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[10px]">Statut de Carte</span>
                    <span className="font-bold text-purple-700">
                      {selectedPartnerForSheet.cardStatus || 'Start'} (Grade : {selectedPartnerForSheet.level})
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[10px]">Statut Qualification</span>
                    <span className={`font-bold ${
                      (selectedPartnerForSheet.qualificationStatus || 'Qualifié') === 'Qualifié' ? 'text-emerald-700' : 'text-neutral-500'
                    }`}>
                      {selectedPartnerForSheet.qualificationStatus || 'Qualifié'}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[10px]">Parrain Réseau (Up-Line)</span>
                    <span className="font-semibold text-neutral-800">
                      {selectedPartnerForSheet.sponsorName ? `${selectedPartnerForSheet.sponsorName} (${selectedPartnerForSheet.sponsorCode})` : 'Tête de réseau'}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[10px]">Date d'entrée au réseau</span>
                    <span className="font-mono">{selectedPartnerForSheet.registeredAt || '2026-01-10'}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[10px]">Téléphone / Contact</span>
                    <span className="font-mono">{selectedPartnerForSheet.phone}</span>
                  </div>
                </div>
              </div>

              {/* 2. Bilan Financier Personnel & Situation PV */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                  <span className="font-bold text-red-700 uppercase tracking-wide text-xs block">
                    2. Bilan Financier Personnel
                  </span>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Gains Directs Accumulés :</span>
                      <span className="font-mono font-bold text-neutral-900">{formatMoney(selectedPartnerForSheet.totalDirectEarnings)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Commissions Déjà Soldées :</span>
                      <span className="font-mono font-semibold text-emerald-700">{formatMoney(selectedPartnerForSheet.paidEarnings)}</span>
                    </div>
                    <div className="flex justify-between border-t border-neutral-200 pt-1 font-bold">
                      <span className="text-neutral-700">Reste à Payer au Partenaire :</span>
                      <span className="font-mono text-red-600">{formatMoney(selectedPartnerForSheet.remainingEarnings)}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                  <span className="font-bold text-amber-700 uppercase tracking-wide text-xs block">
                    3. Bilan Points de Valeur (PV)
                  </span>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Total PV Accumulés :</span>
                      <span className="font-mono font-bold text-amber-700">{formatPV(selectedPartnerForSheet.totalPv)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">PV Placés dans l'arbre :</span>
                      <span className="font-mono text-neutral-800">{selectedPartnerForSheet.placedPv} PV</span>
                    </div>
                    <div className="flex justify-between border-t border-neutral-200 pt-1 font-bold">
                      <span className="text-neutral-700">PV Restants à placer :</span>
                      <span className="font-mono text-orange-600">{selectedPartnerForSheet.remainingPv} PV</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. État de son Réseau Personnel (Filleuls) */}
              <div>
                {(() => {
                  const downlines = getDirectDownlines(selectedPartnerForSheet.id);
                  return (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-neutral-900 uppercase tracking-wide text-xs">
                          4. État de son Réseau Personnel ({downlines.length} Filleul(s) Direct(s))
                        </span>
                      </div>

                      <div className="border border-neutral-200 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-neutral-100 text-neutral-600 uppercase text-[9px] font-bold border-b border-neutral-200">
                            <tr>
                              <th className="p-2">Code</th>
                              <th className="p-2">Nom & Prénom</th>
                              <th className="p-2">Carte</th>
                              <th className="p-2 text-center">Qualif.</th>
                              <th className="p-2 text-right">PV Total</th>
                              <th className="p-2 text-right">Date Entrée</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-100 text-neutral-800 text-[11px]">
                            {downlines.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="p-4 text-center text-neutral-400 italic">
                                  Ce partenaire n'a pas encore de filleuls directement enregistrés.
                                </td>
                              </tr>
                            ) : (
                              downlines.map(child => (
                                <tr key={child.id} className="hover:bg-neutral-50/50">
                                  <td className="p-2 font-mono font-bold text-red-600">{child.code}</td>
                                  <td className="p-2 font-semibold text-neutral-900">{child.firstName} {child.lastName}</td>
                                  <td className="p-2 font-medium">{child.cardStatus || 'Start'}</td>
                                  <td className="p-2 text-center">
                                    <span className={child.qualificationStatus === 'Qualifié' ? 'text-emerald-700 font-bold' : 'text-neutral-400'}>
                                      {child.qualificationStatus || 'Qualifié'}
                                    </span>
                                  </td>
                                  <td className="p-2 text-right font-mono font-bold text-amber-700">{child.totalPv} PV</td>
                                  <td className="p-2 text-right font-mono text-neutral-500">{child.registeredAt || '2026-02-01'}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Cachet & Visa */}
              <div className="pt-4 border-t border-neutral-200 flex items-center justify-between text-[10px] text-neutral-500">
                <div>
                  <span>Délivré par le secrétariat réseau Whieda Smart.</span>
                  <div className="w-24 h-12 border border-dashed border-neutral-300 rounded mt-1 flex items-center justify-center text-neutral-400">
                    Cachet Réseau
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-semibold text-neutral-800">Le Responsable d'Affiliation MLM</div>
                  <div className="font-mono text-neutral-400 mt-1">[Fiche conforme aux registres]</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: ARBORESCENCE DU RÉSEAU (FORMAT IMPRESSION GIK / ARBRE)        */}
      {/* ===================================================================== */}
      {isTreePrintModalOpen && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-3 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full border border-neutral-200 shadow-2xl p-6 space-y-5 my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Top Toolbar (hidden on print) */}
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3 no-print">
              <div>
                <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider block">
                  Document Officiel d'Arborescence
                </span>
                <h3 className="text-base font-extrabold text-neutral-900">
                  Arbre Généalogique Complet du Réseau Whieda Smart
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadNetworkTreePDF}
                  className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Télécharger PDF</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-neutral-900 hover:bg-black text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimer l'Arbre</span>
                </button>

                <button
                  onClick={() => setIsTreePrintModalOpen(false)}
                  className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Tree Content */}
            <div className="print-page space-y-4 text-xs text-neutral-900">
              <div className="flex items-start justify-between border-b-2 border-orange-600 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-neutral-900 font-serif italic text-orange-950">
                      Système Réseau
                    </span>
                    <span className="text-xs font-bold text-neutral-400">·</span>
                    <span className="text-sm font-black tracking-tight text-neutral-900">
                      {companySettings?.name || 'WHIEDA SMART'}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-500">
                    Modèle officiel d'Arborescence Binaire & Généalogie MLM (Parrains, Filleuls, Statuts Carte & PV)
                  </p>
                </div>
                <div className="text-right text-[10px] text-neutral-500 font-mono">
                  Édité le {new Date().toLocaleDateString('fr-FR')} · {partners.length} membres cartographiés
                </div>
              </div>

              {/* Graphical Binary Tree Diagram (Matching Handwritten Photo Model) */}
              <div className="p-4 bg-orange-50/20 border border-orange-300 rounded-xl">
                <div className="flex justify-between items-center text-[10px] font-bold text-orange-900 uppercase tracking-wider mb-2 border-b border-orange-200 pb-1.5">
                  <span>← Branche Gauche (Left Leg)</span>
                  <span className="text-xs font-black font-serif italic">Schéma du Réseau Binaire</span>
                  <span>Branche Droite (Right Leg) →</span>
                </div>

                <div className="overflow-x-auto py-2">
                  <div className="relative mx-auto" style={{ width: '820px', height: '480px' }}>
                    {/* SVG Connecting Lines for Print */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 820 480">
                      {/* Root to Left & Right */}
                      <line x1="410" y1="45" x2="205" y2="130" stroke="#ea580c" strokeWidth="2" />
                      <line x1="410" y1="45" x2="615" y2="130" stroke="#ea580c" strokeWidth="2" />

                      {/* Idris to Béatrice & Ibrahim */}
                      <line x1="205" y1="130" x2="105" y2="225" stroke="#ea580c" strokeWidth="1.8" />
                      <line x1="205" y1="130" x2="305" y2="225" stroke="#ea580c" strokeWidth="1.8" />

                      {/* Sara to Jean-Marc & Chantal */}
                      <line x1="615" y1="130" x2="515" y2="225" stroke="#ea580c" strokeWidth="1.8" />
                      <line x1="615" y1="130" x2="715" y2="225" stroke="#ea580c" strokeWidth="1.8" />

                      {/* Béatrice to Sophie & Mireille */}
                      <line x1="105" y1="225" x2="55" y2="330" stroke="#ea580c" strokeWidth="1.5" />
                      <line x1="105" y1="225" x2="155" y2="330" stroke="#ea580c" strokeWidth="1.5" />

                      {/* Jean-Marc to Eric & Alain */}
                      <line x1="515" y1="225" x2="465" y2="330" stroke="#ea580c" strokeWidth="1.5" />
                      <line x1="515" y1="225" x2="565" y2="330" stroke="#ea580c" strokeWidth="1.5" />

                      {/* Chantal to David */}
                      <line x1="715" y1="225" x2="715" y2="330" stroke="#ea580c" strokeWidth="1.5" />

                      {/* David to Carine */}
                      <line x1="715" y1="330" x2="715" y2="420" stroke="#ea580c" strokeWidth="1.5" />
                    </svg>

                    {/* Nodes Helper Mapping for Print */}
                    {[
                      { id: 'ptn-1', name: 'OYONO UP', card: 'START', pv: 500, x: 410, y: 45, isRoot: true },
                      { id: 'ptn-2', name: 'IDRIS AWOULE', card: 'START', pv: 250, x: 205, y: 130 },
                      { id: 'ptn-3', name: 'SARA OYONO', card: 'START', pv: 500, x: 615, y: 130 },
                      { id: 'ptn-4', name: 'BÉATRICE MANGA', card: 'START', pv: 150, x: 105, y: 225 },
                      { id: 'ptn-5', name: 'IBRAHIM TRAORÉ', card: 'START', pv: 120, x: 305, y: 225 },
                      { id: 'ptn-8', name: 'JEAN-MARC ETOA', card: 'START', pv: 200, x: 515, y: 225 },
                      { id: 'ptn-9', name: 'CHANTAL BILONG', card: 'START', pv: 180, x: 715, y: 225 },
                      { id: 'ptn-6', name: 'SOPHIE MBALLA', card: 'START', pv: 100, x: 55, y: 330 },
                      { id: 'ptn-7', name: 'MIREILLE FOTSO', card: 'START', pv: 80, x: 155, y: 330 },
                      { id: 'ptn-10', name: 'ERIC KOUAM', card: 'START', pv: 140, x: 465, y: 330 },
                      { id: 'ptn-11', name: 'ALAIN NGUEMO', card: 'START', pv: 90, x: 565, y: 330 },
                      { id: 'ptn-12', name: 'DAVID KENMOGNE', card: 'START', pv: 110, x: 715, y: 330 },
                      { id: 'ptn-13', name: 'CARINE ATANGANA', card: 'START', pv: 60, x: 715, y: 420 },
                    ].map(n => {
                      const p = partners.find(item => item.id === n.id);
                      const finalName = p ? `${p.firstName} ${p.lastName}`.toUpperCase() : n.name;
                      const finalCard = p?.cardStatus || n.card;
                      const finalPv = p?.totalPv || n.pv;

                      return (
                        <div
                          key={`print-node-${n.id}`}
                          className="absolute text-center -translate-x-1/2 -translate-y-1/2"
                          style={{ left: `${n.x}px`, top: `${n.y}px` }}
                        >
                          <div className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center font-bold text-[10px] ${
                            n.isRoot
                              ? 'bg-amber-100 text-amber-900 border-2 border-amber-500'
                              : 'bg-white text-orange-700 border-2 border-orange-400'
                          }`}>
                            {n.isRoot ? '👑' : finalName.slice(0, 2)}
                          </div>
                          <div className="bg-white/95 px-1.5 py-0.5 rounded shadow-2xs border border-neutral-300 mt-1 whitespace-nowrap">
                            <span className="font-extrabold text-[9px] text-neutral-900 block leading-tight">{finalName}</span>
                            <span className="text-[8px] text-orange-700 font-bold font-mono">[{finalCard}] {finalPv} PV</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Structured Hierarchical List for Print */}
              <div className="space-y-3 font-mono text-xs">
                <div className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
                  Répertoire Détaillé des Filiations & Points Valeurs (PV)
                </div>
                {rootPartners.map(root => {
                  const downlines1 = getDirectDownlines(root.id);
                  const card = root.cardStatus || 'VIP';
                  const qual = root.qualificationStatus || 'Qualifié';

                  return (
                    <div key={root.id} className="border border-neutral-300 rounded-xl p-3 bg-neutral-50/50 space-y-2">
                      <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-neutral-200">
                        <span className="font-bold text-neutral-900">
                          👑 [TÊTE DE RÉSEAU] {root.code} : {root.firstName} {root.lastName}
                        </span>
                        <div className="space-x-3 text-[11px]">
                          <span className="font-semibold text-purple-700">Carte : {card}</span>
                          <span className="font-semibold text-emerald-700">[{qual}]</span>
                          <span className="font-bold text-amber-700">{root.totalPv} PV</span>
                        </div>
                      </div>

                      {downlines1.map(c1 => {
                        const downlines2 = getDirectDownlines(c1.id);
                        const c1Card = c1.cardStatus || 'Start';
                        const c1Qual = c1.qualificationStatus || 'Qualifié';

                        return (
                          <div key={c1.id} className="pl-6 space-y-1.5 border-l-2 border-neutral-300 ml-4">
                            <div className="flex justify-between items-center bg-white p-2 rounded border border-neutral-200 text-[11px]">
                              <span>├── [Niv 1] {c1.code} : {c1.firstName} {c1.lastName}</span>
                              <div className="space-x-2">
                                <span className="text-neutral-700 font-semibold">Carte : {c1Card}</span>
                                <span className="text-emerald-700">[{c1Qual}]</span>
                                <span className="text-amber-700 font-bold">{c1.totalPv} PV</span>
                              </div>
                            </div>

                            {downlines2.map(c2 => (
                              <div key={c2.id} className="pl-6 flex justify-between items-center text-[10px] text-neutral-600 bg-neutral-100/60 p-1.5 rounded">
                                <span>└── [Niv 2] {c2.code} : {c2.firstName} {c2.lastName}</span>
                                <div className="space-x-2 font-mono">
                                  <span>Carte : {c2.cardStatus || 'Start'}</span>
                                  <span className="text-emerald-700">[{c2.qualificationStatus || 'Qualifié'}]</span>
                                  <span className="font-bold text-amber-700">{c2.totalPv} PV</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-neutral-200 text-center text-[10px] text-neutral-400">
                Document de structure MLM officiel Whieda Smart. Généré automatiquement par le système ERP.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 4: NOUVEAU PARTENAIRE MLM                                       */}
      {/* ===================================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-neutral-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-orange-600" />
                <h3 className="text-sm font-bold text-neutral-900">
                  Enregistrer un Nouveau Partenaire MLM
                </h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-neutral-400 hover:text-neutral-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePartner} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Ibrahim"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Nom de Famille *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Traoré"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Code Unique (ID) *
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Statut de Carte *
                  </label>
                  <select
                    value={cardStatus}
                    onChange={e => setCardStatus(e.target.value as PartnerCardStatus)}
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="Start">Start</option>
                    <option value="Standard">Standard</option>
                    <option value="Premium">Premium</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Téléphone *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+237 6..."
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Statut Qualification *
                  </label>
                  <select
                    value={qualificationStatus}
                    onChange={e => setQualificationStatus(e.target.value as PartnerQualification)}
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="Qualifié">Qualifié</option>
                    <option value="Non qualifié">Non qualifié</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Grade du Partenaire *
                  </label>
                  <select
                    value={level}
                    onChange={e => setLevel(e.target.value)}
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-semibold"
                  >
                    {PARTNER_GRADES.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Nombre de PV Initial *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={10}
                    placeholder="ex: 500 ou 250"
                    value={initialPv}
                    onChange={e => setInitialPv(Number(e.target.value))}
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Parrain (Partenaire Up-Line)
                </label>
                <select
                  value={sponsorId}
                  onChange={e => setSponsorId(e.target.value)}
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">-- Aucun (Tête de Réseau) --</option>
                  {partners.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName} ({p.code}) - {p.cardStatus || p.level}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 rounded-lg shadow-sm"
                >
                  Créer le Partenaire
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 5: RÉGLER LA COMMISSION                                         */}
      {/* ===================================================================== */}
      {selectedPartnerForPayout && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full border border-neutral-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-neutral-900">
                  Règlement de Commission Partenaire
                </h3>
              </div>
              <button onClick={() => setSelectedPartnerForPayout(null)} className="p-1 text-neutral-400 hover:text-neutral-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmPayout} className="p-6 space-y-4">
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs">
                <div className="font-bold text-neutral-900">
                  {selectedPartnerForPayout.firstName} {selectedPartnerForPayout.lastName}
                </div>
                <div className="text-neutral-500 font-mono mt-0.5">
                  ID: {selectedPartnerForPayout.code} · Tel: {selectedPartnerForPayout.phone}
                </div>
                <div className="mt-2 pt-2 border-t border-neutral-200 flex justify-between items-center font-bold">
                  <span>Solde en attente :</span>
                  <span className="text-orange-600 font-mono">
                    {formatMoney(selectedPartnerForPayout.remainingEarnings)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Montant à Verser (FCFA) *
                </label>
                <input
                  type="number"
                  required
                  min={100}
                  max={selectedPartnerForPayout.remainingEarnings}
                  value={payoutAmount}
                  onChange={e => setPayoutAmount(Number(e.target.value))}
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Moyen de Paiement *
                </label>
                <select
                  value={payoutMethod}
                  onChange={e => setPayoutMethod(e.target.value)}
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Orange Money">Orange Money</option>
                  <option value="MTN MoMo">MTN Mobile Money</option>
                  <option value="Espèces à la Caisse">Espèces (Guichet Caisse)</option>
                  <option value="Virement Bancaire">Virement Bancaire</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Référence de transaction / Reçu
                </label>
                <input
                  type="text"
                  placeholder="ex: OM-TX-849202"
                  value={payoutNotes}
                  onChange={e => setPayoutNotes(e.target.value)}
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setSelectedPartnerForPayout(null)}
                  className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                >
                  Confirmer le Règlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 6: PLACER DES PV                                                */}
      {/* ===================================================================== */}
      {selectedPartnerForPlacement && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full border border-neutral-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-neutral-900">
                  Placement des Points de Valeur (PV)
                </h3>
              </div>
              <button onClick={() => setSelectedPartnerForPlacement(null)} className="p-1 text-neutral-400 hover:text-neutral-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmPlacement} className="p-6 space-y-4">
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs">
                <div className="font-bold text-neutral-900">
                  {selectedPartnerForPlacement.firstName} {selectedPartnerForPlacement.lastName}
                </div>
                <div className="text-neutral-500 font-mono mt-0.5">
                  ID: {selectedPartnerForPlacement.code}
                </div>
                <div className="mt-2 pt-2 border-t border-neutral-200 flex justify-between items-center font-bold">
                  <span>PV Restants à placer :</span>
                  <span className="text-amber-600 font-mono">
                    {formatPV(selectedPartnerForPlacement.remainingPv)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Nombre de PV à placer dans l'arbre binaire *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={selectedPartnerForPlacement.remainingPv}
                  value={pvToPlace}
                  onChange={e => setPvToPlace(Number(e.target.value))}
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono font-bold"
                />
              </div>

              <p className="text-[11px] text-neutral-500">
                Ces PV seront injectés dans les branches de l'arbre pour débloquer les cycles et paliers MLM de l'équipe.
              </p>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setSelectedPartnerForPlacement(null)}
                  className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-lg shadow-sm"
                >
                  Valider le Placement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 7: MODIFIER LES INFORMATIONS DU PARTENAIRE                      */}
      {/* ===================================================================== */}
      {partnerToEdit && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-neutral-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50">
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-neutral-900">
                  Modifier les Informations du Partenaire ({partnerToEdit.code})
                </h3>
              </div>
              <button onClick={() => setPartnerToEdit(null)} className="p-1 text-neutral-400 hover:text-neutral-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    required
                    value={editFirstName}
                    onChange={e => setEditFirstName(e.target.value)}
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Nom de Famille *
                  </label>
                  <input
                    type="text"
                    required
                    value={editLastName}
                    onChange={e => setEditLastName(e.target.value)}
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Code Unique (ID) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editCode}
                    onChange={e => setEditCode(e.target.value)}
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Téléphone *
                  </label>
                  <input
                    type="text"
                    required
                    value={editPhone}
                    onChange={e => setEditPhone(e.target.value)}
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Grade Réseau *
                  </label>
                  <select
                    value={editLevel}
                    onChange={e => setEditLevel(e.target.value)}
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                  >
                    {PARTNER_GRADES.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Statut Carte *
                  </label>
                  <select
                    value={editCardStatus}
                    onChange={e => setEditCardStatus(e.target.value as PartnerCardStatus)}
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Start">Start</option>
                    <option value="Standard">Standard</option>
                    <option value="Premium">Premium</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Qualification *
                  </label>
                  <select
                    value={editQualificationStatus}
                    onChange={e => setEditQualificationStatus(e.target.value as PartnerQualification)}
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Qualifié">Qualifié</option>
                    <option value="Non qualifié">Non qualifié</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Parrain Up (Rattachement Arborescence)
                </label>
                <select
                  value={editSponsorId}
                  onChange={e => setEditSponsorId(e.target.value)}
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Aucun (Tête de Réseau) --</option>
                  {partners
                    .filter(p => p.id !== partnerToEdit.id)
                    .map(p => (
                      <option key={p.id} value={p.id}>
                        {p.firstName} {p.lastName} ({p.code}) - {p.cardStatus || p.level}
                      </option>
                    ))}
                </select>
              </div>

              {/* Paramétrage des Points de Valeur (PV) */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                <div className="font-bold text-xs text-amber-900 flex items-center justify-between">
                  <span>Gestion des Points de Valeur (PV)</span>
                  <span className="text-[10px] text-amber-700 font-mono">Administration</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-neutral-600 mb-0.5">PV Total</label>
                    <input
                      type="number"
                      min={0}
                      value={editTotalPv}
                      onChange={e => {
                        const val = Number(e.target.value);
                        setEditTotalPv(val);
                        setEditRemainingPv(Math.max(0, val - editPlacedPv));
                      }}
                      className="w-full text-xs p-2 border border-amber-300 rounded-lg bg-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-neutral-600 mb-0.5">PV Placés</label>
                    <input
                      type="number"
                      min={0}
                      value={editPlacedPv}
                      onChange={e => {
                        const val = Number(e.target.value);
                        setEditPlacedPv(val);
                        setEditRemainingPv(Math.max(0, editTotalPv - val));
                      }}
                      className="w-full text-xs p-2 border border-amber-300 rounded-lg bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-neutral-600 mb-0.5">PV Restants</label>
                    <input
                      type="number"
                      min={0}
                      value={editRemainingPv}
                      onChange={e => setEditRemainingPv(Number(e.target.value))}
                      className="w-full text-xs p-2 border border-amber-300 rounded-lg bg-white font-mono font-bold text-amber-800"
                    />
                  </div>
                </div>
              </div>

              {/* Paramétrage des Gains Financiers */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                <div className="font-bold text-xs text-emerald-900 flex items-center justify-between">
                  <span>Gestion des Gains et Commissions (FCFA)</span>
                  <span className="text-[10px] text-emerald-700 font-mono">Comptabilité</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-neutral-600 mb-0.5">Gains Totaux</label>
                    <input
                      type="number"
                      min={0}
                      value={editTotalDirectEarnings}
                      onChange={e => {
                        const val = Number(e.target.value);
                        setEditTotalDirectEarnings(val);
                        setEditRemainingEarnings(Math.max(0, val - editPaidEarnings));
                      }}
                      className="w-full text-xs p-2 border border-emerald-300 rounded-lg bg-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-neutral-600 mb-0.5">Gains Payés</label>
                    <input
                      type="number"
                      min={0}
                      value={editPaidEarnings}
                      onChange={e => {
                        const val = Number(e.target.value);
                        setEditPaidEarnings(val);
                        setEditRemainingEarnings(Math.max(0, editTotalDirectEarnings - val));
                      }}
                      className="w-full text-xs p-2 border border-emerald-300 rounded-lg bg-white font-mono text-emerald-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-neutral-600 mb-0.5">Reste à Payer</label>
                    <input
                      type="number"
                      min={0}
                      value={editRemainingEarnings}
                      onChange={e => setEditRemainingEarnings(Number(e.target.value))}
                      className="w-full text-xs p-2 border border-emerald-300 rounded-lg bg-white font-mono font-bold text-red-600"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setPartnerToEdit(null)}
                  className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Enregistrer les Modifications</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 8: CONFIRMATION DE SUPPRESSION PARTENAIRE                      */}
      {/* ===================================================================== */}
      {partnerToDelete && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full border border-red-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-base font-bold text-neutral-900">
                  Supprimer ce Partenaire ?
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Êtes-vous sûr de vouloir supprimer définitivement le partenaire{' '}
                  <strong className="text-neutral-900">
                    {partnerToDelete.firstName} {partnerToDelete.lastName} ({partnerToDelete.code})
                  </strong>{' '}
                  du réseau ?
                </p>
              </div>

              <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-xs text-left space-y-1">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Grade & Carte :</span>
                  <span className="font-semibold">{partnerToDelete.level} · {partnerToDelete.cardStatus || 'Start'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Points de Valeur :</span>
                  <span className="font-mono font-bold text-amber-700">{partnerToDelete.totalPv} PV</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Gains restants dus :</span>
                  <span className="font-mono font-bold text-red-600">{formatMoney(partnerToDelete.remainingEarnings)}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPartnerToDelete(null)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Confirmer la Suppression</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
