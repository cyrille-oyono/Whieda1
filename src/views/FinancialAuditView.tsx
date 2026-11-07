import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Expense, 
  ExpenseCategory, 
  EXPENSE_CATEGORIES, 
  PartnerPayoutRecord, 
  PaymentMethod 
} from '../types';
import { formatMoney, formatPV } from '../utils/formatters';
import { generatePartnerPayoutsReportPDF } from '../utils/pdfGenerator';
import { 
  DollarSign, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Plus, 
  Download, 
  Edit3, 
  Trash2, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Building2, 
  PieChart, 
  Calendar, 
  Tag, 
  Layers, 
  Award, 
  Printer, 
  FileText,
  CreditCard,
  ShieldCheck,
  ChevronRight,
  X
} from 'lucide-react';

interface FinancialAuditViewProps {
  onNavigateToAudit?: () => void;
}

export const FinancialAuditView: React.FC<FinancialAuditViewProps> = ({ onNavigateToAudit }) => {
  const { 
    currentUser, 
    partners, 
    sales, 
    expenses, 
    addExpense, 
    updateExpense, 
    deleteExpense, 
    partnerPayouts, 
    addPartnerPayout,
    companySettings 
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'expenses' | 'payouts'>('dashboard');

  // --- Expenses State ---
  const [expenseForm, setExpenseForm] = useState<{
    date: string;
    title: string;
    category: ExpenseCategory;
    amount: string;
    notes: string;
  }>({
    date: new Date().toISOString().split('T')[0],
    title: '',
    category: 'Matériel',
    amount: '',
    notes: '',
  });

  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [expenseSearch, setExpenseSearch] = useState('');
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState<string>('all');

  // --- Payouts State ---
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutForm, setPayoutForm] = useState<{
    partnerId: string;
    amountPaid: string;
    pvPlaced: string;
    date: string;
    paymentMethod: PaymentMethod | string;
    reference: string;
    notes: string;
  }>({
    partnerId: partners[0]?.id || '',
    amountPaid: '',
    pvPlaced: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'orange_money',
    reference: '',
    notes: '',
  });

  const [payoutSearch, setPayoutSearch] = useState('');

  // ==========================================
  // CALCULATIONS & FINANCIAL METRICS
  // ==========================================

  // 1. Enterprise Income
  // Sum of net prices paid by patients/clients across POS sales
  const validSales = sales.filter(s => s.status !== 'annule');
  const totalSalesRevenue = validSales.reduce((sum, s) => sum + (s.netAmount || 0), 0);
  const totalPosPv = validSales.reduce((sum, s) => sum + (s.totalPv || 0), 0);

  // Founder partners direct earnings (e.g. Oyono Up / partners without sponsor or isFounder)
  const founderPartners = partners.filter(p => p.isFounder || !p.sponsorId || p.code === 'WH-PTN-101');
  const founderDirectEarnings = founderPartners.reduce((sum, p) => sum + (p.totalDirectEarnings || 0), 0);

  // Total Enterprise Incomes (Ventes clients/patients + gains fondateurs)
  const totalEnterpriseIncomes = totalSalesRevenue + founderDirectEarnings;

  // Total Enterprise Expenses
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  // Enterprise Net Treasury Balance
  const enterpriseNetBalance = totalEnterpriseIncomes - totalExpenses;

  // 2. Partner Network Finances
  const totalPartnerEarnings = partners.reduce((sum, p) => sum + (p.totalDirectEarnings || 0), 0);
  const totalPartnerPaid = partners.reduce((sum, p) => sum + (p.paidEarnings || 0), 0);
  const totalPartnerRemaining = partners.reduce((sum, p) => sum + (p.remainingEarnings || 0), 0);

  const totalPartnerPv = partners.reduce((sum, p) => sum + (p.totalPv || 0), 0);
  const totalPlacedPv = partners.reduce((sum, p) => sum + (p.placedPv || 0), 0);
  const totalRemainingPv = partners.reduce((sum, p) => sum + (p.remainingPv || 0), 0);

  // 3. COMBINED TOTAL (Entreprise + Partenaires)
  // A / Total Global Entreprise + Partenaires en termes de prix (FCFA) et PV
  const combinedTotalMonetaryValue = totalEnterpriseIncomes + totalPartnerEarnings;
  const combinedTotalPv = totalPosPv + totalPartnerPv;

  // Expenses breakdown by category
  const expenseByCategory = useMemo(() => {
    const acc: Record<ExpenseCategory, number> = {
      Nutrition: 0,
      Transport: 0,
      Salaire: 0,
      Entretien: 0,
      Campagnes: 0,
      Matériel: 0,
    };
    expenses.forEach(e => {
      if (acc[e.category] !== undefined) {
        acc[e.category] += e.amount;
      }
    });
    return acc;
  }, [expenses]);

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const matchSearch = 
        e.title.toLowerCase().includes(expenseSearch.toLowerCase()) ||
        e.recordedBy.toLowerCase().includes(expenseSearch.toLowerCase()) ||
        e.amount.toString().includes(expenseSearch);
      const matchCat = expenseCategoryFilter === 'all' || e.category === expenseCategoryFilter;
      return matchSearch && matchCat;
    });
  }, [expenses, expenseSearch, expenseCategoryFilter]);

  // Filtered payouts
  const filteredPayouts = useMemo(() => {
    return partnerPayouts.filter(p => {
      return (
        p.partnerName.toLowerCase().includes(payoutSearch.toLowerCase()) ||
        p.partnerCode.toLowerCase().includes(payoutSearch.toLowerCase()) ||
        p.recordedBy.toLowerCase().includes(payoutSearch.toLowerCase()) ||
        (p.reference && p.reference.toLowerCase().includes(payoutSearch.toLowerCase()))
      );
    });
  }, [partnerPayouts, payoutSearch]);

  // Selected partner for new payout
  const selectedPartnerObj = partners.find(p => p.id === payoutForm.partnerId);

  // Handlers for Expenses
  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(expenseForm.amount);
    if (!expenseForm.title.trim() || isNaN(amountNum) || amountNum <= 0) {
      alert('Veuillez saisir un intitulé valide et un montant supérieur à 0.');
      return;
    }

    addExpense({
      date: expenseForm.date,
      title: expenseForm.title.trim(),
      category: expenseForm.category,
      amount: amountNum,
      notes: expenseForm.notes.trim() || undefined,
    });

    // Reset form
    setExpenseForm({
      date: new Date().toISOString().split('T')[0],
      title: '',
      category: 'Matériel',
      amount: '',
      notes: '',
    });
  };

  const handleUpdateExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense) return;
    const amountNum = Number(editingExpense.amount);
    if (!editingExpense.title.trim() || isNaN(amountNum) || amountNum <= 0) {
      alert('Veuillez vérifier les informations de la dépense.');
      return;
    }

    updateExpense(editingExpense.id, {
      date: editingExpense.date,
      title: editingExpense.title.trim(),
      category: editingExpense.category,
      amount: amountNum,
      notes: editingExpense.notes,
    });

    setEditingExpense(null);
  };

  const confirmDeleteExpense = () => {
    if (expenseToDelete) {
      deleteExpense(expenseToDelete.id);
      setExpenseToDelete(null);
    }
  };

  // Handlers for Payout
  const handleOpenPayoutModal = (partnerId?: string) => {
    const defaultPartner = partnerId 
      ? partners.find(p => p.id === partnerId) 
      : partners.find(p => p.remainingEarnings > 0) || partners[0];

    setPayoutForm({
      partnerId: defaultPartner?.id || '',
      amountPaid: defaultPartner ? String(defaultPartner.remainingEarnings) : '',
      pvPlaced: defaultPartner ? String(defaultPartner.remainingPv) : '',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'orange_money',
      reference: `REG-${Date.now().toString().slice(-6)}`,
      notes: '',
    });
    setIsPayoutModalOpen(true);
  };

  const handleCreatePayoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartnerObj) return;

    const amountNum = parseFloat(payoutForm.amountPaid);
    const pvNum = parseFloat(payoutForm.pvPlaced) || 0;

    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Veuillez spécifier un montant valide supérieur à 0 FCFA.');
      return;
    }

    addPartnerPayout({
      date: payoutForm.date,
      partnerId: selectedPartnerObj.id,
      partnerName: `${selectedPartnerObj.firstName} ${selectedPartnerObj.lastName}`,
      partnerCode: selectedPartnerObj.code,
      amountPaid: amountNum,
      pvPlaced: pvNum,
      paymentMethod: payoutForm.paymentMethod,
      reference: payoutForm.reference.trim() || undefined,
      notes: payoutForm.notes.trim() || undefined,
    });

    setIsPayoutModalOpen(false);
  };

  const handleDownloadPayoutsPDF = () => {
    generatePartnerPayoutsReportPDF(partnerPayouts, companySettings);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-gradient-to-br from-red-500 to-orange-600 text-white rounded-xl shadow-xs">
              <Wallet className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
              Module de Gestion Financière, Dépenses & Audit
            </h1>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Tableau de bord financier combiné, gestion des dépenses réelles et suivi certifié des paiements partenaires.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('expenses')}
            className="px-3 py-2 bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-800 rounded-xl text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-orange-600" />
            <span>Nouvelle Dépense</span>
          </button>
          <button
            onClick={() => handleOpenPayoutModal()}
            className="px-3.5 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Régler un Partenaire</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-neutral-200 shadow-2xs no-print">
        <button
          onClick={() => setActiveSubTab('dashboard')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeSubTab === 'dashboard'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <PieChart className="w-4 h-4 text-orange-400" />
          <span>1. Tableau Financier Global</span>
        </button>

        <button
          onClick={() => setActiveSubTab('expenses')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeSubTab === 'expenses'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <TrendingDown className="w-4 h-4 text-red-400" />
          <span>2. Gestion des Dépenses ({expenses.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('payouts')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeSubTab === 'payouts'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Users className="w-4 h-4 text-green-400" />
          <span>3. Finances Partenaires & Paiements</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* SECTION 1 : TABLEAU DE BORD FINANCIER GLOBAL             */}
      {/* ========================================================= */}
      {activeSubTab === 'dashboard' && (
        <div className="space-y-6">
          {/* PART A : TOTAL GLOBAL ENTREPRISE + PARTENAIRES */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-800 to-stone-900 text-white p-6 shadow-md border border-neutral-700/50">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 text-[11px] font-bold uppercase tracking-wider">
                  <Layers className="w-3.5 h-3.5" />
                  <span>A / Total Global Combiné (Entreprise + Partenaires)</span>
                </div>
                <h2 className="text-xl lg:text-2xl font-black tracking-tight text-white mt-1">
                  Synthèse Consolidée du Modèle Whieda Smart
                </h2>
                <p className="text-xs text-neutral-300 max-w-2xl">
                  Regroupement de l'activité globale : flux monétaires cumulés (chiffre d'affaires boutique & pharmacie + commissions directes générées par le réseau MLM) et points de valeur (PV) injectés.
                </p>
              </div>

              {/* Combined Metric Badges */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="p-4 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl min-w-[210px]">
                  <span className="text-[11px] font-medium text-orange-200 uppercase tracking-wide">
                    Valeur Monétaire Globale (Prix)
                  </span>
                  <p className="text-2xl font-black text-white mt-1 tracking-tight">
                    {formatMoney(combinedTotalMonetaryValue)}
                  </p>
                  <span className="text-[10px] text-neutral-300">
                    Entrées Entreprise ({formatMoney(totalEnterpriseIncomes)}) + Gains Réseau ({formatMoney(totalPartnerEarnings)})
                  </span>
                </div>

                <div className="p-4 bg-amber-500/20 backdrop-blur-md border border-amber-400/30 rounded-2xl min-w-[190px]">
                  <span className="text-[11px] font-medium text-amber-200 uppercase tracking-wide">
                    Total Points de Valeur (PV)
                  </span>
                  <p className="text-2xl font-black text-amber-300 mt-1 tracking-tight">
                    {formatPV(combinedTotalPv)}
                  </p>
                  <span className="text-[10px] text-neutral-300">
                    PV Ventes ({formatPV(totalPosPv)}) + PV Partenaires ({formatPV(totalPartnerPv)})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* PART B : ÉTATS FINANCIERS SÉPARÉS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* 1. FINANCES DE L'ENTREPRISE */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xs overflow-hidden flex flex-col">
              <div className="p-5 border-b border-neutral-100 bg-gradient-to-r from-orange-50 to-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-xs">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900">
                      B.1 — Finances de l'Entreprise
                    </h3>
                    <p className="text-[11px] text-neutral-500">
                      Entrées de fonds réelles vs Dépenses opérationnelles
                    </p>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  enterpriseNetBalance >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {enterpriseNetBalance >= 0 ? 'Trésorerie Positive' : 'Déficit'}
                </span>
              </div>

              <div className="p-5 space-y-4 flex-1">
                {/* Total Entrées */}
                <div className="p-4 bg-orange-50/60 border border-orange-100 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-orange-950 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-orange-600" />
                      <span>Total des Entrées Entreprise</span>
                    </span>
                    <span className="text-lg font-black text-orange-900">
                      {formatMoney(totalEnterpriseIncomes)}
                    </span>
                  </div>

                  {/* Sub-breakdown: Client Sales + Founder Direct Gains */}
                  <div className="pt-2 border-t border-orange-200/60 grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-white/80 p-2 rounded-lg border border-orange-100">
                      <span className="text-neutral-500 block">Prix payés par clients/patients :</span>
                      <strong className="text-neutral-900 font-bold">{formatMoney(totalSalesRevenue)}</strong>
                      <span className="text-[10px] text-neutral-400 block mt-0.5">({validSales.length} factures acquittées)</span>
                    </div>

                    <div className="bg-white/80 p-2 rounded-lg border border-orange-100">
                      <span className="text-neutral-500 block">Gains directs fondateurs :</span>
                      <strong className="text-orange-700 font-bold">{formatMoney(founderDirectEarnings)}</strong>
                      <span className="text-[10px] text-neutral-400 block mt-0.5">({founderPartners.map(p => p.firstName).join(', ')})</span>
                    </div>
                  </div>
                </div>

                {/* Total Dépenses */}
                <div className="p-4 bg-red-50/60 border border-red-100 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-red-950 flex items-center gap-1.5">
                      <TrendingDown className="w-4 h-4 text-red-600" />
                      <span>Total des Dépenses de l'Entreprise</span>
                    </span>
                    <span className="text-lg font-black text-red-600">
                      - {formatMoney(totalExpenses)}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    Cumul des {expenses.length} dépenses enregistrées (salaires, matériel, campagnes, entretien, nutrition, transport).
                  </p>
                </div>

                {/* Solde Net d'Exploitation */}
                <div className="p-4 bg-neutral-900 text-white rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-neutral-400 uppercase tracking-wider block">
                      Solde Net de Trésorerie Entreprise
                    </span>
                    <span className="text-xs text-neutral-300">
                      (Entrées brutes - Dépenses opérationnelles)
                    </span>
                  </div>
                  <span className={`text-xl font-black tracking-tight ${
                    enterpriseNetBalance >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {formatMoney(enterpriseNetBalance)}
                  </span>
                </div>
              </div>

              <div className="px-5 py-3 bg-neutral-50 border-t border-neutral-100 text-right">
                <button
                  onClick={() => setActiveSubTab('expenses')}
                  className="text-xs font-semibold text-orange-600 hover:text-orange-700 inline-flex items-center gap-1"
                >
                  <span>Gérer les dépenses en détail</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 2. FINANCES DES PARTENAIRES */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xs overflow-hidden flex flex-col">
              <div className="p-5 border-b border-neutral-100 bg-gradient-to-r from-blue-50 to-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900">
                      B.2 — Finances des Partenaires (Réseau MLM)
                    </h3>
                    <p className="text-[11px] text-neutral-500">
                      Commissions directes, montants versés et encours restants
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                  {partners.length} Partenaires
                </span>
              </div>

              <div className="p-5 space-y-4 flex-1">
                {/* 1. Total Gains Directs Cumulés */}
                <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-blue-950 block">
                      Total des Gains Directs Cumulés
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      Droits à commissions acquis sur les ventes et affiliations
                    </span>
                  </div>
                  <span className="text-lg font-black text-blue-900">
                    {formatMoney(totalPartnerEarnings)}
                  </span>
                </div>

                {/* 2. Montant Total Payé aux Partenaires */}
                <div className="p-4 bg-green-50/60 border border-green-100 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-green-950 block">
                      Montant Total Déjà Payé
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      Versements effectifs validés (Orange Money, MoMo, Espèces)
                    </span>
                  </div>
                  <span className="text-lg font-black text-green-700">
                    {formatMoney(totalPartnerPaid)}
                  </span>
                </div>

                {/* 3. Reste à Payer Global */}
                <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-amber-950 block">
                      Reste à Payer Global aux Partenaires
                    </span>
                    <span className="text-[11px] text-amber-700 font-medium">
                      Encours de commissions en attente de règlement
                    </span>
                  </div>
                  <span className="text-lg font-black text-amber-800">
                    {formatMoney(totalPartnerRemaining)}
                  </span>
                </div>

                {/* PV Summary Mini-Banner */}
                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-neutral-600 font-medium">Points de Valeur (PV) :</span>
                  <div className="flex items-center gap-3 font-semibold">
                    <span className="text-neutral-700">Total : {formatPV(totalPartnerPv)}</span>
                    <span className="text-green-700">Placés : {formatPV(totalPlacedPv)}</span>
                    <span className="text-amber-700">Restants : {formatPV(totalRemainingPv)}</span>
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 bg-neutral-50 border-t border-neutral-100 text-right">
                <button
                  onClick={() => setActiveSubTab('payouts')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                >
                  <span>Voir le suivi des paiements & PDF</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 2 : GESTION DES DÉPENSES                          */}
      {/* ========================================================= */}
      {activeSubTab === 'expenses' && (
        <div className="space-y-6">
          {/* Header & Category Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {EXPENSE_CATEGORIES.map(cat => {
              const catTotal = expenseByCategory[cat] || 0;
              const percentage = totalExpenses > 0 ? ((catTotal / totalExpenses) * 100).toFixed(0) : '0';
              return (
                <div key={cat} className="p-3 bg-white border border-neutral-200 rounded-xl shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                    {cat}
                  </span>
                  <p className="text-sm font-black text-neutral-900 mt-1">
                    {formatMoney(catTotal)}
                  </p>
                  <div className="w-full bg-neutral-100 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-orange-500 h-full rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-neutral-400 mt-1 block text-right font-medium">
                    {percentage}%
                  </span>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Formulaire d'enregistrement des dépenses (4 colonnes ou card dédiée) */}
            <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs space-y-4">
              <div className="border-b border-neutral-100 pb-3">
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-orange-600" />
                  <span>Enregistrer une Dépense</span>
                </h3>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Saisie d'une charge d'exploitation avec mise à jour en temps réel.
                </p>
              </div>

              <form onSubmit={handleCreateExpense} className="space-y-3.5">
                {/* 1. Date */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    1. Date de la Dépense *
                  </label>
                  <input
                    type="date"
                    required
                    value={expenseForm.date}
                    onChange={e => setExpenseForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-orange-500 focus:outline-hidden"
                  />
                </div>

                {/* 2. Intitulé */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    2. Intitulé de la Dépense *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Facture électricité et eau cabinet"
                    value={expenseForm.title}
                    onChange={e => setExpenseForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-orange-500 focus:outline-hidden"
                  />
                </div>

                {/* 3. Catégorie */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    3. Catégorie de Charge *
                  </label>
                  <select
                    value={expenseForm.category}
                    onChange={e => setExpenseForm(prev => ({ ...prev, category: e.target.value as ExpenseCategory }))}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-orange-500 focus:outline-hidden font-medium"
                  >
                    {EXPENSE_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* 4. Prix (Montant) */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    4. Prix (Montant en FCFA) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="1"
                      step="500"
                      placeholder="ex: 85000"
                      value={expenseForm.amount}
                      onChange={e => setExpenseForm(prev => ({ ...prev, amount: e.target.value }))}
                      className="w-full pl-3 pr-14 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-orange-500 focus:outline-hidden font-bold"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-neutral-400">
                      FCFA
                    </span>
                  </div>
                </div>

                {/* Notes optionnelles */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Commentaire / Justificatif (Optionnel)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Précisions sur la dépense, numéro de facture ou bénéficiaire..."
                    value={expenseForm.notes}
                    onChange={e => setExpenseForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-orange-500 focus:outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Enregistrer la Dépense</span>
                </button>
              </form>
            </div>

            {/* Tableau des dépenses avec boutons Modifier et Supprimer */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-neutral-200 shadow-2xs overflow-hidden flex flex-col">
              {/* Table Toolbar */}
              <div className="p-4 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50/50">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-neutral-900">
                    Registre des Dépenses Réelles
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-200 text-neutral-700">
                    {filteredExpenses.length} enregistrée{filteredExpenses.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Category Filter */}
                  <select
                    value={expenseCategoryFilter}
                    onChange={e => setExpenseCategoryFilter(e.target.value)}
                    className="px-2.5 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg text-neutral-700 focus:outline-hidden"
                  >
                    <option value="all">Toutes catégories</option>
                    {EXPENSE_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>

                  {/* Search */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Filtrer dépenses..."
                      value={expenseSearch}
                      onChange={e => setExpenseSearch(e.target.value)}
                      className="pl-8 pr-2.5 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-hidden w-36 sm:w-48"
                    />
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-neutral-50/80 border-b border-neutral-200 text-neutral-600 font-semibold">
                      <th className="py-2.5 px-3.5 w-24">Date</th>
                      <th className="py-2.5 px-3.5">Intitulé de la Dépense</th>
                      <th className="py-2.5 px-3.5 w-28">Catégorie</th>
                      <th className="py-2.5 px-3.5 w-32 text-right">Prix (FCFA)</th>
                      <th className="py-2.5 px-3.5 w-28">Saisi par</th>
                      <th className="py-2.5 px-3.5 w-28 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredExpenses.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-neutral-400">
                          Aucune dépense ne correspond à vos filtres.
                        </td>
                      </tr>
                    ) : (
                      filteredExpenses.map(exp => (
                        <tr key={exp.id} className="hover:bg-neutral-50/70 transition-colors">
                          {/* Date */}
                          <td className="py-3 px-3.5 text-neutral-600 whitespace-nowrap font-medium">
                            {exp.date}
                          </td>

                          {/* Intitulé */}
                          <td className="py-3 px-3.5">
                            <div className="font-semibold text-neutral-900">{exp.title}</div>
                            {exp.notes && (
                              <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1">{exp.notes}</p>
                            )}
                          </td>

                          {/* Catégorie */}
                          <td className="py-3 px-3.5">
                            <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              exp.category === 'Nutrition' ? 'bg-emerald-100 text-emerald-800' :
                              exp.category === 'Transport' ? 'bg-sky-100 text-sky-800' :
                              exp.category === 'Salaire' ? 'bg-purple-100 text-purple-800' :
                              exp.category === 'Entretien' ? 'bg-teal-100 text-teal-800' :
                              exp.category === 'Campagnes' ? 'bg-pink-100 text-pink-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {exp.category}
                            </span>
                          </td>

                          {/* Prix (Montant) */}
                          <td className="py-3 px-3.5 text-right font-bold text-red-600 whitespace-nowrap">
                            {formatMoney(exp.amount)}
                          </td>

                          {/* Saisi par */}
                          <td className="py-3 px-3.5 text-neutral-500 text-[11px] whitespace-nowrap truncate max-w-[110px]" title={exp.recordedBy}>
                            {exp.recordedBy}
                          </td>

                          {/* Actions : Modifier et Supprimer (OBLIGATOIRES) */}
                          <td className="py-3 px-3.5 text-center whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              {/* Bouton Modifier */}
                              <button
                                onClick={() => setEditingExpense(exp)}
                                className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Modifier cette dépense"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              {/* Bouton Supprimer */}
                              <button
                                onClick={() => setExpenseToDelete(exp)}
                                className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                                title="Supprimer définitivement"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Total Footer */}
              <div className="p-3.5 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between text-xs font-bold text-neutral-900">
                <span>Total Cumulé des Dépenses :</span>
                <span className="text-red-600 text-sm">{formatMoney(totalExpenses)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 3 : FINANCES PARTENAIRES & SUIVI DES PAIEMENTS    */}
      {/* ========================================================= */}
      {activeSubTab === 'payouts' && (
        <div className="space-y-6">
          {/* Top Bar with PDF Export & Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>État des Paiements des Partenaires & Suivi des PV</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Historique des règlements de commissions et placement des points de valeur (PV) dans le réseau.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadPayoutsPDF}
                className="px-3.5 py-2 bg-neutral-900 hover:bg-black text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
                title="Télécharger l'état certifié sous format PDF"
              >
                <Download className="w-3.5 h-3.5 text-orange-400" />
                <span>Télécharger l'État (PDF)</span>
              </button>

              <button
                onClick={() => handleOpenPayoutModal()}
                className="px-3.5 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nouveau Paiement</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white border border-neutral-200 rounded-2xl shadow-2xs">
              <span className="text-xs text-neutral-500 font-medium">Total des Gains Reconnus Réseau</span>
              <p className="text-xl font-black text-neutral-900 mt-1">{formatMoney(totalPartnerEarnings)}</p>
            </div>
            <div className="p-4 bg-white border border-green-200 rounded-2xl shadow-2xs">
              <span className="text-xs text-green-700 font-semibold">Montant Total Réglé aux Partenaires</span>
              <p className="text-xl font-black text-green-600 mt-1">{formatMoney(totalPartnerPaid)}</p>
            </div>
            <div className="p-4 bg-white border border-amber-200 rounded-2xl shadow-2xs">
              <span className="text-xs text-amber-700 font-semibold">Reste Global à Régler</span>
              <p className="text-xl font-black text-amber-700 mt-1">{formatMoney(totalPartnerRemaining)}</p>
            </div>
          </div>

          {/* Table of Payout Records */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50/50">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                  Tableau de Suivi des Versements ({partnerPayouts.length} opération{partnerPayouts.length > 1 ? 's' : ''})
                </h4>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher partenaire, ID..."
                  value={payoutSearch}
                  onChange={e => setPayoutSearch(e.target.value)}
                  className="pl-8 pr-2.5 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-hidden w-56"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-neutral-50/80 border-b border-neutral-200 text-neutral-600 font-semibold">
                    <th className="py-3 px-4 w-28">1. Date</th>
                    <th className="py-3 px-4">2. Partenaire</th>
                    <th className="py-3 px-4 w-32">3. ID Partenaire</th>
                    <th className="py-3 px-4 w-36 text-right">4. Montant Payé</th>
                    <th className="py-3 px-4 w-28 text-right">5. PV Placés</th>
                    <th className="py-3 px-4 w-36">Mode / Réf.</th>
                    <th className="py-3 px-4 w-32">Enregistré par</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredPayouts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-neutral-400">
                        Aucun versement enregistré pour le moment.
                      </td>
                    </tr>
                  ) : (
                    filteredPayouts.map(p => (
                      <tr key={p.id} className="hover:bg-neutral-50/60 transition-colors">
                        {/* 1. Date */}
                        <td className="py-3 px-4 text-neutral-600 whitespace-nowrap font-medium">
                          {p.date}
                        </td>

                        {/* 2. Partenaire */}
                        <td className="py-3 px-4">
                          <span className="font-bold text-neutral-900">{p.partnerName}</span>
                          {p.notes && (
                            <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1">{p.notes}</p>
                          )}
                        </td>

                        {/* 3. ID Partenaire */}
                        <td className="py-3 px-4 font-mono font-bold text-orange-600 whitespace-nowrap">
                          {p.partnerCode}
                        </td>

                        {/* 4. Montant Payé */}
                        <td className="py-3 px-4 text-right font-black text-green-600 whitespace-nowrap">
                          {formatMoney(p.amountPaid)}
                        </td>

                        {/* 5. PV Placés */}
                        <td className="py-3 px-4 text-right font-bold text-amber-600 whitespace-nowrap">
                          {formatPV(p.pvPlaced)}
                        </td>

                        {/* Mode / Réf */}
                        <td className="py-3 px-4 text-neutral-600 text-[11px] whitespace-nowrap">
                          <span className="capitalize">{p.paymentMethod?.replace('_', ' ') || 'Virement'}</span>
                          {p.reference && (
                            <span className="block text-neutral-400 font-mono text-[10px]">
                              {p.reference}
                            </span>
                          )}
                        </td>

                        {/* Enregistré par */}
                        <td className="py-3 px-4 text-neutral-500 text-[11px] whitespace-nowrap truncate max-w-[120px]" title={p.recordedBy}>
                          {p.recordedBy}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Total Footer */}
            <div className="p-3.5 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between text-xs font-bold text-neutral-900">
              <span>Total des Règlements Effectués :</span>
              <div className="flex items-center gap-4">
                <span className="text-green-600 font-black text-sm">
                  {formatMoney(partnerPayouts.reduce((sum, p) => sum + p.amountPaid, 0))}
                </span>
                <span className="text-amber-600 font-bold">
                  {formatPV(partnerPayouts.reduce((sum, p) => sum + p.pvPlaced, 0))} placés
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL : MODIFIER UNE DÉPENSE                              */}
      {/* ========================================================= */}
      {editingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-600" />
                <span>Modifier la Dépense</span>
              </h3>
              <button
                onClick={() => setEditingExpense(null)}
                className="text-neutral-400 hover:text-neutral-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateExpenseSubmit} className="space-y-3.5">
              {/* Date */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={editingExpense.date}
                  onChange={e => setEditingExpense({ ...editingExpense, date: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Intitulé */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Intitulé
                </label>
                <input
                  type="text"
                  required
                  value={editingExpense.title}
                  onChange={e => setEditingExpense({ ...editingExpense, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Catégorie */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Catégorie
                </label>
                <select
                  value={editingExpense.category}
                  onChange={e => setEditingExpense({ ...editingExpense, category: e.target.value as ExpenseCategory })}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-hidden font-medium"
                >
                  {EXPENSE_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Montant */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Prix (Montant en FCFA)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="500"
                  value={editingExpense.amount}
                  onChange={e => setEditingExpense({ ...editingExpense, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-hidden font-bold"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={editingExpense.notes || ''}
                  onChange={e => setEditingExpense({ ...editingExpense, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingExpense(null)}
                  className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
                >
                  Enregistrer les Modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL : CONFIRMATION SUPPRESSION DÉPENSE                  */}
      {/* ========================================================= */}
      {expenseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-neutral-900">
                Confirmer la suppression ?
              </h3>
              <p className="text-xs text-neutral-500">
                Êtes-vous sûr de vouloir supprimer la dépense : <br/>
                <strong className="text-neutral-900">"{expenseToDelete.title}"</strong> ({formatMoney(expenseToDelete.amount)}) ?
              </p>
              <p className="text-[11px] text-red-600 font-semibold pt-1">
                Cette action sera immédiatement enregistrée dans le Journal d'Audit.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setExpenseToDelete(null)}
                className="flex-1 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-semibold"
              >
                Annuler
              </button>
              <button
                onClick={confirmDeleteExpense}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL : ENREGISTRER UN PAIEMENT PARTENAIRE               */}
      {/* ========================================================= */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-green-600" />
                <span>Enregistrer un Paiement Partenaire</span>
              </h3>
              <button
                onClick={() => setIsPayoutModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePayoutSubmit} className="space-y-3.5">
              {/* Partner Select */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Partenaire Bénéficiaire *
                </label>
                <select
                  required
                  value={payoutForm.partnerId}
                  onChange={e => {
                    const found = partners.find(p => p.id === e.target.value);
                    setPayoutForm(prev => ({
                      ...prev,
                      partnerId: e.target.value,
                      amountPaid: found ? String(found.remainingEarnings) : prev.amountPaid,
                      pvPlaced: found ? String(found.remainingPv) : prev.pvPlaced,
                    }));
                  }}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-green-500 focus:outline-hidden font-medium"
                >
                  {partners.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName} ({p.code}) — Dû: {formatMoney(p.remainingEarnings)} | PV Restant: {p.remainingPv}
                    </option>
                  ))}
                </select>
              </div>

              {/* Info Banner on selected partner */}
              {selectedPartnerObj && (
                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-neutral-500">Reste à payer actuel :</span>
                    <strong className="block text-amber-700 font-bold">
                      {formatMoney(selectedPartnerObj.remainingEarnings)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-neutral-500">PV non encore placés :</span>
                    <strong className="block text-amber-700 font-bold">
                      {formatPV(selectedPartnerObj.remainingPv)}
                    </strong>
                  </div>
                </div>
              )}

              {/* Date */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Date de Paiement *
                </label>
                <input
                  type="date"
                  required
                  value={payoutForm.date}
                  onChange={e => setPayoutForm(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-green-500 focus:outline-hidden"
                />
              </div>

              {/* Montant Payé & PV Placés */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Montant Payé (FCFA) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="500"
                    placeholder="Montant FCFA"
                    value={payoutForm.amountPaid}
                    onChange={e => setPayoutForm(prev => ({ ...prev, amountPaid: e.target.value }))}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-green-500 focus:outline-hidden font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    PV Placés
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="PV à placer"
                    value={payoutForm.pvPlaced}
                    onChange={e => setPayoutForm(prev => ({ ...prev, pvPlaced: e.target.value }))}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-green-500 focus:outline-hidden font-bold"
                  />
                </div>
              </div>

              {/* Mode de règlement & Référence */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Mode de Paiement
                  </label>
                  <select
                    value={payoutForm.paymentMethod}
                    onChange={e => setPayoutForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-green-500 focus:outline-hidden font-medium"
                  >
                    <option value="orange_money">Orange Money</option>
                    <option value="mtn_momo">MTN MoMo</option>
                    <option value="especes">Espèces (Caisse)</option>
                    <option value="carte">Virement / Carte</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Référence Reçu / ID
                  </label>
                  <input
                    type="text"
                    placeholder="ex: OM-2026-004"
                    value={payoutForm.reference}
                    onChange={e => setPayoutForm(prev => ({ ...prev, reference: e.target.value }))}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-green-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Motif / Commentaire
                </label>
                <input
                  type="text"
                  placeholder="Règlement quinzaine commissions directes..."
                  value={payoutForm.notes}
                  onChange={e => setPayoutForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-green-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPayoutModalOpen(false)}
                  className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
                >
                  Valider le Paiement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
