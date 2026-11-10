import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ProductService, ProductCategory } from '../types';
import { formatMoney, formatPV, getCategoryLabel } from '../utils/formatters';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Package, 
  Check,
  Database,
  Copy,
  RefreshCw,
  LayoutGrid,
  List,
  Tag,
  ShieldCheck,
  TrendingUp,
  FileCode,
  DollarSign,
  X,
  AlertTriangle
} from 'lucide-react';
import { SUPABASE_OFFICIAL_PRODUCTS_SEED_SQL, OFFICIAL_PRODUCTS_CATALOG } from '../data/officialProducts';

export const ProductsView: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, seedOfficialCatalog, currentUser, supabaseStatus } = useApp();

  const [activeCategory, setActiveCategory] = useState<'all' | ProductCategory>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductService | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warning' } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  // Form State
  const [code, setCode] = useState('');
  const [customSku, setCustomSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('regulateur');
  const [patientPrice, setPatientPrice] = useState<number>(17500);
  const [partnerPrice, setPartnerPrice] = useState<number>(12500);
  const [pv, setPv] = useState<number>(25);
  const [stockQuantity, setStockQuantity] = useState<number>(20);
  const [minStockThreshold, setMinStockThreshold] = useState<number>(5);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [description, setDescription] = useState('');

  const showToast = (text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_OFFICIAL_PRODUCTS_SEED_SQL);
    setCopiedSql(true);
    showToast('Script SQL Supabase copié dans le presse-papier !', 'success');
    setTimeout(() => setCopiedSql(false), 2500);
  };

  // Auto-calculated gain
  const computedGain = Math.max(0, Number(patientPrice || 0) - Number(partnerPrice || 0));

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setCode('');
    setCustomSku('');
    setName('');
    setCategory('regulateur');
    setPatientPrice(17500);
    setPartnerPrice(12500);
    setPv(25);
    setStockQuantity(25);
    setMinStockThreshold(5);
    setImageUrl('');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: ProductService) => {
    setEditingProduct(p);
    setCode(p.code || p.sku);
    setCustomSku(p.sku);
    setName(p.name);
    setCategory(p.category);
    setPatientPrice(p.patientPrice);
    setPartnerPrice(p.partnerPrice);
    setPv(p.pv);
    setStockQuantity(p.stockQuantity);
    setMinStockThreshold(p.minStockThreshold);
    setImageUrl(p.imageUrl || '');
    setDescription(p.description || '');
    setIsModalOpen(true);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const localUrl = URL.createObjectURL(file);
      setImageUrl(localUrl);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateProduct(editingProduct.id, {
        code: code.trim().toUpperCase() || undefined,
        name: name.trim(),
        category,
        patientPrice: Number(patientPrice),
        publicPrice: Number(patientPrice),
        partnerPrice: Number(partnerPrice),
        pv: Number(pv),
        stockQuantity: Number(stockQuantity),
        minStockThreshold: Number(minStockThreshold),
        imageUrl: imageUrl || undefined,
        description: description || undefined,
      });
      showToast(`Produit "${name}" mis à jour avec succès.`, 'success');
    } else {
      addProduct({
        code: code.trim().toUpperCase() || undefined,
        customSku: customSku.trim() || undefined,
        name: name.trim(),
        category,
        patientPrice: Number(patientPrice),
        publicPrice: Number(patientPrice),
        partnerPrice: Number(partnerPrice),
        pv: Number(pv),
        stockQuantity: (category === 'services') ? 9999 : Number(stockQuantity),
        minStockThreshold: Number(minStockThreshold),
        imageUrl: imageUrl || undefined,
        description: description || undefined,
        active: true,
      });
      showToast(`Produit "${name}" ajouté au catalogue.`, 'success');
    }
    setIsModalOpen(false);
  };

  const handleSeedOfficialCatalog = () => {
    seedOfficialCatalog('merge');
    showToast('Les 28 produits de la grille tarifaire officielle ont été synchronisés !', 'success');
  };

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: products.length };
    products.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
      const q = searchTerm.toLowerCase();
      const matchesSearch = 
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.code && p.code.toLowerCase().includes(q)) ||
        getCategoryLabel(p.category).toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchTerm]);

  // Total Catalog Financial Metrics
  const totalPublicValue = useMemo(() => {
    return products.reduce((acc, p) => p.category !== 'services' ? acc + (p.stockQuantity * p.patientPrice) : acc, 0);
  }, [products]);

  const totalPv = useMemo(() => {
    return products.reduce((acc, p) => acc + p.pv, 0);
  }, [products]);

  const getCategoryBadgeStyle = (cat: ProductCategory) => {
    switch (cat) {
      case 'regulateur':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'nettoyage':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'entretien':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'alimentation':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'soins':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'appareils':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'services':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-neutral-50 text-neutral-700 border-neutral-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className={`px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 ${
            toastMessage.type === 'success' 
              ? 'bg-emerald-600 text-white border-emerald-500' 
              : toastMessage.type === 'warning'
              ? 'bg-amber-600 text-white border-amber-500'
              : 'bg-neutral-900 text-white border-neutral-800'
          }`}>
            <Check className="w-4 h-4 text-white" />
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
              <Package className="w-5 h-5 text-orange-600" />
              <span>Catalogue & Produits Officiels Whieda</span>
            </h1>
            {supabaseStatus === 'connected' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Supabase Realtime</span>
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Grille tarifaire officielle (28 produits certifiés), marges directes, PV MLM et gestion des stocks
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSeedOfficialCatalog}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200 rounded-lg text-xs font-semibold shadow-2xs transition-all"
            title="Synchroniser la grille tarifaire officielle"
          >
            <RefreshCw className="w-3.5 h-3.5 text-orange-600" />
            <span>Initialiser Grille (28 Produits)</span>
          </button>

          <button
            onClick={() => setIsSqlModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-all"
            title="Voir et copier le script SQL pour Supabase"
          >
            <Database className="w-3.5 h-3.5 text-orange-400" />
            <span>Script Supabase</span>
          </button>

          {currentUser.role !== 'receptionist' && (
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau Produit</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary Stat Mini-Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-neutral-400 block">Total Références</span>
            <span className="text-base font-bold text-neutral-900 font-mono">{products.length}</span>
          </div>
          <Tag className="w-4 h-4 text-orange-500" />
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-neutral-400 block">Grille Officielle</span>
            <span className="text-base font-bold text-emerald-600 font-mono">28 / 28</span>
          </div>
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-neutral-400 block">Valeur Stock Public</span>
            <span className="text-xs font-bold text-neutral-900 font-mono">{formatMoney(totalPublicValue)}</span>
          </div>
          <DollarSign className="w-4 h-4 text-amber-500" />
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-neutral-400 block">Cumul PV Réseau</span>
            <span className="text-base font-bold text-amber-700 font-mono">{formatPV(totalPv)}</span>
          </div>
          <TrendingUp className="w-4 h-4 text-amber-600" />
        </div>
      </div>

      {/* Filter Tabs and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center bg-neutral-100 p-1 rounded-lg flex-wrap gap-1">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
              activeCategory === 'all' ? 'bg-white text-neutral-900 shadow-xs font-bold' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <span>Tous</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-neutral-200 rounded-full font-mono">{categoryCounts.all || 0}</span>
          </button>
          <button
            onClick={() => setActiveCategory('regulateur')}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
              activeCategory === 'regulateur' ? 'bg-white text-red-700 shadow-xs font-bold' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <span>Régulateur</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-red-100 text-red-800 rounded-full font-mono">{categoryCounts.regulateur || 0}</span>
          </button>
          <button
            onClick={() => setActiveCategory('nettoyage')}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
              activeCategory === 'nettoyage' ? 'bg-white text-orange-700 shadow-xs font-bold' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <span>Nettoyage</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-orange-100 text-orange-800 rounded-full font-mono">{categoryCounts.nettoyage || 0}</span>
          </button>
          <button
            onClick={() => setActiveCategory('entretien')}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
              activeCategory === 'entretien' ? 'bg-white text-amber-800 shadow-xs font-bold' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <span>Entretien</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded-full font-mono">{categoryCounts.entretien || 0}</span>
          </button>
          <button
            onClick={() => setActiveCategory('alimentation')}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
              activeCategory === 'alimentation' ? 'bg-white text-emerald-800 shadow-xs font-bold' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <span>Alimentation</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-full font-mono">{categoryCounts.alimentation || 0}</span>
          </button>
          <button
            onClick={() => setActiveCategory('soins')}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
              activeCategory === 'soins' ? 'bg-white text-rose-800 shadow-xs font-bold' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <span>Soins</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded-full font-mono">{categoryCounts.soins || 0}</span>
          </button>
          <button
            onClick={() => setActiveCategory('appareils')}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
              activeCategory === 'appareils' ? 'bg-white text-purple-800 shadow-xs font-bold' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <span>Appareils</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded-full font-mono">{categoryCounts.appareils || 0}</span>
          </button>
          <button
            onClick={() => setActiveCategory('services')}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
              activeCategory === 'services' ? 'bg-white text-blue-800 shadow-xs font-bold' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <span>Services & Bilans</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded-full font-mono">{categoryCounts.services || 0}</span>
          </button>
        </div>

        {/* Search & View Mode Toggle */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Rechercher code, nom, SKU..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg border border-neutral-200">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                viewMode === 'table' ? 'bg-white text-neutral-900 shadow-2xs font-bold' : 'text-neutral-500 hover:text-neutral-800'
              }`}
              title="Vue Tableau"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                viewMode === 'grid' ? 'bg-white text-neutral-900 shadow-2xs font-bold' : 'text-neutral-500 hover:text-neutral-800'
              }`}
              title="Vue Cartes"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Products Display (Table View or Grid View) */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200">
                <tr>
                  <th className="py-3 px-4">Code Grille</th>
                  <th className="py-3 px-4">Désignation Produit</th>
                  <th className="py-3 px-4">Catégorie</th>
                  <th className="py-3 px-4 text-right">Prix Partenaire</th>
                  <th className="py-3 px-4 text-right">Prix Public</th>
                  <th className="py-3 px-4 text-right">Marge Directe</th>
                  <th className="py-3 px-4 text-right">PV</th>
                  <th className="py-3 px-4 text-center">Stock</th>
                  {currentUser.role !== 'receptionist' && (
                    <th className="py-3 px-4 text-right">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-700">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-neutral-400">
                      Aucun produit trouvé dans cette 
