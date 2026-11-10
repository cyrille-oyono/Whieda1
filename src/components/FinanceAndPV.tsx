import React, { useEffect, useState } from 'react';
import { getSupabaseClient } from '../lib/supabase';

interface PartnerPV {
  id: string;
  full_name: string;
  initial_pv: number;
  current_pv: number;
  role: string;
}

interface Expense {
  id: number;
  category: string;
  amount: number;
  description: string;
  expense_date: string;
}

export default function FinanceAndPV() {
  const [partners, setPartners] = useState<PartnerPV[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Formulaire nouvelle dépense
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const supabase = getSupabaseClient();

  const fetchData = async () => {
    if (!supabase) return;
    setLoading(true);

    // Charger les partenaires et leurs PV
    const { data: partnersData } = await supabase
      .from('profiles')
      .select('id, full_name, initial_pv, current_pv, role')
      .in('role', ['partner', 'admin']);

    if (partnersData) setPartners(partnersData);

    // Charger les dépenses
    const { data: expensesData } = await supabase
      .from('expenses')
      .select('*')
      .order('expense_date', { ascending: false });

    if (expensesData) setExpenses(expensesData);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    const { error } = await supabase.from('expenses').insert([
      {
        category,
        amount: parseFloat(amount) || 0,
        description,
      },
    ]);

    if (error) {
      alert("Erreur lors de l'enregistrement de la dépense : " + error.message);
    } else {
      alert("Dépense enregistrée avec succès !");
      setCategory('');
      setAmount('');
      setDescription('');
      fetchData();
    }
  };

  // Calcul des bilans globaux PV
  const totalCompanyPV = partners.reduce((sum, p) => sum + (Number(p.current_pv) || 0), 0);
  const totalInitialPV = partners.reduce((sum, p) => sum + (Number(p.initial_pv) || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white rounded-lg shadow border border-gray-200 mt-6 space-y-8">
      <h2 className="text-2xl font-bold text-orange-600">Gestion Financière & Suivi des PV (Wheida Smart)</h2>

      {/* Cartes de Bilan Global */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <h4 className="text-sm font-semibold text-orange-800">Total PV Actuels Réseau</h4>
          <p className="text-3xl font-bold text-orange-600 mt-2">{totalCompanyPV} PV</p>
          <p className="text-xs text-gray-500 mt-1">Cumul initial : {totalInitialPV} PV</p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="text-sm font-semibold text-blue-800">Nombre de Partenaires</h4>
          <p className="text-3xl font-bold text-blue-600 mt-2">{partners.length}</p>
          <p className="text-xs text-gray-500 mt-1">Actifs dans le système</p>
        </div>

        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <h4 className="text-sm font-semibold text-red-800">Total Dépenses Enregistrées</h4>
          <p className="text-3xl font-bold text-red-600 mt-2">{totalExpenses} XAF</p>
          <p className="text-xs text-gray-500 mt-1">Charges d'exploitation</p>
        </div>
      </div>

      {/* Section 1 : Suivi des PV des Partenaires */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4">Suivi des PV des Partenaires</h3>
        {loading ? (
          <p>Chargement des données...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="p-3">Nom du Partenaire</th>
                  <th className="p-3">Rôle</th>
                  <th className="p-3">PV Initial</th>
                  <th className="p-3">PV Actuels (Solde)</th>
                </tr>
              </thead>
              <tbody>
                {partners.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-semibold text-gray-800">{p.full_name || 'Partenaire sans nom'}</td>
                    <td className="p-3"><span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">{p.role}</span></td>
                    <td className="p-3 text-gray-600">{p.initial_pv || 0} PV</td>
                    <td className="p-3 font-bold text-orange-600">{p.current_pv || 0} PV</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 2 : Trésorerie & Dépenses */}
      <div className="border-t pt-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Saisie d'une Dépense</h3>
        <form onSubmit={handleAddExpense} className="bg-gray-50 p-4 rounded-lg mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 border">
          <input
            type="text"
            placeholder="Catégorie (ex: Loyer, Achat Stock)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="p-2 border rounded bg-white"
          />
          <input
            type="number"
            placeholder="Montant (XAF)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="p-2 border rounded bg-white"
          />
          <input
            type="text"
            placeholder="Description détaillée"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="p-2 border rounded bg-white"
          />
          <button
            type="submit"
            className="bg-red-600 text-white p-2 rounded col-span-full font-semibold hover:bg-red-700 transition"
          >
            Enregistrer la dépense
          </button>
        </form>

        <h4 className="font-bold text-gray-800 mb-2">Historique des Dépenses</h4>
        <div className="space-y-2">
          {expenses.map((exp) => (
            <div key={exp.id} className="p-3 border rounded bg-gray-50 flex justify-between items-center text-sm">
              <div>
                <span className="font-bold text-gray-800">{exp.category}</span> - <span>{exp.description || 'Sans description'}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-red-600">-{exp.amount} XAF</span>
                <span className="text-xs text-gray-400">{exp.expense_date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
