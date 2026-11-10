import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ProductService, ProductCategory } from '../types';
import { formatMoney, formatPV, getCategoryLabel } from '../utils/formatters';
import { 
  Package, 
  Search, 
  Plus, 
  Tag, 
  Award, 
  DollarSign, 
  Boxes, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  X, 
  AlertTriangle,
  Layers,
  Sparkles
} from 'lucide-react';

export const ProductsView: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, currentUser } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductService | null>(null);
  
  // Form State
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<ProductCategory>('regulateur');
  const [formSku, setFormSku] = useState('');
  const [formPatientPrice, setFormPatientPrice] = useState<number>(0);
  const [formPartnerPrice, setFormPartnerPrice] = useState<number>(0);
  const [formPv, setFormPv] = useState<number>(0);
  const [formStock, setFormStock] = useState<number>(50);
  const [formThreshold, setFormThreshold] = useState<number>(10);
  const [formDescription, setFormDescription] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (text: string) => {
    setToastMessage(text);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategory('regulateur');
    setFormSku(`WHD-${Math.floor(100 + Math.random() * 900)}`);
    setFormPatientPrice(10000);
    setFormPartnerPrice(7500);
    setFormPv(5);
    setFormStock(50);
    setFormThreshold(10);
    setFormDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: ProductService) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormCategory(product.category);
    setFormSku(product.sku);
    setFormPatientPrice(product.patientPrice);
    setFormPartnerPrice(product.partnerPrice);
    setFormPv(product.pv);
    setFormStock(product.stockQuantity);
    setFormThreshold(product.minStockThreshold);
    setFormDescription(product.description || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Veuillez renseigner le nom du produit.');
      return;
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: formName.trim(),
        category: formCategory,
        sku: formSku.trim(),
        patientPrice: Number(formPatientPrice) || 0,
        partnerPrice: Number(formPartnerPrice) || 0,
        pv: Number(formPv) || 0,
        stockQuantity: Number(formStock) || 0,
        minStockThreshold: Number(formThreshold) || 10,
        description: formDescription.trim() || undefined,
      });
      showToast(`Produit "${formName}" mis à jour avec succès.`);
    } else {
      addProduct({
        name: formName.trim(),
        category: formCategory,
        sku: formSku.trim() || `WHD-${Math.floor(100 + Math.random() * 900)}`,
        patientPrice: Number(formPatientPrice) || 0,
        partnerPrice: Number(formPartnerPrice) || 0,
        pv: Number(formPv) || 0,
        stockQuantity: Number(formStock) || 0,
        minStockThreshold: Number(formThreshold) || 10,
        description: formDescription.trim() || undefined,
        active: true,
      });
      showToast(`Produit "${formName}" ajouté au catalogue.`);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Voulez-vous vraiment supprimer "${name}" du catalogue ?`)) {
      deleteProduct(id);
      showToast(`Produit "${name}" supprimé.`);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const q = searchTerm.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-neutral-900 text-white px-4 py-3 rounded-xl shadow-xl border border-orange-500 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-orange-600" />
            <span>Catalogue des Produits & Soins Whieda</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Gestion des 28 produits certifiés, régulateurs, nettoyages, soins et grille tarifaire (Public / Partenaire)
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un Produit</span>
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Rechercher par nom de produit ou code SKU..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'Tous les produits' },
            { id: 'regulateur', label: 'Régulateur' },
            { id: 'nettoyage', label: 'Nettoyage' },
            { id: 'entretien', label: 'Entretien' },
            { id: 'alimentation', label: 'Alimentation' },
            { id: 'soins', label: 'Soins' },
            { id: 'appareils', label: 'Appareils' },
            { id: 'services', label: 'Services' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat.id ? 'bg-orange-600 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200 uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Référence SKU</th>
                <th className="py-3 px-4">Nom du Produit / Soin</th>
                <th className="py-3 px-4">Catégorie</th>
                <th className="py-3 px-4 text-right">Prix Public</th>
                <th className="py-3 px-4 text-right">Prix Partenaire</th>
                <th className="py-3 px-4 text-center">Points PV</th>
                <th className="py-3 px-4 text-center">Stock</th>
                {isAdmin && <th className="py-3 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-800 font-medium">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-400 italic">
                    Aucun produit trouvé dans cette catégorie.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => (
                  <tr key={p.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-orange-600">
                      {p.sku}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-neutral-900">{p.name}</div>
                      {p.description && (
                        <div className="text-[11px] text-neutral-500 truncate max-w-xs">{p.description}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-800 border uppercase">
                        {getCategoryLabel(p.category)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-neutral-900">
                      {formatMoney(p.patientPrice)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-emerald-600 font-bold">
                      {formatMoney(p.partnerPrice)}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-amber-700">
                      {formatPV(p.pv)}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.stockQuantity <= p.minStockThreshold ? 'bg-red-100 text-red-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {p.stockQuantity}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-orange-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            className="p-1.5 bg-neutral-100 hover:bg-red-50 text-neutral-400 hover:text-red-600 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-neutral-200 text-xs">
            <div className="px-6 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Package className="w-4 h-4" />
                <span>{editingProduct ? 'Modifier le Produit' : 'Ajouter un Nouveau Produit'}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Nom du Produit ou Soin *</label>
                <input
                  type="text"
                  placeholder="ex: Capsules Whieda Cardio"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  required
                  className="w-full p-2 border border-neutral-300 rounded-lg font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Catégorie</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value as ProductCategory)}
                    className="w-full p-2 border border-neutral-300 rounded-lg bg-white font-bold"
                  >
                    <option value="regulateur">Régulateur</option>
                    <option value="nettoyage">Nettoyage</option>
                    <option value="entretien">Entretien</option>
                    <option value="alimentation">Alimentation</option>
                    <option value="soins">Soins</option>
                    <option value="appareils">Appareils</option>
                    <option value="services">Services</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Référence SKU</label>
                  <input
                    type="text"
                    value={formSku}
                    onChange={e => setFormSku(e.target.value)}
                    required
                    className="w-full p-2 border border-neutral-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Prix Public (XAF)</label>
                  <input
                    type="number"
                    value={formPatientPrice}
                    onChange={e => setFormPatientPrice(Number(e.target.value))}
                    required
                    className="w-full p-2 border border-neutral-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Prix Partenaire (XAF)</label>
                  <input
                    type="number"
                    value={formPartnerPrice}
                    onChange={e => setFormPartnerPrice(Number(e.target.value))}
                    required
                    className="w-full p-2 border border-neutral-300 rounded-lg font-mono text-emerald-600 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Points PV</label>
                  <input
                    type="number"
                    value={formPv}
                    onChange={e => setFormPv(Number(e.target.value))}
                    required
                    className="w-full p-2 border border-neutral-300 rounded-lg font-mono text-amber-700 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Quantité en Stock</label>
                  <input
                    type="number"
                    value={formStock}
                    onChange={e => setFormStock(Number(e.target.value))}
                    required
                    className="w-full p-2 border border-neutral-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Seuil d'Alerte</label>
                  <input
                    type="number"
                    value={formThreshold}
                    onChange={e => setFormThreshold(Number(e.target.value))}
                    required
                    className="w-full p-2 border border-neutral-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Description / Bienfaits</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-lg"
                  placeholder="Détails ou propriétés thérapeutiques..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-semibold text-neutral-600 hover:bg-neutral-100 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 rounded-lg shadow-xs"
                >
                  {editingProduct ? 'Enregistrer les modifications' : 'Ajouter le Produit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
        
