import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ProductService, SaleItem, PaymentMethod, Sale } from '../types';
import { formatMoney, formatPV } from '../utils/formatters';
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  Printer, 
  User, 
  Link as LinkIcon, 
  Check, 
  X, 
  Percent, 
  Sparkles,
  Smartphone,
  FileText,
  DollarSign,
  Receipt,
  FileDown,
  CheckCircle,
  Download
} from 'lucide-react';
import { generateInvoicePDF } from '../utils/pdfGenerator';

export const PosView: React.FC = () => {
  const { products, patients, partners, completeSale, currentUser, sales, companySettings } = useApp();

  // Tab: 'pos' (Caisse active) or 'invoices' (Factures & Historique)
  const [activePosTab, setActivePosTab] = useState<'pos' | 'invoices'>('pos');
  const [invoiceSearch, setInvoiceSearch] = useState('');

  // PDF Export Feedback and View Mode
  const [pdfNotification, setPdfNotification] = useState<string | null>(null);
  const [receiptViewMode, setReceiptViewMode] = useState<'invoice_a4' | 'ticket'>('invoice_a4');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [customPatientName, setCustomPatientName] = useState<string>('');
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('orange_money');
  const [paymentRef, setPaymentRef] = useState<string>('');

  // Receipt Modal
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const handleDownloadPdf = (sale: Sale) => {
    try {
      generateInvoicePDF(sale, companySettings);
      setPdfNotification(`Facture PDF ${sale.receiptNumber} générée et téléchargée avec succès !`);
      setTimeout(() => setPdfNotification(null), 4000);
    } catch (err) {
      console.error('Erreur génération PDF :', err);
      // Fallback to print
      window.print();
    }
  };

  // Auto-detect sponsor when patient is selected
  const handleSelectPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
    if (!patientId) {
      setSelectedPartnerId('');
      setCustomPatientName('');
      return;
    }
    const pat = patients.find(p => p.id === patientId);
    if (pat) {
      setCustomPatientName(pat.fullName);
      if (pat.sponsorPartnerId) {
        setSelectedPartnerId(pat.sponsorPartnerId);
      }
    }
  };

  const handleAddToCart = (product: ProductService) => {
    // Check if item in stock
    const isPhysical = product.category !== 'services';
    const existingInCart = cart.find(i => i.productId === product.id);
    const currentQtyInCart = existingInCart ? existingInCart.quantity : 0;


    if (isPhysical && product.stockQuantity <= currentQtyInCart) {
      alert(`Stock insuffisant pour ${product.name} (Quantité en stock: ${product.stockQuantity})`);
      return;
    }

    if (existingInCart) {
      setCart(cart.map(item =>
        item.productId === product.id
          ? {
              ...item,
              quantity: item.quantity + 1,
              subtotal: (item.quantity + 1) * item.patientPrice,
            }
          : item
      ));
    } else {
      const newItem: SaleItem = {
        productId: product.id,
        sku: product.sku,
        productName: product.name,
        category: product.category,
        patientPrice: product.patientPrice,
        partnerPrice: product.partnerPrice,
        itemGain: product.directMargin,
        pv: product.pv,
        quantity: 1,
        subtotal: product.patientPrice,
      };
      setCart([...cart, newItem]);
    }
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    const prod = products.find(p => p.id === productId);
    const item = cart.find(i => i.productId === productId);
    if (!item) return;

    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      setCart(cart.filter(i => i.productId !== productId));
      return;
    }

    if (prod && prod.category !== 'services' && newQty > prod.stockQuantity) {
      alert(`Stock maximum atteint (${prod.stockQuantity} disponibles).`);
      return;
    }


    setCart(cart.map(i =>
      i.productId === productId
        ? { ...i, quantity: newQty, subtotal: newQty * i.patientPrice }
        : i
    ));
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(cart.filter(i => i.productId !== productId));
  };

  const totalGross = cart.reduce((acc, item) => acc + item.subtotal, 0);
  const netTotal = Math.max(0, totalGross - discountAmount);
  const totalPv = cart.reduce((acc, item) => acc + (item.pv * item.quantity), 0);
  const totalPartnerMargin = cart.reduce((acc, item) => acc + (item.itemGain * item.quantity), 0);

  const selectedPartner = partners.find(p => p.id === selectedPartnerId);

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const patientName = customPatientName.trim() || 'Client Comptoir';
    const sale = completeSale({
      patientId: selectedPatientId || undefined,
      patientName,
      sponsorPartnerId: selectedPartner?.id,
      sponsorPartnerName: selectedPartner ? `${selectedPartner.firstName} ${selectedPartner.lastName}` : undefined,
      sponsorPartnerCode: selectedPartner?.code,
      items: cart,
      discountAmount,
      paymentMethod,
      paymentReference: paymentRef || undefined,
    });

    setLastSale(sale);
    setIsReceiptOpen(true);

    // Reset cart
    setCart([]);
    setDiscountAmount(0);
    setPaymentRef('');
  };

  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const filteredSales = sales.filter(s => {
    const q = invoiceSearch.toLowerCase();
    return (
      s.receiptNumber.toLowerCase().includes(q) ||
      s.patientName.toLowerCase().includes(q) ||
      (s.sponsorPartnerName && s.sponsorPartnerName.toLowerCase().includes(q)) ||
      (s.paymentReference && s.paymentReference.toLowerCase().includes(q)) ||
      s.cashierName.toLowerCase().includes(q)
    );
  });

  const totalInvoiced = sales.reduce((acc, s) => acc + s.netAmount, 0);
  const totalPvInvoiced = sales.reduce((acc, s) => acc + s.totalPv, 0);
  const totalCommissions = sales.reduce((acc, s) => acc + s.totalPartnerGain, 0);

  return (
    <div className="space-y-6">
      {/* Toast Notification PDF Export */}
      {pdfNotification && (
        <div className="fixed top-20 right-6 z-50 max-w-md bg-neutral-900 text-white p-4 rounded-xl shadow-2xl border border-orange-500/50 flex items-start gap-3 animate-in fade-in slide-in-from-top-4 no-print">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-semibold block text-emerald-300">Exportation Réussie</span>
            <p className="mt-0.5 text-neutral-200">{pdfNotification}</p>
          </div>
          <button onClick={() => setPdfNotification(null)} className="ml-auto text-neutral-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Sub-nav toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
            Caisse Enregistreuse & Factures (POS)
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Encaissement direct, déduction immédiate des stocks, factures officielles et suivi des PV
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 bg-neutral-200/80 rounded-xl">
            <button
              onClick={() => setActivePosTab('pos')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activePosTab === 'pos'
                  ? 'bg-white text-orange-600 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Caisse & Vente</span>
            </button>
            <button
              onClick={() => setActivePosTab('invoices')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activePosTab === 'invoices'
                  ? 'bg-white text-orange-600 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Factures & Ventes ({sales.length})</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono bg-neutral-100 px-3 py-1.5 rounded-lg text-neutral-600">
            <span>Poste :</span>
            <span className="font-bold text-neutral-900">{currentUser.fullName}</span>
          </div>
        </div>
      </div>

      {/* VIEW 1: POS REGISTER */}
      {activePosTab === 'pos' && (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Product Catalog (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-neutral-200 shadow-xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Rechercher par article, médicament ou code..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg shrink-0 flex-wrap">
              {[
                { id: 'all', label: 'Tous' },
                { id: 'regulateur', label: 'Régulateur' },
                { id: 'nettoyage', label: 'Nettoyage' },
                { id: 'entretien', label: 'Entretien' },
                { id: 'alimentation', label: 'Alimentation' },
                { id: 'soins', label: 'Soins' },
                { id: 'services', label: 'Services' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 text-xs rounded font-medium transition-all ${
                    selectedCategory === cat.id ? 'bg-white text-orange-900 shadow-xs font-bold' : 'text-neutral-600'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>


          {/* Product Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[560px] overflow-y-auto pr-1">
            {filteredProducts.map(p => {
              const isPhysical = p.category !== 'services';
              const outOfStock = isPhysical && p.stockQuantity <= 0;


              return (
                <div
                  key={p.id}
                  onClick={() => !outOfStock && handleAddToCart(p)}
                  className={`p-3 rounded-xl border transition-all text-left flex flex-col justify-between ${
                    outOfStock
                      ? 'border-neutral-200 bg-neutral-50/70 opacity-60 cursor-not-allowed'
                      : 'border-neutral-200 hover:border-orange-400 hover:shadow-xs cursor-pointer bg-white'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-700 font-semibold">
                        {p.sku}
                      </span>
                      <span className="text-[10px] font-bold text-amber-700 font-mono">
                        +{formatPV(p.pv)}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-neutral-900 line-clamp-2">
                      {p.name}
                    </h4>
                  </div>

                  <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-neutral-900 font-mono">
                        {formatMoney(p.patientPrice)}
                      </div>
                      <div className="text-[10px] text-emerald-600 font-medium">
                        Gain: +{formatMoney(p.directMargin)}
                      </div>
                    </div>

                    <div className="text-right">
                      {isPhysical ? (
                        <span className={`text-[11px] font-mono font-medium ${p.stockQuantity <= p.minStockThreshold ? 'text-red-600' : 'text-neutral-500'}`}>
                          Stock: {p.stockQuantity}
                        </span>
                      ) : (
                        <span className="text-[11px] text-neutral-400">Service</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Cart, Patient & Sponsor Linking, Checkout (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-neutral-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-orange-600" />
              <h3 className="text-sm font-bold text-neutral-900">
                Panier ({cart.length} article{cart.length > 1 ? 's' : ''})
              </h3>
            </div>
            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                className="text-xs text-neutral-400 hover:text-red-600 transition-colors"
              >
                Vider
              </button>
            )}
          </div>

          {/* Patient & Parrain Linking Section */}
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Client / Patient au comptoir :
              </label>
              <select
                value={selectedPatientId}
                onChange={e => handleSelectPatient(e.target.value)}
                className="w-full text-xs p-2 border border-neutral-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="">-- Client Comptoir (Non enregistré) --</option>
                {patients.map(pat => (
                  <option key={pat.id} value={pat.id}>
                    {pat.fullName} ({pat.phone}) · Parrain: {pat.sponsorPartnerName || 'N/A'}
                  </option>
                ))}
              </select>
            </div>

            {/* Sponsor Partner (Auto-detected or selectable) */}
            <div className="p-2.5 bg-orange-50/70 border border-orange-200 rounded-lg space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-orange-950 flex items-center gap-1">
                  <LinkIcon className="w-3 h-3 text-orange-600" />
                  <span>Partenaire Parrain (Bénéficiaire MLM) :</span>
                </span>
              </div>

              <select
                value={selectedPartnerId}
                onChange={e => setSelectedPartnerId(e.target.value)}
                className="w-full text-xs p-1.5 border border-orange-300 bg-white rounded-md text-neutral-900 font-medium"
              >
                <option value="">-- Aucun partenaire parrain (Vente directe) --</option>
                {partners.map(ptn => (
                  <option key={ptn.id} value={ptn.id}>
                    {ptn.firstName} {ptn.lastName} ({ptn.code})
                  </option>
                ))}
              </select>

              {selectedPartner && (
                <div className="text-[11px] text-orange-800 flex justify-between pt-1">
                  <span>Gain parrain : <strong className="font-mono">+{formatMoney(totalPartnerMargin)}</strong></span>
                  <span>PV parrain : <strong className="font-mono">+{formatPV(totalPv)}</strong></span>
                </div>
              )}
            </div>
          </div>

          {/* Cart Items List */}
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {cart.length === 0 ? (
              <div className="py-8 text-center text-neutral-400 text-xs">
                Le panier est vide. Sélectionnez des produits ou services dans le catalogue à gauche.
              </div>
            ) : (
              cart.map(item => (
                <div
                  key={item.productId}
                  className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-100 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-neutral-900 truncate">
                      {item.productName}
                    </div>
                    <div className="text-[10px] text-neutral-500 font-mono">
                      {formatMoney(item.patientPrice)} × {item.quantity} · PV: {item.pv * item.quantity}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleUpdateQuantity(item.productId, -1)}
                      className="w-6 h-6 rounded bg-white border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-100"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-bold font-mono text-neutral-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdateQuantity(item.productId, 1)}
                      className="w-6 h-6 rounded bg-white border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-100"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleRemoveFromCart(item.productId)}
                      className="p-1 text-neutral-400 hover:text-red-600 ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Discount & Totals */}
          <div className="pt-3 border-t border-neutral-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-neutral-500">Sous-total Brut :</span>
              <span className="font-mono font-medium text-neutral-900">{formatMoney(totalGross)}</span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-neutral-500 flex items-center gap-1">
                <Percent className="w-3.5 h-3.5 text-neutral-400" />
                <span>Remise commerciale (FCFA) :</span>
              </span>
              <input
                type="number"
                min={0}
                max={totalGross}
                value={discountAmount}
                onChange={e => setDiscountAmount(Number(e.target.value))}
                className="w-24 text-right p-1 border border-neutral-300 rounded font-mono text-xs"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-neutral-200 text-sm font-bold">
              <span className="text-neutral-900">Net à Payer :</span>
              <span className="font-mono text-red-600 text-base">{formatMoney(netTotal)}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-700 mb-1.5">
              Mode de Règlement
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPaymentMethod('orange_money')}
                className={`p-2 rounded-lg border font-medium flex items-center justify-center gap-1.5 transition-all ${
                  paymentMethod === 'orange_money'
                    ? 'border-orange-500 bg-orange-50 text-orange-900 font-bold'
                    : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-orange-600" />
                <span>Orange Money</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('mtn_momo')}
                className={`p-2 rounded-lg border font-medium flex items-center justify-center gap-1.5 transition-all ${
                  paymentMethod === 'mtn_momo'
                    ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold'
                    : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-amber-600" />
                <span>MTN MoMo</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('especes')}
                className={`p-2 rounded-lg border font-medium flex items-center justify-center gap-1.5 transition-all ${
                  paymentMethod === 'especes'
                    ? 'border-neutral-800 bg-neutral-900 text-white font-bold'
                    : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                }`}
              >
                <span>Espèces Guichet</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('carte')}
                className={`p-2 rounded-lg border font-medium flex items-center justify-center gap-1.5 transition-all ${
                  paymentMethod === 'carte'
                    ? 'border-neutral-800 bg-neutral-900 text-white font-bold'
                    : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Carte Bancaire</span>
              </button>
            </div>
          </div>

          {/* Reference transaction */}
          <div>
            <input
              type="text"
              placeholder="Réf. transaction (ex: OM-83920)..."
              value={paymentRef}
              onChange={e => setPaymentRef(e.target.value)}
              className="w-full text-xs p-2 border border-neutral-200 rounded-lg font-mono"
            />
          </div>

          {/* Checkout Button */}
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className={`w-full py-3 px-4 rounded-xl text-xs font-bold text-white shadow-sm transition-all flex items-center justify-center gap-2 ${
              cart.length > 0
                ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 cursor-pointer'
                : 'bg-neutral-300 cursor-not-allowed'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>Valider l'Encaissement & Imprimer Ticket</span>
          </button>
        </div>
      </div>
      )}

      {/* VIEW 2: FACTURES & HISTORIQUE DES VENTES */}
      {activePosTab === 'invoices' && (
        <div className="space-y-6">
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs flex items-center gap-3">
              <div className="p-3 rounded-xl bg-orange-50 text-orange-600">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-neutral-400 block font-semibold uppercase">Total Encaissé</span>
                <span className="text-xl font-black text-neutral-900 font-mono">{formatMoney(totalInvoiced)}</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs flex items-center gap-3">
              <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-neutral-400 block font-semibold uppercase">Points Valeur (PV)</span>
                <span className="text-xl font-black text-amber-600 font-mono">{formatPV(totalPvInvoiced)}</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs flex items-center gap-3">
              <div className="p-3 rounded-xl bg-red-50 text-red-600">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-neutral-400 block font-semibold uppercase">Gains Parrains (MLM)</span>
                <span className="text-xl font-black text-red-600 font-mono">{formatMoney(totalCommissions)}</span>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50/50">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Rechercher par N° ticket, nom du client ou caissier..."
                  value={invoiceSearch}
                  onChange={e => setInvoiceSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <span className="text-xs text-neutral-500 font-medium">
                {filteredSales.length} facture(s) trouvée(s)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider text-[10px] border-b border-neutral-200">
                  <tr>
                    <th className="py-3 px-4">N° Facture / Reçu</th>
                    <th className="py-3 px-4">Date & Heure</th>
                    <th className="py-3 px-4">Client</th>
                    <th className="py-3 px-4">Caissier</th>
                    <th className="py-3 px-4">Parrain MLM</th>
                    <th className="py-3 px-4">Articles</th>
                    <th className="py-3 px-4">Règlement</th>
                    <th className="py-3 px-4 text-right">Total Net</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {filteredSales.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-neutral-400">
                        Aucune facture trouvée pour cette recherche.
                      </td>
                    </tr>
                  ) : (
                    filteredSales.map(sale => (
                      <tr key={sale.id} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-neutral-900">
                          {sale.receiptNumber}
                        </td>
                        <td className="py-3 px-4 text-neutral-600 font-mono">
                          {sale.date} <span className="text-neutral-400">· {sale.time}</span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-neutral-800">
                          {sale.patientName}
                        </td>
                        <td className="py-3 px-4 text-neutral-600">
                          {sale.cashierName}
                        </td>
                        <td className="py-3 px-4">
                          {sale.sponsorPartnerName ? (
                            <div className="text-[11px]">
                              <span className="font-semibold text-orange-950 block">{sale.sponsorPartnerName}</span>
                              <span className="text-orange-600 font-mono">{sale.sponsorPartnerCode}</span>
                            </div>
                          ) : (
                            <span className="text-neutral-400 italic">Sans parrain</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-neutral-600 font-mono">
                          {sale.items.reduce((sum, item) => sum + item.quantity, 0)} art.
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-700">
                            {sale.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-black text-neutral-900">
                          {formatMoney(sale.netAmount)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleDownloadPdf(sale)}
                              className="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 font-semibold transition-colors inline-flex items-center gap-1 border border-orange-200"
                              title="Télécharger la facture officielle en PDF"
                            >
                              <FileDown className="w-3.5 h-3.5" />
                              <span>PDF</span>
                            </button>
                            <button
                              onClick={() => {
                                setLastSale(sale);
                                setIsReceiptOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium transition-colors inline-flex items-center gap-1 border border-neutral-200"
                              title="Afficher et imprimer la facture"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Reçu</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Receipt & Invoice Modal */}
      {isReceiptOpen && lastSale && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className={`bg-white rounded-2xl w-full border border-neutral-200 shadow-2xl p-6 space-y-4 my-8 transition-all ${
            receiptViewMode === 'invoice_a4' ? 'max-w-2xl' : 'max-w-sm'
          }`}>
            {/* Top Toolbar (hidden on print) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 pb-3 no-print">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <Check className="w-4 h-4" /> Vente Encaissée
                </span>
                <span className="font-mono text-xs font-bold text-neutral-800">
                  {lastSale.receiptNumber}
                </span>
              </div>

              {/* Format Switcher */}
              <div className="flex items-center gap-2">
                <div className="flex items-center p-0.5 bg-neutral-100 rounded-lg text-[11px] font-semibold">
                  <button
                    onClick={() => setReceiptViewMode('invoice_a4')}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      receiptViewMode === 'invoice_a4'
                        ? 'bg-white text-orange-700 shadow-xs'
                        : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    Facture A4
                  </button>
                  <button
                    onClick={() => setReceiptViewMode('ticket')}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      receiptViewMode === 'ticket'
                        ? 'bg-white text-orange-700 shadow-xs'
                        : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    Ticket 80mm
                  </button>
                </div>

                {/* Primary Action: Download PDF */}
                <button
                  onClick={() => handleDownloadPdf(lastSale)}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                  title="Télécharger la facture en format PDF officiel"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Télécharger PDF</span>
                </button>

                {/* Print button */}
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-neutral-900 hover:bg-black text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                  title="Imprimer directement"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Imprimer</span>
                </button>

                {/* Close */}
                <button
                  onClick={() => setIsReceiptOpen(false)}
                  className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* FORMAT 1: FACTURE COMMERCIALE A4 */}
            {receiptViewMode === 'invoice_a4' ? (
              <div className="print-page bg-white p-4 sm:p-6 rounded-xl border border-neutral-100 text-neutral-900 space-y-4 text-xs">
                {/* Letterhead */}
                <div className="flex items-start justify-between border-b-2 border-orange-600 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-red-600 to-orange-500 text-white flex items-center justify-center font-black text-base">
                        W
                      </div>
                      <span className="text-lg font-black tracking-tight text-neutral-900">
                        {companySettings?.name || 'WHIEDA SMART'}
                      </span>
                    </div>
                    <p className="text-[10px] text-neutral-500 mt-0.5">
                      {companySettings?.tagline || 'Cabinet de Santé, Pharmacie Naturelle & Prospérité Partagée'}
                    </p>
                    <p className="text-[10px] text-neutral-400">
                      {companySettings?.address || 'Boulevard de la Liberté, Akwa - Douala, Cameroun'}
                    </p>
                    <p className="text-[10px] text-neutral-400">
                      Tél : {companySettings?.phone || '(+237) 699 00 11 22'} · Email : {companySettings?.email || 'contact@whiedasmart.com'}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase tracking-wider border border-emerald-200">
                      Facture Acquittée
                    </span>
                    <div className="text-base font-black font-mono text-orange-600 mt-1">
                      N° {lastSale.receiptNumber}
                    </div>
                    <div className="text-[10px] text-neutral-500 font-mono">
                      Date : {lastSale.date} à {lastSale.time}
                    </div>
                  </div>
                </div>

                {/* Client & Cashier Information */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200/80">
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Facturé à</span>
                    <div className="font-extrabold text-neutral-900 text-sm mt-0.5">{lastSale.patientName}</div>
                    {lastSale.sponsorPartnerName ? (
                      <div className="text-[11px] text-orange-900 mt-1 font-medium">
                        Parrain MLM : <span className="font-bold">{lastSale.sponsorPartnerName}</span> ({lastSale.sponsorPartnerCode})
                      </div>
                    ) : (
                      <div className="text-[11px] text-neutral-400 italic mt-1">Client direct (sans parrain)</div>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Modalités de Caisse</span>
                    <div className="font-semibold text-neutral-800 mt-0.5">Caissier(e) : {lastSale.cashierName}</div>
                    <div className="text-[11px] text-neutral-600 font-mono mt-0.5">
                      Règlement : <span className="font-bold uppercase">{lastSale.paymentMethod}</span>
                      {lastSale.paymentReference && ` (Réf: ${lastSale.paymentReference})`}
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <div className="border border-neutral-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-100 text-neutral-600 uppercase text-[10px] font-bold border-b border-neutral-200">
                      <tr>
                        <th className="p-2.5">Code</th>
                        <th className="p-2.5">Désignation</th>
                        <th className="p-2.5 text-center">Qté</th>
                        <th className="p-2.5 text-right">P.U (FCFA)</th>
                        <th className="p-2.5 text-right">PV</th>
                        <th className="p-2.5 text-right">Total (FCFA)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 text-neutral-800">
                      {lastSale.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-neutral-50/50">
                          <td className="p-2.5 font-mono text-neutral-500 text-[11px]">{item.sku}</td>
                          <td className="p-2.5 font-bold text-neutral-900">{item.productName}</td>
                          <td className="p-2.5 text-center font-mono">{item.quantity}</td>
                          <td className="p-2.5 text-right font-mono text-neutral-600">{formatMoney(item.patientPrice)}</td>
                          <td className="p-2.5 text-right font-mono font-bold text-amber-600">+{item.pv * item.quantity} PV</td>
                          <td className="p-2.5 text-right font-mono font-bold text-neutral-900">{formatMoney(item.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Financial Summary & Stamp */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {/* Left advice */}
                  <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 text-[11px] text-amber-950 space-y-1">
                    <span className="font-bold block text-amber-900">Conseils & Validité :</span>
                    <p>• Conservez cette facture comme preuve d'achat et garantie de conformité.</p>
                    <p>• Points de Valeur (PV) automatiquement crédités sur le compte du parrain.</p>
                    <p className="text-[10px] text-amber-800 font-mono mt-1">Authentification : Système Whieda Smart ERP</p>
                  </div>

                  {/* Right totals box */}
                  <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 text-xs space-y-1.5">
                    <div className="flex justify-between text-neutral-600">
                      <span>Sous-total Brut :</span>
                      <span className="font-mono">{formatMoney(lastSale.totalAmount)}</span>
                    </div>
                    {lastSale.discountAmount > 0 && (
                      <div className="flex justify-between text-red-600 font-semibold">
                        <span>Remise commerciale :</span>
                        <span className="font-mono">-{formatMoney(lastSale.discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-black text-sm text-neutral-900 border-t border-neutral-300 pt-1.5">
                      <span>TOTAL NET ACQUITTÉ :</span>
                      <span className="font-mono text-orange-600 text-base">{formatMoney(lastSale.netAmount)}</span>
                    </div>
                    {lastSale.totalPv > 0 && (
                      <div className="flex justify-between text-amber-700 font-bold text-[11px] pt-0.5">
                        <span>Points Valeur Total :</span>
                        <span>+{formatPV(lastSale.totalPv)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Stamp */}
                <div className="pt-3 border-t border-neutral-200 flex items-center justify-between text-[10px] text-neutral-400">
                  <span>Document officiel délivré au client le jour de la transaction.</span>
                  <div className="font-mono font-semibold text-neutral-500">Whieda Smart Caisse POS · Akwa Douala</div>
                </div>
              </div>
            ) : (
              /* FORMAT 2: TICKET THERMIQUE 80MM */
              <div className="print-page text-center font-mono text-[11px] space-y-3 text-neutral-900 bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                <div className="space-y-0.5">
                  <div className="text-base font-extrabold tracking-tight">WHIEDA SMART</div>
                  <div className="text-[10px]">Boutique Santé & Cabinet Médical</div>
                  <div className="text-[10px]">Tél : (+237) 699 00 11 22 / 677 22 33 44</div>
                  <div className="text-[10px]">Douala / Yaoundé - Cameroun</div>
                </div>

                <div className="border-y border-dashed border-neutral-300 py-1.5 text-left text-[10px] space-y-0.5">
                  <div>Reçu N° : {lastSale.receiptNumber}</div>
                  <div>Date : {lastSale.date} à {lastSale.time}</div>
                  <div>Caissier : {lastSale.cashierName}</div>
                  <div>Client : {lastSale.patientName}</div>
                  {lastSale.sponsorPartnerName && (
                    <div className="font-bold text-orange-900">
                      Parrain MLM : {lastSale.sponsorPartnerName} ({lastSale.sponsorPartnerCode})
                    </div>
                  )}
                </div>

                {/* Items Table */}
                <div className="text-left space-y-1.5">
                  {lastSale.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start text-[10px]">
                      <div className="flex-1 pr-2">
                        <div>{item.productName}</div>
                        <div className="text-neutral-500">{item.quantity} × {formatMoney(item.patientPrice)}</div>
                      </div>
                      <div className="font-bold font-mono">{formatMoney(item.subtotal)}</div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-dashed border-neutral-300 pt-2 space-y-1 text-right text-xs">
                  <div className="flex justify-between">
                    <span>Sous-total :</span>
                    <span>{formatMoney(lastSale.totalAmount)}</span>
                  </div>
                  {lastSale.discountAmount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Remise :</span>
                      <span>-{formatMoney(lastSale.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-sm border-t border-neutral-900 pt-1">
                    <span>TOTAL NET :</span>
                    <span>{formatMoney(lastSale.netAmount)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-neutral-500">
                    <span>Paiement ({lastSale.paymentMethod.toUpperCase()}) :</span>
                    <span>{formatMoney(lastSale.netAmount)}</span>
                  </div>
                  {lastSale.totalPv > 0 && (
                    <div className="flex justify-between text-[10px] text-amber-700 font-bold">
                      <span>PV Crédités :</span>
                      <span>+{formatPV(lastSale.totalPv)}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-dashed border-neutral-300 pt-2 text-[9px] text-neutral-500">
                  Merci de votre visite et bonne guérison !<br />
                  Les produits naturels Whieda ne se substituent pas à un avis médical.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
