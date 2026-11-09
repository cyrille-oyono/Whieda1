import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ProductService, ProductCategory } from '../types';
import { formatMoney, formatPV, getCategoryLabel } from '../utils/formatters';
import { 
  Boxes, 
  Search, 
  Plus, 
  ShoppingCart, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Download, 
  Printer, 
  RefreshCw, 
  FileText, 
  ArrowUpDown, 
  Layers, 
  CheckSquare, 
  Square, 
  Filter, 
  Truck, 
  DollarSign, 
  BarChart3, 
  Package, 
  ShieldCheck, 
  X, 
  PlusCircle, 
  Trash2, 
  Eye, 
  Check
} from 'lucide-react';
import { generateStockOrderPDF, StockOrderPDFItem } from '../utils/pdfGenerator';

export const StockView: React.FC = () => {
  const { 
    products, 
    sales, 
    addProduct, 
    updateProduct, 
    restockProduct, 
    batchRestockProducts, 
    createSupplierOrder, 
    currentUser, 
    companySettings,
    supabaseStatus 
  } = useApp();

  // Role Protection: Visible par l'Admin et le Comptable
  const isAuthorized = currentUser.role === 'admin' || currentUser.role === 'accountant';

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'rupture' | 'alerte' | 'ok'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'sold' | 'value'>('stock');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Selected Products for Batch Restocking
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isBatchRestockModalOpen, setIsBatchRestockModalOpen] = useState(false);
  const [batchQuantities, setBatchQuantities] = useState<Record<string, number>>({});
  const [batchNote, setBatchNote] = useState('');

  // Single Restock Modal
  const [restockingProduct, setRestockingProduct] = useState<ProductService | null>(null);
  const [singleRestockQty, setSingleRestockQty] = useState<number>(10);
  const [singleRestockNote, setSingleRestockNote] = useState('');

  // Add Product Modal
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [newProductForm, setNewProductForm] = useState({
    name: '',
    category: 'regulateur' as ProductCategory,
    customSku: '',
    patientPrice: '',
    partnerPrice: '',
    pv: '',
    initialStockQuantity: '50',
    minStockThreshold: '10',
    description: '',
  });

  // Supplier Order Modal ("Commander les produits")
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderItems, setOrderItems] = useState<{
    productId: string;
    product: ProductService;
    quantity: number;
  }[]>([]);
  const [selectedProductToAdd, setSelectedProductToAdd] = useState<string>('');
  const [qtyForSelectedToAdd, setQtyForSelectedToAdd] = useState<number>(10);
  const [orderSupplierName, setOrderSupplierName] = useState('Laboratoire Central Whieda International');
  const [orderNotes, setOrderNotes] = useState('Approvisionnement périodique urgent pour le cabinet de santé Whieda Meyomessala.');

  // Notification Toast
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'warning' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // ==========================================
  // CALCULATIONS SYNCHRONIZED WITH POS SALES
  // ==========================================

  // Map each product to its live sold quantity across completed sales
  const productStockStats = useMemo(() => {
    const validSales = sales.filter(s => s.status !== 'annule');

    return products.map(p => {
      // Sold quantity
      const soldQty = validSales.reduce((acc, sale) => {
        const item = sale.items.find(i => i.productId === p.id);
        return acc + (item ? item.quantity : 0);
      }, 0);

      // Initial quantity: if defined on product use it, otherwise infer from current stock + sold
      const initialQty = p.initialStockQuantity ?? (p.stockQuantity + soldQty);

      // Total quantity supplied: initial + any further restockings
      const totalQty = p.totalStockReceived ?? (p.stockQuantity + soldQty);

      // Current remaining stock
      const remainingStock = p.stockQuantity;

      // Alert threshold
      const threshold = p.minStockThreshold;

      // Status
      let status: 'rupture' | 'alerte' | 'ok' = 'ok';
      let statusLabel = 'Stock Ok';
      if (p.category !== 'services') {
        if (remainingStock === 0) {
          status = 'rupture';
          statusLabel = 'Rupture de Stock';
        } else if (remainingStock <= threshold) {
          status = 'alerte';
          statusLabel = 'À Commander';
        } else {
          status = 'ok';
          statusLabel = 'Stock Ok';
        }
      } else {
        statusLabel = 'Service / Soin';
      }

      // Financial value of remaining stock at patient price (retail value)
      const stockValuePatient = p.category !== 'services' ? remainingStock * p.patientPrice : 0;

      // Financial value of remaining stock at partner price (investment cost)
      const stockValuePartner = p.category !== 'services' ? remainingStock * p.partnerPrice : 0;

      // Total revenue generated by this product
      const totalRevenueGenerated = soldQty * p.patientPrice;

      return {
        product: p,
        initialQty,
        totalQty,
        soldQty,
        remainingStock,
        threshold,
        status,
        statusLabel,
        stockValuePatient,
        stockValuePartner,
        totalRevenueGenerated,
      };
    });
  }, [products, sales]);

  // Overall Global KPI Metrics
  const physicalStats = productStockStats.filter(s => s.product.category !== 'services');
  const totalStockValuePatient = physicalStats.reduce((sum, s) => sum + s.stockValuePatient, 0);
  const totalStockValuePartner = physicalStats.reduce((sum, s) => sum + s.stockValuePartner, 0);
  const potentialGrossMargin = totalStockValuePatient - totalStockValuePartner;
  const outOfStockCount = physicalStats.filter(s => s.status === 'rupture').length;
  const lowStockAlertCount = physicalStats.filter(s => s.status === 'alerte').length;
  const totalUnitsSold = physicalStats.reduce((sum, s) => sum + s.soldQty, 0);
  const totalUnitsRemaining = physicalStats.reduce((sum, s) => sum + s.remainingStock, 0);

  // Top Sold Products for Visual Sales Chart
  const topSoldProducts = useMemo(() => {
    return [...productStockStats]
      .filter(s => s.product.category !== 'services' && s.soldQty > 0)
      .sort((a, b) => b.soldQty - a.soldQty)
      .slice(0, 6);
  }, [productStockStats]);

  const maxSoldUnits = topSoldProducts.length > 0 ? Math.max(...topSoldProducts.map(t => t.soldQty), 1) : 1;

  // Category breakdown
  const categoryStats = useMemo(() => {
    const cats: Record<string, { label: string; count: number; unitsSold: number; revenue: number }> = {};
    productStockStats.forEach(s => {
      const cat = s.product.category;
      if (!cats[cat]) {
        cats[cat] = {
          label: getCategoryLabel(cat),
          count: 0,
          unitsSold: 0,
          revenue: 0,
        };
      }
      cats[cat].count += 1;
      cats[cat].unitsSold += s.soldQty;
      cats[cat].revenue += s.totalRevenueGenerated;
    });
    return Object.values(cats);
  }, [productStockStats]);

  // Filtered & Sorted Table Items
  const filteredProductStats = useMemo(() => {
    return productStockStats.filter(item => {
      const q = searchTerm.toLowerCase();
      const matchesSearch = 
        item.product.name.toLowerCase().includes(q) ||
        item.product.sku.toLowerCase().includes(q) ||
        getCategoryLabel(item.product.category).toLowerCase().includes(q);

      const matchesCategory = selectedCategory === 'all' || item.product.category === selectedCategory;
      const matchesStatus = stockStatusFilter === 'all' || item.status === stockStatusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') comparison = a.product.name.localeCompare(b.product.name);
      if (sortBy === 'stock') comparison = a.remainingStock - b.remainingStock;
      if (sortBy === 'sold') comparison = a.soldQty - b.soldQty;
      if (sortBy === 'value') comparison = a.stockValuePatient - b.stockValuePatient;
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [productStockStats, searchTerm, selectedCategory, stockStatusFilter, sortBy, sortOrder]);

  // ==========================================
  // HANDLERS: SELECTION & BATCH RESTOCKING
  // ==========================================
  const handleToggleSelectAll = () => {
    if (selectedProductIds.length === filteredProductStats.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProductStats.map(s => s.product.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedProductIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleOpenBatchRestockModal = () => {
    if (selectedProductIds.length === 0) {
      showToast('Veuillez sélectionner au moins un produit à ravitailler.', 'warning');
      return;
    }
    const initialQtyMap: Record<string, number> = {};
    selectedProductIds.forEach(id => {
      initialQtyMap[id] = 20; // Default suggested restock quantity
    });
    setBatchQuantities(initialQtyMap);
    setBatchNote('');
    setIsBatchRestockModalOpen(true);
  };

  const handleBatchRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const itemsToRestock = selectedProductIds.map(id => ({
      productId: id,
      quantity: Number(batchQuantities[id]) || 0,
    })).filter(i => i.quantity > 0);

    if (itemsToRestock.length === 0) {
      showToast('Veuillez spécifier des quantités valides supérieures à 0.', 'warning');
      return;
    }

    batchRestockProducts(itemsToRestock, batchNote.trim() || undefined);
    showToast(`Ravitaillement validé pour ${itemsToRestock.length} produit(s) sélectionné(s) !`, 'success');
    setSelectedProductIds([]);
    setIsBatchRestockModalOpen(false);
  };

  // Single restock
  const handleOpenSingleRestock = (product: ProductService) => {
    setRestockingProduct(product);
    setSingleRestockQty(15);
    setSingleRestockNote('');
  };

  const handleSingleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockingProduct) return;
    if (singleRestockQty <= 0) {
      showToast('La quantité à ravitailler doit être supérieure à 0.', 'warning');
      return;
    }

    restockProduct(restockingProduct.id, singleRestockQty, singleRestockNote.trim() || undefined);
    showToast(`Stock de "${restockingProduct.name}" augmenté de +${singleRestockQty} unités.`, 'success');
    setRestockingProduct(null);
  };

  // Add Product Form
  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patientPriceNum = Number(newProductForm.patientPrice);
    const partnerPriceNum = Number(newProductForm.partnerPrice);
    const pvNum = Number(newProductForm.pv) || 0;
    const initialStockNum = Number(newProductForm.initialStockQuantity) || 0;
    const alertThresholdNum = Number(newProductForm.minStockThreshold) || 10;

    if (!newProductForm.name.trim() || isNaN(patientPriceNum) || patientPriceNum <= 0) {
      showToast('Veuillez renseigner un nom valide et un prix patient supérieur à 0.', 'warning');
      return;
    }

    addProduct({
      name: newProductForm.name.trim(),
      category: newProductForm.category,
      customSku: newProductForm.customSku.trim() || undefined,
      patientPrice: patientPriceNum,
      partnerPrice: partnerPriceNum > 0 ? partnerPriceNum : Math.round(patientPriceNum * 0.75),
      pv: pvNum,
      stockQuantity: initialStockNum,
      initialStockQuantity: initialStockNum,
      totalStockReceived: initialStockNum,
      minStockThreshold: alertThresholdNum,
      description: newProductForm.description.trim() || undefined,
      active: true,
    });

    showToast(`Nouveau produit "${newProductForm.name.trim()}" ajouté au stock avec succès !`, 'success');
    setIsAddProductModalOpen(false);
    setNewProductForm({
      name: '',
      category: 'regulateur',
      customSku: '',
      patientPrice: '',
      partnerPrice: '',
      pv: '',
      initialStockQuantity: '50',
      minStockThreshold: '10',
      description: '',
    });
  };

  // ==========================================
  // HANDLERS: SUPPLIER ORDER & RESTOCK SHEET
  // ==========================================
  const handleOpenOrderModal = () => {
    // Automatically populate order with all products out of stock or below threshold
    const lowAndOutProducts = productStockStats
      .filter(s => s.product.category !== 'services' && (s.status === 'rupture' || s.status === 'alerte'))
      .map(s => {
        // Suggested quantity to bring back to initial or safe stock
        const suggestedQty = Math.max(20, (s.threshold * 3) - s.remainingStock);
        return {
          productId: s.product.id,
          product: s.product,
          quantity: suggestedQty,
        };
      });

    setOrderItems(lowAndOutProducts);
    setSelectedProductToAdd('');
    setQtyForSelectedToAdd(10);
    setIsOrderModalOpen(true);
  };

  const handleAddProductToOrder = () => {
    if (!selectedProductToAdd) return;
    const prod = products.find(p => p.id === selectedProductToAdd);
    if (!prod) return;

    if (orderItems.some(i => i.productId === selectedProductToAdd)) {
      showToast('Ce produit figure déjà dans votre liste de commande.', 'warning');
      return;
    }

    setOrderItems(prev => [
      ...prev,
      {
        productId: prod.id,
        product: prod,
        quantity: Math.max(1, qtyForSelectedToAdd),
      }
    ]);

    setSelectedProductToAdd('');
    showToast(`Produit "${prod.name}" ajouté à la commande.`, 'info');
  };

  const handleUpdateOrderItemQty = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      setOrderItems(prev => prev.filter(i => i.productId !== productId));
    } else {
      setOrderItems(prev => prev.map(i => i.productId === productId ? { ...i, quantity: newQty } : i));
    }
  };

  const handleRemoveOrderItem = (productId: string) => {
    setOrderItems(prev => prev.filter(i => i.productId !== productId));
  };

  // Export Order PDF
  const handleDownloadOrderPDF = () => {
    if (orderItems.length === 0) {
      showToast('La fiche de commande ne contient aucun produit.', 'warning');
      return;
    }

    const orderNumber = `BC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const pdfItems: StockOrderPDFItem[] = orderItems.map(item => ({
      sku: item.product.sku,
      name: item.product.name,
      category: getCategoryLabel(item.product.category),
      currentStock: item.product.stockQuantity,
      orderQuantity: item.quantity,
      unitPrice: item.product.patientPrice,
      partnerPrice: item.product.partnerPrice,
      totalPrice: item.quantity * item.product.patientPrice,
    }));

    generateStockOrderPDF(orderNumber, pdfItems, companySettings, orderNotes);
    showToast(`Bon de commande ${orderNumber} téléchargé en PDF avec succès !`, 'success');
  };

  // Submit Supplier Order to System
  const handleSaveSupplierOrder = () => {
    if (orderItems.length === 0) {
      showToast('La fiche de commande ne contient aucun produit.', 'warning');
      return;
    }

    const supplierItems = orderItems.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      quantity: item.quantity,
      unitCost: item.product.partnerPrice,
    }));

    const totalCost = supplierItems.reduce((acc, i) => acc + (i.quantity * i.unitCost), 0);

    createSupplierOrder({
      supplierName: orderSupplierName,
      items: supplierItems,
      totalCost,
      status: 'envoyee',
      notes: orderNotes,
    });

    showToast(`Commande fournisseur de ${formatMoney(totalCost)} enregistrée dans le système !`, 'success');
    setIsOrderModalOpen(false);
  };

  if (!isAuthorized) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-neutral-200 shadow-sm max-w-xl mx-auto my-12">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-neutral-900">Accès Restreint</h2>
        <p className="text-xs text-neutral-500 mt-1">
          La page de gestion de stock synchronisée est réservée exclusivement aux profils <strong>Administrateur</strong> et <strong>Comptable</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 max-w-md p-3.5 rounded-2xl shadow-2xl border backdrop-blur-md flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4 duration-200 ${
          notification.type === 'warning'
            ? 'bg-amber-950/95 text-amber-100 border-amber-800'
            : notification.type === 'info'
            ? 'bg-blue-950/95 text-blue-100 border-blue-800'
            : 'bg-neutral-900/95 text-white border-neutral-700/80'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'warning' ? (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <p className="text-xs font-medium">{notification.text}</p>
          </div>
          <button 
            onClick={() => setNotification(null)}
            className="p-1 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-gradient-to-br from-red-600 to-orange-600 text-white rounded-xl shadow-xs">
              <Boxes className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
              Gestion de Stock Synchronisée & Approvisionnement
            </h1>
            {supabaseStatus === 'connected' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Supabase Realtime</span>
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Suivi des quantités initiales, totales, vendues et restantes en temps réel avec les ventes POS · Alertes de réapprovisionnement.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddProductModalOpen(true)}
            className="px-3.5 py-2 bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-800 rounded-xl text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4 text-orange-600" />
            <span>Ajouter un Produit</span>
          </button>

          <button
            onClick={handleOpenOrderModal}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all active:scale-98"
          >
            <Truck className="w-4 h-4" />
            <span>Commander les Produits ({outOfStockCount + lowStockAlertCount})</span>
          </button>
        </div>
      </div>

      {/* 4 Financial & Inventory KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Stock Value Patient Price */}
        <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <span className="text-xs font-bold text-neutral-700">Valeur Totale du Stock (Vente)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 tracking-tight">
            {formatMoney(totalStockValuePatient)}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Estimation cumulée au Prix Patient ({totalUnitsRemaining.toLocaleString('fr-FR')} unités en stock)
          </div>
        </div>

        {/* Total Stock Value Partner Price (Investment Cost) */}
        <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <span className="text-xs font-bold text-neutral-700">Coût d'Investissement Stock</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-neutral-900 tracking-tight">
            {formatMoney(totalStockValuePartner)}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            Marge potentielle : +{formatMoney(potentialGrossMargin)}
          </div>
        </div>

        {/* Out of stock & Alert count */}
        <div className="p-4 bg-white rounded-2xl border border-red-200/90 shadow-2xs bg-gradient-to-br from-white to-red-50/20">
          <div className="flex items-center justify-between text-red-700 mb-1">
            <span className="text-xs font-bold">Produits en Rupture & Alertes</span>
            <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-red-600">{outOfStockCount}</span>
            <span className="text-xs font-semibold text-red-800">rupture(s)</span>
            <span className="text-neutral-300">|</span>
            <span className="text-xl font-bold text-amber-600">{lowStockAlertCount}</span>
            <span className="text-xs font-medium text-amber-700">à commander</span>
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Seuil d'alerte paramétré par référence
          </div>
        </div>

        {/* Synchronized Total Units Sold */}
        <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <span className="text-xs font-bold text-neutral-700">Unités Vendues (Caisse POS)</span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-orange-600 tracking-tight">
            {totalUnitsSold.toLocaleString('fr-FR')} <span className="text-sm font-semibold text-neutral-500">unités</span>
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Synchronisation dynamique sur {sales.filter(s => s.status !== 'annule').length} reçus de vente
          </div>
        </div>
      </div>

      {/* Visual Chart & Statistics: Top Sold Products */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-orange-100 text-orange-600 rounded-lg">
              <BarChart3 className="w-4 h-4" />
            </span>
            <h2 className="text-sm font-bold text-neutral-900">
              Statistiques des Ventes & Top Produits en Rotation
            </h2>
          </div>
          <span className="text-xs text-neutral-400">
            Calculé sur l'historique complet des encaissements
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top 6 Best Sellers Bars */}
          <div className="lg:col-span-2 space-y-3">
            <span className="text-xs font-bold text-neutral-700 block">
              Palmarès des Produits les Plus Vendus (Unités & Chiffre d'Affaires) :
            </span>

            {topSoldProducts.length === 0 ? (
              <div className="py-8 text-center text-neutral-400 text-xs">
                Aucune vente enregistrée pour le moment.
              </div>
            ) : (
              <div className="space-y-2.5">
                {topSoldProducts.map((stat, idx) => {
                  const percentage = Math.round((stat.soldQty / maxSoldUnits) * 100);
                  return (
                    <div key={stat.product.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full bg-neutral-100 text-neutral-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-neutral-900 truncate max-w-[240px] sm:max-w-[340px]">
                            {stat.product.name}
                          </span>
                          <span className="text-[10px] font-mono text-neutral-400">({stat.product.sku})</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-bold text-orange-600">{stat.soldQty} vendus</span>
                          <span className="text-neutral-300">·</span>
                          <span className="font-bold text-neutral-800">{formatMoney(stat.totalRevenueGenerated)}</span>
                        </div>
                      </div>

                      {/* Bar indicator */}
                      <div className="w-full h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Category Breakdown Card */}
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/80 flex flex-col justify-between space-y-3">
            <div>
              <span className="text-xs font-bold text-neutral-800 block mb-2">
                Répartition par Famille de Produits
              </span>
              <div className="space-y-2 text-xs">
                {categoryStats.map(cat => (
                  <div key={cat.label} className="flex items-center justify-between py-1 border-b border-neutral-200/60 last:border-0">
                    <span className="text-neutral-600">{cat.label} ({cat.count})</span>
                    <div className="text-right">
                      <div className="font-bold text-neutral-900">{cat.unitsSold} vendus</div>
                      <div className="text-[10px] text-neutral-500">{formatMoney(cat.revenue)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-200 text-[11px] text-neutral-500">
              💡 Le réapprovisionnement proactif évite les pertes de ventes en pharmacie.
            </div>
          </div>
        </div>
      </div>

      {/* Floating Selection Bar for Batch Restocking */}
      {selectedProductIds.length > 0 && (
        <div className="sticky top-20 z-20 bg-neutral-900 text-white p-3.5 rounded-2xl shadow-xl border border-neutral-700 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 bg-orange-600 rounded-lg text-xs font-bold">
              {selectedProductIds.length} sélectionné(s)
            </span>
            <span className="text-xs text-neutral-300 hidden sm:inline">
              Sélectionnez les articles pour réapprovisionner les stocks en un clic.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedProductIds([])}
              className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white rounded-xl transition-colors"
            >
              Désélectionner tout
            </button>
            <button
              onClick={handleOpenBatchRestockModal}
              className="px-4 py-1.5 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Ravitailler la Sélection ({selectedProductIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-neutral-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par nom de produit, SKU ou catégorie..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-neutral-50/80 border border-neutral-200 rounded-xl text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs font-medium pb-1 md:pb-0">
          {/* Status filter */}
          <div className="flex items-center bg-neutral-100 p-1 rounded-xl">
            <button
              onClick={() => setStockStatusFilter('all')}
              className={`px-3 py-1 rounded-lg transition-all ${
                stockStatusFilter === 'all' ? 'bg-white text-neutral-900 font-bold shadow-2xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setStockStatusFilter('rupture')}
              className={`px-3 py-1 rounded-lg transition-all ${
                stockStatusFilter === 'rupture' ? 'bg-red-600 text-white font-bold shadow-2xs' : 'text-red-700 hover:bg-red-50'
              }`}
            >
              En Rupture ({outOfStockCount})
            </button>
            <button
              onClick={() => setStockStatusFilter('alerte')}
              className={`px-3 py-1 rounded-lg transition-all ${
                stockStatusFilter === 'alerte' ? 'bg-amber-600 text-white font-bold shadow-2xs' : 'text-amber-700 hover:bg-amber-50'
              }`}
            >
              À Commander ({lowStockAlertCount})
            </button>
            <button
              onClick={() => setStockStatusFilter('ok')}
              className={`px-3 py-1 rounded-lg transition-all ${
                stockStatusFilter === 'ok' ? 'bg-emerald-600 text-white font-bold shadow-2xs' : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              Stock Ok
            </button>
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-white border border-neutral-200 rounded-xl text-neutral-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/30"
          >
            <option value="all">Toutes les catégories</option>
            <option value="regulateur">Régulateur</option>
            <option value="nettoyage">Nettoyage</option>
            <option value="entretien">Entretien</option>
            <option value="alimentation">Alimentation</option>
            <option value="soins">Soins</option>
            <option value="appareils">Appareils & Dispositifs</option>
            <option value="services">Services</option>
          </select>
        </div>
      </div>

      {/* Main Stock Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-3 w-10 text-center">
                  <button 
                    onClick={handleToggleSelectAll}
                    title="Tout sélectionner"
                    className="p-1 text-neutral-500 hover:text-neutral-900"
                  >
                    {selectedProductIds.length > 0 && selectedProductIds.length === filteredProductStats.length ? (
                      <CheckSquare className="w-4 h-4 text-orange-600" />
                    ) : (
                      <Square className="w-4 h-4 text-neutral-400" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-3">Produit & Réf. SKU</th>
                <th className="py-3 px-3 text-right">Prix Patient / Part.</th>
                <th className="py-3 px-3 text-center">Qté Initiale</th>
                <th className="py-3 px-3 text-center">Qté Totale</th>
                <th className="py-3 px-3 text-center">Qté Vendue</th>
                <th className="py-3 px-3 text-center">Reste en Stock</th>
                <th className="py-3 px-3 text-center">Seuil d'Alerte</th>
                <th className="py-3 px-3 text-center">État du Stock</th>
                <th className="py-3 px-3 text-right">Valeur Stock</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-700">
              {filteredProductStats.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-neutral-400">
                    <Boxes className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-medium text-xs">Aucun produit ne correspond à vos critères de recherche.</p>
                  </td>
                </tr>
              ) : (
                filteredProductStats.map(stat => {
                  const isSelected = selectedProductIds.includes(stat.product.id);
                  const isPhysical = stat.product.category !== 'services';

                  return (
                    <tr 
                      key={stat.product.id} 
                      className={`hover:bg-neutral-50/70 transition-colors ${
                        isSelected ? 'bg-orange-50/30' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-3 text-center">
                        {isPhysical ? (
                          <button
                            onClick={() => handleToggleSelectOne(stat.product.id)}
                            className="p-1"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-orange-600" />
                            ) : (
                              <Square className="w-4 h-4 text-neutral-300 hover:text-neutral-500" />
                            )}
                          </button>
                        ) : (
                          <span className="text-neutral-300">-</span>
                        )}
                      </td>

                      {/* Product Name & SKU */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-neutral-900">{stat.product.name}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-[10px] bg-neutral-100 text-neutral-600 px-1.5 py-0.2 rounded border border-neutral-200">
                            {stat.product.sku}
                          </span>
                          <span className="text-[10px] text-neutral-400">
                            {getCategoryLabel(stat.product.category)}
                          </span>
                        </div>
                      </td>

                      {/* Prices */}
                      <td className="py-3 px-3 text-right">
                        <div className="font-bold text-neutral-900">{formatMoney(stat.product.patientPrice)}</div>
                        <div className="text-[10px] text-neutral-400">Part: {formatMoney(stat.product.partnerPrice)}</div>
                      </td>

                      {/* Initial Quantity */}
                      <td className="py-3 px-3 text-center font-mono font-medium text-neutral-600">
                        {isPhysical ? stat.initialQty : 'Illimité'}
                      </td>

                      {/* Total Quantity */}
                      <td className="py-3 px-3 text-center font-mono font-medium text-neutral-700">
                        {isPhysical ? stat.totalQty : 'Illimité'}
                      </td>

                      {/* Sold Quantity (Synchronized with POS) */}
                      <td className="py-3 px-3 text-center">
                        <span className={`font-mono font-bold px-2 py-0.5 rounded-lg text-xs ${
                          stat.soldQty > 0 ? 'bg-orange-50 text-orange-700' : 'text-neutral-400'
                        }`}>
                          {stat.soldQty}
                        </span>
                      </td>

                      {/* Remaining Stock */}
                      <td className="py-3 px-3 text-center">
                        {isPhysical ? (
                          <div>
                            <span className={`font-mono font-black text-sm ${
                              stat.remainingStock === 0
                                ? 'text-red-600'
                                : stat.remainingStock <= stat.threshold
                                ? 'text-amber-600'
                                : 'text-emerald-700'
                            }`}>
                              {stat.remainingStock}
                            </span>
                          </div>
                        ) : (
                          <span className="text-emerald-600 font-semibold text-[11px]">Service</span>
                        )}
                      </td>

                      {/* Alert Threshold */}
                      <td className="py-3 px-3 text-center font-mono text-neutral-500">
                        {isPhysical ? stat.threshold : '-'}
                      </td>

                      {/* Status / Message: "Stock Ok" ou "À commander" ou "Rupture" */}
                      <td className="py-3 px-3 text-center">
                        {isPhysical ? (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold ${
                            stat.status === 'rupture'
                              ? 'bg-red-50 text-red-700 border border-red-200 animate-pulse'
                              : stat.status === 'alerte'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {stat.status === 'rupture' && <XCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />}
                            {stat.status === 'alerte' && <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                            {stat.status === 'ok' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                            <span>{stat.statusLabel}</span>
                          </span>
                        ) : (
                          <span className="text-neutral-400 text-[10px]">Non applicable</span>
                        )}
                      </td>

                      {/* Stock Value Patient Price */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-neutral-900">
                        {isPhysical ? formatMoney(stat.stockValuePatient) : '-'}
                      </td>

                      {/* Action buttons on each row */}
                      <td className="py-3 px-3 text-right">
                        {isPhysical && (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenSingleRestock(stat.product)}
                              title="Ravitailler ce produit"
                              className="px-2.5 py-1.5 rounded-lg border border-orange-200 bg-orange-50/70 hover:bg-orange-100 text-orange-800 font-semibold text-[11px] flex items-center gap-1 transition-all"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Ravitailler</span>
                            </button>

                            <button
                              onClick={() => {
                                handleOpenOrderModal();
                                // Add to order if not in list
                                if (!orderItems.some(i => i.productId === stat.product.id)) {
                                  setOrderItems(prev => [
                                    ...prev,
                                    {
                                      productId: stat.product.id,
                                      product: stat.product,
                                      quantity: 20,
                                    }
                                  ]);
                                }
                              }}
                              title="Ajouter au bon de commande fournisseur"
                              className="p-1.5 rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 transition-all"
                            >
                              <Truck className="w-3.5 h-3.5 text-neutral-600" />
                            </button>
                          </div>
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

      {/* ========================================================= */}
      {/* MODAL 1: RAVITAILLEMENT INDIVIDUEL                        */}
      {/* ========================================================= */}
      {restockingProduct && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full border border-neutral-200 shadow-2xl overflow-hidden p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-orange-600 text-white rounded-lg">
                  <Plus className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-neutral-900">
                  Ravitailler le Stock
                </h3>
              </div>
              <button onClick={() => setRestockingProduct(null)} className="p-1 text-neutral-400 hover:text-neutral-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSingleRestockSubmit} className="mt-4 space-y-4">
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs">
                <div className="font-bold text-neutral-900">{restockingProduct.name}</div>
                <div className="text-neutral-500 font-mono mt-0.5">SKU : {restockingProduct.sku}</div>
                <div className="mt-1 flex items-center justify-between text-neutral-600">
                  <span>Stock actuel disponible :</span>
                  <strong className="text-orange-600 font-mono text-sm">{restockingProduct.stockQuantity} unités</strong>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Quantité à Ajouter au Stock *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={singleRestockQty}
                  onChange={e => setSingleRestockQty(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full text-sm font-bold p-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                />
                <span className="text-[11px] text-neutral-500 mt-1 block">
                  Nouveau stock après validation : <strong>{restockingProduct.stockQuantity + (Number(singleRestockQty) || 0)} unités</strong>
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Référence du Bon de Livraison / Note (Optionnel)
                </label>
                <input
                  type="text"
                  placeholder="ex: BL-WH-2026-08, Réception arrivage..."
                  value={singleRestockNote}
                  onChange={e => setSingleRestockNote(e.target.value)}
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setRestockingProduct(null)}
                  className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 rounded-xl shadow-xs transition-all"
                >
                  Valider le Ravitaillement (+{singleRestockQty})
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: RAVITAILLEMENT GROUPÉ POUR LA SÉLECTION          */}
      {/* ========================================================= */}
      {isBatchRestockModalOpen && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-neutral-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-gradient-to-r from-orange-50 to-neutral-50 shrink-0">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-orange-600 text-white rounded-lg">
                  <RefreshCw className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-neutral-900">
                  Ravitaillement Groupé ({selectedProductIds.length} produits sélectionnés)
                </h3>
              </div>
              <button onClick={() => setIsBatchRestockModalOpen(false)} className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleBatchRestockSubmit} className="p-6 overflow-y-auto space-y-4">
              <p className="text-xs text-neutral-500">
                Définissez la quantité exacte à ajouter pour chacun des produits sélectionnés :
              </p>

              <div className="space-y-2.5 max-h-[45vh] overflow-y-auto pr-1">
                {selectedProductIds.map(id => {
                  const prod = products.find(p => p.id === id);
                  if (!prod) return null;
                  const currentQty = batchQuantities[id] || 0;

                  return (
                    <div key={id} className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between gap-3 text-xs">
                      <div className="flex-1">
                        <div className="font-bold text-neutral-900 truncate">{prod.name}</div>
                        <div className="text-[10px] text-neutral-500">
                          Stock actuel : <strong>{prod.stockQuantity}</strong> · Seuil : {prod.minStockThreshold}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-neutral-500">Ajouter :</span>
                        <input
                          type="number"
                          min="1"
                          required
                          value={currentQty}
                          onChange={e => {
                            const val = Math.max(0, parseInt(e.target.value) || 0);
                            setBatchQuantities(prev => ({ ...prev, [id]: val }));
                          }}
                          className="w-20 text-xs font-bold p-1.5 border border-neutral-300 rounded-lg text-center font-mono focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <span className="text-[11px] font-bold text-emerald-600 w-12 text-right font-mono">
                          = {prod.stockQuantity + currentQty}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Note ou Motif du Ravitaillement
                </label>
                <input
                  type="text"
                  placeholder="ex: Réception livraison fournisseur du mois..."
                  value={batchNote}
                  onChange={e => setBatchNote(e.target.value)}
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsBatchRestockModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 rounded-xl shadow-xs transition-all"
                >
                  Valider le Ravitaillement Groupé
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: AJOUTER UN PRODUIT                               */}
      {/* ========================================================= */}
      {isAddProductModalOpen && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-neutral-200 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-gradient-to-r from-orange-50 to-neutral-50 shrink-0">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-gradient-to-br from-red-600 to-orange-600 text-white rounded-lg">
                  <Plus className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-neutral-900">
                  Ajouter un Nouveau Produit au Stock
                </h3>
              </div>
              <button onClick={() => setIsAddProductModalOpen(false)} className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Nom du Produit / Formule *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Sirop Bio-Immunité Whieda 250ml"
                  value={newProductForm.name}
                  onChange={e => setNewProductForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Catégorie *
                  </label>
                  <select
                    value={newProductForm.category}
                    onChange={e => setNewProductForm(prev => ({ ...prev, category: e.target.value as ProductCategory }))}
                    className="w-full text-xs p-2.5 bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                  >
                    <option value="regulateur">Régulateur</option>
                    <option value="nettoyage">Nettoyage</option>
                    <option value="entretien">Entretien</option>
                    <option value="alimentation">Alimentation</option>
                    <option value="soins">Soins</option>
                    <option value="appareils">Appareils & Dispositifs</option>
                    <option value="services">Services</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Code SKU (Optionnel)
                  </label>
                  <input
                    type="text"
                    placeholder="Auto si vide"
                    value={newProductForm.customSku}
                    onChange={e => setNewProductForm(prev => ({ ...prev, customSku: e.target.value }))}
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Prix Patient (FCFA) *
                  </label>
                  <input
                    type="number"
                    required
                    min="100"
                    placeholder="ex: 15000"
                    value={newProductForm.patientPrice}
                    onChange={e => setNewProductForm(prev => ({ ...prev, patientPrice: e.target.value }))}
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Prix Partenaire (FCFA)
                  </label>
                  <input
                    type="number"
                    min="100"
                    placeholder="ex: 11000"
                    value={newProductForm.partnerPrice}
                    onChange={e => setNewProductForm(prev => ({ ...prev, partnerPrice: e.target.value }))}
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Points PV
                  </label>
                  <input
                    type="number"
                    placeholder="ex: 20"
                    value={newProductForm.pv}
                    onChange={e => setNewProductForm(prev => ({ ...prev, pv: e.target.value }))}
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Quantité Initiale en Stock *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newProductForm.initialStockQuantity}
                    onChange={e => setNewProductForm(prev => ({ ...prev, initialStockQuantity: e.target.value }))}
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Seuil d'Alerte Stock Bas *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newProductForm.minStockThreshold}
                    onChange={e => setNewProductForm(prev => ({ ...prev, minStockThreshold: e.target.value }))}
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Description & Vertus
                </label>
                <textarea
                  rows={2}
                  placeholder="Propriétés phytothérapeutiques, posologie..."
                  value={newProductForm.description}
                  onChange={e => setNewProductForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsAddProductModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 rounded-xl shadow-xs transition-all"
                >
                  Enregistrer dans le Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: COMMANDER LES PRODUITS (FICHE D'APPROVISIONNEMENT)*/}
      {/* ========================================================= */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-4xl w-full border border-neutral-200 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-gradient-to-r from-red-50 to-orange-50 shrink-0">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-gradient-to-br from-red-600 to-orange-600 text-white rounded-xl shadow-xs">
                  <Truck className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    Fiche de Commande & Réapprovisionnement des Stocks
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Répertoire automatique des ruptures et alertes avec ajustement des quantités et prix totaux
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadOrderPDF}
                  className="px-3 py-1.5 bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all"
                >
                  <Download className="w-3.5 h-3.5 text-orange-600" />
                  <span>Télécharger PDF</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all"
                >
                  <Printer className="w-3.5 h-3.5 text-neutral-600" />
                  <span>Imprimer</span>
                </button>

                <button onClick={() => setIsOrderModalOpen(false)} className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-4">
              {/* Option to Add ANY product not currently in low-stock list */}
              <div className="p-3.5 bg-orange-50/70 border border-orange-200 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <span className="text-xs font-bold text-orange-950 block">
                    Ajouter un autre produit à la fiche (même non en rupture) :
                  </span>
                  <p className="text-[11px] text-orange-850">
                    Complétez votre bon de commande avec n'importe quelle référence du catalogue.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedProductToAdd}
                    onChange={e => setSelectedProductToAdd(e.target.value)}
                    className="text-xs p-2 bg-white border border-orange-200 rounded-xl text-neutral-800 max-w-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">-- Choisir un produit du catalogue --</option>
                    {products
                      .filter(p => p.category !== 'services' && !orderItems.some(item => item.productId === p.id))
                      .map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} (Stock: {p.stockQuantity}) - {formatMoney(p.patientPrice)}
                        </option>
                      ))}
                  </select>

                  <input
                    type="number"
                    min="1"
                    value={qtyForSelectedToAdd}
                    onChange={e => setQtyForSelectedToAdd(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 text-xs p-2 border border-orange-200 rounded-xl text-center font-bold font-mono bg-white"
                    title="Quantité à ajouter"
                  />

                  <button
                    type="button"
                    disabled={!selectedProductToAdd}
                    onClick={handleAddProductToOrder}
                    className="px-3 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all whitespace-nowrap"
                  >
                    Ajouter
                  </button>
                </div>
              </div>

              {/* Order Items Table */}
              <div className="border border-neutral-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200 text-[10px] uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Produit & SKU</th>
                      <th className="py-2.5 px-3 text-center">Stock Actuel</th>
                      <th className="py-2.5 px-3 text-center">Quantité à Commander</th>
                      <th className="py-2.5 px-3 text-right">Prix U Patient</th>
                      <th className="py-2.5 px-3 text-right">Prix Total Estimé</th>
                      <th className="py-2.5 px-3 text-center w-12">Retirer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-neutral-700">
                    {orderItems.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-neutral-400">
                          Aucun produit dans la fiche de commande. Utilisez le sélecteur ci-dessus pour ajouter des articles.
                        </td>
                      </tr>
                    ) : (
                      orderItems.map((item, idx) => {
                        const lineTotal = item.quantity * item.product.patientPrice;
                        const isOutOfStock = item.product.stockQuantity === 0;

                        return (
                          <tr key={item.productId} className="hover:bg-neutral-50/60">
                            <td className="py-2.5 px-3">
                              <div className="font-bold text-neutral-900">{item.product.name}</div>
                              <div className="text-[10px] font-mono text-neutral-400">{item.product.sku}</div>
                            </td>

                            <td className="py-2.5 px-3 text-center">
                              {isOutOfStock ? (
                                <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold text-[10px]">
                                  0 (Rupture)
                                </span>
                              ) : (
                                <span className="font-mono font-bold text-neutral-700">{item.product.stockQuantity}</span>
                              )}
                            </td>

                            <td className="py-2.5 px-3 text-center">
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={e => handleUpdateOrderItemQty(item.productId, parseInt(e.target.value) || 0)}
                                className="w-20 p-1.5 border border-neutral-300 rounded-lg text-center font-mono font-bold text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                              />
                            </td>

                            <td className="py-2.5 px-3 text-right font-mono text-neutral-700">
                              {formatMoney(item.product.patientPrice)}
                            </td>

                            <td className="py-2.5 px-3 text-right font-mono font-bold text-neutral-900">
                              {formatMoney(lineTotal)}
                            </td>

                            <td className="py-2.5 px-3 text-center">
                              <button
                                onClick={() => handleRemoveOrderItem(item.productId)}
                                className="p-1 text-red-400 hover:text-red-700 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                  {orderItems.length > 0 && (
                    <tfoot className="bg-neutral-50 font-bold border-t border-neutral-200 text-neutral-900">
                      <tr>
                        <td colSpan={2} className="py-3 px-3 uppercase text-[11px]">
                          Total Général du Bon :
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-orange-600 text-sm">
                          {orderItems.reduce((acc, i) => acc + i.quantity, 0)} unités
                        </td>
                        <td></td>
                        <td className="py-3 px-3 text-right font-mono text-emerald-600 text-sm">
                          {formatMoney(orderItems.reduce((acc, i) => acc + (i.quantity * i.product.patientPrice), 0))}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>

              {/* Order Info & Instructions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Fournisseur Référencé
                  </label>
                  <input
                    type="text"
                    value={orderSupplierName}
                    onChange={e => setOrderSupplierName(e.target.value)}
                    className="w-full p-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Instructions & Remarques
                  </label>
                  <input
                    type="text"
                    value={orderNotes}
                    onChange={e => setOrderNotes(e.target.value)}
                    className="w-full p-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                <div className="text-xs text-neutral-500">
                  Total références : <strong>{orderItems.length}</strong>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOrderModalOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 rounded-xl"
                  >
                    Fermer
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveSupplierOrder}
                    className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Enregistrer la Commande Fournisseur</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
