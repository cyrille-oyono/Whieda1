import React, { useState } from 'react';
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
  Check
} from 'lucide-react';

export const ProductsView: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, currentUser } = useApp();

  const [activeCategory, setActiveCategory] = useState<'all' | ProductCategory>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductService | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('regulateur');
  const [patientPrice, setPatientPrice] = useState<number>(17500);
  const [partnerPrice, setPartnerPrice] = useState<number>(12500);
  const [pv, setPv] = useState<number>(25);
  const [stockQuantity, setStockQuantity] = useState<number>(20);
  const [minStockThreshold, setMinStockThreshold] = useState<number>(5);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [description, setDescription] = useState('');
  const [customSku, setCustomSku] = useState('');

  // Auto-calculated gain
  const computedGain = Math.max(0, Number(patientPrice || 0) - Number(partnerPrice || 0));

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setName('');
    setCategory('regulateur');
    setPatientPrice(17500);
    setPartnerPrice(12500);
    setPv(25);
    setStockQuantity(25);
    setMinStockThreshold(5);
    setImageUrl('/src/assets/images/whieda_supplement_bottle_1793253158824.jpg');
    setDescription('');
    setCustomSku('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: ProductService) => {
    setEditingProduct(p);
    setName(p.name);
    setCategory(p.category);
    setPatientPrice(p.patientPrice);
    setPartnerPrice(p.partnerPrice);
    setPv(p.pv);
    setStockQuantity(p.stockQuantity);
    setMinStockThreshold(p.minStockThreshold);
    setImageUrl(p.imageUrl || '');
    setDescription(p.description || '');
    setCustomSku(p.sku);
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
        name,
        category,
        patientPrice: Number(patientPrice),
        partnerPrice: Number(partnerPrice),
        pv: Number(pv),
        stockQuantity: Number(stockQuantity),
        minStockThreshold: Number(minStockThreshold),
        imageUrl: imageUrl || undefined,
        description: description || undefined,
      });
    } else {
      addProduct({
        name,
        category,
        patientPrice: Number(patientPrice),
        partnerPrice: Number(partnerPrice),
        pv: Number(pv),
        stockQuantity: (category === 'services') ? 9999 : Number(stockQuantity),
        minStockThreshold: Number(minStockThreshold),
        imageUrl: imageUrl || undefined,
        description: description || undefined,
        active: true,
        customSku: customSku.trim() || undefined,
      });
    }
    setIsModalOpen(false);
  };


  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
            Gestion des Produits & Services
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Boutique de santé naturelle, pharmacie, consultations et examens médicaux
          </p>
        </div>

        {currentUser.role !== 'receptionist' && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Produit / Service</span>
          </button>
        )}
      </div>

      {/* Filter Tabs and Search */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Category Tabs (Segmented Buttons) */}
        <div className="flex items-center bg-neutral-100 p-1 rounded-lg flex-wrap gap-1">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeCategory === 'all' ? 'bg-white text-neutral-900 shadow-xs font-bold' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Tous ({products.length})
          </button>
          <button
            onClick={() => setActiveCategory('regulateur')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeCategory === 'regulateur' ? 'bg-white text-red-800 shadow-xs font-bold' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Régulateur
          </button>
          <button
            onClick={() => setActiveCategory('nettoyage')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeCategory === 'nettoyage' ? 'bg-white text-orange-800 shadow-xs font-bold' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Nettoyage
          </button>
          <button
            onClick={() => setActiveCategory('entretien')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeCategory === 'entretien' ? 'bg-white text-amber-800 shadow-xs font-bold' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Entretien
          </button>
          <button
            onClick={() => setActiveCategory('alimentation')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeCategory === 'alimentation' ? 'bg-white text-emerald-800 shadow-xs font-bold' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Alimentation
          </button>
          <button
            onClick={() => setActiveCategory('soins')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeCategory === 'soins' ? 'bg-white text-rose-800 shadow-xs font-bold' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Soins
          </button>
          <button
            onClick={() => setActiveCategory('services')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeCategory === 'services' ? 'bg-white text-blue-800 shadow-xs font-bold' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Services & Bilans
          </button>
        </div>


        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Rechercher par nom ou SKU..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200">
              <tr>
                <th className="py-3 px-4">Code / SKU</th>
                <th className="py-3 px-4">Produit / Service</th>
                <th className="py-3 px-4">Catégorie</th>
                <th className="py-3 px-4 text-right">Prix Patient</th>
                <th className="py-3 px-4 text-right">Prix Partenaire</th>
                <th className="py-3 px-4 text-right">Gain Direct Auto</th>
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
                    Aucun produit ou service trouvé.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => {
                  const isPhysical = p.category !== 'services';
                  const isLowStock = isPhysical && p.stockQuantity <= p.minStockThreshold;

                  return (
                    <tr key={p.id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-neutral-800">
                        {p.sku}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-neutral-100 border border-neutral-200 overflow-hidden shrink-0 flex items-center justify-center">
                            {p.imageUrl ? (
                              <img
                                src={p.imageUrl}
                                alt={p.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-5 h-5 text-neutral-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-neutral-900">{p.name}</div>
                            {p.description && (
                              <div className="text-[11px] text-neutral-400 truncate max-w-xs">{p.description}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-medium text-neutral-600">
                          {getCategoryLabel(p.category)}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-semibold text-neutral-900 tabular-nums">
                        {formatMoney(p.patientPrice)}
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-neutral-600 tabular-nums">
                        {formatMoney(p.partnerPrice)}
                      </td>

                      {/* Gain Direct Highlighted */}
                      <td className="py-3 px-4 text-right">
                        <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded tabular-nums">
                          +{formatMoney(p.directMargin)}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-semibold text-amber-700 tabular-nums">
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
                              <span className="text-[10px] text-red-600">(Bas)</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-neutral-400">Illimité</span>
                        )}
                      </td>

                      {currentUser.role !== 'receptionist' && (
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 text-neutral-500 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors mr-1"
                            title="Modifier le produit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {currentUser.role === 'admin' && (
                            <button
                              onClick={() => {
                                if (confirm(`Supprimer définitivement ${p.name} ?`)) {
                                  deleteProduct(p.id);
                                }
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
              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Catégorie
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {(['regulateur', 'nettoyage', 'entretien', 'alimentation', 'soins', 'services'] as ProductCategory[]).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`p-2.5 rounded-lg border font-medium text-center transition-all ${
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


              {/* Name & SKU */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Nom du Produit / Service *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Thé Détox Whieda Bio"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Code Produit (SKU)
                  </label>
                  <input
                    type="text"
                    placeholder="Auto-généré si vide"
                    value={customSku}
                    onChange={e => setCustomSku(e.target.value)}
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                  />
                </div>
              </div>

              {/* Pricing & Auto-Computed Direct Margin */}
              <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Prix Patient (Vente) *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={patientPrice}
                      onChange={e => setPatientPrice(Number(e.target.value))}
                      className="w-full text-xs p-2.5 border border-neutral-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono font-semibold"
                    />
                  </div>
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
                      Points de Valeur (PV) *
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
                    Gain Direct calculé automatiquement :
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
                  Image du Produit (Téléphone / Supabase Storage)
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
                      <span>Téléverser depuis l'appareil</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-neutral-400 mt-1">
                      Prend en charge appareil photo mobile et stockage Supabase Storage.
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Description & Posologie Recommandée
                </label>
                <textarea
                  rows={2}
                  placeholder="Composition, bienfaits santé, recommandations..."
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
