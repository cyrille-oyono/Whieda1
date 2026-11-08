import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ProductService, ProductCategory } from '../types';
import { formatMoney, formatPV, getCategoryLabel } from '../utils/formatters';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Package, 
  Upload, 
  Sparkles, 
  AlertTriangle,
  X,
  Camera,
  Layers,
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
  DollarSign
} from 'lucide-react';
import { SUPABASE_OFFICIAL_PRODUCTS_SEED_SQL, OFFICIAL_PRODUCTS_CATALOG } from '../data/officialProducts';

export const ProductsView: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, seedOfficialCatalog, currentUser } = useApp();

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
    setImageUrl('/src/assets/images/whieda_supplement_bottle_1793253158824.jpg');
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
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-orange-600" />
            <span>Catalogue & Produits Officiels Whieda</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Grille tarifaire officielle (28 produits certifiés), marges directes, PV MLM et gestion des stocks
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Sync Button */}
          <button
            onClick={handleSeedOfficialCatalog}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200 rounded-lg text-xs font-semibold shadow-2xs transition-all"
            title="Synchroniser la grille tarifaire officielle"
          >
            <RefreshCw className="w-3.5 h-3.5 text-orange-600" />
            <span>Initialiser Grille (28 Produits)</span>
          </button>

          {/* SQL Script Button */}
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

      {/* Products Display (Table View) */}
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
                    <td colSpan={9} className="py-12 text-center text-neutral-400">
                      Aucun produit ou service trouvé pour cette recherche.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map(p => {
                    const isPhysical = p.category !== 'services';
                    const isLowStock = isPhysical && p.stockQuantity <= p.minStockThreshold;
                    const displayCode = p.code || p.sku;

                    return (
                      <tr key={p.id} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-xs bg-neutral-100 text-neutral-800 px-2 py-1 rounded border border-neutral-200">
                            {displayCode}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-neutral-100 border border-neutral-200 overflow-hidden shrink-0 flex items-center justify-center">
                              {p.imageUrl ? (
                                <img
                                  src={p.imageUrl}
                                  alt={p.name}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package className="w-4 h-4 text-neutral-400" />
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-neutral-900 tracking-tight">{p.name}</div>
                              {p.description && (
                                <div className="text-[11px] text-neutral-400 truncate max-w-xs">{p.description}</div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getCategoryBadgeStyle(p.category)}`}>
                            {getCategoryLabel(p.category)}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right font-mono text-neutral-600 tabular-nums">
                          {formatMoney(p.partnerPrice)}
                        </td>

                        <td className="py-3 px-4 text-right font-mono font-bold text-neutral-900 tabular-nums">
                          {formatMoney(p.patientPrice)}
                        </td>

                        {/* Marge Directe Automatique */}
                        <td className="py-3 px-4 text-right">
                          <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded tabular-nums border border-emerald-100">
                            +{formatMoney(p.directMargin)}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right font-mono font-bold text-amber-700 tabular-nums">
                          {formatPV(p.pv)}
                        </td>

                        <td className="py-3 px-4 text-center">
                          {isPhysical ? (
                            <div className="inline-flex items-center gap-1 font-mono">
                              {isLowStock && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
                              <span className={`font-semibold ${isLowStock ? 'text-red-600 font-bold' : 'text-neutral-800'}`}>
                                {p.stockQuantity}
                              </span>
                              {isLowStock && (
                                <span className="text-[10px] text-red-600 font-sans font-bold">(Alerte)</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-neutral-400 text-[11px]">Illimité</span>
                          )}
                        </td>

                        {currentUser.role !== 'receptionist' && (
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => handleOpenEdit(p)}
                              className="p-1.5 text-neutral-500 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors mr-1"
                              title="Modifier la fiche produit"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            {currentUser.role === 'admin' && (
                              <button
                                onClick={() => {
                                  deleteProduct(p.id);
                                  showToast(`Produit ${p.name} supprimé.`, 'info');
                                }}
                                className="p-1.5 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Products Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map(p => {
            const isPhysical = p.category !== 'services';
            const isLowStock = isPhysical && p.stockQuantity <= p.minStockThreshold;
            const displayCode = p.code || p.sku;

            return (
              <div 
                key={p.id} 
                className="bg-white rounded-xl border border-neutral-200 shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Card Header with Badges */}
                  <div className="p-3 border-b border-neutral-100 flex items-center justify-between gap-2 bg-neutral-50/50">
                    <span className="font-mono font-bold text-xs bg-white text-neutral-900 px-2 py-0.5 rounded border border-neutral-200">
                      {displayCode}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getCategoryBadgeStyle(p.category)}`}>
                      {getCategoryLabel(p.category)}
                    </span>
                  </div>

                  {/* Body with Image & Details */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 rounded-lg bg-neutral-100 border border-neutral-200 overflow-hidden shrink-0 flex items-center justify-center">
                        {p.imageUrl ? (
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-6 h-6 text-neutral-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm text-neutral-900 tracking-tight leading-snug">
                          {p.name}
                        </h3>
                        {p.description && (
                          <p className="text-[11px] text-neutral-500 line-clamp-2 mt-1">
                            {p.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Financial & PV Breakdown */}
                    <div className="bg-neutral-50 p-2.5 rounded-lg space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-500">Prix Public :</span>
                        <span className="font-mono font-bold text-neutral-900">{formatMoney(p.patientPrice)}</span>
                      </div>
                      <div className="flex items-center justify-between text-neutral-600">
                        <span className="text-neutral-500">Prix Partenaire :</span>
                        <span className="font-mono">{formatMoney(p.partnerPrice)}</span>
                      </div>
                      <div className="flex items-center justify-between text-emerald-700 font-semibold pt-1 border-t border-neutral-200/60">
                        <span>Bénéfice Net :</span>
                        <span className="font-mono font-bold">+{formatMoney(p.directMargin)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <div className="flex items-center gap-1 font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <span>{formatPV(p.pv)}</span>
                      </div>

                      {isPhysical && (
                        <div className={`font-mono text-xs flex items-center gap-1 ${isLowStock ? 'text-red-600 font-bold' : 'text-neutral-600'}`}>
                          {isLowStock && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
                          <span>Stock: {p.stockQuantity}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                {currentUser.role !== 'receptionist' && (
                  <div className="px-4 py-2.5 border-t border-neutral-100 bg-neutral-50 flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="px-2.5 py-1 text-xs font-semibold text-neutral-700 hover:text-orange-600 hover:bg-white rounded transition-colors flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Modifier</span>
                    </button>
                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => {
                          deleteProduct(p.id);
                          showToast(`Produit ${p.name} supprimé.`, 'info');
                        }}
                        className="p-1 text-neutral-400 hover:text-red-600 hover:bg-white rounded transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* SQL Supabase Seed Modal */}
      {isSqlModalOpen && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-neutral-950 rounded-2xl max-w-3xl w-full border border-neutral-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 my-8 text-neutral-100 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-orange-400" />
                <h3 className="text-sm font-bold text-white">
                  Script SQL Supabase · Initialisation de la Grille Tarifaire (28 Produits)
                </h3>
              </div>
              <button 
                onClick={() => setIsSqlModalOpen(false)} 
                className="p-1 text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-neutral-900/50 border-b border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <p className="text-neutral-400">
                Colonnes requises : <code className="text-orange-300">code</code>, <code className="text-orange-300">name</code>, <code className="text-orange-300">partner_price</code>, <code className="text-orange-300">public_price</code>, <code className="text-orange-300">pv</code>, <code className="text-orange-300">category_id</code>
              </p>
              <button
                onClick={handleCopySql}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-semibold shadow-xs transition-colors shrink-0"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Copié !' : 'Copier Tout le SQL'}</span>
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 font-mono text-xs leading-relaxed text-neutral-300">
              <pre className="whitespace-pre-wrap">
                {SUPABASE_OFFICIAL_PRODUCTS_SEED_SQL}
              </pre>
            </div>

            <div className="p-4 border-t border-neutral-800 bg-neutral-900 flex items-center justify-between">
              <span className="text-[11px] text-neutral-400">
                Copiez et collez ce script dans l'Éditeur SQL Supabase (SQL Editor) pour peupler la base en un clic.
              </span>
              <button
                onClick={() => setIsSqlModalOpen(false)}
                className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-lg"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-neutral-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-orange-600" />
                <h3 className="text-sm font-bold text-neutral-900">
                  {editingProduct ? 'Modifier le Produit / Service' : 'Ajouter un Produit ou Service'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-neutral-400 hover:text-neutral-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Category Picker */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Catégorie du Produit *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
                  {(['regulateur', 'nettoyage', 'entretien', 'alimentation', 'soins', 'appareils', 'services'] as ProductCategory[]).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`p-2 rounded-lg border font-medium text-center transition-all ${
                        category === cat
                          ? 'border-orange-500 bg-orange-50 text-orange-900 font-bold shadow-2xs'
                          : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                      }`}
                    >
                      {getCategoryLabel(cat)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Code Grille & SKU & Name */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Code Officiel *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: F001, BA-02"
                    value={code}
                    onChange={e => setCode(e.target.value.toUpperCase())}
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono font-bold"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Désignation du Produit / Service *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: ORAL LIQUID, LINCHZI"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-semibold"
                  />
                </div>
              </div>

              {/* Pricing & Auto-Computed Direct Margin */}
              <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Prix Partenaire (Achat) *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={partnerPrice}
                      onChange={e => setPartnerPrice(Number(e.target.value))}
                      className="w-full text-xs p-2.5 border border-neutral-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Prix Public (Vente) *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={patientPrice}
                      onChange={e => setPatientPrice(Number(e.target.value))}
                      className="w-full text-xs p-2.5 border border-neutral-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Points Valeur (PV) *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      step="0.5"
                      value={pv}
                      onChange={e => setPv(Number(e.target.value))}
                      className="w-full text-xs p-2.5 border border-neutral-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono text-amber-700 font-bold"
                    />
                  </div>
                </div>

                {/* Direct Margin Highlight */}
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-900">
                    Bénéfice Direct (Prix Public - Prix Partenaire) :
                  </span>
                  <span className="font-mono font-bold text-emerald-700 text-sm">
                    {formatMoney(computedGain)}
                  </span>
                </div>
              </div>

              {/* Stock (For all physical categories except services) */}
              {category !== 'services' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Quantité Initiale en Stock
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={stockQuantity}
                      onChange={e => setStockQuantity(Number(e.target.value))}
                      className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Seuil d'Alerte Stock Bas
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={minStockThreshold}
                      onChange={e => setMinStockThreshold(Number(e.target.value))}
                      className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Image Upload / URL */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Visuel du Produit
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg border border-neutral-200 bg-neutral-100 overflow-hidden flex items-center justify-center shrink-0">
                    {imageUrl ? (
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-5 h-5 text-neutral-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-xs font-medium cursor-pointer text-neutral-700 transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Sélectionner une photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Description & Indications Cliniques
                </label>
                <textarea
                  rows={2}
                  placeholder="Propriétés, conseils d'utilisation, recommandations..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
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
                  {editingProduct ? 'Enregistrer Modifications' : 'Créer le Produit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
