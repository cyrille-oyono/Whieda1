import React, { useEffect, useState } from 'react';
import { getSupabaseClient } from '../lib/supabase';

interface Product {
  id: number;
  name: string;
  price: number;
  pv_value: number;
}

export default function CashRegister() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [cart, setCart] = useState<{ product: Product; qty: number }[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const supabase = getSupabaseClient();

  useEffect(() => {
    async function fetchProducts() {
      if (!supabase) return;
      const { data } = await supabase.from('products').select('id, name, price, pv_value');
      if (data) setProducts(data);
    }
    fetchProducts();
  }, []);

  const addToCart = () => {
    const prod = products.find(p => p.id.toString() === selectedProduct);
    if (!prod) return;
    setCart([...cart, { product: prod, qty: quantity }]);
    setSelectedProduct('');
    setQuantity(1);
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  const totalPv = cart.reduce((sum, item) => sum + item.product.pv_value * item.qty, 0);

  const handleCheckout = async () => {
    if (!supabase || cart.length === 0) return;
    setLoading(true);

    // 1. Créer la commande
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([{ total_amount: totalAmount, status: 'completed' }])
      .select()
      .single();

    if (orderError) {
      alert("Erreur lors de la validation de la vente : " + orderError.message);
      setLoading(false);
      return;
    }

    // 2. Insérer les lignes de commande
    const orderId = orderData.id;
    for (const item of cart) {
      await supabase.from('order_items').insert([
        {
          order_id: orderId,
          product_id: item.product.id,
          quantity: item.qty,
          unit_price: item.product.price,
        },
      ]);
    }

    alert(`Vente enregistrée avec succès ! Total : ${totalAmount} XAF (PV générés : ${totalPv})`);
    setCart([]);
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow border border-gray-200 mt-6">
      <h2 className="text-2xl font-bold text-orange-600 mb-4">Caisse Enregistreuse & Ventes</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          className="p-2 border rounded md:col-span-2"
        >
          <option value="">-- Sélectionner un produit / médicament --</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} - {p.price} XAF (PV: {p.pv_value})
            </option>
          ))}
        </select>
        
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
          className="p-2 border rounded"
          placeholder="Quantité"
        />
        
        <button
          onClick={addToCart}
          className="bg-orange-600 text-white p-2 rounded md:col-span-3 font-semibold hover:bg-orange-700"
        >
          Ajouter au panier
        </button>
      </div>

      {/* Panier */}
      <h3 className="font-bold text-lg mb-2">Panier en cours</h3>
      {cart.length === 0 ? (
        <p className="text-gray-500">Le panier est vide.</p>
      ) : (
        <div>
          <ul className="divide-y divide-gray-200 mb-4">
            {cart.map((item, index) => (
              <li key={index} className="py-2 flex justify-between">
                <span>{item.product.name} (x{item.qty})</span>
                <span className="font-semibold">{item.product.price * item.qty} XAF</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded mb-4 font-bold">
            <span>Total : {totalAmount} XAF | Total PV : {totalPv}</span>
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              {loading ? 'Validation...' : 'Valider la Vente'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
