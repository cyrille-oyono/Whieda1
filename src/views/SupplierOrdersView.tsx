import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SupplierOrder, OrderStatus, SupplierOrderItem } from '../types';
import { formatMoney, getOrderStatusLabel } from '../utils/formatters';
import { 
  Truck, 
  Plus, 
  AlertTriangle, 
  PackageCheck, 
  FileText, 
  Calendar, 
  ArrowRight, 
  CheckCircle2, 
  X,
  Search
} from 'lucide-react';

export const SupplierOrdersView: React.FC = () => {
  const { supplierOrders, createSupplierOrder, updateSupplierOrderStatus, products } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [supplierName, setSupplierName] = useState('Laboratoires Phytocare Afrique');
  const [notes, setNotes] = useState('');
  const [orderItems, setOrderItems] = useState<{ productId: string; quantity: number; unitCost: number }[]>([]);

  // Filter products needing restock
  const lowStockProducts = products.filter(
    p => p.category !== 'services' && p.stockQuantity <= p.minStockThreshold
  );


  const handleOpenCreateModal = (prefillProductId?: string) => {
    setSupplierName('Laboratoires Phytocare Afrique');
    setNotes('');

    if (prefillProductId) {
      const prod = products.find(p => p.id === prefillProductId);
      if (prod) {
        setOrderItems([{ productId: prod.id, quantity: 20, unitCost: prod.partnerPrice * 0.7 }]);
      }
    } else if (lowStockProducts.length > 0) {
      setOrderItems(lowStockProducts.map(p => ({
        productId: p.id,
        quantity: 25,
        unitCost: Math.round(p.partnerPrice * 0.7),
      })));
    } else {
      const first = products.find(p => p.category !== 'services');
      setOrderItems(first ? [{ productId: first.id, quantity: 10, unitCost: Math.round(first.partnerPrice * 0.7) }] : []);
    }
    setIsModalOpen(true);
  };

  const handleAddItemLine = () => {
    const candidate = products.find(p => p.category !== 'services');
    if (candidate) {
      setOrderItems([...orderItems, { productId: candidate.id, quantity: 10, unitCost: Math.round(candidate.partnerPrice * 0.7) }]);
    }
  };


  const handleRemoveLine = (idx: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== idx));
  };

  const handleUpdateItemLine = (idx: number, field: 'productId' | 'quantity' | 'unitCost', value: any) => {
    setOrderItems(orderItems.map((item, i) => {
      if (i === idx) {
        if (field === 'productId') {
          const prod = products.find(p => p.id === value);
          const defaultCost = prod ? Math.round(prod.partnerPrice * 0.7) : item.unitCost;
          return { ...item, productId: value, unitCost: defaultCost };
        }
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const totalCost = orderItems.reduce((acc, i) => acc + (i.quantity * i.unitCost), 0);

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderItems.length === 0) return;

    const formattedItems: SupplierOrderItem[] = orderItems.map(item => {
      const prod = products.find(p => p.id === item.productId);
      return {
        productId: item.productId,
        productName: prod ? prod.name : 'Article',
        quantity: Number(item.quantity),
        unitCost: Number(item.unitCost),
      };
    });

    createSupplierOrder({
      supplierName,
      status: 'envoyee',
      totalCost,
      items: formattedItems,
      notes,
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
            Commandes Fournisseurs & Approvisionnements
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Suivi des réapprovisionnements, bons de commande et réintégration automatique des stocks
          </p>
        </div>

        <button
          onClick={() => handleOpenCreateModal()}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Bon de Commande</span>
        </button>
      </div>

      {/* Low Stock Alert Strip if any */}
      {lowStockProducts.length > 0 && (
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Articles en alerte rupture de stock ({lowStockProducts.length})</span>
            </div>
            <button
              onClick={() => handleOpenCreateModal()}
              className="text-xs font-bold text-amber-900 underline hover:text-amber-950"
            >
              Générer un bon de commande automatique
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {lowStockProducts.map(p => (
              <div key={p.id} className="p-2.5 bg-white rounded-lg border border-amber-200 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-neutral-900 truncate max-w-[150px]">{p.name}</div>
                  <div className="text-[10px] text-neutral-500 font-mono">Stock actuel : {p.stockQuantity} (Seuil: {p.minStockThreshold})</div>
                </div>
                <button
                  onClick={() => handleOpenCreateModal(p.id)}
                  className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded text-[11px] font-semibold"
                >
                  Commander
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Orders List Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200">
              <tr>
                <th className="py-3 px-4">N° Bon Commande</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Fournisseur</th>
                <th className="py-3 px-4">Articles Commandés</th>
                <th className="py-3 px-4 text-right">Montant Total</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right">Action Réception</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-700">
              {supplierOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400">
                    Aucun bon de commande fournisseur enregistré.
                  </td>
                </tr>
              ) : (
                supplierOrders.map(order => {
                  const statusConf = getOrderStatusLabel(order.status);

                  return (
                    <tr key={order.id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-neutral-900">
                        {order.orderNumber}
                      </td>

                      <td className="py-3 px-4 text-neutral-500 font-mono">
                        {order.date}
                      </td>

                      <td className="py-3 px-4 font-semibold text-neutral-900">
                        {order.supplierName}
                      </td>

                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          {order.items.map((it, idx) => (
                            <div key={idx} className="text-[11px] text-neutral-600">
                              <span className="font-semibold text-neutral-900">{it.quantity}x</span> {it.productName}
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-neutral-900 tabular-nums">
                        {formatMoney(order.totalCost)}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusConf.bg} ${statusConf.text}`}>
                          {statusConf.label}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        {order.status !== 'recue' ? (
                          <button
                            onClick={() => {
                              if (confirm(`Confirmer la réception de la commande ${order.orderNumber} ? Le stock physique sera automatiquement incrémenté.`)) {
                                updateSupplierOrderStatus(order.id, 'recue');
                              }
                            }}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1 ml-auto"
                          >
                            <PackageCheck className="w-3.5 h-3.5" />
                            <span>Valider Réception & Réapprovisionner</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-700 font-medium inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Stock incrémenté
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

      {/* Modal: Nouveau Bon de Commande */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-neutral-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-orange-600" />
                <h3 className="text-sm font-bold text-neutral-900">
                  Créer un Bon de Commande Fournisseur
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-neutral-400 hover:text-neutral-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitOrder} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Nom du Laboratoire / Fournisseur *
                </label>
                <input
                  type="text"
                  required
                  value={supplierName}
                  onChange={e => setSupplierName(e.target.value)}
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Items in PO */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-neutral-700">
                    Articles à Commander
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItemLine}
                    className="text-xs text-orange-600 font-semibold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Ajouter un produit
                  </button>
                </div>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {orderItems.map((item, idx) => (
                    <div key={idx} className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-200 grid grid-cols-12 gap-2 items-center text-xs">
                      <div className="col-span-6">
                        <select
                          value={item.productId}
                          onChange={e => handleUpdateItemLine(idx, 'productId', e.target.value)}
                          className="w-full p-1.5 border border-neutral-300 rounded bg-white text-xs"
                        >
                          {products
                            .filter(p => p.category !== 'services')
                            .map(p => (
                              <option key={p.id} value={p.id}>
                                {p.name} (Stock: {p.stockQuantity})
                              </option>
                            ))}

                        </select>
                      </div>

                      <div className="col-span-2">
                        <input
                          type="number"
                          min={1}
                          placeholder="Qté"
                          value={item.quantity}
                          onChange={e => handleUpdateItemLine(idx, 'quantity', Number(e.target.value))}
                          className="w-full p-1.5 border border-neutral-300 rounded bg-white text-xs text-center font-mono font-bold"
                        />
                      </div>

                      <div className="col-span-3">
                        <input
                          type="number"
                          min={100}
                          placeholder="Coût unit."
                          value={item.unitCost}
                          onChange={e => handleUpdateItemLine(idx, 'unitCost', Number(e.target.value))}
                          className="w-full p-1.5 border border-neutral-300 rounded bg-white text-xs text-right font-mono"
                        />
                      </div>

                      <div className="col-span-1 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(idx)}
                          className="p-1 text-neutral-400 hover:text-red-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total estimation */}
              <div className="p-3 bg-neutral-100 rounded-lg flex items-center justify-between text-xs font-bold">
                <span>Coût Total Estimé :</span>
                <span className="font-mono text-sm text-neutral-900">{formatMoney(totalCost)}</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Instructions / Conditions de Livraison
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="ex: Livraison sous 48h au magasin central..."
                  className="w-full text-xs p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

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
                  Émettre le Bon de Commande
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
